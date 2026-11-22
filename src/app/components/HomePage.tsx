import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Play, CheckCircle, BarChart3 } from 'lucide-react';
import { getPreferences, getTemplates, getSessions } from '../data/store';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG_LIGHT, CATEGORY_TEXT } from '../data/exercises';
import { format, isThisWeek } from 'date-fns';

export function HomePage() {
  const navigate = useNavigate();
  const prefs = getPreferences();
  const templates = getTemplates();
  const sessions = getSessions().filter(s => s.completedAt);
  const thisWeekSessions = sessions.filter(s => isThisWeek(new Date(s.completedAt!)));

  // Weekly volume (total weight * reps)
  const weeklyVolume = thisWeekSessions.reduce((total, s) => {
    return (
      total +
      s.exercises.reduce(
        (et, ex) =>
          et +
          ex.sets
            .filter(set => set.completed)
            .reduce((st, set) => st + set.reps * (set.weight || 0), 0),
        0
      )
    );
  }, 0);

  // Recent templates
  const recentTemplates = templates.slice(-5).reverse();

  // Recent sessions (last 5)
  const recentSessions = sessions
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return format(d, 'EEE, MMM d');
  };

  const formatDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins}m`;
  };

  const getSessionVolume = (s: typeof sessions[0]) => {
    return s.exercises.reduce(
      (a, ex) =>
        a +
        ex.sets
          .filter(set => set.completed)
          .reduce((b, set) => b + set.reps * (set.weight || 0), 0),
      0
    );
  };

  const now = new Date();
  const dayOfWeek = format(now, 'EEEE').toUpperCase();
  const monthDay = format(now, 'MMM d').toUpperCase();

  return (
    <div className="pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="w-10 h-10 rounded-full bg-[#e5e5ea] dark:bg-[#2c2c2e] flex items-center justify-center overflow-hidden">
            {(() => {
              try {
                const url = localStorage.getItem('forma_avatar_url');
                if (url) return <img src={url} alt="" className="w-full h-full object-cover" />;
              } catch {}
              return <span className="text-[#8e8e93] dark:text-[#aeaeb2] text-sm">{prefs.displayName.charAt(0).toUpperCase()}</span>;
            })()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1 className="text-[32px] tracking-[-0.9px] leading-[1.2] text-foreground" style={{ fontWeight: 600 }}>
            {dayOfWeek},
            <br />
            {monthDay}
          </h1>
        </motion.div>
      </div>

      {/* Weekly Volume Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-8"
      >
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 relative overflow-hidden shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] dark:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#8e8e93] dark:text-[#aeaeb2] tracking-[1.3px] uppercase" style={{ fontWeight: 500 }}>
              Weekly Volume
            </span>
            <BarChart3 className="w-[14px] h-[14px] text-[#8e8e93] dark:text-[#636366] opacity-50" />
          </div>
          <div className="font-numeric text-[42px] text-[#1c1c1e] dark:text-white tracking-[-1.05px]" style={{ fontWeight: 500 }}>
            {weeklyVolume > 0 ? weeklyVolume.toLocaleString() : '0'}
          </div>
          <span className="text-[14px] text-[#8e8e93] dark:text-[#aeaeb2]" style={{ fontWeight: 500 }}>
            lbs lifted
          </span>
        </div>
      </motion.div>

      {/* Templates Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between px-6 mb-4">
          <span className="text-[13px] text-[#8e8e93] dark:text-[#aeaeb2] tracking-[1.3px] uppercase" style={{ fontWeight: 500 }}>
            Templates
          </span>
          <button onClick={() => navigate('/builder/new')}>
            <Plus className="w-[14px] h-[14px] text-[#1c1c1e] dark:text-[#aeaeb2]" />
          </button>
        </div>

        {recentTemplates.length > 0 ? (
          <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar">
            {recentTemplates.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/workouts/${t.id}/live`)}
                className="flex-shrink-0 w-[160px] h-[200px] bg-white dark:bg-[#1c1c1e] rounded-[24px] p-[21px] flex flex-col justify-between shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] dark:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.3)] text-left"
              >
                <div>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-[12px] text-[11px] tracking-[0.55px] uppercase ${CATEGORY_BG_LIGHT[t.category]} ${CATEGORY_TEXT[t.category]}`}
                    style={{ fontWeight: 700 }}
                  >
                    {CATEGORY_LABELS[t.category]}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[rgba(229,229,234,0.5)] dark:bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <Play className="w-4 h-4 text-[#1c1c1e] dark:text-white ml-0.5" fill="currentColor" />
                </div>
                <div>
                  <div className="text-[18px] text-[#1c1c1e] dark:text-white truncate" style={{ fontWeight: 600 }}>
                    {t.name}
                  </div>
                  <div className="text-[12px] text-[#8e8e93] dark:text-[#aeaeb2]" style={{ fontWeight: 400 }}>
                    {t.exercises.reduce((a, e) => a + e.restSeconds, 0) > 0
                      ? `${Math.round(t.exercises.reduce((a, e) => a + e.sets * 1.5 + (e.restSeconds * (e.sets - 1)) / 60, 0))} min`
                      : `${t.exercises.length * 5} min`}
                    {' \u2022 '}
                    {t.exercises.length} exercises
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mx-6 bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 flex flex-col items-center shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] dark:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.3)]">
            <p className="text-[#8e8e93] dark:text-[#aeaeb2] text-[14px] mb-3">No templates yet</p>
            <button
              onClick={() => navigate('/builder/new')}
              className="flex items-center gap-2 text-[14px] text-[#34C759]"
              style={{ fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Create your first routine
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Section */}
      {recentSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-6"
        >
          <span className="text-[13px] text-[#8e8e93] dark:text-[#aeaeb2] tracking-[1.3px] uppercase block mb-4" style={{ fontWeight: 500 }}>
            Recent
          </span>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)] overflow-hidden">
            {recentSessions.map((s, i) => {
              const vol = getSessionVolume(s);
              const duration = s.completedAt
                ? formatDuration(s.startedAt, s.completedAt)
                : '';
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 ${
                    i < recentSessions.length - 1 ? 'border-b border-[#e5e5ea] dark:border-[rgba(255,255,255,0.08)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${CATEGORY_COLORS[s.category]}15` }}
                    >
                      <CheckCircle
                        className="w-[14px] h-[14px]"
                        style={{ color: CATEGORY_COLORS[s.category] }}
                      />
                    </div>
                    <div>
                      <div className="text-[14px] text-[#1c1c1e] dark:text-white" style={{ fontWeight: 600 }}>
                        {s.name}
                      </div>
                      <div className="text-[12px] text-[#8e8e93] dark:text-[#aeaeb2]" style={{ fontWeight: 400 }}>
                        {formatSessionDate(s.completedAt!)}
                        {duration && ` \u2022 ${duration}`}
                      </div>
                    </div>
                  </div>
                  <div className="font-numeric text-[12px] text-[#1c1c1e] dark:text-[#aeaeb2]" style={{ fontWeight: 500 }}>
                    {vol > 0 ? `${vol.toLocaleString()} lb` : 'BW'}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* FAB - Quick Start */}
      {recentTemplates.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/workouts/${recentTemplates[0].id}/live`)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#34C759] flex items-center justify-center shadow-[0px_25px_50px_-12px_rgba(52,199,89,0.3)] z-50"
        >
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </motion.button>
      )}
    </div>
  );
}
