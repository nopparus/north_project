
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, LogOut, Settings, Shield } from 'lucide-react';
import { SubApp } from '../types';
import { ICONS } from '../constants';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  apps: SubApp[];
  currentAppId?: string;
  isSettingsPage?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ apps, currentAppId, isSettingsPage }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="h-full w-20 border-r border-slate-800 flex flex-col items-center py-6 bg-[#0f172a] shadow-2xl backdrop-blur-xl bg-opacity-95">
      {/* Branding / Home Trigger */}
      <button 
        onClick={() => navigate('/')}
        className="p-3 mb-8 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-lg shadow-sky-500/10 group"
        title="Nexus Portal Home"
      >
        <Shield size={26} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* App Icons Container */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto w-full items-center px-2 scrollbar-hide py-2">
        {apps.map(app => {
          const IconComponent = ICONS[app.icon as keyof typeof ICONS] || ICONS.Dev;
          const isActive = currentAppId === app.id;

          return (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className={`
                relative p-3 rounded-2xl transition-all duration-300 group
                ${isActive ? 'bg-slate-100 text-slate-900 shadow-xl' : 'bg-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-200'}
              `}
              title={app.name}
            >
              <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[100] border border-slate-700 shadow-2xl">
                {app.name}
              </div>

              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* System Actions Area */}
      <div className="mt-auto flex flex-col items-center gap-3 pt-6 border-t border-slate-800/50 w-full px-2">
        {/* Settings Gear - Always reachable for configuration */}
        <button 
          onClick={() => navigate('/system-settings')}
          className={`
            p-3 rounded-2xl transition-all duration-300 group
            ${isSettingsPage ? 'bg-slate-200 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}
          `}
          title="System Settings"
        >
          <Settings size={24} className={isSettingsPage ? '' : 'group-hover:rotate-90 transition-transform duration-700'} />
        </button>

        {/* Logout */}
        <button 
          onClick={logout}
          className="p-3 rounded-2xl text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-300"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
        
        {/* Status indicator */}
        <div className="flex flex-col items-center mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[8px] font-black text-slate-700 mt-1 tracking-tighter">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
