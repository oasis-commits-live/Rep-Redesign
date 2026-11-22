import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ── Resend email helper ──
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmailViaResend(to: string, otp: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY not set — skipping email delivery");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Rep <onboarding@resend.dev>",
        to: [to],
        subject: `${otp} is your Rep verification code`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:420px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#34C759;line-height:56px;text-align:center;">
                <span style="color:white;font-size:28px;font-weight:700;">R</span>
              </div>
            </div>
            <h1 style="font-size:24px;font-weight:700;color:#1c1c1e;text-align:center;margin:0 0 8px;">Your verification code</h1>
            <p style="font-size:15px;color:#8e8e93;text-align:center;margin:0 0 28px;">Enter this code in the app to verify your email.</p>
            <div style="background:#f5f5f7;border-radius:16px;padding:20px;text-align:center;margin-bottom:28px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:0.3em;color:#1c1c1e;font-family:monospace;">${otp}</span>
            </div>
            <p style="font-size:13px;color:#8e8e93;text-align:center;margin:0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[email] Resend API error (${res.status}):`, errBody);
      return false;
    }
    console.log(`[email] OTP email sent to ${to} via Resend`);
    return true;
  } catch (e) {
    console.log("[email] Failed to send via Resend:", e);
    return false;
  }
}

// ── Lazy bucket creation (runs on first avatar/media request, not on cold start) ──
const AVATAR_BUCKET = "make-cef03f12-avatars";
const WORKOUT_MEDIA_BUCKET = "make-cef03f12-workout-media";
let _bucketsEnsured = false;
async function ensureBuckets() {
  if (_bucketsEnsured) return;
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: buckets } = await sb.storage.listBuckets();
    for (const name of [AVATAR_BUCKET, WORKOUT_MEDIA_BUCKET]) {
      if (!buckets?.some((b: any) => b.name === name)) {
        await sb.storage.createBucket(name, { public: false });
        console.log(`[storage] Created bucket: ${name}`);
      }
    }
    _bucketsEnsured = true;
  } catch (e) {
    console.log("[storage] Bucket init error (non-fatal):", e);
  }
}

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ── In-app browser support ──
// Instagram/Facebook/TikTok WebViews block CORS preflight (OPTIONS) requests.
// To work around this, the frontend can send "simple" requests:
//   - No custom headers (no Authorization, no X-User-Token)
//   - Content-Type: text/plain (instead of application/json)
//   - Auth tokens passed as query params: ?_token=xxx
// This middleware normalizes those requests so downstream handlers work unchanged.
app.use("/*", async (c, next) => {
  const url = new URL(c.req.url);

  // Allow _token query param as fallback for X-User-Token header
  const qToken = url.searchParams.get("_token");
  if (qToken && !c.req.header("X-User-Token")) {
    c.req.raw.headers.set("X-User-Token", qToken);
  }

  // Normalize text/plain → application/json so Hono's c.req.json() works
  const ct = c.req.header("Content-Type") || "";
  if (
    ct.includes("text/plain") &&
    ["POST", "PUT", "PATCH"].includes(c.req.method)
  ) {
    c.req.raw.headers.set("Content-Type", "application/json");
  }

  await next();
});

// ── Auth helper ──
// The Supabase gateway consumes the Authorization header (anon key).
// The user's access token is passed via the X-User-Token custom header
// or the _token query param (for in-app browser compatibility).
async function getUserId(c: any): Promise<string | null> {
  try {
    const token =
      c.req.header("X-User-Token") ||
      new URL(c.req.url).searchParams.get("_token");
    if (!token) return null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (e) {
    console.log("Auth error:", e);
    return null;
  }
}

// ── Username helpers ──
// KV patterns: username:{lowered} → { userId, email }
//              user_username:{userId} → { username }

async function isUsernameTaken(username: string): Promise<boolean> {
  const existing = await kv.get(`username:${username.toLowerCase()}`);
  return !!existing;
}

async function getUsernameForUser(userId: string): Promise<string | null> {
  const rec = await kv.get(`user_username:${userId}`) as any;
  return rec?.username || null;
}

async function resolveUsernameToEmail(username: string): Promise<string | null> {
  const rec = await kv.get(`username:${username.toLowerCase()}`) as any;
  return rec?.email || null;
}

// ── Health check ──
app.get("/make-server-cef03f12/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Auth: Signup ──
app.post("/make-server-cef03f12/signup", async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required for signup" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let data: any;
    let error: any;

    ({ data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: displayName || "Athlete" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    }));

    // If the email is already registered, delete the old Auth user + orphaned
    // KV data and re-create so the developer can start fresh.
    if (error && error.message?.includes("already been registered")) {
      console.log(`[signup] Email "${email}" already exists — deleting old user and re-creating`);

      // Find the existing user by email
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        // Clean up all their orphaned KV data first
        await cleanupOrphanedUser(existingUser.id);
        // Delete from Supabase Auth
        await supabase.auth.admin.deleteUser(existingUser.id);
        console.log(`[signup] Deleted old Auth user ${existingUser.id} for email "${email}"`);
      }

      // Retry creation
      ({ data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name: displayName || "Athlete" },
        email_confirm: true,
      }));
    }

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }

    // Initialize default preferences for the new user
    await kv.set(`prefs:${data.user.id}`, {
      onboardingComplete: false,
      preferredStyle: null,
      displayName: displayName || "Athlete",
    });

    // Initialize public community profile
    await kv.set(`profile:${data.user.id}`, {
      userId: data.user.id,
      displayName: displayName || "Athlete",
      avatarUrl: null,
      preferredStyle: null,
      bio: "",
      joinedAt: new Date().toISOString(),
    });

    return c.json({ user: { id: data.user.id, email: data.user.email } });
  } catch (e) {
    console.log("Signup exception:", e);
    return c.json({ error: `Signup exception: ${e}` }, 500);
  }
});

// ── Signup Seed (best-effort KV profile seeding after direct browser signUp) ──
app.post("/make-server-cef03f12/signup-seed", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { displayName } = await c.req.json();
    const name = (displayName || "Athlete").trim();

    // Only seed if not already present
    const existing = await kv.get(`profile:${userId}`);
    if (existing) {
      console.log(`[signup-seed] Profile already exists for ${userId}`);
      return c.json({ ok: true, alreadyExisted: true });
    }

    await kv.set(`prefs:${userId}`, {
      onboardingComplete: false,
      preferredStyle: null,
      displayName: name,
    });
    await kv.set(`profile:${userId}`, {
      userId,
      displayName: name,
      avatarUrl: null,
      preferredStyle: null,
      bio: "",
      joinedAt: new Date().toISOString(),
    });

    console.log(`[signup-seed] Seeded profile for ${userId} (${name})`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("[signup-seed] Error:", e);
    return c.json({ error: `Seed failed: ${e}` }, 500);
  }
});

// ── Auth: Send OTP for signup email verification ──
app.post("/make-server-cef03f12/auth/send-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this email already has a completed account (has a username)
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingUser = listData?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()
    );

    if (existingUser) {
      const usernameRec = await kv.get(`user_username:${existingUser.id}`) as any;
      if (usernameRec?.username) {
        return c.json({
          error: "An account with this email already exists. Please sign in instead.",
          code: "ACCOUNT_EXISTS",
        }, 409);
      }
      // Incomplete signup — clean up and allow retry
      await cleanupOrphanedUser(existingUser.id);
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`[auth/send-otp] Cleaned up incomplete signup for ${email}`);
    }

    // Generate a 6-digit OTP and store in KV (expires in 10 minutes)
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await kv.set(`otp:${email.toLowerCase().trim()}`, { otp, expiresAt, verified: false });

    // Try to send OTP via Resend; fall back to dev-mode (return in response) if not configured
    const emailSent = await sendEmailViaResend(email.trim(), otp);

    console.log(`[auth/send-otp] OTP generated for ${email}: ${otp} (email ${emailSent ? "sent" : "not sent — dev mode"})`);

    const response: any = {
      ok: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "Verification code generated",
      emailSent,
    };

    // If email wasn't sent (no API key / error), include OTP for dev testing
    if (!emailSent) {
      response._dev_otp = otp;
    }

    return c.json(response);
  } catch (e) {
    console.log("[auth/send-otp] Exception:", e);
    return c.json({ error: `Failed to send verification code: ${e}` }, 500);
  }
});

// ── Auth: Verify OTP ──
app.post("/make-server-cef03f12/auth/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    if (!email || !otp) {
      return c.json({ error: "Email and verification code are required" }, 400);
    }

    const stored = await kv.get(`otp:${email.toLowerCase().trim()}`) as any;
    if (!stored) {
      return c.json({ error: "No verification code found. Please request a new one." }, 400);
    }

    if (new Date(stored.expiresAt) < new Date()) {
      await kv.del(`otp:${email.toLowerCase().trim()}`);
      return c.json({ error: "Verification code expired. Please request a new one." }, 400);
    }

    if (stored.otp !== otp.trim()) {
      // Try Supabase's own OTP as fallback
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!
      );
      const { error: verifyError } = await anonClient.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (verifyError) {
        return c.json({ error: "Invalid verification code. Please try again." }, 400);
      }
    }

    // Mark as verified
    await kv.set(`otp:${email.toLowerCase().trim()}`, { ...stored, verified: true });

    console.log(`[auth/verify-otp] OTP verified for ${email}`);
    return c.json({ ok: true, verified: true });
  } catch (e) {
    console.log("[auth/verify-otp] Exception:", e);
    return c.json({ error: `Verification failed: ${e}` }, 500);
  }
});

