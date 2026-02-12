
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubApp } from '../types';
import { ICONS } from '../constants';

interface AppGridProps {
  apps: SubApp[];
}

const AppGrid: React.FC<AppGridProps> = ({ apps }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full w-full max-w-7xl mx-auto px-10 py-20 flex flex-col">
      <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="text-[10px] font-black text-sky-500 tracking-[0.3em] uppercase mb-3">Central Command</div>
          <h1 className="text-5xl font-extrabold text-slate-100 mb-2 tracking-tight">Nexus Portal</h1>
          <p className="text-slate-500 text-lg max-w-xl">Unified workspace for server-mounted applications. Cluster active: {apps.length} modules found.</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2">Core Telemetry</div>
          <div className="h-2 w-48 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div className="h-full bg-sky-500 w-1/3 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.6)] transition-all duration-1000" />
          </div>
          <div className="flex gap-4 mt-3">
             <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
               <span className="text-[10px] font-bold text-slate-600 uppercase">Sync Enabled</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-bold text-slate-600 uppercase">Latency 24ms</span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {apps.map((app, index) => {
          const IconComponent = ICONS[app.icon as keyof typeof ICONS] || ICONS.Dev;
          
          return (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className="group relative flex flex-col items-start p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:border-sky-500/40 transition-all duration-500 text-left hover:scale-[1.03] active:scale-[0.98] shadow-2xl hover:shadow-sky-500/10"
            >
              <div className="flex justify-between items-start w-full mb-10">
                <div className={`p-5 rounded-3xl bg-slate-950 border border-slate-800 group-hover:bg-slate-800 group-hover:scale-110 transition-all duration-500 ${app.color || 'text-sky-400'}`}>
                  <IconComponent size={32} />
                </div>
                <div className="text-[10px] font-black tracking-widest text-slate-700 group-hover:text-sky-500 transition-colors bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  REF {index.toString().padStart(2, '0')}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-sky-400 transition-colors">
                {app.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-3">
                {app.description}
              </p>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors">
                 <span className="uppercase tracking-widest">Access Module</span>
                 <div className="w-4 h-[1px] bg-slate-800 group-hover:bg-sky-500 group-hover:w-8 transition-all duration-500" />
              </div>

              {/* Decorative hover elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              </div>
            </button>
          );
        })}
      </div>

      <footer className="mt-auto pt-20 pb-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">
        <div className="mb-4 md:mb-0">Nexus Operations Command — Kernel 4.2.0-STABLE</div>
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500/50" />
            <span className="text-slate-500">Global Cluster Ready</span>
          </div>
          <span className="hover:text-sky-400 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-sky-400 cursor-pointer transition-colors">Documentation</span>
        </div>
      </footer>
    </div>
  );
};

export default AppGrid;
