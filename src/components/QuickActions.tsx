import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, BarChart3, Briefcase, Target } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add',
      label: 'Добавить',
      icon: Plus,
      onClick: () => navigate('/entries'),
      highlight: true,
    },
    {
      id: 'container',
      label: 'Контейнер',
      icon: Package,
      onClick: () => navigate('/entries'),
    },
    {
      id: 'analytics',
      label: 'Аналитика',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
    },
    {
      id: 'catalog',
      label: 'Каталог',
      icon: Briefcase,
      onClick: () => navigate('/works'),
    },
    {
      id: 'goal',
      label: 'Цель',
      icon: Target,
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      <div className="flex items-center justify-around sm:justify-center sm:gap-10 overflow-x-auto py-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer flex-shrink-0"
            >
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
                  act.highlight
                    ? 'bg-[#FF7A00] text-gray-950 hover:bg-[#ff881a] shadow-[0_0_18px_rgba(255,122,0,0.35)]'
                    : 'bg-black/5 dark:bg-[#1c1c1e] text-[#FF7A00] border border-black/5 dark:border-white/5 hover:border-[#FF7A00]/50 hover:bg-black/10 dark:hover:bg-[#262629]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110 ${
                    act.highlight ? 'stroke-[2.5]' : 'stroke-2'
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors tracking-tight text-center">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