// ── Auth: Complete signup (after OTP verified) — set username + password ──
app.post("/make-server-cef03f12/auth/complete-signup", async (c) => {
  try {
    const { email, username, password } = await c.req.json();
    if (!email || !username || !password) {
      return c.json({ error: "Email, username, and password are required" }, 400);
    }

    // Validate OTP was verified
    const otpRec = await kv.get(`otp:${email.toLowerCase().trim()}`) as any;
    if (!otpRec || !otpRec.verified) {
      return c.json({ error: "Email not verified. Please verify your email first." }, 400);
    }

    // Validate username
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return c.json({ error: "Username must be 3-20 characters" }, 400);
    }
    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      return c.json({ error: "Username can only contain letters, numbers, dots, and underscores" }, 400);
    }

    // Validate password
    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Check username uniqueness
    if (await isUsernameTaken(cleanUsername)) {
      return c.json({ error: "This username is already taken. Please choose another." }, 409);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user exists from OTP flow
    const { data: listData } = await supabase.auth.admin.listUsers();
    let user = listData?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()
    );

    if (user) {
      // Update existing user with password
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        user_metadata: { name: cleanUsername, display_name: cleanUsername, username: cleanUsername },
        email_confirm: true,
      });
      if (updateError) {
        console.log("[auth/complete-signup] Update error:", updateError);
        return c.json({ error: `Failed to set password: ${updateError.message}` }, 500);
      }
    } else {
      // Create new user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        user_metadata: { name: cleanUsername, display_name: cleanUsername, username: cleanUsername },
        email_confirm: true,
      });
      if (createError) {
        console.log("[auth/complete-signup] Create error:", createError);
        return c.json({ error: `Failed to create account: ${createError.message}` }, 500);
      }
      user = createData.user;
    }

    // Store username mappings
    await kv.set(`username:${cleanUsername}`, { userId: user!.id, email: email.toLowerCase().trim() });
    await kv.set(`user_username:${user!.id}`, { username: cleanUsername });

    // Initialize profile and preferences
    await kv.set(`prefs:${user!.id}`, {
      onboardingComplete: false,
      preferredStyle: null,
      displayName: cleanUsername,
    });
    await kv.set(`profile:${user!.id}`, {
      userId: user!.id,
      displayName: cleanUsername,
      username: cleanUsername,
      avatarUrl: null,
      preferredStyle: null,
      bio: "",
      joinedAt: new Date().toISOString(),
    });

    // Clean up OTP
    await kv.del(`otp:${email.toLowerCase().trim()}`);

    console.log(`[auth/complete-signup] Account created: ${email} @${cleanUsername}`);
    return c.json({
      ok: true,
      user: { id: user!.id, email: user!.email, username: cleanUsername },
    });
  } catch (e) {
    console.log("[auth/complete-signup] Exception:", e);
    return c.json({ error: `Signup failed: ${e}` }, 500);
  }
});

// ── Auth: Resolve username/email to email (for login) ──
app.post("/make-server-cef03f12/auth/resolve-username", async (c) => {
  try {
    const { identifier } = await c.req.json();
    if (!identifier) {
      return c.json({ error: "Username or email is required" }, 400);
    }

    const trimmed = identifier.trim();

    if (trimmed.includes("@")) {
      // Email — check if account exists
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: listData } = await supabase.auth.admin.listUsers();
      const user = listData?.users?.find(
        (u: any) => u.email?.toLowerCase() === trimmed.toLowerCase()
      );
      if (!user) {
        return c.json({
          error: "No account found with this email. Please sign up first.",
          code: "NO_ACCOUNT",
        }, 404);
      }
      const usernameRec = await kv.get(`user_username:${user.id}`) as any;
      if (!usernameRec?.username) {
        return c.json({
          error: "This email started signup but never completed it. Please sign up again.",
          code: "INCOMPLETE_SIGNUP",
        }, 404);
      }
      return c.json({ email: trimmed.toLowerCase(), username: usernameRec.username });
    }

    // Username — resolve to email
    const email = await resolveUsernameToEmail(trimmed);
    if (!email) {
      return c.json({
        error: "No account found with this username. Please sign up first.",
        code: "NO_ACCOUNT",
      }, 404);
    }

    return c.json({ email, username: trimmed.toLowerCase() });
  } catch (e) {
    console.log("[auth/resolve-username] Exception:", e);
    return c.json({ error: `Failed to resolve account: ${e}` }, 500);
  }
});

// ── Auth: Check username availability ──
app.get("/make-server-cef03f12/auth/check-username/:username", async (c) => {
  try {
    const username = c.req.param("username").toLowerCase().trim();
    const taken = await isUsernameTaken(username);
    return c.json({ available: !taken });
  } catch (e) {
    console.log("[auth/check-username] Exception:", e);
    return c.json({ error: `Check failed: ${e}` }, 500);
  }
});

// ── Auth: Get current user info ──
app.get("/make-server-cef03f12/auth/me", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const username = await getUsernameForUser(userId);
    return c.json({ userId, username });
  } catch (e) {
    console.log("[auth/me] Exception:", e);
    return c.json({ error: `Failed to get user info: ${e}` }, 500);
  }
});

// ── Auth: Complete profile for OAuth users (Google, etc.) ──
// After OAuth sign-in, first-time users don't have a username/profile yet.
// This endpoint sets up their username, profile, and preferences.
app.post("/make-server-cef03f12/auth/google/complete-profile", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { displayName, username } = await c.req.json();
    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return c.json({ error: "Username must be 3-20 characters" }, 400);
    }
    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      return c.json({ error: "Username can only contain letters, numbers, dots, and underscores" }, 400);
    }

    // Check username uniqueness
    if (await isUsernameTaken(cleanUsername)) {
      return c.json({ error: "This username is already taken. Please choose another." }, 409);
    }

    // Get user email from Supabase Auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return c.json({ error: "Failed to retrieve user info" }, 500);
    }

    const email = user.email?.toLowerCase() || "";
    const name = (displayName || cleanUsername).trim();

    // Store username mappings
    await kv.set(`username:${cleanUsername}`, { userId, email });
    await kv.set(`user_username:${userId}`, { username: cleanUsername });

    // Initialize profile and preferences
    await kv.set(`prefs:${userId}`, {
      onboardingComplete: false,
      preferredStyle: null,
      displayName: name,
    });
    await kv.set(`profile:${userId}`, {
      userId,
      displayName: name,
      username: cleanUsername,
      avatarUrl: user.user_metadata?.avatar_url || null,
      preferredStyle: null,
      bio: "",
      joinedAt: new Date().toISOString(),
    });

    // Update user metadata with username
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        username: cleanUsername,
        display_name: name,
      },
    });

    console.log(`[auth/google/complete-profile] Profile created for ${userId}: @${cleanUsername} (${name})`);
    return c.json({
      ok: true,
      user: { id: userId, email, username: cleanUsername, displayName: name },
    });
  } catch (e) {
    console.log("[auth/google/complete-profile] Exception:", e);
    return c.json({ error: `Profile setup failed: ${e}` }, 500);
  }
});

// ── Preferences ──
app.get("/make-server-cef03f12/preferences", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for preferences GET" }, 401);

  try {
    const prefs = await kv.get(`prefs:${userId}`);
    return c.json({
      preferences: prefs || {
        onboardingComplete: false,
        preferredStyle: null,
        displayName: "Athlete",
      },
    });
  } catch (e) {
    console.log("Get preferences error:", e);
    return c.json({ error: `Failed to get preferences: ${e}` }, 500);
  }
});

app.put("/make-server-cef03f12/preferences", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for preferences PUT" }, 401);

  try {
    const { preferences } = await c.req.json();
    await kv.set(`prefs:${userId}`, preferences);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Update preferences error:", e);
    return c.json({ error: `Failed to update preferences: ${e}` }, 500);
  }
});

// ── Templates ──
app.get("/make-server-cef03f12/templates", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for templates GET" }, 401);

  try {
    const templates = await kv.getByPrefix(`template:${userId}:`);
    return c.json({ templates: templates || [] });
  } catch (e) {
    console.log("Get templates error:", e);
    return c.json({ error: `Failed to get templates: ${e}` }, 500);
  }
});

app.post("/make-server-cef03f12/templates", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for templates POST" }, 401);

  try {
    const { template } = await c.req.json();
    if (!template || !template.id) {
      return c.json({ error: "Template with id is required" }, 400);
    }
    await kv.set(`template:${userId}:${template.id}`, template);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Save template error:", e);
    return c.json({ error: `Failed to save template: ${e}` }, 500);
  }
});

