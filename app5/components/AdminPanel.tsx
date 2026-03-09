import React, { useState } from 'react';
import { Project, WorkType } from '../types';
import { ShieldAlert, Lock, Trash2, Edit2, Plus, X, Briefcase, Save, MapPin, Database } from 'lucide-react';
import { projectsApi } from '../services/api';
import ManageProjectSites from './ManageProjectSites';
import AdminSiteMaster from './AdminSiteMaster';

interface AdminPanelProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onProjectChange: (id: string) => void;
    selectedProjectId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ projects, setProjects, onProjectChange, selectedProjectId }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('pms_admin_auth') === 'true');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [managingSitesForProject, setManagingSitesForProject] = useState<Project | null>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'projects' | 'sites'>('projects');

    // Forms
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [newProject, setNewProject] = useState({ name: '', workType: 'PM' as WorkType, color: '#3b82f6' });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            sessionStorage.setItem('pms_admin_auth', 'true');
            setError('');
        } else {
            setError('รหัสผ่านไม่ถูกต้อง');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ "${name}" ?\n*การกระทำนี้ไม่สามารถย้อนกลับได้*`)) {
            try {
                await projectsApi.delete(id);
                setProjects(prev => prev.filter(p => p.id !== id));
                if (selectedProjectId === id) {
                    onProjectChange(''); // reset selection
                }
            } catch (err) {
                alert('ลบโครงการไม่สำเร็จ');
            }
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await projectsApi.create({
                name: newProject.name,
                status: 'active',
                color: newProject.color,
                workType: newProject.workType,
                equipmentTypes: newProject.workType === 'PM' ? ['AC', 'Battery', 'Generator'] : ['Infrastructure', 'Security'],
            });
            setProjects(prev => [...prev, created]);
            setIsAddOpen(false);
            setNewProject({ name: '', workType: 'PM', color: '#3b82f6' });
        } catch (err) {
            alert('สร้างโครงการไม่สำเร็จ');
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;
        try {
            const updated = await projectsApi.update(editingProject.id, {
                name: editingProject.name,
                color: editingProject.color,
            });
            setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
            setIsEditOpen(false);
            setEditingProject(null);
        } catch (err) {
            alert('อัปเดตโครงการไม่สำเร็จ');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
                    <div className="flex justify-center mb-6">
                        <div className="bg-rose-500/20 p-4 rounded-full border border-rose-500/30">
                            <ShieldAlert size={32} className="text-rose-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black text-white text-center mb-2 tracking-tight">ADMIN ACCESS ONLY</h2>
                    <p className="text-xs text-slate-400 text-center mb-6 font-medium">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบผู้ดูแล</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                                    placeholder="Password..."
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-rose-500 text-xs font-bold mt-2 text-center">{error}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-lg transition-all"
                        >
                            Verify Access
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-rose-500" />
                        ระบบจัดการผู้ดูแลระบบ (Admin)
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">จัดการ เพิ่ม, ลบ, หรือแก้ไขข้อมูลสำคัญในระบบ</p>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-5 py-3 rounded-2xl font-black tracking-widest text-xs uppercase flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Briefcase size={16} /> โครงการแบะสิทธิ์สถานที่
                </button>
                <button
                    onClick={() => setActiveTab('sites')}
                    className={`px-5 py-3 rounded-2xl font-black tracking-widest text-xs uppercase flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'sites' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Database size={16} /> ข้อมูลสถานที่หลัก (Map Sites)
                </button>
            </div>

            {activeTab === 'projects' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            <Plus size={16} /> สร้างโครงการใหม่
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Project Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {projects.length > 0 ? projects.map(project => (
                                        <tr key={project.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: project.color }} />
                                                    <span className="font-bold text-slate-200">{project.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${project.workType === 'PM' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {project.workType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{project.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setManagingSitesForProject(project)}
                                                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-500/20"
                                                        title="จัดการสถานที่"
                                                    >
                                                        <MapPin size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingProject(project); setIsEditOpen(true); }}
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                                                        title="แก้ไขโครงการ"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id, project.name)}
                                                        className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                                                        title="ลบโครงการ"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                                                <Briefcase className="mx-auto mb-2 opacity-20" size={32} />
                                                ยังไม่มีโปรเจกต์ในระบบ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sites' && (
                <AdminSiteMaster />
            )}

            {/* Add Project Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center relative">
                            <h3 className="text-lg font-black text-white">สร้างโครงการใหม่</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-lg"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อโครงการ</label>
                                <input
                                    type="text" required
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="เช่น PM ระดับชาติ 2026"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">หมวดหมู่</label>
                                    <select
                                        value={newProject.workType}
                                        onChange={e => setNewProject({ ...newProject, workType: e.target.value as WorkType })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="PM">PM (บำรุงรักษา)</option>
                                        <option value="Survey">Survey (สำรวจ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">สีแผนงาน</label>
                                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                                        <input
                                            type="color"
                                            value={newProject.color}
                                            onChange={e => setNewProject({ ...newProject, color: e.target.value })}
                                            className="w-8 h-8 rounded cursor-pointer shrink-0 bg-transparent border-0 p-0"
                                        />
                                        <span className="text-xs text-slate-400 font-mono uppercase w-full text-center">{newProject.color}</span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                                <Save size={16} /> ยืนยันสร้าง
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {isEditOpen && editingProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center relative">
                            <h3 className="text-lg font-black text-white">แก้ไขโครงการ</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-lg"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อโครงการ</label>
                                <input
                                    type="text" required
                                    value={editingProject.name}
                                    onChange={e => setEditingProject({ ...editingProject, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">สีแผนงาน</label>
                                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                                    <input
                                        type="color"
                                        value={editingProject.color}
                                        onChange={e => setEditingProject({ ...editingProject, color: e.target.value })}
                                        className="w-8 h-8 rounded cursor-pointer shrink-0 bg-transparent border-0 p-0"
                                    />
                                    <span className="text-xs text-slate-400 font-mono uppercase w-full text-center">{editingProject.color}</span>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4">
                                <Edit2 size={16} /> บันทึกการแก้ไข
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {managingSitesForProject && (
                <ManageProjectSites
                    project={managingSitesForProject}
                    onClose={() => setManagingSitesForProject(null)}
                />
            )}
        </div>
    );
};

export default AdminPanel;
