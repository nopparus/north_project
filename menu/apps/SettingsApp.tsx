import React, { useState } from 'react';
import { User, Shield, Bell, Palette, FolderPlus, Terminal, Trash2, HardDrive, Check, Edit3, X, AlertTriangle } from 'lucide-react';
import { useApps } from '../context/AppContext';
import { ICONS } from '../constants';

const SettingItem = ({ icon: Icon, label, description, type, children }: any) => (
  <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/50 hover:bg-[#0f172a] transition-colors">
    <div className="flex items-center gap-5">
      <div className="p-3 bg-slate-900 rounded-xl text-slate-400 border border-slate-800">
        <Icon size={22} />
      </div>
      <div>
        <div className="font-semibold text-slate-100">{label}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
    </div>
    <div>
      {children || (
        type === 'toggle' ? (
          <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer shadow-inner">
            <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full shadow-sm" />
          </div>
        ) : (
          <div className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors cursor-pointer border border-slate-700 font-medium">
            Edit
          </div>
        )
      )}
    </div>
  </div>
);

const SettingsApp: React.FC = () => {
  const { apps, addApp, updateApp, removeApp, resetApps } = useApps();
  const [folderName, setFolderName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Dev');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', path: '' });
  
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName && displayName) {
      addApp(folderName, displayName, selectedIcon);
      setFolderName('');
      setDisplayName('');
      setSelectedIcon('Dev');
      setIsAdding(false);
    }
  };

  const startEditing = (app: any) => {
    setEditingId(app.id);
    setEditValues({ name: app.name, path: app.path });
  };

  const saveEdit = () => {
    if (editingId) {
      updateApp(editingId, { name: editValues.name, path: editValues.path });
      setEditingId(null);
    }
  };

  const handleReset = () => {
    if (confirmText === 'Delete') {
      resetApps();
      setIsResetting(false);
      setConfirmText('');
    }
  };

  const iconOptions = Object.keys(ICONS).filter(k => k !== 'Home');

  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12 pb-32">
      <header>
        <h2 className="text-3xl font-bold mb-2 text-slate-100">Settings</h2>
        <p className="text-slate-500">Configure your workspace and manage server applications.</p>
      </header>

      {/* Application Registry */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-600">Application Registry</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-sky-600/10"
          >
            <FolderPlus size={14} />
            Mount Server Folder
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddApp} className="mb-6 p-6 bg-[#0f172a] border border-sky-500/30 rounded-2xl animate-in slide-in-from-top-4 duration-300 shadow-2xl shadow-sky-500/5">
            <div className="flex items-center gap-3 mb-4 text-sky-400">
              <Terminal size={18} />
              <span className="text-sm font-mono font-bold">nexus@server:~/apps$ sudo mount</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Directory Path</label>
                <input 
                  type="text" 
                  placeholder="e.g. inventory-tool"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 font-mono text-sm focus:border-sky-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Module Name</label>
                <input 
                  type="text" 
                  placeholder="App Display Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 focus:border-sky-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1 block mb-3">Module Icon</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {iconOptions.map(iconKey => {
                  const IconComp = ICONS[iconKey as keyof typeof ICONS];
                  const isSelected = selectedIcon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`
                        p-3 rounded-xl border flex items-center justify-center transition-all relative
                        ${isSelected 
                          ? 'bg-sky-500/20 border-sky-500 text-sky-400' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}
                      `}
                      title={iconKey}
                    >
                      <IconComp size={20} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 shadow-lg">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
               <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-sm text-slate-500 px-4 py-2 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white text-sm px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-sky-900/10"
              >
                Confirm Mount
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {apps.map((app) => {
            const IconComp = ICONS[app.icon as keyof typeof ICONS] || HardDrive;
            const isEditing = editingId === app.id;

            return (
              <div key={app.id} className="p-6 bg-[#0f172a]/40 border border-slate-800 rounded-3xl group hover:border-slate-700 transition-all duration-300">
                {isEditing ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Name</label>
                        <input 
                          type="text" 
                          value={editValues.name}
                          onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-100 text-sm outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Path</label>
                        <input 
                          type="text" 
                          value={editValues.path}
                          onChange={e => setEditValues({ ...editValues, path: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-100 text-sm font-mono outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                      <button onClick={saveEdit} className="p-2 text-sky-400 hover:text-sky-300 transition-colors">
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 bg-slate-950 rounded-2xl border border-slate-800 ${app.color || 'text-sky-400'}`}>
                        <IconComp size={24} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-100">{app.name}</div>
                        <div className="text-xs text-slate-500 font-mono tracking-tighter">path: {app.path}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(app)}
                        className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        title="Edit App"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => removeApp(app.id)}
                        className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                        title="Delete App"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Standard Preferences */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-600 mb-6">Standard Preferences</h3>
        <SettingItem icon={User} label="Personal Information" description="Name, email, and avatar." type="button" />
        <SettingItem icon={Shield} label="Privacy & Security" description="Password and authentication." type="button" />
        <SettingItem icon={Bell} label="Push Notifications" description="Updates from all sub-apps." type="toggle" />
        <SettingItem icon={Palette} label="Appearance" description="Deep slate-blue high-contrast theme." type="toggle" />
      </section>

      {/* System Override / Purge */}
      <div className="mt-12 p-10 rounded-[2.5rem] border border-slate-800 bg-[#0f172a]/20 flex flex-col items-center text-center">
        <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl mb-6 border border-rose-500/20">
          <AlertTriangle size={32} />
        </div>
        <h4 className="text-slate-100 font-bold mb-2 text-xl tracking-tight">System Override</h4>
        <p className="text-slate-500 text-sm mb-10 max-w-md leading-relaxed">
          Resetting will clear all mounted folder configurations and restore defaults. This action cannot be undone.
        </p>
        
        {isResetting ? (
          <div className="w-full max-w-xs animate-in slide-in-from-bottom-2">
            <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">
              Type <span className="underline">Delete</span> to confirm
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                autoFocus
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
              />
              <button 
                onClick={handleReset}
                disabled={confirmText !== 'Delete'}
                className="bg-rose-600 disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsResetting(false)}
                className="text-slate-500 px-2 hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsResetting(true)}
            className="px-10 py-4 bg-slate-900 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/50 rounded-2xl transition-all font-bold shadow-xl shadow-black/40 active:scale-95"
          >
            Purge Application Data
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;