app.delete("/make-server-cef03f12/templates/:id", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for templates DELETE" }, 401);

  try {
    const templateId = c.req.param("id");
    await kv.del(`template:${userId}:${templateId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Delete template error:", e);
    return c.json({ error: `Failed to delete template: ${e}` }, 500);
  }
});

// ── Sessions ──
app.get("/make-server-cef03f12/sessions", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for sessions GET" }, 401);

  try {
    const sessions = await kv.getByPrefix(`session:${userId}:`);
    return c.json({ sessions: sessions || [] });
  } catch (e) {
    console.log("Get sessions error:", e);
    return c.json({ error: `Failed to get sessions: ${e}` }, 500);
  }
});

app.post("/make-server-cef03f12/sessions", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for sessions POST" }, 401);

  try {
    const { session } = await c.req.json();
    if (!session || !session.id) {
      return c.json({ error: "Session with id is required" }, 400);
    }
    await kv.set(`session:${userId}:${session.id}`, session);

    // Track template usage when a completed session references a template
    if (session.completedAt && session.templateId) {
      try {
        const usageKey = `template_usage:${userId}:${session.templateId}`;
        const existing = await kv.get(usageKey) as any;
        const usageCount = (existing?.usageCount || 0) + 1;
        // Also fetch the actual template to snapshot exercise data for sharing
        let templateExercises = existing?.exercises || [];
        try {
          const tmpl = await kv.get(`template:${userId}:${session.templateId}`) as any;
          if (tmpl?.exercises) {
            templateExercises = tmpl.exercises;
          }
        } catch (_) { /* ignore */ }
        await kv.set(usageKey, {
          templateId: session.templateId,
          templateName: session.name || existing?.templateName || "Workout",
          category: session.category || existing?.category || "gym",
          exercises: templateExercises,
          exerciseCount: session.exercises?.length || existing?.exerciseCount || 0,
          usageCount,
          lastUsedAt: session.completedAt,
        });
        console.log(`[sessions] Updated template usage for ${session.templateId}: count=${usageCount}`);
      } catch (e) {
        console.log("[sessions] Template usage tracking error (non-fatal):", e);
      }
    }

    return c.json({ ok: true });
  } catch (e) {
    console.log("Save session error:", e);
    return c.json({ error: `Failed to save session: ${e}` }, 500);
  }
});

// ── Custom Exercises ──
app.post("/make-server-cef03f12/custom-exercises", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for custom-exercises POST" }, 401);

  try {
    const { exercise } = await c.req.json();
    if (!exercise || !exercise.id) {
      return c.json({ error: "Exercise with id is required" }, 400);
    }
    await kv.set(`custom_exercise:${userId}:${exercise.id}`, exercise);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Save custom exercise error:", e);
    return c.json({ error: `Failed to save custom exercise: ${e}` }, 500);
  }
});

app.delete("/make-server-cef03f12/custom-exercises/:id", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for custom-exercises DELETE" }, 401);

  try {
    const exerciseId = c.req.param("id");
    await kv.del(`custom_exercise:${userId}:${exerciseId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Delete custom exercise error:", e);
    return c.json({ error: `Failed to delete custom exercise: ${e}` }, 500);
  }
});

// ── Bulk Sync ──
// Accepts full local state and merges with server state.
// Returns the merged state so the client can update localStorage.
app.post("/make-server-cef03f12/sync", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for sync" }, 401);

  try {
    const { templates: localTemplates, sessions: localSessions, preferences: localPrefs, customExercises: localCustomExercises } = await c.req.json();

    // ── Preferences: smart merge ──
    // Read server prefs FIRST before any overwrite.
    const serverPrefs = await kv.get(`prefs:${userId}`) as Record<string, any> | null;

    let mergedPrefs;
    if (
      serverPrefs &&
      serverPrefs.onboardingComplete === true &&
      localPrefs &&
      localPrefs.onboardingComplete === false
    ) {
      // Server wins — user already completed onboarding on another device / session.
      // Local has fresh-install defaults, so do NOT overwrite.
      console.log(`[sync] Preferences: server wins (onboarding already complete for user ${userId})`);
      mergedPrefs = { ...serverPrefs };
    } else if (localPrefs) {
      // Local wins for most fields — user actively changed something on this device.
      // But ALWAYS prefer the server's displayName when the server has a real name.
      // This prevents cross-user contamination when a previous user's localStorage
      // wasn't fully cleared before a different user signed in.
      const finalPrefs = { ...localPrefs };
      if (
        serverPrefs &&
        serverPrefs.displayName &&
        serverPrefs.displayName !== "Athlete"
      ) {
        // Server has a real display name for this userId — always trust it.
        finalPrefs.displayName = serverPrefs.displayName;
        console.log(`[sync] Preferences: using server displayName "${serverPrefs.displayName}" for user ${userId} (local had "${localPrefs.displayName}")`);
      }
      console.log(`[sync] Preferences: local wins (onboardingComplete=${localPrefs.onboardingComplete} for user ${userId})`);
      await kv.set(`prefs:${userId}`, finalPrefs);
      mergedPrefs = finalPrefs;
    } else {
      console.log(`[sync] Preferences: using server or defaults for user ${userId}`);
      mergedPrefs = serverPrefs || {
        onboardingComplete: false,
        preferredStyle: null,
        displayName: "Athlete",
      };
    }

    // ── Templates: merge by ID ──
    const serverTemplates = (await kv.getByPrefix(`template:${userId}:`)) || [];
    const serverTemplateMap = new Map<string, any>();
    serverTemplates.forEach((t: any) => {
      if (t && t.id) serverTemplateMap.set(t.id, t);
    });

    // Push local templates to server (local wins on conflict since user just edited)
    if (localTemplates && Array.isArray(localTemplates)) {
      const keys: string[] = [];
      const values: any[] = [];
      for (const t of localTemplates) {
        if (t && t.id) {
          serverTemplateMap.set(t.id, t);
          keys.push(`template:${userId}:${t.id}`);
          values.push(t);
        }
      }
      if (keys.length > 0) {
        await kv.mset(keys, values);
      }
    }

    const mergedTemplates = Array.from(serverTemplateMap.values());

    // ── Sessions: merge by ID (sessions are append-only) ──
    const serverSessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    const sessionMap = new Map<string, any>();
    serverSessions.forEach((s: any) => {
      if (s && s.id) sessionMap.set(s.id, s);
    });

    if (localSessions && Array.isArray(localSessions)) {
      const keys: string[] = [];
      const values: any[] = [];
      for (const s of localSessions) {
        if (s && s.id && !sessionMap.has(s.id)) {
          sessionMap.set(s.id, s);
          keys.push(`session:${userId}:${s.id}`);
          values.push(s);
        }
      }
      if (keys.length > 0) {
        await kv.mset(keys, values);
      }
    }

    const mergedSessions = Array.from(sessionMap.values());

    // ── Custom Exercises: merge by ID (local wins) ──
    const serverCustomExercises = (await kv.getByPrefix(`custom_exercise:${userId}:`)) || [];
    const customExMap = new Map<string, any>();
    serverCustomExercises.forEach((e: any) => {
      if (e && e.id) customExMap.set(e.id, e);
    });

    if (localCustomExercises && Array.isArray(localCustomExercises)) {
      const keys: string[] = [];
      const values: any[] = [];
      for (const e of localCustomExercises) {
        if (e && e.id) {
          customExMap.set(e.id, e);
          keys.push(`custom_exercise:${userId}:${e.id}`);
          values.push(e);
        }
      }
      if (keys.length > 0) {
        await kv.mset(keys, values);
      }
    }

    const mergedCustomExercises = Array.from(customExMap.values());

    return c.json({
      preferences: mergedPrefs,
      templates: mergedTemplates,
      sessions: mergedSessions,
      customExercises: mergedCustomExercises,
    });
  } catch (e) {
    console.log("Sync error:", e);
    return c.json({ error: `Sync failed: ${e}` }, 500);
  }
});

// ── Exercise Library (Global catalog — no auth) ──
// Persists the full exercise catalog in KV so data isn't lost and can be managed independently.
// KV pattern: exercise:{id} → Exercise object

app.get("/make-server-cef03f12/exercises", async (c) => {
  try {
    const exercises = await kv.getByPrefix("exercise:");
    // Filter out exercise_gif: entries that also match
    const catalog = (exercises || []).filter(
      (e: any) => e && e.id && e.name && e.category
    );
    console.log(`[exercises] Returning ${catalog.length} exercises from catalog`);
    return c.json({ exercises: catalog });
  } catch (e) {
    console.log("Get exercises error:", e);
    return c.json({ error: `Failed to get exercises: ${e}` }, 500);
  }
});

