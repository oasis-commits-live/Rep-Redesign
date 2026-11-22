import svgPaths from "../../imports/svg-sxupith9wk";

interface RepLogoProps {
  /** Width & height of the logo container */
  size?: number;
  /** Border radius in px */
  radius?: number;
  /** Additional className on the outer wrapper */
  className?: string;
}

/**
 * The official Rep app logo — obsidian black rounded-rect with the custom white "R" glyph,
 * matching the installed Android and iOS device icon.
 */
export function RepLogo({ size = 64, radius, className = '' }: RepLogoProps) {
  const r = radius ?? size * 0.22;

  return (
    <div
      className={`rounded-[22%] overflow-hidden ring-1 ring-black/10 dark:ring-white/15 ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg
        viewBox="0 0 92 92"
        fill="none"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="92"
          height="92"
          rx={r * (92 / size)}
          fill="#090A0D"
        />
        <path d={svgPaths.p239480f0} fill="#FFFFFF" />
        <path d={svgPaths.p3bc32000} fill="#FFFFFF" />
      </svg>
    </div>
  );
}
