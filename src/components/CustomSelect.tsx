import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  disabled = false,
  className = '',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-black dark:text-white rounded-full px-4 py-2 text-sm text-left transition-all hover:border-accent-orange focus:outline-none focus:border-accent-orange shadow-sm cursor-pointer"
      >
        <span className={`truncate ${selectedOption ? 'font-medium text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-accent-orange' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {/* Matte Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-[0_16px_36px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.5)] p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-gray-500 dark:text-zinc-400 text-center">
              Нет доступных вариантов
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent-orange/15 text-accent-orange font-semibold'
                      : 'text-gray-900 dark:text-zinc-100 hover:bg-[#ff7a00]/10 hover:text-accent-orange'
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-accent-orange flex-shrink-0" strokeWidth={2} />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
