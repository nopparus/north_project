import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import { Project, NTLocation } from '../types';
import { locationsApi, projectSitesApi } from '../services/api';

interface Props {
    project: Project;
    onClose: () => void;
}

const ManageProjectSites: React.FC<Props> = ({ project, onClose }) => {
    const [allSites, setAllSites] = useState<NTLocation[]>([]);
    const [projectSiteIds, setProjectSiteIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [sites, assignedIds] = await Promise.all([
                    locationsApi.listNT(),
                    projectSitesApi.getSitesForProject(project.id)
                ]);
                setAllSites(sites);
                setProjectSiteIds(new Set(assignedIds));
            } catch (err) {
                alert('โหลดข้อมูลสถานที่ล้มเหลว');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [project.id]);

    const handleAdd = async (siteId: number) => {
        setActionLoading(siteId);
        try {
            await projectSitesApi.addSiteToProject(project.id, siteId);
            setProjectSiteIds(prev => {
                const next = new Set(prev);
                next.add(siteId);
                return next;
            });
        } catch (err) {
            alert('เพิ่มสถานที่ล้มเหลว');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (siteId: number) => {
        setActionLoading(siteId);
        try {
            await projectSitesApi.removeSiteFromProject(project.id, siteId);
            setProjectSiteIds(prev => {
                const next = new Set(prev);
                next.delete(siteId);
                return next;
            });
        } catch (err) {
            alert('ลบสถานที่ล้มเหลว');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredSites = useMemo(() => {
        if (!search) return allSites;
        const lower = search.toLowerCase();
        return allSites.filter(s => s.name.toLowerCase().includes(lower) || s.province.toLowerCase().includes(lower));
    }, [allSites, search]);

    const assignedSites = filteredSites.filter(s => projectSiteIds.has(s.id));
    const unassignedSites = filteredSites.filter(s => !projectSiteIds.has(s.id));

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 mx-auto rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <MapPin className="text-blue-500" />
                            จัดการสถานที่ในโครงการ
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                            โครงการ: <span className="text-blue-400 font-bold">{project.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-hidden flex flex-col gap-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาสถานที่หรือจังหวัด..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 font-bold"
                        />
                    </div>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                            <p className="font-bold tracking-widest uppercase text-xs">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">

                            {/* Assigned List */}
                            <div className="flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                                <div className="bg-blue-600/20 border-b border-blue-600/30 px-4 py-3">
                                    <h4 className="font-black text-blue-400 text-sm uppercase tracking-widest flex justify-between">
                                        สถานที่ในโครงการ
                                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px]">{assignedSites.length}</span>
                                    </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {assignedSites.length > 0 ? assignedSites.map(site => (
                                        <div key={site.id} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl group transition-colors">
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-tight">{site.name}</p>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{site.province}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(site.id)}
                                                disabled={actionLoading === site.id}
                                                className="p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                                title="เอาออกจากโครงการ"
                                            >
                                                {actionLoading === site.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-slate-600 text-xs font-bold py-10">ไม่พบสถานที่ในโครงการนี้</p>
                                    )}
                                </div>
                            </div>

                            {/* Unassigned List */}
                            <div className="flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                                <div className="bg-slate-800/50 border-b border-slate-800 px-4 py-3">
                                    <h4 className="font-black text-slate-400 text-sm uppercase tracking-widest flex justify-between">
                                        สถานที่ที่สามารถเพิ่มได้
                                        <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{unassignedSites.length}</span>
                                    </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {unassignedSites.length > 0 ? unassignedSites.map(site => (
                                        <div key={site.id} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl group transition-colors">
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-tight">{site.name}</p>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{site.province}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAdd(site.id)}
                                                disabled={actionLoading === site.id}
                                                className="p-2 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                                title="เพิ่มเข้าโครงการ"
                                            >
                                                {actionLoading === site.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-slate-600 text-xs font-bold py-10">ไม่พบสถานที่อื่นในระบบ</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageProjectSites;
