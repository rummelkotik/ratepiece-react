import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { to: '/', label: 'Дашборд', icon: LayoutDashboard },
    { to: '/entries', label: 'Добавление работы', icon: PlusCircle },
    { to: '/works', label: 'Каталог работ', icon: Briefcase },
    { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
    { to: '/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#101010] border-r border-black/5 dark:border-white/5 flex flex-col justify-between h-full select-none">
      <div>
        {/* Logo block */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5">
          <Logo showText={true} size={36} />
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-[#FF7A00]/10 text-[#FF7A00] border-l-2 border-[#FF7A00] font-semibold'
                      : 'border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom info card */}
      <div className="p-4">
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold font-heading text-gray-900 dark:text-white leading-tight">RatePiece</div>
            <div className="text-xs text-gray-500 leading-tight">v1.1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
