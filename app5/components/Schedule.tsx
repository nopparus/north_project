
import React, { useState, useRef, useEffect } from 'react';
import { EQUIPMENT_CONFIG, TASK_PRESETS } from '../constants';
import { EquipmentType, ScheduleItem, Project, WorkType } from '../types';
import { Plus, X, Calendar, Settings2, Clock, Check, Trash2, Edit3, Settings, Box, LayoutGrid } from 'lucide-react';

interface ScheduleProps {
  scheduleItems: ScheduleItem[];
  projectId: string;
  currentProject: Project;
  workMode: WorkType;
  onUpdateItems: (items: ScheduleItem[]) => void;
  onAddItem: (item: ScheduleItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateCategories: (categoryIds: string[]) => void;
}

const MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const Schedule: React.FC<ScheduleProps> = ({ 
  scheduleItems, 
  projectId, 
  currentProject,
  workMode,
  onUpdateItems, 
  onAddItem, 
  onDeleteItem,
  onUpdateCategories
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isCustomLabel, setIsCustomLabel] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTask, setNewTask] = useState({
    equipmentType: currentProject.equipmentTypes[0] || '',
    label: '',
    startMonth: 1,
    duration: 1
  });

  const [activeItem, setActiveItem] = useState<{ id: string, type: 'move' | 'resize', startX: number, initialStartMonth: number, initialDuration: number } | null>(null);
  const containerRef = useRef<HTMLTableSectionElement>(null);

  // เมื่อเปลี่ยนประเภทอุปกรณ์ ให้รีเซ็ต label ไปที่รายการแรกของ preset นั้นๆ
  useEffect(() => {
    if (!editingItemId && !isCustomLabel && newTask.equipmentType) {
      const presets = TASK_PRESETS[newTask.equipmentType] || [];
      if (presets.length > 0) {
        setNewTask(prev => ({ ...prev, label: presets[0] }));
      } else {
        setIsCustomLabel(true);
      }
    }
  }, [newTask.equipmentType, editingItemId, isCustomLabel]);

  const handleMouseDown = (e: React.MouseEvent, item: ScheduleItem, type: 'move' | 'resize') => {
    e.preventDefault(); e.stopPropagation();
    setActiveItem({ id: item.id, type, startX: e.clientX, initialStartMonth: item.startMonth, initialDuration: item.duration });
  };

