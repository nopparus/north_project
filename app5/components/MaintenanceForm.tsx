
import React, { useState } from 'react';
import { EquipmentType, LocationInfo, MaintenanceRecord, WorkType } from '../types';
import { EQUIPMENT_CONFIG } from '../constants';
import { Save, X, Camera, Check, Star } from 'lucide-react';

interface MaintenanceFormProps {
  location: LocationInfo;
  equipmentType: EquipmentType;
  projectId: string;
  workMode: WorkType;
  onSave: (record: MaintenanceRecord) => void;
  onCancel: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ location, equipmentType, projectId, workMode, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    inspector: '',
    coInspector: '',
    status: 'Normal',
    values: {},
    notes: '',
    conditionRating: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MaintenanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      workType: workMode,
      siteId: location.siteName,
      equipmentType,
      date: formData.date,
      inspector: formData.inspector,
      coInspector: formData.coInspector,
      status: formData.status as 'Normal' | 'Abnormal',
      data: formData.values,
      notes: formData.notes,
      conditionRating: workMode === 'Survey' ? formData.conditionRating : undefined
    };
    onSave(newRecord);
  };

  const getHeaderColor = () => {
    if (workMode === 'Survey') return 'bg-emerald-600';
    return EQUIPMENT_CONFIG[equipmentType]?.color || 'bg-slate-700';
  };

  const renderSpecificFields = () => {
    if (workMode === 'Survey') {
      return (
        <div className="space-y-6">
           <div className="bg-emerald-900/30 p-6 rounded-3xl border border-emerald-800">
              <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Site Condition Rating</label>
              <div className="flex items-center space-x-4">
                 {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, conditionRating: star})}
                      className={`p-2 rounded-xl transition-all ${formData.conditionRating >= star ? 'text-amber-400 scale-110' : 'text-slate-600'}`}
                    >
                       <Star size={32} fill={formData.conditionRating >= star ? "currentColor" : "none"} />
                    </button>
                 ))}
                 <span className="text-xl font-black text-emerald-400 ml-4">{formData.conditionRating}/5</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GPS Location (Lat, Lng)</label>
                 <input type="text" placeholder="Auto-detecting..." className="w-full bg-transparent font-bold text-sm outline-none text-white" defaultValue="18.7883, 98.9853" />
              </div>
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Survey Type</label>
                 <select className="w-full bg-transparent font-bold text-sm outline-none appearance-none text-white">
                    <option>Site Audit</option>
                    <option>Energy Efficiency Survey</option>
                    <option>Infrastructure Check</option>
                 </select>
              </div>
           </div>
        </div>
      );
    }

    // Default PM forms
    switch (equipmentType) {
      case 'AC':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold mb-2 text-slate-300">BTU</label>
                  <input type="number" className="w-full border border-slate-700 bg-slate-800 text-white p-3 rounded-xl" placeholder="เช่น 24000" />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 text-slate-300">อุณหภูมิห้อง (°C)</label>
                  <input type="number" className="w-full border border-slate-700 bg-slate-800 text-white p-3 rounded-xl" placeholder="25" />
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-10 text-center text-slate-500 italic">
            แบบฟอร์มมาตรฐานสำหรับ {EQUIPMENT_CONFIG[equipmentType]?.label || equipmentType}
            <p className="text-xs mt-2">(ระบุรายละเอียดในหมายเหตุ)</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-700">
        <div className={`p-8 text-white flex justify-between items-center ${getHeaderColor()} transition-colors`}>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              {workMode === 'PM' ? (EQUIPMENT_CONFIG[equipmentType]?.icon || <Check size={24} />) : <Star size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {workMode === 'PM' ? 'Record Maintenance' : 'Site Survey Log'}
              </h2>
              <p className="text-white/80 font-medium">{location.siteName} - {location.province}</p>
            </div>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Check Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-white"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Primary Inspector</label>
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-white"
                  value={formData.inspector}
                  onChange={e => setFormData({...formData, inspector: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Overall Status</label>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: 'Normal'})}
                    className={`flex-1 py-4 px-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                      formData.status === 'Normal' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {workMode === 'PM' ? 'Normal' : 'Passed'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: 'Abnormal'})}
                    className={`flex-1 py-4 px-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                      formData.status === 'Abnormal' ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {workMode === 'PM' ? 'Abnormal' : 'Faulty'}
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Current Work Mode</label>
                <div className={`px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border ${workMode === 'PM' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800'}`}>
                   Active: {workMode}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-black text-white mb-6 uppercase tracking-widest flex items-center">
              <span className={`w-1.5 h-6 rounded-full mr-3 ${getHeaderColor()}`} />
              Detailed Assessment
            </h3>
            {renderSpecificFields()}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Notes / Observations</label>
              <textarea
                rows={3}
                placeholder="ระบุรายละเอียดหน้างาน..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-white"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button type="button" className="aspect-square rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all bg-slate-800">
                <Camera size={32} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Attach Photo</span>
              </button>
              <div className="aspect-square bg-slate-800 rounded-3xl border border-slate-700" />
              <div className="aspect-square bg-slate-800 rounded-3xl border border-slate-700" />
              <div className="aspect-square bg-slate-800 rounded-3xl border border-slate-700" />
            </div>
          </div>

          <div className="pt-6 flex space-x-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`flex-[2] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all ${getHeaderColor()} hover:brightness-110 flex items-center justify-center space-x-2 active:scale-95`}
            >
              <Save size={18} />
              <span>Submit Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
