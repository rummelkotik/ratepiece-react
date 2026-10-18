import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { ru } from 'date-fns/locale';
import { format, isToday } from 'date-fns';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseISODate, toISODate } from '../lib/format';

export interface DatePickerProps {
  value: string; // ISO format: 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Текущая дата:',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = parseISODate(value);
  const [month, setMonth] = useState<Date>(parsedDate);

  // Keep month synchronized when value changes
  useEffect(() => {
    setMonth(parseISODate(value));
  }, [value]);

  // Click outside and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (selectedDay: Date | undefined) => {
    if (selectedDay) {
      onChange(toISODate(selectedDay));
      setIsOpen(false);
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    onChange(toISODate(today));
    setMonth(today);
    setIsOpen(false);
  };

  // Formatted date string for button display
  const displayFormatted = (() => {
    try {
      const formatted = format(parsedDate, 'd MMMM yyyy', { locale: ru });
      return formatted;
    } catch {
      return value;
    }
  })();

  const isCurrentToday = isToday(parsedDate);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-2.5 w-full sm:w-auto ${className}`}
    >
      {label && (
        <span
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs font-medium text-text-muted shrink-0 select-none cursor-pointer"
        >
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 min-h-[42px] px-4 py-2 rounded-full bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-md hover:border-accent-orange/50 transition-all text-sm font-medium text-text-main cursor-pointer w-full sm:w-auto ${
          isOpen ? 'ring-2 ring-accent-orange/40 border-accent-orange' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <span className="font-heading capitalize text-sm truncate font-medium">
            {displayFormatted}
          </span>
          {isCurrentToday && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange hidden xs:inline-block">
              сегодня
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-accent-orange' : ''
          }`}
        />
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="bg-[#141414] border border-white/5 rounded-3xl shadow-2xl p-5 font-heading text-white min-w-[310px] max-w-[calc(100vw-2rem)] select-none">
            <DayPicker
              mode="single"
              selected={parsedDate}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonth}
              locale={ru}
              className="custom-day-picker"
              components={{
                Chevron: ({ orientation }) =>
                  orientation === 'left' ? (
                    <ChevronLeft className="w-5 h-5 text-white transition-colors hover:text-[#FF7A00]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white transition-colors hover:text-[#FF7A00]" />
                  ),
              }}
            />

            {/* Quick footer action: "Сегодня" button */}
            <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-4 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-accent-orange hover:text-gray-950 text-gray-300 font-bold transition-all cursor-pointer active:scale-95 border border-white/5"
              >
                Выбрать сегодня
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
