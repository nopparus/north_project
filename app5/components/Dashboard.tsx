
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { MaintenanceRecord, LocationInfo, Project, WorkType } from '../types';
import { EQUIPMENT_CONFIG } from '../constants';
import { CheckCircle, AlertCircle, Clock, Activity, ShieldCheck, Target, MapPin, ClipboardList } from 'lucide-react';

interface DashboardProps {
  records: MaintenanceRecord[];
  currentProject: Project;
  workMode: WorkType;
  onAction: (loc: LocationInfo, eq: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, currentProject, workMode, onAction }) => {
  const abnormalRecords = records.filter(r => r.status === 'Abnormal');
  const healthyCount = records.length - abnormalRecords.length;
  const healthPercentage = records.length > 0 ? Math.round((healthyCount / records.length) * 100) : 100;

  const stats = [
    { label: workMode === 'PM' ? 'ดำเนินการแล้ว (YTD)' : 'สำรวจแล้ว (YTD)', value: records.length, icon: <CheckCircle className="text-green-400" size={24} />, color: 'bg-green-900/30', border: 'border-green-800' },
    { label: 'รอดำเนินการ', value: workMode === 'PM' ? 12 : 5, icon: <Clock className="text-blue-400" size={24} />, color: 'bg-blue-900/30', border: 'border-blue-800' },
    { label: 'พบความผิดปกติ', value: abnormalRecords.length, icon: <AlertCircle className="text-red-400" size={24} />, color: 'bg-red-900/30', border: 'border-red-800' },
  ];

  const equipmentStats = currentProject.equipmentTypes.map(typeId => {
    const config = EQUIPMENT_CONFIG[typeId] || { label: typeId };
    return {
      name: config.label.replace('ระบบ', '').replace('เครื่องกำเนิดไฟฟ้า', 'Gen.'),
      count: records.filter(r => r.equipmentType === typeId).length,
      abnormal: records.filter(r => r.equipmentType === typeId && r.status === 'Abnormal').length
    };
  });

  const pieData = [
    { name: 'ปกติ/ผ่าน', value: healthyCount || (records.length === 0 ? 1 : 0), color: workMode === 'PM' ? '#10b981' : '#059669' },
    { name: 'พบจุดบกพร่อง', value: abnormalRecords.length, color: '#ef4444' }
  ];

  const performanceData = [
    { month: 'ม.ค.', rate: 85 }, { month: 'ก.พ.', rate: 88 }, { month: 'มี.ค.', rate: 92 }, { month: 'เม.ย.', rate: 90 }, { month: 'พ.ค.', rate: healthPercentage },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              {workMode === 'PM' ? 'Maintenance Dashboard' : 'Site Survey Dashboard'}
            </h2>
            <p className="text-slate-500 font-medium">ภาพรวมงานหมวด {workMode}: {currentProject.name}</p>
         </div>
         <div className="bg-slate-900 px-6 py-4 rounded-2xl border border-slate-700 shadow-sm shadow-slate-900/20 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${healthPercentage > 80 ? workMode === 'PM' ? 'bg-green-900/40 text-green-400' : 'bg-emerald-900/40 text-emerald-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
               {workMode === 'PM' ? <Activity size={24} /> : <MapPin size={24} />}
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {workMode === 'PM' ? 'System Health' : 'Site Condition'}
               </p>
               <h3 className="text-2xl font-black text-white">{healthPercentage}%</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} p-5 md:p-6 rounded-2xl border ${stat.border} shadow-sm flex items-center justify-between group`}>
            <div><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-black mt-2 text-white">{stat.value}</h3></div>
            <div className="bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-700">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-3xl shadow-sm shadow-slate-900/20 border border-slate-700">
           <h3 className="font-bold text-white mb-8 flex items-center">
             {workMode === 'PM' ? <ShieldCheck className="text-blue-500 mr-2" size={20} /> : <ClipboardList className="text-emerald-500 mr-2" size={20} />}
             ประสิทธิภาพงานรายเดือน ({workMode})
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)'}}/>
                    <Area type="monotone" dataKey="rate" stroke={workMode === 'PM' ? '#3b82f6' : '#10b981'} strokeWidth={4} fillOpacity={0.1} fill={workMode === 'PM' ? '#3b82f6' : '#10b981'} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 p-6 rounded-3xl shadow-sm shadow-slate-900/20 border border-slate-700">
          <h3 className="font-bold text-white mb-8 flex items-center">
             <Target className={workMode === 'PM' ? 'text-blue-500 mr-2' : 'text-emerald-500 mr-2'} size={20} />
             สถานะรวมปัจจุบัน
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
             {pieData.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                   <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} /><span className="text-sm font-bold text-slate-400">{item.name}</span></div>
                   <span className="text-sm font-black text-white">{item.value}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {workMode === 'PM' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-3xl shadow-sm shadow-slate-900/20 border border-slate-700">
               <h3 className="font-bold text-white mb-6">ความคืบหน้าแยกตามประเภทอุปกรณ์</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={equipmentStats} layout="vertical" margin={{left: 20}}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-slate-900 rounded-3xl shadow-sm shadow-slate-900/20 border border-slate-700 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-700"><h3 className="font-bold text-red-400 flex items-center"><AlertCircle className="mr-2" size={20} />รายการที่ต้องติดตาม (Flagged)</h3></div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800 max-h-[300px]">
                {abnormalRecords.length > 0 ? abnormalRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-red-900/20 transition-colors">
                    <div className="flex items-center justify-between"><span className="text-xs font-black text-red-400 uppercase tracking-widest">{record.equipmentType}</span><span className="text-[10px] text-slate-500 font-bold">{record.date}</span></div>
                    <h4 className="font-bold text-white mt-1">{record.siteId}</h4>
                  </div>
                )) : <div className="p-10 text-center text-slate-500 italic">ไม่พบรายการผิดปกติ</div>}
              </div>
            </div>
        </div>
      )}

      {workMode === 'Survey' && (
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-800/50 shadow-sm shadow-slate-900/20">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white">Survey Summary by Category</h3>
              <div className="text-[10px] font-black text-emerald-400 bg-emerald-900/40 px-3 py-1 rounded-full uppercase">Real-time Data</div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProject.equipmentTypes.map(type => (
                 <div key={type} className="p-6 rounded-3xl bg-slate-800 border border-slate-700 hover:scale-105 transition-all cursor-default">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{type}</p>
                    <div className="flex items-end justify-between">
                       <h4 className="text-3xl font-black text-white">{records.filter(r => r.equipmentType === type).length}</h4>
                       <span className="text-xs font-bold text-slate-500 mb-1">Items</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
