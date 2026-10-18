import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '../lib/constants';
import { PeriodType } from '../lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PeriodSwitcherProps {
  mode: PeriodType;
  date: Date;
  onModeChange: (mode: PeriodType) => void;
  onShift: (dir: number) => void;
}

export const PeriodSwitcher: React.FC<PeriodSwitcherProps> = ({
  mode,
  date,
  onModeChange,
  onShift,
}) => {
  const getLabel = () => {
    if (mode === 'day') {
      return format(date, 'd MMMM yyyy', { locale: ru });
    }
    if (mode === 'month') {
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    }
    return `${date.getFullYear()} год`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 text-black dark:text-white rounded-full px-2 py-1 shadow-md text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => onShift(-1)}
          className="w-7 h-7 rounded-full bg-black/5 dark:bg-[#1c1c1e] hover:text-[#FF7A00] transition-colors text-gray-500 dark:text-gray-400 flex items-center justify-center"
          title="Назад"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 min-w-[110px] sm:min-w-[140px] text-center select-none text-[#1a1a1a] dark:text-white truncate text-xs sm:text-sm font-heading font-medium">
          {getLabel()}
        </span>
        <button
          type="button"
          onClick={() => onShift(1)}
          className="w-7 h-7 rounded-full bg-black/5 dark:bg-[#1c1c1e] hover:text-[#FF7A00] transition-colors text-gray-500 dark:text-gray-400 flex items-center justify-center"
          title="Вперёд"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex items-center bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 text-black dark:text-white p-1 rounded-full text-xs sm:text-sm shadow-md">
        {(['day', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => onModeChange(period)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full font-semibold transition-all text-xs sm:text-sm ${
              mode === period
                ? 'bg-[#FF7A00] text-gray-950 shadow-[0_0_14px_rgba(255,122,0,0.35)]'
                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {period === 'day' ? 'День' : period === 'month' ? 'Месяц' : 'Год'}
          </button>
        ))}
      </div>
    </div>
  );
};
