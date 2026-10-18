import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  subtitle = 'Твой сдельный заработок',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Scalable Vector Emblem with Theme-Adaptive Colors */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Vibrant Orange Gradient */}
          <linearGradient id="rp-orange-gradient" x1="2" y1="4" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA64D" />
            <stop offset="45%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#D95700" />
          </linearGradient>

          {/* Orange Glow filter */}
          <filter id="rp-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Squircle Container: Dark in dark mode, light glass in light mode */}
        <rect
          x="1"
          y="1"
          width="42"
          height="42"
          rx="12"
          strokeWidth="1.5"
          className="fill-white/80 dark:fill-zinc-900/90 stroke-black/10 dark:stroke-white/15 transition-colors duration-300 shadow-sm"
        />

        {/* Arc Sector / Gauge Arc (Always Vibrant Orange) */}
        <path
          d="M 12 28 A 12 12 0 1 1 32 24"
          stroke="url(#rp-orange-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#rp-glow-filter)"
        />

        {/* Secondary Technical Segment (Adaptive: Black/Graphite in light, White in dark) */}
        <path
          d="M 12 28 L 22 22 L 22 13"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-zinc-900 dark:stroke-white transition-colors duration-300"
        />

        {/* Dynamic Precision Notch / Piece Slice forming stylized 'P' & 'R' (Vibrant Orange) */}
        <path
          d="M 22 12 H 29 C 32.3 12 34 14.2 34 17 C 34 19.8 32.3 22 29 22 H 22 Z"
          fill="url(#rp-orange-gradient)"
        />

        {/* Central Pivot Hole (Adaptive Fill & Stroke) */}
        <circle
          cx="22"
          cy="22"
          r="3.2"
          strokeWidth="1.8"
          className="fill-zinc-100 dark:fill-[#0a0a0a] stroke-zinc-900 dark:stroke-white transition-colors duration-300"
        />

        {/* Diagonal Dynamic Ray */}
        <path
          d="M 24.5 24.5 L 33 33"
          stroke="url(#rp-orange-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Precision Micro-dots */}
        <circle
          cx="12"
          cy="16"
          r="1.3"
          className="fill-zinc-800 dark:fill-zinc-100 transition-colors duration-300"
        />
        <circle
          cx="15"
          cy="11"
          r="1.3"
          fill="#FF7A00"
        />
      </svg>

      {/* Typography with Space Grotesk heading */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading text-lg font-bold tracking-tight text-text-main flex items-center leading-none">
            Rate<span className="text-accent-orange ml-0.5">Piece</span>
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-text-muted mt-1 leading-none tracking-normal">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
