
import React, { useState } from 'react';
import { MOCK_LOCATIONS, PROVINCES, EQUIPMENT_CONFIG } from '../constants';
import { LocationInfo, EquipmentType, Project } from '../types';
import { Search, Filter, MapPin, LayoutGrid, List, Box } from 'lucide-react';

interface LocationManagerProps {
  projectId: string;
  currentProject: Project;
  onSelectSite: (loc: LocationInfo) => void;
  onStartMaintenance: (loc: LocationInfo, eq: string) => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({ currentProject, onSelectSite, onStartMaintenance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredLocations = MOCK_LOCATIONS.filter(loc => {
    const matchesSearch = loc.siteName.toLowerCase().includes(searchTerm.toLowerCase()) || loc.province.includes(searchTerm);
    const matchesProvince = selectedProvince === 'All' || loc.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const getEquipmentStyle = (type: string) => {
    return EQUIPMENT_CONFIG[type] || { label: type, icon: <Box size={12} />, color: 'bg-slate-500' };
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="ค้นหาชื่อชุมสาย..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 outline-none bg-slate-900 text-white shadow-sm shadow-slate-900/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <div className="flex space-x-2">
          <select className="pl-4 pr-8 py-3 rounded-xl border border-slate-700 outline-none bg-slate-900 text-white shadow-sm shadow-slate-900/20" value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
            <option value="All">ทุกจังหวัด</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex bg-slate-900 rounded-xl shadow-sm shadow-slate-900/20 border border-slate-700 overflow-hidden">
             <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><LayoutGrid size={20} /></button>
             <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><List size={20} /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLocations.map(loc => (
            <div key={loc.id} className="bg-slate-900 rounded-2xl shadow-sm shadow-slate-900/20 border border-slate-700 p-6 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-900/40 p-3 rounded-xl text-blue-400"><MapPin size={24} /></div>
                <div><h3 className="font-bold text-white">{loc.siteName}</h3><p className="text-sm text-slate-500">{loc.province}</p></div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">บันทึกรายการใหม่ (Project Categories)</p>
                <div className="flex flex-wrap gap-2">
                  {currentProject.equipmentTypes.map(type => {
                    const style = getEquipmentStyle(type);
                    return (
                      <button key={type} onClick={() => onStartMaintenance(loc, type)} className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-blue-900/30 text-[10px] font-bold transition-all shadow-sm text-slate-300">
                        <span className={style.color.replace('bg-', 'text-')}>{style.icon}</span>
                        <span>{style.label.split(' ').pop()}</span>
                      </button>
                    );
                  })}
                  {currentProject.equipmentTypes.length === 0 && <span className="text-[10px] italic text-slate-400">ยังไม่ได้ตั้งค่าประเภทอุปกรณ์ในตารางแผนงาน</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl shadow-sm shadow-slate-900/20 border border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-950/50">
              <tr><th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">ชุมสาย</th><th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">ดำเนินการ</th></tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {filteredLocations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-white">{loc.siteName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1">
                      {currentProject.equipmentTypes.map(type => (
                        <button key={type} onClick={() => onStartMaintenance(loc, type)} title={getEquipmentStyle(type).label} className={`p-2 rounded-lg hover:bg-slate-700 ${getEquipmentStyle(type).color.replace('bg-', 'text-')}`}>{getEquipmentStyle(type).icon}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocationManager;