app.post("/make-server-cef03f12/exercises", async (c) => {
  try {
    const { exercise } = await c.req.json();
    if (!exercise || !exercise.id || !exercise.name || !exercise.category) {
      return c.json(
        { error: "Exercise must have id, name, and category" },
        400
      );
    }
    await kv.set(`exercise:${exercise.id}`, exercise);
    console.log(`[exercises] Saved exercise: ${exercise.id} — ${exercise.name}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Save exercise error:", e);
    return c.json({ error: `Failed to save exercise: ${e}` }, 500);
  }
});

app.delete("/make-server-cef03f12/exercises/:id", async (c) => {
  try {
    const exerciseId = c.req.param("id");
    await kv.del(`exercise:${exerciseId}`);
    console.log(`[exercises] Deleted exercise: ${exerciseId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Delete exercise error:", e);
    return c.json({ error: `Failed to delete exercise: ${e}` }, 500);
  }
});

// Bulk seed: accepts an array of exercises and inserts them all (idempotent via upsert)
app.post("/make-server-cef03f12/exercises/seed", async (c) => {
  try {
    const { exercises } = await c.req.json();
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return c.json({ error: "Provide a non-empty 'exercises' array" }, 400);
    }

    const keys: string[] = [];
    const values: any[] = [];
    for (const ex of exercises) {
      if (ex && ex.id && ex.name && ex.category) {
        keys.push(`exercise:${ex.id}`);
        values.push(ex);
      }
    }

    if (keys.length > 0) {
      await kv.mset(keys, values);
    }

    console.log(`[exercises] Seeded ${keys.length} exercises into catalog`);
    return c.json({ ok: true, count: keys.length });
  } catch (e) {
    console.log("Seed exercises error:", e);
    return c.json({ error: `Failed to seed exercises: ${e}` }, 500);
  }
});

// ── Exercise GIF lookup (ExerciseDB via RapidAPI) ──
// Public route — no auth required since exercise data is not user-specific.
// Results are cached in KV to minimise external API calls.
// Pass ?refresh=1 to bypass cache and re-fetch from API.
app.get("/make-server-cef03f12/exercise-gif", async (c) => {
  try {
    const name = c.req.query("name");
    if (!name) {
      return c.json({ error: "Missing 'name' query parameter for exercise-gif lookup" }, 400);
    }

    const refresh = c.req.query("refresh") === "1";
    const cacheKey = `exercise_gif:${name.toLowerCase().trim()}`;

    // 1. Check cache first (skip if refresh requested)
    if (!refresh) {
      const cached = await kv.get(cacheKey);
      if (cached) {
        console.log(`[exercise-gif] Cache hit for "${name}"`);
        return c.json(cached as Record<string, unknown>);
      }
    }

    // 2. Call ExerciseDB API
    const apiKey = Deno.env.get("EXERCISEDB_API_KEY");
    if (!apiKey) {
      console.log("EXERCISEDB_API_KEY not configured");
      return c.json({
        found: false,
        gifUrl: null,
        exerciseName: name,
        error: "Exercise GIF service not configured — please add your RapidAPI key as EXERCISEDB_API_KEY"
      }, 200); // Return 200 with found:false so frontend can display gracefully
    }

    // Clean the name for search: remove hyphens, extra whitespace
    const cleanName = name.toLowerCase().trim().replace(/-/g, " ").replace(/\s+/g, " ");
    const searchTerm = encodeURIComponent(cleanName);

    console.log(`[exercise-gif] Searching ExerciseDB for: "${cleanName}" (key length: ${apiKey.length})`);

    const apiUrl = `https://exercisedb.p.rapidapi.com/exercises/name/${searchTerm}?offset=0&limit=10`;

    const res = await fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    });

    console.log(`[exercise-gif] ExerciseDB responded: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errText = await res.text().catch(() => "no body");
      console.log(`[exercise-gif] ExerciseDB API error body:`, errText);
      // Return a graceful 200 response with error info so frontend can display it
      return c.json({
        found: false,
        gifUrl: null,
        exerciseName: name,
        error: `ExerciseDB API returned ${res.status}: ${errText.substring(0, 200)}`
      });
    }

    let results: any;
    try {
      results = await res.json();
    } catch (parseErr) {
      console.log(`[exercise-gif] Failed to parse response JSON:`, parseErr);
      return c.json({
        found: false,
        gifUrl: null,
        exerciseName: name,
        error: "Failed to parse ExerciseDB response"
      });
    }

    console.log(`[exercise-gif] Got ${Array.isArray(results) ? results.length : 'non-array'} results for "${cleanName}"`);

    // Handle both array and non-array responses
    const resultsArray = Array.isArray(results) ? results : [];

    if (resultsArray.length === 0) {
      const notFound = { found: false, gifUrl: null, exerciseName: name };
      await kv.set(cacheKey, notFound);
      return c.json(notFound);
    }

    // Pick best match: exact match first, contains match, then first result
    const lowerName = cleanName;
    const exactMatch = resultsArray.find(
      (r: any) => r.name?.toLowerCase() === lowerName
    );
    const containsMatch = !exactMatch
      ? resultsArray.find((r: any) => r.name?.toLowerCase()?.includes(lowerName) || lowerName.includes(r.name?.toLowerCase() || ""))
      : null;
    const best = exactMatch || containsMatch || resultsArray[0];

    const result = {
      found: true,
      gifUrl: best.gifUrl || null,
      exerciseName: best.name || name,
      target: best.target || null,
      equipment: best.equipment || null,
      bodyPart: best.bodyPart || null,
      secondaryMuscles: best.secondaryMuscles || [],
      instructions: best.instructions || [],
    };

    console.log(`[exercise-gif] Best match: "${result.exerciseName}", gifUrl: ${result.gifUrl ? 'present' : 'null'}`);

    // Cache the result
    await kv.set(cacheKey, result);

    return c.json(result);
  } catch (e) {
    console.log("Exercise GIF lookup error:", e);
    return c.json({
      found: false,
      gifUrl: null,
      exerciseName: c.req.query("name") || "unknown",
      error: `Lookup failed: ${String(e).substring(0, 200)}`
    });
  }
});

// ── Clear exercise GIF cache (for debugging/refresh) ──
app.delete("/make-server-cef03f12/exercise-gif-cache", async (c) => {
  try {
    const cached = await kv.getByPrefix("exercise_gif:");
    if (cached && cached.length > 0) {
      const keys = cached.map((_: any, i: number) => `exercise_gif:${i}`);
      // We can't easily get the keys back from getByPrefix, so we'll skip bulk delete
      // Instead, individual exercises will be refreshed with ?refresh=1
    }
    return c.json({ ok: true, message: "Use ?refresh=1 on individual lookups to bypass cache" });
  } catch (e) {
    console.log("Cache clear error:", e);
    return c.json({ error: `Cache clear failed: ${e}` }, 500);
  }
});

// ── Profile Avatar (Supabase Storage) ──
// Upload: accepts base64 JPEG blob, stores in private bucket, returns signed URL
app.post("/make-server-cef03f12/avatar", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for avatar upload" }, 401);
  await ensureBuckets();

  try {
    const { image } = await c.req.json(); // base64 data URL
    if (!image) {
      return c.json({ error: "Missing 'image' field (base64 data URL)" }, 400);
    }

    // Parse the base64 data URL
    const matches = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return c.json({ error: "Invalid image format — expected base64 data URL (image/png or image/jpeg)" }, 400);
    }

    const ext = matches[1] === "jpg" ? "jpeg" : matches[1];
    const base64Data = matches[2];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const filePath = `${userId}/avatar.${ext}`;

    // Upload (upsert to overwrite previous avatar)
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, bytes, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.log("[avatar] Upload error:", uploadError);
      return c.json({ error: `Avatar upload failed: ${uploadError.message}` }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedError) {
      console.log("[avatar] Signed URL error:", signedError);
      return c.json({ error: `Failed to create signed URL: ${signedError.message}` }, 500);
    }

    // Also store the path in KV so we can regenerate the signed URL
    await kv.set(`avatar:${userId}`, { path: filePath, ext });

    console.log(`[avatar] Uploaded avatar for user ${userId}`);
    return c.json({ ok: true, url: signedData.signedUrl });
  } catch (e) {
    console.log("Avatar upload exception:", e);
    return c.json({ error: `Avatar upload exception: ${e}` }, 500);
  }
});

// Get current avatar signed URL
app.get("/make-server-cef03f12/avatar", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for avatar GET" }, 401);
  await ensureBuckets();

  try {
    const meta = await kv.get(`avatar:${userId}`) as { path: string; ext: string } | null;
    if (!meta || !meta.path) {
      return c.json({ url: null });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(meta.path, 60 * 60 * 24 * 365);

    if (error) {
      console.log("[avatar] Signed URL error:", error);
      return c.json({ url: null });
    }

    return c.json({ url: data.signedUrl });
  } catch (e) {
    console.log("Avatar GET error:", e);
    return c.json({ error: `Failed to get avatar: ${e}` }, 500);
  }
});

// Delete avatar
app.delete("/make-server-cef03f12/avatar", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for avatar DELETE" }, 401);

  try {
    const meta = await kv.get(`avatar:${userId}`) as { path: string; ext: string } | null;
    if (meta && meta.path) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.storage.from(AVATAR_BUCKET).remove([meta.path]);
    }
    await kv.del(`avatar:${userId}`);
    console.log(`[avatar] Deleted avatar for user ${userId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Avatar DELETE error:", e);
    return c.json({ error: `Failed to delete avatar: ${e}` }, 500);
  }
});

// ── Account Management ──

// Reset all user data (keep account + onboarding state)
app.post("/make-server-cef03f12/account/reset-data", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for data reset" }, 401);

  try {
    console.log(`[account] Resetting data for user ${userId}`);

    // Delete all templates
    const templates = (await kv.getByPrefix(`template:${userId}:`)) || [];
    for (const t of templates) {
      if (t && (t as any).id) {
        await kv.del(`template:${userId}:${(t as any).id}`);
      }
    }

    // Delete all sessions
    const sessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    for (const s of sessions) {
      if (s && (s as any).id) {
        await kv.del(`session:${userId}:${(s as any).id}`);
      }
    }

    // Delete all custom exercises
    const customExercises = (await kv.getByPrefix(`custom_exercise:${userId}:`)) || [];
    for (const e of customExercises) {
      if (e && (e as any).id) {
        await kv.del(`custom_exercise:${userId}:${(e as any).id}`);
      }
    }

    // Delete avatar from storage
    const avatarMeta = await kv.get(`avatar:${userId}`) as { path: string; ext: string } | null;
    if (avatarMeta && avatarMeta.path) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.storage.from(AVATAR_BUCKET).remove([avatarMeta.path]);
    }
    await kv.del(`avatar:${userId}`);

    // Reset preferences but keep onboarding complete + displayName
    const currentPrefs = await kv.get(`prefs:${userId}`) as Record<string, any> | null;
    await kv.set(`prefs:${userId}`, {
      onboardingComplete: true,
      preferredStyle: currentPrefs?.preferredStyle || null,
      displayName: currentPrefs?.displayName || "Athlete",
    });

    console.log(`[account] Data reset complete for user ${userId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Account reset error:", e);
    return c.json({ error: `Data reset failed: ${e}` }, 500);
  }
});

// Delete account entirely
app.delete("/make-server-cef03f12/account", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for account deletion" }, 401);

  try {
    console.log(`[account] Deleting account for user ${userId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete all KV data
    const templates = (await kv.getByPrefix(`template:${userId}:`)) || [];
    for (const t of templates) {
      if (t && (t as any).id) await kv.del(`template:${userId}:${(t as any).id}`);
    }

    const sessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    for (const s of sessions) {
      if (s && (s as any).id) await kv.del(`session:${userId}:${(s as any).id}`);
    }

    const customExercises = (await kv.getByPrefix(`custom_exercise:${userId}:`)) || [];
    for (const e of customExercises) {
      if (e && (e as any).id) await kv.del(`custom_exercise:${userId}:${(e as any).id}`);
    }

    // Delete avatar
    const avatarMeta = await kv.get(`avatar:${userId}`) as { path: string; ext: string } | null;
    if (avatarMeta && avatarMeta.path) {
      await supabase.storage.from(AVATAR_BUCKET).remove([avatarMeta.path]);
    }
    await kv.del(`avatar:${userId}`);

    // Delete preferences
    await kv.del(`prefs:${userId}`);

    // Delete the user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.log(`[account] Failed to delete user from auth: ${deleteError.message}`);
      return c.json({ error: `Failed to delete user: ${deleteError.message}` }, 500);
    }

    console.log(`[account] Account fully deleted for user ${userId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Account deletion error:", e);
    return c.json({ error: `Account deletion failed: ${e}` }, 500);
  }
});

// Change email
app.put("/make-server-cef03f12/account/email", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized: could not verify user for email change" }, 401);

  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: "New email is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });

    if (error) {
      console.log(`[account] Email change failed: ${error.message}`);
      return c.json({ error: `Email change failed: ${error.message}` }, 400);
    }

    console.log(`[account] Email changed for user ${userId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Email change error:", e);
    return c.json({ error: `Email change failed: ${e}` }, 500);
  }
});

// ══════════════════════════════════════════════════════════
// ── Community / Social Layer ──
// ══════════════════════════════════════════════════════════
//
// KV patterns:
//   profile:{userId}          → public profile (displayName, avatarUrl, preferredStyle, bio, joinedAt, workoutCount)
//   following:{userId}:{targetId} → who userId follows
//   follower:{targetId}:{userId}  → who follows targetId (mirrors "following" for reverse lookups)
//   activity:{userId}:{activityId} → public workout activity post
//   actlike:{activityId}:{likerId} → like record
//   actcomment:{activityId}:{commentId} → comment record

// ── Notification KV patterns ──
//   notification:{userId}:{notificationId} → notification object
//   notification_read:{userId} → timestamp of last "mark all read"

// ── Notification helper ──
// Creates a notification for a user. Deduplicates by checking a composed key.
async function createNotification(
  targetUserId: string,
  notification: {
    type: 'follow_back' | 'like' | 'comment' | 'app_update';
    fromUserId?: string;
    fromDisplayName?: string;
    fromAvatarUrl?: string | null;
    activityId?: string;
    activityName?: string;
    commentText?: string;
    title?: string;
    message?: string;
  }
) {
  try {
    const notifId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const notif = {
      id: notifId,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await kv.set(`notification:${targetUserId}:${notifId}`, notif);
    console.log(`[notifications] Created ${notification.type} notification for user ${targetUserId}`);
  } catch (e) {
    // Non-fatal — don't break the parent operation
    console.log(`[notifications] Failed to create notification: ${e}`);
  }
}

// ── Helper: get set of valid Supabase Auth user IDs ──
// Used to filter out KV data belonging to deleted users.
async function getValidUserIds(): Promise<Set<string>> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const ids = new Set<string>();
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.log("[auth] listUsers error:", error);
        break;
      }
      for (const u of users) ids.add(u.id);
      if (users.length < perPage) break;
      page++;
    }
    return ids;
  } catch (e) {
    console.log("[auth] Failed to list valid users:", e);
    return new Set();
  }
}

