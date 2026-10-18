import React from 'react';
import { formatMoney } from '../lib/format';

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  current,
  target,
  size = 180,
  strokeWidth = 24,
}) => {
  const safeTarget = Math.max(0, target);
  const percentage = safeTarget > 0
    ? Math.min(100, Math.round((current / safeTarget) * 100))
    : current > 0 ? 100 : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="ring-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA64D" />
              <stop offset="100%" stopColor="#FF7A00" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/5 dark:text-white/10 fill-none"
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ring-orange-grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-700 ease-out"
            style={{ filter: 'drop-shadow(0 0 14px rgba(255,122,0,0.7))' }}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute flex items-center justify-center text-center">
          <span className="text-5xl font-extrabold font-mono tabular-nums text-[#1a1a1a] dark:text-white tracking-tight">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="text-center mt-4">
        <div className="text-sm font-semibold font-mono tabular-nums text-[#1a1a1a] dark:text-white">
          {formatMoney(current)} / {formatMoney(safeTarget)}
        </div>
        <div className="text-xs text-accent-orange font-semibold font-mono tabular-nums mt-0.5">
          {percentage}% выполнено в этом месяце
        </div>
      </div>
    </div>
  );
};
