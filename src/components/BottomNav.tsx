import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  BarChart3,
  Settings,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Дашборд', icon: LayoutDashboard },
    { to: '/entries', label: 'Работа', icon: PlusCircle },
    { to: '/works', label: 'Каталог', icon: Briefcase },
    { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
    { to: '/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-50"
      aria-label="Мобильная навигация"
    >
      <div className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'text-[#FF7A00] font-bold'
                    : 'text-text-muted hover:text-text-main font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <span className="text-[9px] leading-tight tracking-tight select-none truncate max-w-[56px]">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