// ── Helper: clean up ALL orphaned KV data for a deleted userId ──
async function cleanupOrphanedUser(userId: string) {
  console.log(`[cleanup] Removing orphaned KV data for deleted user ${userId}`);
  try {
    // Profile
    await kv.del(`profile:${userId}`);
    // Preferences
    await kv.del(`prefs:${userId}`);
    // Avatar metadata
    await kv.del(`avatar:${userId}`);
    // Templates
    const templates = (await kv.getByPrefix(`template:${userId}:`)) || [];
    for (const t of templates) {
      if (t && (t as any).id) await kv.del(`template:${userId}:${(t as any).id}`);
    }
    // Sessions
    const sessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    for (const s of sessions) {
      if (s && (s as any).id) await kv.del(`session:${userId}:${(s as any).id}`);
    }
    // Custom exercises
    const exercises = (await kv.getByPrefix(`custom_exercise:${userId}:`)) || [];
    for (const e of exercises) {
      if (e && (e as any).id) await kv.del(`custom_exercise:${userId}:${(e as any).id}`);
    }
    // Activities
    const activities = (await kv.getByPrefix(`activity:${userId}:`)) || [];
    for (const a of activities) {
      if (a && (a as any).id) {
        await kv.del(`activity:${userId}:${(a as any).id}`);
        await kv.del(`activity_owner:${(a as any).id}`);
      }
    }
    // Following / follower records
    const following = (await kv.getByPrefix(`following:${userId}:`)) || [];
    for (const f of following) {
      if (f && (f as any).targetId) {
        await kv.del(`following:${userId}:${(f as any).targetId}`);
        await kv.del(`follower:${(f as any).targetId}:${userId}`);
      }
    }
    const followers = (await kv.getByPrefix(`follower:${userId}:`)) || [];
    for (const f of followers) {
      if (f && (f as any).followerId) {
        await kv.del(`follower:${userId}:${(f as any).followerId}`);
        await kv.del(`following:${(f as any).followerId}:${userId}`);
      }
    }
    // Notifications
    const notifs = (await kv.getByPrefix(`notification:${userId}:`)) || [];
    for (const n of notifs) {
      if (n && (n as any).id) await kv.del(`notification:${userId}:${(n as any).id}`);
    }
    await kv.del(`notification_read:${userId}`);
    // Template usage tracking
    const usageRecords = (await kv.getByPrefix(`template_usage:${userId}:`)) || [];
    for (const u of usageRecords) {
      if (u && (u as any).templateId) await kv.del(`template_usage:${userId}:${(u as any).templateId}`);
    }
    // Saved templates
    const savedTemplates = (await kv.getByPrefix(`saved_template:${userId}:`)) || [];
    for (const s of savedTemplates) {
      if (s && (s as any).id) await kv.del(`saved_template:${userId}:${(s as any).id}`);
    }
    // Workout media
    const media = (await kv.getByPrefix(`workout_media:${userId}:`)) || [];
    for (const m of media) {
      if (m && (m as any).path) {
        try {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          await supabase.storage.from(WORKOUT_MEDIA_BUCKET).remove([(m as any).path]);
        } catch (_e) { /* ignore */ }
      }
    }

    console.log(`[cleanup] Finished cleaning orphaned data for user ${userId}`);
  } catch (e) {
    console.log(`[cleanup] Error cleaning data for user ${userId}:`, e);
  }
}

// ── Helper: get or build public profile for a userId ──
async function getPublicProfile(userId: string) {
  const existing = await kv.get(`profile:${userId}`) as Record<string, any> | null;
  if (existing) return existing;

  // Build from preferences + avatar
  const prefs = await kv.get(`prefs:${userId}`) as Record<string, any> | null;
  const avatarMeta = await kv.get(`avatar:${userId}`) as { path: string; ext: string } | null;
  let avatarUrl = null;
  if (avatarMeta && avatarMeta.path) {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(avatarMeta.path, 60 * 60 * 24 * 365);
      avatarUrl = data?.signedUrl || null;
    } catch (_e) { /* ignore */ }
  }

  const profile = {
    userId,
    displayName: prefs?.displayName || "Athlete",
    avatarUrl,
    preferredStyle: prefs?.preferredStyle || null,
    bio: "",
    joinedAt: new Date().toISOString(),
  };

  await kv.set(`profile:${userId}`, profile);
  return profile;
}

// ── Upsert public profile (called internally) ──
async function upsertPublicProfile(userId: string, updates: Record<string, any>) {
  const existing = await getPublicProfile(userId);
  const merged = { ...existing, ...updates, userId };
  await kv.set(`profile:${userId}`, merged);
  return merged;
}

// ── Get own public profile ──
app.get("/make-server-cef03f12/community/profile/me", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const profile = await getPublicProfile(userId);

    // Count stats
    const sessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    const workoutCount = sessions.filter((s: any) => s && s.completedAt).length;

    const followers = (await kv.getByPrefix(`follower:${userId}:`)) || [];
    const following = (await kv.getByPrefix(`following:${userId}:`)) || [];

    return c.json({
      profile: {
        ...profile,
        workoutCount,
        followersCount: followers.length,
        followingCount: following.length,
      },
    });
  } catch (e) {
    console.log("Get own profile error:", e);
    return c.json({ error: `Failed to get profile: ${e}` }, 500);
  }
});

// ── Get another user's public profile ──
app.get("/make-server-cef03f12/community/profile/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");

    // Verify the target user still exists in Auth
    const validIds = await getValidUserIds();
    if (!validIds.has(targetId)) {
      cleanupOrphanedUser(targetId); // fire-and-forget
      return c.json({ error: "User not found" }, 404);
    }

    const profile = await getPublicProfile(targetId);

    // Count stats
    const sessions = (await kv.getByPrefix(`session:${targetId}:`)) || [];
    const workoutCount = sessions.filter((s: any) => s && s.completedAt).length;

    const followers = (await kv.getByPrefix(`follower:${targetId}:`)) || [];
    const following = (await kv.getByPrefix(`following:${targetId}:`)) || [];

    // Check if current user follows this target
    const followRecord = await kv.get(`following:${userId}:${targetId}`);
    const isFollowing = !!followRecord;

    // Get total volume, total duration for the target
    let totalVolume = 0;
    let totalDuration = 0;
    let totalSets = 0;
    let totalReps = 0;
    sessions.forEach((s: any) => {
      if (!s || !s.completedAt) return;
      totalDuration += (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 1000 / 60;
      (s.exercises || []).forEach((ex: any) => {
        (ex.sets || []).filter((set: any) => set.completed).forEach((set: any) => {
          totalVolume += (set.reps || 0) * (set.weight || 0);
          totalSets++;
          totalReps += set.reps || 0;
        });
      });
    });

    return c.json({
      profile: {
        ...profile,
        workoutCount,
        followersCount: followers.length,
        followingCount: following.length,
        isFollowing,
        totalVolume,
        totalDuration: Math.round(totalDuration),
        totalSets,
        totalReps,
      },
    });
  } catch (e) {
    console.log("Get user profile error:", e);
    return c.json({ error: `Failed to get user profile: ${e}` }, 500);
  }
});

