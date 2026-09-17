import React from 'react';
import { ViewTab } from '../types';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenSupport,
}) => {
  const navItems: { id: ViewTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'EXECUTIVE OVERVIEW', icon: 'dashboard' },
    { id: 'aps_demand', label: 'APS DEMAND', icon: 'precision_manufacturing' },
    { id: 'hr_actual', label: 'HR ACTUAL', icon: 'groups' },
    { id: 'ie_forecast', label: 'IE STANDARD', icon: 'analytics' },
    { id: 'global_feedback', label: 'GLOBAL FEEDBACK', icon: 'public' },
  ];

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-[#524437]/60 bg-[#1C1D22] py-8 flex flex-col z-50 select-none">
      <div className="px-6 mb-8">
        <h1 className="font-['Inter'] text-xl font-bold text-[#ffb86b] tracking-tight">
          IEC Manpower
        </h1>
        <p className="font-['JetBrains_Mono'] text-xs text-[#d7c3b2]/70 uppercase tracking-widest mt-1">
          Workforce Central
        </p>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="px-4">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 text-left rounded-md ${
                    isActive
                      ? "text-[#e5e1e6] font-bold bg-[#2a292d] relative before:content-[''] before:absolute before:left-0 before:w-1 before:h-5 before:bg-[#ffb86b] before:rounded-full"
                      : "text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 font-normal"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? 'text-[#ffb86b]' : 'text-[#d7c3b2]/70'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 mt-auto space-y-1 pt-4 border-t border-[#524437]/30">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 transition-colors text-left rounded-md"
        >
          <span className="material-symbols-outlined text-lg text-[#d7c3b2]/70">
            settings
          </span>
          <span>Settings</span>
        </button>
        <button
          onClick={onOpenSupport}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 transition-colors text-left rounded-md"
        >
          <span className="material-symbols-outlined text-lg text-[#d7c3b2]/70">
            help
          </span>
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
