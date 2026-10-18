import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Logo } from './Logo';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-[#1a1a1a] dark:text-white">
      {/* Desktop Sidebar: hidden on mobile (<768px), visible on md+ */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle Background Dot Pattern (2-3% opacity) */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.03] text-black dark:text-white"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1.25px, transparent 1.25px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Mobile Topbar (Clean, no hamburger) */}
        <header className="md:hidden flex items-center px-4 py-2.5 bg-white/80 dark:bg-[#121212]/85 backdrop-blur-xl border-b border-black/5 dark:border-white/10 z-30 flex-shrink-0">
          <Logo showText={true} size={28} subtitle="" />
        </header>

        {/* Scrollable Main View: extra bottom padding on mobile for floating dock */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-32 md:pb-8 w-full min-w-0 relative z-10">
          <div className="max-w-7xl mx-auto w-full min-w-0 pb-24 md:pb-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (Floating Island Dock) */}
        <BottomNav />
      </div>
    </div>
  );
};