// ── Update own public profile (bio, displayName) ──
app.put("/make-server-cef03f12/community/profile", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const updates = await c.req.json();
    // Only allow safe fields
    const safe: Record<string, any> = {};
    if (updates.displayName !== undefined) safe.displayName = updates.displayName;
    if (updates.bio !== undefined) safe.bio = updates.bio;
    if (updates.avatarUrl !== undefined) safe.avatarUrl = updates.avatarUrl;
    if (updates.preferredStyle !== undefined) safe.preferredStyle = updates.preferredStyle;

    const profile = await upsertPublicProfile(userId, safe);
    return c.json({ ok: true, profile });
  } catch (e) {
    console.log("Update profile error:", e);
    return c.json({ error: `Failed to update profile: ${e}` }, 500);
  }
});

// ── Follow a user ──
app.post("/make-server-cef03f12/community/follow/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");
    if (targetId === userId) {
      return c.json({ error: "Cannot follow yourself" }, 400);
    }

    // Check target exists
    const targetPrefs = await kv.get(`prefs:${targetId}`);
    if (!targetPrefs) {
      return c.json({ error: "User not found" }, 404);
    }

    const now = new Date().toISOString();

    // Dual write: following + follower
    await kv.mset(
      [`following:${userId}:${targetId}`, `follower:${targetId}:${userId}`],
      [
        { targetId, createdAt: now },
        { followerId: userId, createdAt: now },
      ]
    );

    // Create notification for the target user
    const profile = await getPublicProfile(userId);
    createNotification(targetId, {
      type: 'follow_back',
      fromUserId: userId,
      fromDisplayName: profile.displayName || "Athlete",
      fromAvatarUrl: profile.avatarUrl || null,
    });

    console.log(`[community] ${userId} followed ${targetId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Follow error:", e);
    return c.json({ error: `Follow failed: ${e}` }, 500);
  }
});

// ── Unfollow a user ──
app.delete("/make-server-cef03f12/community/follow/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");

    await kv.mdel([
      `following:${userId}:${targetId}`,
      `follower:${targetId}:${userId}`,
    ]);

    console.log(`[community] ${userId} unfollowed ${targetId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Unfollow error:", e);
    return c.json({ error: `Unfollow failed: ${e}` }, 500);
  }
});

// ── Get followers of a user ──
app.get("/make-server-cef03f12/community/followers/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");
    const followerRecords = (await kv.getByPrefix(`follower:${targetId}:`)) || [];

    // Enrich with profile info
    const profiles: any[] = [];
    for (const rec of followerRecords) {
      const r = rec as any;
      if (r && r.followerId) {
        const profile = await getPublicProfile(r.followerId);
        // Check if current user follows this person
        const followCheck = await kv.get(`following:${userId}:${r.followerId}`);
        profiles.push({
          ...profile,
          isFollowing: !!followCheck,
          isMe: r.followerId === userId,
        });
      }
    }

    return c.json({ followers: profiles });
  } catch (e) {
    console.log("Get followers error:", e);
    return c.json({ error: `Failed to get followers: ${e}` }, 500);
  }
});

// ── Get who a user follows ──
app.get("/make-server-cef03f12/community/following/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");
    const followingRecords = (await kv.getByPrefix(`following:${targetId}:`)) || [];

    const profiles: any[] = [];
    for (const rec of followingRecords) {
      const r = rec as any;
      if (r && r.targetId) {
        const profile = await getPublicProfile(r.targetId);
        const followCheck = await kv.get(`following:${userId}:${r.targetId}`);
        profiles.push({
          ...profile,
          isFollowing: !!followCheck,
          isMe: r.targetId === userId,
        });
      }
    }

    return c.json({ following: profiles });
  } catch (e) {
    console.log("Get following error:", e);
    return c.json({ error: `Failed to get following: ${e}` }, 500);
  }
});

// ── Post a workout activity ──
app.post("/make-server-cef03f12/community/activity", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { activity } = await c.req.json();
    if (!activity || !activity.id) {
      return c.json({ error: "Activity with id is required" }, 400);
    }

    // Enrich with current profile info
    const profile = await getPublicProfile(userId);

    // Check if workout media was uploaded for this session
    let mediaUrl = activity.mediaUrl || null;
    if (!mediaUrl) {
      const mediaMeta = await kv.get(`workout_media:${userId}:${activity.id}`) as any;
      if (mediaMeta?.url) mediaUrl = mediaMeta.url;
    }

    const enriched = {
      ...activity,
      userId,
      displayName: profile.displayName || "Athlete",
      avatarUrl: profile.avatarUrl || null,
      mediaUrl,
      postedAt: new Date().toISOString(),
    };

    await kv.set(`activity:${userId}:${activity.id}`, enriched);
    // Store a reverse-lookup so we can find the owner from just the activityId
    await kv.set(`activity_owner:${activity.id}`, { userId, sessionName: enriched.sessionName || enriched.name || "Workout" });

    // Also update workout count on profile
    const sessions = (await kv.getByPrefix(`session:${userId}:`)) || [];
    const workoutCount = sessions.filter((s: any) => s && s.completedAt).length;
    await upsertPublicProfile(userId, { workoutCount });

    console.log(`[community] Activity posted: ${activity.id} by ${userId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Post activity error:", e);
    return c.json({ error: `Failed to post activity: ${e}` }, 500);
  }
});

// ── Get a single activity post detail ──
app.get("/make-server-cef03f12/community/activity/:activityId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");

    // Find the activity owner via reverse-lookup
    const ownerInfo = await kv.get(`activity_owner:${activityId}`) as any;
    if (!ownerInfo?.userId) {
      return c.json({ error: "Activity not found" }, 404);
    }

    // Fetch the full activity record
    const activity = await kv.get(`activity:${ownerInfo.userId}:${activityId}`) as any;
    if (!activity) {
      return c.json({ error: "Activity not found" }, 404);
    }

    // Enrich with likes and comments
    const likes = (await kv.getByPrefix(`actlike:${activityId}:`)) || [];
    const commentsRaw = (await kv.getByPrefix(`actcomment:${activityId}:`)) || [];
    const myLike = await kv.get(`actlike:${activityId}:${userId}`);

    const sortedComments = commentsRaw
      .filter((cm: any) => cm && cm.commentId)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Get owner profile for latest info
    const ownerProfile = await getPublicProfile(ownerInfo.userId);

    const enriched = {
      ...activity,
      displayName: ownerProfile.displayName || activity.displayName || "Athlete",
      avatarUrl: ownerProfile.avatarUrl || activity.avatarUrl || null,
      likesCount: likes.length,
      commentsCount: sortedComments.length,
      isLiked: !!myLike,
      comments: sortedComments,
      likers: likes
        .filter((l: any) => l && l.likerId)
        .slice(0, 10)
        .map((l: any) => ({
          userId: l.likerId,
          displayName: l.displayName || "Athlete",
          avatarUrl: l.avatarUrl || null,
        })),
    };

    console.log(`[community] Activity detail fetched: ${activityId} by user ${userId}`);
    return c.json({ activity: enriched });
  } catch (e) {
    console.log("Get activity detail error:", e);
    return c.json({ error: `Failed to get activity: ${e}` }, 500);
  }
});

// ── Get community feed (activities from followed users) ──
app.get("/make-server-cef03f12/community/feed", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    // Get the set of user IDs that actually exist in Supabase Auth
    const validIds = await getValidUserIds();

    // Get who the user follows — only keep targets that still exist
    const followingRecords = (await kv.getByPrefix(`following:${userId}:`)) || [];
    const followedIds = followingRecords
      .map((r: any) => r?.targetId)
      .filter((id: string) => id && validIds.has(id)) as string[];

    // Also include own activities
    followedIds.push(userId);

    // Fetch activities from each followed user (limited scope for performance)
    const allActivities: any[] = [];
    for (const fId of followedIds) {
      const activities = (await kv.getByPrefix(`activity:${fId}:`)) || [];
      allActivities.push(...activities.filter((a: any) => a && a.id));
    }

    // Sort by postedAt/completedAt descending, limit to 50
    allActivities.sort((a: any, b: any) => {
      const dateA = new Date(a.postedAt || a.completedAt || 0).getTime();
      const dateB = new Date(b.postedAt || b.completedAt || 0).getTime();
      return dateB - dateA;
    });

    const sliced = allActivities.slice(0, 50);
    const enriched = await enrichActivities(sliced, userId);

    return c.json({ activities: enriched });
  } catch (e) {
    console.log("Get feed error:", e);
    return c.json({ error: `Failed to get feed: ${e}` }, 500);
  }
});

// ── Get a single user's activities ──
app.get("/make-server-cef03f12/community/activities/:targetId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");
    const activities = (await kv.getByPrefix(`activity:${targetId}:`)) || [];
    const valid = activities
      .filter((a: any) => a && a.id)
      .sort((a: any, b: any) => {
        const dateA = new Date((a as any).postedAt || (a as any).completedAt || 0).getTime();
        const dateB = new Date((b as any).postedAt || (b as any).completedAt || 0).getTime();
        return dateB - dateA;
      });
    const sliced = valid.slice(0, 30);
    const enriched = await enrichActivities(sliced, userId);
    return c.json({ activities: enriched });
  } catch (e) {
    console.log("Get user activities error:", e);
    return c.json({ error: `Failed to get activities: ${e}` }, 500);
  }
});

// ── Search / discover users ──
app.get("/make-server-cef03f12/community/search", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const query = (c.req.query("q") || "").toLowerCase().trim();

    // Get the set of user IDs that actually exist in Supabase Auth
    const validIds = await getValidUserIds();

    // Get all profiles and filter out deleted users
    const allProfiles = (await kv.getByPrefix("profile:")) || [];
    let results = allProfiles.filter((p: any) => {
      if (!p || !p.userId || p.userId === userId) return false;
      if (!validIds.has(p.userId)) {
        cleanupOrphanedUser(p.userId); // fire-and-forget
        return false;
      }
      return true;
    });

    // Filter by search query if provided
    if (query) {
      results = results.filter((p: any) =>
        (p.displayName || "").toLowerCase().includes(query)
      );
    }

    // Enrich with follow status
    const enriched: any[] = [];
    for (const p of results) {
      const profile = p as any;
      const followCheck = await kv.get(`following:${userId}:${profile.userId}`);
      // Get workout count
      const sessions = (await kv.getByPrefix(`session:${profile.userId}:`)) || [];
      const workoutCount = sessions.filter((s: any) => s && s.completedAt).length;

      enriched.push({
        ...profile,
        workoutCount,
        isFollowing: !!followCheck,
      });
    }

    // Sort: people with more workouts first
    enriched.sort((a, b) => (b.workoutCount || 0) - (a.workoutCount || 0));

    return c.json({ users: enriched.slice(0, 30) });
  } catch (e) {
    console.log("Search error:", e);
    return c.json({ error: `Search failed: ${e}` }, 500);
  }
});

// ── Discover athletes (popular / active users the current user doesn't follow) ──
app.get("/make-server-cef03f12/community/discover", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    // Get the set of user IDs that actually exist in Supabase Auth
    const validIds = await getValidUserIds();

    const allProfiles = (await kv.getByPrefix("profile:")) || [];
    const followingRecords = (await kv.getByPrefix(`following:${userId}:`)) || [];
    const followedSet = new Set(followingRecords.map((r: any) => r?.targetId).filter(Boolean));

    const suggestions: any[] = [];
    for (const p of allProfiles) {
      const profile = p as any;
      if (!profile || !profile.userId) continue;

      // Skip deleted users and clean up their orphaned KV data
      if (!validIds.has(profile.userId)) {
        cleanupOrphanedUser(profile.userId); // fire-and-forget
        continue;
      }

      if (profile.userId === userId || followedSet.has(profile.userId)) {
        continue;
      }

      const sessions = (await kv.getByPrefix(`session:${profile.userId}:`)) || [];
      const workoutCount = sessions.filter((s: any) => s && s.completedAt).length;

      suggestions.push({
        ...profile,
        workoutCount,
        isFollowing: false,
      });
    }

    suggestions.sort((a, b) => (b.workoutCount || 0) - (a.workoutCount || 0));

    return c.json({ users: suggestions.slice(0, 20) });
  } catch (e) {
    console.log("Discover error:", e);
    return c.json({ error: `Discover failed: ${e}` }, 500);
  }
});

// Helper: enrich a batch of activities with like/comment counts + current-user liked status
async function enrichActivities(activities: any[], currentUserId: string) {
  const enriched: any[] = [];
  for (const a of activities) {
    const likes = (await kv.getByPrefix(`actlike:${a.id}:`)) || [];
    const comments = (await kv.getByPrefix(`actcomment:${a.id}:`)) || [];
    const myLike = await kv.get(`actlike:${a.id}:${currentUserId}`);
    enriched.push({
      ...a,
      likesCount: likes.length,
      commentsCount: comments.length,
      isLiked: !!myLike,
    });
  }
  return enriched;
}

// ══════════════════════════════════════════════════════════
// ── Likes & Comments ──
// ══════════════════════════════════════════════════════════

// ── Like an activity ──
app.post("/make-server-cef03f12/community/activity/:activityId/like", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");
    const profile = await getPublicProfile(userId);

    await kv.set(`actlike:${activityId}:${userId}`, {
      likerId: userId,
      displayName: profile.displayName || "Athlete",
      avatarUrl: profile.avatarUrl || null,
      createdAt: new Date().toISOString(),
    });

    // Notify the activity owner
    const ownerInfo = await kv.get(`activity_owner:${activityId}`) as any;
    if (ownerInfo?.userId && ownerInfo.userId !== userId) {
      createNotification(ownerInfo.userId, {
        type: 'like',
        fromUserId: userId,
        fromDisplayName: profile.displayName || "Athlete",
        fromAvatarUrl: profile.avatarUrl || null,
        activityId,
        activityName: ownerInfo.sessionName || "Workout",
      });
    }

    console.log(`[community] ${userId} liked activity ${activityId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Like error:", e);
    return c.json({ error: `Like failed: ${e}` }, 500);
  }
});