  const handleDoubleClick = (e: React.MouseEvent, item: ScheduleItem) => {
    e.preventDefault(); e.stopPropagation();
    setEditingItemId(item.id);
    const presets = TASK_PRESETS[item.equipmentType] || [];
    const isCustom = !presets.includes(item.label);
    setIsCustomLabel(isCustom);
    setNewTask({ equipmentType: item.equipmentType, label: item.label, startMonth: item.startMonth, duration: item.duration });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeItem || !containerRef.current) return;
      const deltaX = e.clientX - activeItem.startX;
      const row = containerRef.current.querySelector('tr');
      if (!row) return;
      const monthArea = row.querySelector('.month-grid-container');
      if (!monthArea) return;
      const colWidth = monthArea.clientWidth / 12;
      const colDelta = Math.round(deltaX / colWidth);
      const updatedItems = scheduleItems.map(item => {
        if (item.id !== activeItem.id) return item;
        if (activeItem.type === 'move') {
          let newStartMonth = activeItem.initialStartMonth + colDelta;
          newStartMonth = Math.max(1, Math.min(13 - item.duration, newStartMonth));
          return { ...item, startMonth: newStartMonth };
        } else {
          let newDuration = activeItem.initialDuration + colDelta;
          newDuration = Math.max(1, Math.min(13 - item.startMonth, newDuration));
          return { ...item, duration: newDuration };
        }
      });
      onUpdateItems(updatedItems);
    };
    const handleMouseUp = () => setActiveItem(null);
    if (activeItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [activeItem, scheduleItems, onUpdateItems]);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemId) {
      onUpdateItems(scheduleItems.map(item => item.id === editingItemId ? { ...item, ...newTask } : item));
    } else {
      onAddItem({ id: `task-${Date.now()}`, projectId, ...newTask });
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingItemId(null); setIsCustomLabel(false);
    setNewTask({ equipmentType: currentProject.equipmentTypes[0] || '', label: '', startMonth: 1, duration: 1 });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !currentProject.equipmentTypes.includes(newCategoryName)) {
      onUpdateCategories([...currentProject.equipmentTypes, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const handleToggleCategory = (cat: string) => {
    if (currentProject.equipmentTypes.includes(cat)) {
      onUpdateCategories(currentProject.equipmentTypes.filter(c => c !== cat));
    } else {
      onUpdateCategories([...currentProject.equipmentTypes, cat]);
    }
  };

  const getEquipmentStyle = (type: string) => {
    return EQUIPMENT_CONFIG[type] || { label: type, icon: <Box size={20} />, color: 'bg-slate-500' };
  };

  const themeColor = workMode === 'PM' ? 'blue' : 'emerald';

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {workMode === 'PM' ? 'PM Timeline Management' : 'Survey Planning Timeline'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest flex items-center">
            <Settings2 size={14} className={`mr-1 text-${themeColor}-500`} />
            ตารางการทำงานรายโครงการ ({workMode})
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-700 text-slate-300 px-6 py-3.5 rounded-2xl font-black text-xs transition-all shadow-sm shadow-slate-900/20 hover:bg-slate-800"
          >
            <Settings size={18} />
            <span>จัดการประเภทหัวข้อ</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center justify-center space-x-2 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs transition-all shadow-xl hover:scale-105 active:scale-95 group`}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>เพิ่มแผนงาน {workMode} ใหม่</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] shadow-sm shadow-slate-900/20 border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1100px]">
            <thead className="bg-slate-950/50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-700 sticky left-0 bg-slate-950/50 z-20 w-56">Category</th>
                <th className="px-4 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-700 w-28">Frequency</th>
                {MONTHS.map((m, i) => <th key={i} className="px-2 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-700 min-w-[65px]">{m}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800" ref={containerRef}>
              {currentProject.equipmentTypes.map((type) => {
                const config = getEquipmentStyle(type);
                const typeItems = scheduleItems.filter(s => s.equipmentType === type);
                return (
                  <tr key={type} className="hover:bg-slate-800/50 transition-colors relative h-24">
                    <td className="px-8 py-4 border-r border-slate-800 sticky left-0 bg-slate-900 z-10 shadow-[4px_0_15px_rgba(0,0,0,0.15)]">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${config.color.replace('bg-', 'bg-') + '20'} ${config.color.replace('bg-', 'text-')} ring-1 ring-inset ${config.color.replace('bg-', 'ring-') + '30'}`}>
                          {React.cloneElement(config.icon as React.ReactElement<any>, { size: 22 })}
                        </div>
                        <span className="font-black text-slate-300 whitespace-nowrap text-sm tracking-tight">{config.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-[10px] font-black text-slate-500 border-r border-slate-800 uppercase tracking-widest">
                      {workMode === 'PM' ? (type === 'Generator' || type === 'Transformer' ? 'Annual' : 'Semi-Annual') : 'Per Request'}
                    </td>
                    <td colSpan={12} className="p-0 relative month-grid-container">
                      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                        {MONTHS.map((_, i) => <div key={i} className={`border-r border-slate-800 last:border-r-0 h-full ${i % 3 === 0 ? 'bg-slate-800/20' : ''}`} />)}
                      </div>
                      <div className="absolute inset-0 grid grid-cols-12 h-full items-center px-1">
                        {typeItems.map(item => (
                          <div
                            key={item.id}
                            style={{ gridColumnStart: item.startMonth, gridColumnEnd: item.startMonth + item.duration, zIndex: activeItem?.id === item.id ? 30 : 5 }}
                            onMouseDown={(e) => handleMouseDown(e, item, 'move')}
                            onDoubleClick={(e) => handleDoubleClick(e, item)}
                            className={`relative h-12 mx-1.5 rounded-2xl border-2 shadow-sm transition-all cursor-move flex flex-col items-center justify-center select-none overflow-hidden
                              ${item.startMonth <= 3 ? `bg-${themeColor}-500/10 text-${themeColor}-300 border-${themeColor}-700` : item.startMonth <= 6 ? 'bg-indigo-500/10 text-indigo-300 border-indigo-700' : item.startMonth <= 9 ? 'bg-amber-500/10 text-amber-300 border-amber-700' : 'bg-slate-500/10 text-slate-300 border-slate-600'}
                              ${activeItem?.id === item.id ? `shadow-2xl scale-[1.05] border-${themeColor}-500 ring-8 ring-${themeColor}-500/10 z-50` : `hover:border-${themeColor}-500`}
                            `}
                          >
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 truncate px-2 w-full text-center">{item.label}</span>
                            <div className="flex items-center text-[8px] font-bold opacity-60"><Clock size={8} className="mr-0.5" />{item.duration} MO</div>
                            <div className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-${themeColor}-500/10 flex items-center justify-center group`} onMouseDown={(e) => handleMouseDown(e, item, 'resize')}>
                                <div className={`w-1 h-4 bg-slate-600 rounded-full group-hover:bg-${themeColor}-500 transition-colors`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {currentProject.equipmentTypes.length === 0 && (
                <tr><td colSpan={14} className="py-20 text-center text-slate-400 italic">กรุณาคลิก "จัดการประเภทหัวข้อ" เพื่อเริ่มเพิ่มแผนงาน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-slate-900/20 border border-slate-700 overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-slate-950 p-8 text-white relative border-b border-slate-700">
                 <h4 className="text-xl font-black uppercase tracking-tight">Manage {workMode} Categories</h4>
                 <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">โครงการ: {currentProject.name}</p>
                 <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master Categories</label>
                    <div className="grid grid-cols-1 gap-2">
                       {Object.keys(EQUIPMENT_CONFIG).map(catId => (
                          <button
                            key={catId}
                            onClick={() => handleToggleCategory(catId)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${currentProject.equipmentTypes.includes(catId) ? `border-${themeColor}-500 bg-${themeColor}-900/30 text-${themeColor}-300` : 'border-slate-700 bg-slate-800 text-slate-400'}`}
                          >
                             <div className="flex items-center space-x-3">
                                {EQUIPMENT_CONFIG[catId].icon}
                                <span className="font-bold">{EQUIPMENT_CONFIG[catId].label}</span>
                             </div>
                             {currentProject.equipmentTypes.includes(catId) ? <Check size={18} /> : <div className="w-4.5 h-4.5 rounded-full border border-slate-600" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Add Custom Category</label>
                    <div className="flex space-x-2">
                       <input
                         type="text"
                         className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="ระบุชื่อประเภท..."
                         value={newCategoryName}
                         onChange={e => setNewCategoryName(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                       />
                       <button onClick={handleAddCategory} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 border border-slate-700"><Plus size={24} /></button>
                    </div>
                 </div>

                 <button onClick={() => setIsCategoryModalOpen(false)} className={`w-full bg-${themeColor}-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl transition-all`}>Done</button>
              </div>
           </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-slate-900/20 border border-slate-700 overflow-hidden animate-in zoom-in duration-300">
            <div className={`bg-slate-950 p-8 text-white relative border-b border-slate-700`}>
               <h4 className="text-xl font-black uppercase tracking-tight">{editingItemId ? `Edit ${workMode} Task` : `New ${workMode} Task`}</h4>
               <button onClick={closeModal} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveTask} className="p-8 space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={newTask.equipmentType}
                      disabled={!!editingItemId}
                      onChange={e => setNewTask({...newTask, equipmentType: e.target.value})}
                    >
                      {currentProject.equipmentTypes.map(type => (
                        <option key={type} value={type}>{getEquipmentStyle(type).label}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Name / Template</label>
                       <button type="button" onClick={() => setIsCustomLabel(!isCustomLabel)} className={`text-[10px] font-black text-${themeColor}-400 uppercase flex items-center hover:underline`}>
                         {isCustomLabel ? 'เลือกจาก Template' : 'สร้างชื่อใหม่เอง'} <Edit3 size={10} className="ml-1" />
                       </button>
                    </div>
                    {!isCustomLabel && TASK_PRESETS[newTask.equipmentType] ? (
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={newTask.label} onChange={e => setNewTask({...newTask, label: e.target.value})}>
                        {TASK_PRESETS[newTask.equipmentType].map(preset => <option key={preset} value={preset}>{preset}</option>)}
                      </select>
                    ) : (
                      <input type="text" required autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600" value={newTask.label} onChange={e => setNewTask({...newTask, label: e.target.value})} placeholder="ระบุชื่อแผนงาน..."/>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Month</label>
                       <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white appearance-none" value={newTask.startMonth} onChange={e => setNewTask({...newTask, startMonth: parseInt(e.target.value)})}>
                          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Duration (Months)</label>
                       <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold text-white appearance-none" value={newTask.duration} onChange={e => setNewTask({...newTask, duration: parseInt(e.target.value)})}>
                          {[1, 2, 3, 4, 6].map(d => <option key={d} value={d}>{d} เดือน</option>)}
                       </select>
                    </div>
                 </div>
              </div>
              <div className="pt-4 flex items-center gap-3">
                 {editingItemId && <button type="button" onClick={() => {onDeleteItem(editingItemId); closeModal();}} className="p-4 rounded-2xl text-rose-400 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800"><Trash2 size={18} /></button>}
                 <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-500 font-black text-xs uppercase">Cancel</button>
                 <button type="submit" disabled={!newTask.equipmentType} className={`flex-[2] bg-${themeColor}-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2`}>
                   <Check size={18} /><span>{editingItemId ? 'Update Plan' : 'Add to Plan'}</span>
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
