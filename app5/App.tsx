
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import LocationManager from './components/LocationManager';
import NTLocationMap from './components/NTLocationMap';
import MaintenanceForm from './components/MaintenanceForm';
import { MaintenanceRecord, EquipmentType, LocationInfo, ScheduleItem, Project, WorkType } from './types';
import { NAVIGATION } from './constants';
import { Menu, X, Loader2, Briefcase } from 'lucide-react';
import { projectsApi, recordsApi, scheduleApi, locationsApi } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('pms_active_tab') || 'dashboard');
  const [workMode, setWorkMode] = useState<WorkType>(() => (localStorage.getItem('pms_work_mode') as WorkType) || 'PM');

  const [projects, setProjects] = useState<Project[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', status: 'active' as const, color: '#3b82f6' });

  // ── Load all data from API on mount ─────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [proj, rec, sch, ntLocs] = await Promise.all([
        projectsApi.list(),
        recordsApi.list(),
        scheduleApi.list(),
        locationsApi.listNT(),
      ]);
      setProjects(proj);
      setRecords(rec);
      setScheduleItems(sch);

      // Map NT Locations to LocationInfo for LocationManager
      const mappedLocations: LocationInfo[] = ntLocs.map(nt => ({
        id: String(nt.id),
        siteName: nt.name,
        province: nt.province,
        numFacilities: 0, // Default
        numGenerators: 0, // Default
      }));
      setLocations(mappedLocations);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Persist preferences ─────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('pms_active_tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('pms_work_mode', workMode); }, [workMode]);

  // ── Auto-select first project when workMode or projects change ───────────────
  useEffect(() => {
    const valid = projects.filter(p => p.workType === workMode);
    if (valid.length > 0) {
      setSelectedProjectId(prev => valid.find(p => p.id === prev) ? prev : valid[0].id);
    } else {
      setSelectedProjectId('');
    }
  }, [workMode, projects]);

  // ── Responsive sidebar ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProjects = projects.filter(p => p.workType === workMode);
  const currentProject = projects.find(p => p.id === selectedProjectId) || filteredProjects[0] || null;
  const projectRecords = records.filter(r => r.projectId === selectedProjectId);
  const projectScheduleItems = scheduleItems.filter(s => s.projectId === selectedProjectId);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSaveRecord = async (record: MaintenanceRecord) => {
    try {
      const saved = await recordsApi.create({
        projectId: record.projectId,
        workType: record.workType,
        siteId: record.siteId,
        equipmentType: record.equipmentType,
        date: record.date,
        inspector: record.inspector,
        coInspector: record.coInspector,
        status: record.status,
        data: record.data,
        notes: record.notes,
        conditionRating: record.conditionRating,
      });
      setRecords(prev => [saved, ...prev]);
      setActiveTab('dashboard');
      setSelectedLocation(null);
      setSelectedEquipment(null);
    } catch (e: unknown) {
      alert('บันทึกไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleAddScheduleItem = async (item: ScheduleItem) => {
    try {
      const saved = await scheduleApi.create({
        projectId: item.projectId,
        equipmentType: item.equipmentType,
        startMonth: item.startMonth,
        duration: item.duration,
        label: item.label,
      });
      setScheduleItems(prev => [...prev, saved]);
    } catch (e: unknown) {
      alert('เพิ่มแผนไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleUpdateScheduleItems = async (updatedItems: ScheduleItem[]) => {
    try {
      await Promise.all(updatedItems.map(item =>
        scheduleApi.update(item.id, {
          startMonth: item.startMonth,
          duration: item.duration,
          label: item.label,
          equipmentType: item.equipmentType,
        })
      ));
      setScheduleItems(prev => {
        const otherItems = prev.filter(i => i.projectId !== selectedProjectId);
        return [...otherItems, ...updatedItems];
      });
    } catch (e: unknown) {
      alert('อัพเดตแผนไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleDeleteScheduleItem = async (id: string) => {
    try {
      await scheduleApi.delete(id);
      setScheduleItems(prev => prev.filter(i => i.id !== id));
    } catch (e: unknown) {
      alert('ลบแผนไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleUpdateProjectCategories = async (categoryIds: string[]) => {
    if (!currentProject) return;
    try {
      const updated = await projectsApi.update(currentProject.id, { equipmentTypes: categoryIds });
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (e: unknown) {
      alert('อัพเดตหมวดอุปกรณ์ไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await projectsApi.create({
        name: newProject.name,
        status: newProject.status,
        color: workMode === 'PM' ? '#3b82f6' : '#10b981',
        workType: workMode,
        equipmentTypes: workMode === 'PM' ? ['AC', 'Battery', 'Generator'] : ['Infrastructure', 'Security'],
      });
      setProjects(prev => [...prev, created]);
      setSelectedProjectId(created.id);
      setIsProjectModalOpen(false);
      setNewProject({ name: '', status: 'active', color: '#3b82f6' });
    } catch (e: unknown) {
      alert('สร้างโครงการไม่สำเร็จ: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="font-bold text-sm">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <p className="text-red-400 font-bold">เชื่อมต่อ API ไม่ได้</p>
          <p className="text-sm">{error}</p>
          <button onClick={loadAll} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentProject) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <Briefcase size={64} className="mb-4 opacity-20" />
          <p className="font-bold">ยังไม่มีโครงการในหมวด {workMode}</p>
          <button onClick={() => setIsProjectModalOpen(true)} className="mt-4 text-blue-400 font-black uppercase text-xs hover:underline">
            สร้างโครงการใหม่ในหมวดนี้
          </button>
        </div>
      );
    }

    if (selectedLocation && selectedEquipment) {
      return (
        <MaintenanceForm
          location={selectedLocation}
          equipmentType={selectedEquipment}
          projectId={selectedProjectId}
          workMode={workMode}
          onSave={handleSaveRecord}
          onCancel={() => {
            setSelectedLocation(null);
            setSelectedEquipment(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            records={projectRecords}
            currentProject={currentProject}
            workMode={workMode}
            onAction={(loc, eq) => { setSelectedLocation(loc); setSelectedEquipment(eq); }}
          />
        );
      case 'schedule':
        return (
          <Schedule
            scheduleItems={projectScheduleItems}
            projectId={selectedProjectId}
            currentProject={currentProject}
            workMode={workMode}
            onUpdateItems={handleUpdateScheduleItems}
            onAddItem={handleAddScheduleItem}
            onDeleteItem={handleDeleteScheduleItem}
            onUpdateCategories={handleUpdateProjectCategories}
          />
        );
      case 'locations':
        return (
          <LocationManager
            projectId={selectedProjectId}
            currentProject={currentProject}
            locations={locations}
            onSelectSite={(loc) => setSelectedLocation(loc)}
            onStartMaintenance={(loc, eq) => {
              setSelectedLocation(loc);
              setSelectedEquipment(eq);
            }}
          />
        );
      case 'nt-map':
        return <NTLocationMap />;
      case 'history':
        return (
          <div className="p-4 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">{workMode === 'PM' ? 'ประวัติการบำรุงรักษา' : 'ประวัติงานสำรวจ'}</h2>
                <p className="text-sm text-slate-500 font-medium">{currentProject.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg ${workMode === 'PM' ? 'bg-blue-600' : 'bg-emerald-600'}`}>MODE: {workMode}</span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg bg-slate-700">{currentProject.status.toUpperCase()}</span>
              </div>
            </div>
            <div className="bg-slate-900 rounded-3xl shadow-sm shadow-slate-900/20 border border-slate-700 overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ชุมสาย</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">หัวข้อตรวจสอบ</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {projectRecords.length > 0 ? projectRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-800/50 transition-colors text-sm">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-bold">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-white">{record.siteId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">{record.equipmentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black rounded-full border shadow-sm ${record.status === 'Normal' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700' : 'bg-rose-900/40 text-rose-400 border-rose-700'}`}>
                          {record.status === 'Normal' ? (workMode === 'PM' ? 'NORMAL' : 'PASSED') : (workMode === 'PM' ? 'ABNORMAL' : 'FAULTY')}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic font-medium">ไม่พบประวัติในโครงการนี้ ({workMode})</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative font-['Sarabun']">
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workMode={workMode}
        setWorkMode={setWorkMode}
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
        projects={filteredProjects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onOpenAddProject={() => setIsProjectModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto flex flex-col w-full">
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 sticky top-0 z-30 flex justify-between items-center h-16 shadow-2xl">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button onClick={() => setIsSidebarOpen(p => !p)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-black text-white tracking-tight leading-none uppercase">
                {NAVIGATION.find(n => n.id === activeTab)?.name}
              </h1>
              <span className="text-[10px] text-blue-400 font-black mt-1 uppercase tracking-widest truncate max-w-[150px] md:max-w-md">
                PROJECT: {currentProject?.name || 'No Project Selected'}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${workMode === 'PM' ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'}`}>
              Active Category: {workMode}
            </div>
          </div>
        </header>
        <div className={`flex-1 overflow-x-hidden ${activeTab === 'nt-map' ? 'overflow-y-hidden' : ''}`}>
          <div className={activeTab === 'nt-map' ? 'h-full w-full' : 'container mx-auto pb-10'}>
            {renderContent()}
          </div>
        </div>
      </main>

      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-800 p-8 text-white relative border-b border-slate-700">
              <h4 className="text-xl font-black uppercase tracking-tight">Create New {workMode} Project</h4>
              <p className="text-slate-400 text-xs font-bold mt-1">โครงการใหม่จะถูกสร้างภายใต้หมวด {workMode} โดยอัตโนมัติ</p>
              <button onClick={() => setIsProjectModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Name</label>
                <input
                  type="text" required
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder={`ชื่อโครงการ ${workMode} ใหม่`}
                />
              </div>
              <button type="submit" className={`w-full text-white py-4 rounded-2xl font-black uppercase shadow-xl transition-all ${workMode === 'PM' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                Create {workMode} Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