// ── Unlike an activity ──
app.delete("/make-server-cef03f12/community/activity/:activityId/like", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");
    await kv.del(`actlike:${activityId}:${userId}`);
    console.log(`[community] ${userId} unliked activity ${activityId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Unlike error:", e);
    return c.json({ error: `Unlike failed: ${e}` }, 500);
  }
});

// ── Add a comment ──
app.post("/make-server-cef03f12/community/activity/:activityId/comment", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");
    const { text } = await c.req.json();
    if (!text || !text.trim()) {
      return c.json({ error: "Comment text is required" }, 400);
    }

    const profile = await getPublicProfile(userId);
    const commentId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

    const comment = {
      commentId,
      userId,
      displayName: profile.displayName || "Athlete",
      avatarUrl: profile.avatarUrl || null,
      text: text.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`actcomment:${activityId}:${commentId}`, comment);

    // Notify the activity owner
    const ownerInfo = await kv.get(`activity_owner:${activityId}`) as any;
    if (ownerInfo?.userId && ownerInfo.userId !== userId) {
      createNotification(ownerInfo.userId, {
        type: 'comment',
        fromUserId: userId,
        fromDisplayName: profile.displayName || "Athlete",
        fromAvatarUrl: profile.avatarUrl || null,
        activityId,
        activityName: ownerInfo.sessionName || "Workout",
        commentText: text.trim().slice(0, 100),
      });
    }

    console.log(`[community] ${userId} commented on activity ${activityId}`);
    return c.json({ ok: true, comment });
  } catch (e) {
    console.log("Comment error:", e);
    return c.json({ error: `Comment failed: ${e}` }, 500);
  }
});

// ── Get comments for an activity ──
app.get("/make-server-cef03f12/community/activity/:activityId/comments", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");
    const comments = (await kv.getByPrefix(`actcomment:${activityId}:`)) || [];
    const sorted = comments
      .filter((c: any) => c && c.commentId)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return c.json({ comments: sorted });
  } catch (e) {
    console.log("Get comments error:", e);
    return c.json({ error: `Failed to get comments: ${e}` }, 500);
  }
});

// ── Delete a comment (only author can delete) ──
app.delete("/make-server-cef03f12/community/activity/:activityId/comment/:commentId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const activityId = c.req.param("activityId");
    const commentId = c.req.param("commentId");

    const comment = await kv.get(`actcomment:${activityId}:${commentId}`) as any;
    if (!comment) return c.json({ error: "Comment not found" }, 404);
    if (comment.userId !== userId) return c.json({ error: "Cannot delete another user's comment" }, 403);

    await kv.del(`actcomment:${activityId}:${commentId}`);
    console.log(`[community] ${userId} deleted comment ${commentId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Delete comment error:", e);
    return c.json({ error: `Delete comment failed: ${e}` }, 500);
  }
});

// ══════════════════════════════════════════════════════════
// ── Notifications ──
// ══════════════════════════════════════════════════════════

// ── Get notifications for the current user ──
app.get("/make-server-cef03f12/notifications", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const raw = (await kv.getByPrefix(`notification:${userId}:`)) || [];
    const notifications = raw
      .filter((n: any) => n && n.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    // Count unread
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return c.json({ notifications, unreadCount });
  } catch (e) {
    console.log("Get notifications error:", e);
    return c.json({ error: `Failed to get notifications: ${e}` }, 500);
  }
});

// ── Mark all notifications as read ──
app.put("/make-server-cef03f12/notifications/read", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const raw = (await kv.getByPrefix(`notification:${userId}:`)) || [];
    const keys: string[] = [];
    const values: any[] = [];
    for (const n of raw) {
      const notif = n as any;
      if (notif && notif.id && !notif.read) {
        keys.push(`notification:${userId}:${notif.id}`);
        values.push({ ...notif, read: true });
      }
    }
    if (keys.length > 0) {
      await kv.mset(keys, values);
    }
    console.log(`[notifications] Marked ${keys.length} notifications as read for user ${userId}`);
    return c.json({ ok: true, markedRead: keys.length });
  } catch (e) {
    console.log("Mark notifications read error:", e);
    return c.json({ error: `Failed to mark notifications read: ${e}` }, 500);
  }
});

// ── Post an app-update notification to ALL users ──
app.post("/make-server-cef03f12/notifications/app-update", async (c) => {
  try {
    const { title, message } = await c.req.json();
    if (!title || !message) {
      return c.json({ error: "title and message are required" }, 400);
    }

    // Broadcast to all users with profiles
    const allProfiles = (await kv.getByPrefix("profile:")) || [];
    let count = 0;
    for (const p of allProfiles) {
      const prof = p as any;
      if (prof?.userId) {
        await createNotification(prof.userId, {
          type: 'app_update',
          title,
          message,
        });
        count++;
      }
    }

    console.log(`[notifications] Broadcast app_update to ${count} users: "${title}"`);
    return c.json({ ok: true, count });
  } catch (e) {
    console.log("App update notification error:", e);
    return c.json({ error: `Failed to broadcast: ${e}` }, 500);
  }
});

// ══════════════════════════════════════════════════════════
// ── Template Usage / Sharing / Workout Media ──
// ══════════════════════════════════════════════════════════

