import React, { useRef, useState } from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
  color?: string;
  isHighlight?: boolean; // For "Чистыми" indicator
  icon?: React.ReactNode;
  valueClassName?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  trend,
  subtext,
  isHighlight = false,
  icon,
  valueClassName,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isPositiveTrend = trend?.startsWith('↑');
  const isNegativeTrend = trend?.startsWith('↓');
  const isLongText = value.length > 14 && isNaN(Number(value.replace(/[^0-9.-]/g, '')));

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden min-w-0 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1 border shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${
        isHighlight
          ? 'bg-gradient-to-br from-[#FF7A00]/10 via-white to-white dark:from-[#FF7A00]/15 dark:via-[#141414] dark:to-[#141414] border-[#FF7A00]/30 dark:border-[#FF7A00]/30'
          : 'bg-white dark:bg-[#141414] border-black/5 dark:border-white/5'
      }`}
    >
      {/* Interactive Spotlight Radial Gradient Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 122, 0, ${
                isHighlight ? '0.22' : '0.12'
              }), transparent 75%)`
            : undefined,
        }}
      />

      {/* Subtle Top-Right Ambient Specular Reflection */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-orange/10 blur-2xl transition-all duration-500 group-hover:bg-accent-orange/20" />

      {/* Card Header: Label & Round Icon */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
          {label}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-[#FF7A00] shadow-sm transition-transform duration-300 group-hover:scale-105 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value & Trend */}
      <div className="relative z-10 flex items-baseline justify-between gap-2 mt-2 min-w-0">
        <span
          title={value}
          className={`tracking-tight min-w-0 ${
            valueClassName
              ? valueClassName
              : isLongText
              ? 'text-sm font-semibold font-heading truncate'
              : 'text-3xl sm:text-4xl font-bold font-heading tabular-nums'
          } ${
            isHighlight
              ? 'text-accent-orange drop-shadow-[0_0_12px_rgba(255,122,0,0.4)]'
              : 'text-[#1a1a1a] dark:text-white'
          }`}
        >
          {value}
        </span>

        {trend && (
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 transition-all ${
              isPositiveTrend
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : isNegativeTrend
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Optional Subtext */}
      {subtext && (
        <div className="relative z-10 text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium truncate">
          {subtext}
        </div>
      )}

      {/* Bottom Accent Line for Highlighted Card */}
      {isHighlight && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-orange to-transparent opacity-80" />
      )}
    </div>
  );
};
