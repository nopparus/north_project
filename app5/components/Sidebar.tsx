
import React from 'react';
import { NAVIGATION } from '../constants';
import { Project, WorkType } from '../types';
import { X, ShieldCheck, Briefcase, Plus, Calendar, Map, ClipboardCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  workMode: WorkType;
  setWorkMode: (mode: WorkType) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  onOpenAddProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  workMode,
  setWorkMode,
  isOpen, 
  isMobile, 
  onClose,
  projects,
  selectedProjectId,
  onProjectChange,
  onOpenAddProject
}) => {
  return (
    <aside 
      className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
        ${isOpen ? 'translate-x-0 w-64 md:w-72' : '-translate-x-full w-0'}
        bg-slate-900 h-screen text-white flex flex-col transition-all duration-300 ease-in-out shadow-2xl overflow-hidden
      `}
    >
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="truncate">
            <h1 className="text-lg font-bold leading-tight uppercase tracking-tighter">PMS Enterprise</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Facility & Survey</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Work Mode Switcher */}
      <div className="px-6 py-4 border-b border-slate-800/50">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Work Category</p>
        <div className="flex p-1 bg-slate-950 rounded-xl">
           <button 
            onClick={() => setWorkMode('PM')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${workMode === 'PM' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Calendar size={14} />
             <span>PM</span>
           </button>
           <button 
            onClick={() => setWorkMode('Survey')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${workMode === 'Survey' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Map size={14} />
             <span>Survey</span>
           </button>
        </div>
      </div>

      {/* Project Selector */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Project</label>
          <button 
            onClick={onOpenAddProject}
            className="p-1.5 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all hover:scale-105"
            title="Create New Project"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="relative">
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1.5 overflow-y-auto">
        {NAVIGATION.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
              activeTab === item.id 
                ? workMode === 'PM' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`}>
              {item.icon}
            </div>
            <span className="font-bold whitespace-nowrap text-sm tracking-tight uppercase">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 m-4 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">Connectivity</p>
        <div className="flex items-center space-x-2 text-xs font-black text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-tight">Server Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