// ── Get top templates for a user (public) ──
app.get("/make-server-cef03f12/community/profile/:targetId/top-templates", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");
    const usageRecords = (await kv.getByPrefix(`template_usage:${targetId}:`)) || [];

    // Sort by usageCount descending, take top 3
    const sorted = usageRecords
      .filter((r: any) => r && r.templateId && r.usageCount > 0)
      .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 3);

    // Enrich with full template data if available
    const templates: any[] = [];
    for (const usage of sorted) {
      const u = usage as any;
      // Try to get the actual template for exercise details
      const template = await kv.get(`template:${targetId}:${u.templateId}`) as any;
      // Fall back to exercises stored in the usage record (snapshot from session save)
      const exercises = template?.exercises || u.exercises || [];
      const exerciseCount = exercises.length || u.exerciseCount || 0;
      templates.push({
        templateId: u.templateId,
        templateName: template?.name || u.templateName || "Workout",
        category: template?.category || u.category || "gym",
        exercises,
        exerciseCount,
        usageCount: u.usageCount || 0,
        lastUsedAt: u.lastUsedAt,
        // Estimate duration from exercises
        estimatedMinutes: exercises.length > 0
          ? Math.round(exercises.reduce((a: number, e: any) => a + (e.sets || 3) * 1.5 + ((e.restSeconds || 60) * ((e.sets || 3) - 1)) / 60, 0))
          : 0,
      });
    }

    return c.json({ templates });
  } catch (e) {
    console.log("Get top templates error:", e);
    return c.json({ error: `Failed to get top templates: ${e}` }, 500);
  }
});

// ── Get ALL templates for a user (for their public profile) ──
app.get("/make-server-cef03f12/community/profile/:targetId/templates", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const targetId = c.req.param("targetId");

    // Fetch all templates the user has created
    const allTemplates = (await kv.getByPrefix(`template:${targetId}:`)) || [];
    const validTemplates = allTemplates.filter(
      (t: any) => t && t.id && t.name && t.exercises
    );

    // Also fetch usage records to enrich with usage counts
    const usageRecords = (await kv.getByPrefix(`template_usage:${targetId}:`)) || [];
    const usageMap = new Map<string, number>();
    for (const u of usageRecords) {
      const rec = u as any;
      if (rec && rec.templateId) {
        usageMap.set(rec.templateId, rec.usageCount || 0);
      }
    }

    // Build response: all templates with usage counts, sorted by usage desc then by creation date desc
    const templates = validTemplates.map((t: any) => {
      const exercises = t.exercises || [];
      const usageCount = usageMap.get(t.id) || 0;
      return {
        templateId: t.id,
        templateName: t.name,
        category: t.category || "gym",
        exercises,
        exerciseCount: exercises.length,
        usageCount,
        createdAt: t.createdAt || "",
        estimatedMinutes: exercises.length > 0
          ? Math.round(exercises.reduce((a: number, e: any) => a + (e.sets || 3) * 1.5 + ((e.restSeconds || 60) * ((e.sets || 3) - 1)) / 60, 0))
          : 0,
      };
    });

    // Sort: most used first, then newest first
    templates.sort((a: any, b: any) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    console.log(`[templates] Returning ${templates.length} templates for user ${targetId}`);
    return c.json({ templates });
  } catch (e) {
    console.log("Get user templates error:", e);
    return c.json({ error: `Failed to get user templates: ${e}` }, 500);
  }
});

// ── Save (duplicate) another user's template ──
app.post("/make-server-cef03f12/community/templates/save", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { templateId, ownerId } = await c.req.json();
    if (!templateId || !ownerId) {
      return c.json({ error: "templateId and ownerId are required" }, 400);
    }

    console.log(`[templates/save] User ${userId} saving template ${templateId} from owner ${ownerId}`);

    // Fetch the original template
    let original = await kv.get(`template:${ownerId}:${templateId}`) as any;

    // If original template not found by exact key, search all owner templates
    // (the templateId from usage records might differ from the stored key)
    if (!original) {
      console.log(`[templates/save] Template not found at template:${ownerId}:${templateId}, searching all owner templates...`);
      const allOwnerTemplates = (await kv.getByPrefix(`template:${ownerId}:`)) || [];
      original = allOwnerTemplates.find((t: any) => t && (t.id === templateId || t.name === templateId));
      if (original) {
        console.log(`[templates/save] Found template by search: ${original.id} — ${original.name}`);
      }
    }

    // If still not found, try to reconstruct from usage record
    if (!original) {
      console.log(`[templates/save] Still not found, checking usage record...`);
      const usageRecord = await kv.get(`template_usage:${ownerId}:${templateId}`) as any;
      if (usageRecord) {
        console.log(`[templates/save] Found usage record, creating minimal template`);
        original = {
          id: templateId,
          name: usageRecord.templateName || "Workout",
          category: usageRecord.category || "gym",
          exercises: [],
          createdAt: usageRecord.lastUsedAt || new Date().toISOString(),
        };
      }
    }

    if (!original) {
      console.log(`[templates/save] Template ${templateId} from owner ${ownerId} not found anywhere`);
      return c.json({ error: "Template not found — it may have been deleted by the owner" }, 404);
    }

    // Get owner's profile for attribution
    const ownerProfile = await getPublicProfile(ownerId);

    // Create a new template ID for the saved copy
    const savedId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

    // Save as the user's own template (so they can use it)
    const savedTemplate = {
      ...original,
      id: savedId,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`template:${userId}:${savedId}`, savedTemplate);

    // Also store a record in saved_templates for attribution/display
    const savedRecord = {
      id: savedId,
      originalTemplateId: templateId,
      originalOwnerId: ownerId,
      originalOwnerName: ownerProfile.displayName || "Athlete",
      originalOwnerAvatar: ownerProfile.avatarUrl || null,
      templateName: original.name,
      category: original.category,
      exercises: original.exercises,
      exerciseCount: original.exercises?.length || 0,
      savedAt: new Date().toISOString(),
    };
    await kv.set(`saved_template:${userId}:${savedId}`, savedRecord);

    console.log(`[templates/save] User ${userId} saved template ${templateId} from ${ownerId} as ${savedId}`);
    return c.json({ ok: true, savedId, template: savedTemplate });
  } catch (e) {
    console.log("Save template error:", e);
    return c.json({ error: `Failed to save template: ${e}` }, 500);
  }
});

// ── Get saved templates for current user ──
app.get("/make-server-cef03f12/community/saved-templates", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const records = (await kv.getByPrefix(`saved_template:${userId}:`)) || [];
    const sorted = records
      .filter((r: any) => r && r.id)
      .sort((a: any, b: any) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());

    return c.json({ savedTemplates: sorted });
  } catch (e) {
    console.log("Get saved templates error:", e);
    return c.json({ error: `Failed to get saved templates: ${e}` }, 500);
  }
});

// ── Delete a saved template ──
app.delete("/make-server-cef03f12/community/saved-templates/:id", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const savedId = c.req.param("id");
    await kv.del(`saved_template:${userId}:${savedId}`);
    // Also delete the template copy itself
    await kv.del(`template:${userId}:${savedId}`);
    console.log(`[templates] User ${userId} removed saved template ${savedId}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Delete saved template error:", e);
    return c.json({ error: `Failed to delete saved template: ${e}` }, 500);
  }
});

// ── Upload workout media (photo) ──
app.post("/make-server-cef03f12/workout-media", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { sessionId, image } = await c.req.json();
    if (!sessionId || !image) {
      return c.json({ error: "sessionId and image (base64 data URL) are required" }, 400);
    }

    // Parse the base64 data URL
    const matches = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return c.json({ error: "Invalid image format — expected base64 data URL (image/png or image/jpeg)" }, 400);
    }

    const ext = matches[1] === "jpg" ? "jpeg" : matches[1];
    const base64Data = matches[2];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const filePath = `${userId}/${sessionId}.${ext}`;

    // Upload (upsert to handle re-uploads)
    const { error: uploadError } = await supabase.storage
      .from(WORKOUT_MEDIA_BUCKET)
      .upload(filePath, bytes, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.log("[workout-media] Upload error:", uploadError);
      return c.json({ error: `Media upload failed: ${uploadError.message}` }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(WORKOUT_MEDIA_BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedError) {
      console.log("[workout-media] Signed URL error:", signedError);
      return c.json({ error: `Failed to create signed URL: ${signedError.message}` }, 500);
    }

    // Store metadata in KV
    await kv.set(`workout_media:${userId}:${sessionId}`, {
      path: filePath,
      ext,
      url: signedData.signedUrl,
      uploadedAt: new Date().toISOString(),
    });

    console.log(`[workout-media] Uploaded media for session ${sessionId} by user ${userId}`);
    return c.json({ ok: true, url: signedData.signedUrl });
  } catch (e) {
    console.log("Workout media upload error:", e);
    return c.json({ error: `Workout media upload failed: ${e}` }, 500);
  }
});

// ── Get workout media for a session ──
app.get("/make-server-cef03f12/workout-media/:sessionId", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const sessionId = c.req.param("sessionId");
    const meta = await kv.get(`workout_media:${userId}:${sessionId}`) as any;
    if (!meta || !meta.path) {
      return c.json({ url: null });
    }
    return c.json({ url: meta.url });
  } catch (e) {
    console.log("Get workout media error:", e);
    return c.json({ error: `Failed to get workout media: ${e}` }, 500);
  }
});

// ── Admin: cleanup all orphaned KV data for deleted users ──
app.post("/make-server-cef03f12/admin/cleanup-orphans", async (c) => {
  try {
    const validIds = await getValidUserIds();
    const allProfiles = (await kv.getByPrefix("profile:")) || [];
    let cleaned = 0;

    for (const p of allProfiles) {
      const profile = p as any;
      if (profile?.userId && !validIds.has(profile.userId)) {
        await cleanupOrphanedUser(profile.userId);
        cleaned++;
      }
    }

    console.log(`[admin] Orphan cleanup complete: removed ${cleaned} deleted user(s)`);
    return c.json({ ok: true, cleaned });
  } catch (e) {
    console.log("Admin cleanup error:", e);
    return c.json({ error: `Cleanup failed: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);