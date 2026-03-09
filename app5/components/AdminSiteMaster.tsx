import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, MapPin, Edit2, Trash2, X, AlertOctagon, Save } from 'lucide-react';
import { locationsApi } from '../services/api';
import { NTLocation } from '../types';

export default function AdminSiteMaster() {
    const [sites, setSites] = useState<NTLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Context objects
    const [editingSite, setEditingSite] = useState<Partial<NTLocation> | null>(null);
    const [deletingSite, setDeletingSite] = useState<NTLocation | null>(null);

    // Form saving & delete state
    const [isSaving, setIsSaving] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await locationsApi.listNT();
            setSites(data);
        } catch (err) {
            alert('โหลดข้อมูลแผนที่ล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredSites = useMemo(() => {
        if (!search) return sites;
        const lower = search.toLowerCase();
        return sites.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.province.toLowerCase().includes(lower) ||
            s.type.toLowerCase().includes(lower)
        );
    }, [sites, search]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSite) return;
        setIsSaving(true);

        try {
            if (editingSite.id) {
                // Update
                const updated = await locationsApi.updateNTDetails(editingSite.id, editingSite);
                setSites(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                // Create
                const created = await locationsApi.createNT(editingSite);
                setSites(prev => [...prev, created]);
            }
            setIsFormOpen(false);
            setEditingSite(null);
        } catch (err) {
            alert('บันทึกข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingSite) return;
        if (deleteInput !== 'Delete') {
            alert('ข้อความยืนยันไม่ถูกต้อง');
            return;
        }

        setIsSaving(true);
        try {
            await locationsApi.deleteNT(deletingSite.id);
            setSites(prev => prev.filter(s => s.id !== deletingSite.id));
            setIsDeleteOpen(false);
            setDeletingSite(null);
            setDeleteInput('');
        } catch (err) {
            alert('ไม่สามารถลบสถานที่ได้ อาจมีข้อมูลค้างอยู่');
        } finally {
            setIsSaving(false);
        }
    };

    const openAddSite = () => {
        setEditingSite({
            name: '',
            province: 'เชียงใหม่',
            latitude: 18.7883,
            longitude: 98.9853,
            type: 'ตู้สาขา',
            serviceCenter: '',
            site_exists: true,
            images: []
        } as any);
        setIsFormOpen(true);
    };

    const openEditSite = (site: NTLocation) => {
        setEditingSite({
            ...site,
            lat: site.lat,
            lng: site.lng
        });
        setIsFormOpen(true);
    };

    const openDeleteSite = (site: NTLocation) => {
        setDeletingSite(site);
        setDeleteInput('');
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาสถานที่, จังหวัด, หรือประเภท..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-xl placeholder:text-slate-600 font-bold"
                    />
                </div>
                <button
                    onClick={openAddSite}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 transition-all shadow-emerald-500/20 whitespace-nowrap"
                >
                    <Plus size={16} /> ควบคุมสถานที่ใหม่
                </button>
            </div>

            {/* Sites Table */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-900/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                        <p className="font-bold tracking-widest uppercase text-xs">กำลังโหลดข้อมูลแผนที่...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Site Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Type / System</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Coordinates</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredSites.length > 0 ? filteredSites.map(site => (
                                    <tr key={site.id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl shrink-0 mt-1 ${site.site_exists ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200 text-sm">{site.name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 flex items-center gap-1">
                                                        {site.province}
                                                        {site.serviceCenter && <><span className="mx-1">•</span> {site.serviceCenter}</>}
                                                    </p>
                                                    {!site.site_exists && <p className="text-[10px] text-rose-500 font-bold mt-1">ถูกรื้อถอน (Dismantled)</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex flex-col items-start gap-2">
                                            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] uppercase tracking-widest font-black rounded-lg border border-slate-700">
                                                {site.type}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold ml-1">OLTs: {site.olt_count ?? 1}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            <div>{site.lat?.toFixed(6)}</div>
                                            <div>{site.lng?.toFixed(6)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditSite(site)}
                                                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-colors border border-blue-500/20 hover:border-blue-500"
                                                    title="แก้ไขพิกัดและข้อมูล"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteSite(site)}
                                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-colors border border-rose-500/20 hover:border-rose-500"
                                                    title="ลบสถานที่ถาวร"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-medium italic">
                                            <div className="flex justify-center mb-4 opacity-30">
                                                <MapPin size={48} />
                                            </div>
                                            ไม่พบข้อมูลสถานที่ที่ตรงกับการค้นหา
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ==== Add / Edit Form Modal ==== */}
            {isFormOpen && editingSite && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    {editingSite.id ? <Edit2 size={18} /> : <Plus size={18} />}
                                </div>
                                {editingSite.id ? 'แก้ไขข้อมูลสถานที่จุดติดตั้ง' : 'เพิ่มสถานที่จุดติดตั้งใหม่'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อสถานที่</label>
                                    <input
                                        type="text" required
                                        value={editingSite.name || ''}
                                        onChange={e => setEditingSite({ ...editingSite, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="เช่น NT1 ช้างคลาน"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ประเภท อุปกรณ์</label>
                                    <input
                                        type="text" required
                                        value={editingSite.type || ''}
                                        onChange={e => setEditingSite({ ...editingSite, type: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="เช่น ตู้สาขา, Node, Center"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">จังหวัด</label>
                                    <input
                                        type="text" required
                                        value={editingSite.province || ''}
                                        onChange={e => setEditingSite({ ...editingSite, province: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="เช่น เชียงใหม่"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ศูนย์บริการ / สาขา</label>
                                    <input
                                        type="text"
                                        value={editingSite.serviceCenter || ''}
                                        onChange={e => setEditingSite({ ...editingSite, serviceCenter: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="ไม่มีให้เว้นว่าง"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ละติจูด (Latitude)</label>
                                    <input
                                        type="number" step="any" required
                                        value={editingSite.lat || ''}
                                        onChange={e => setEditingSite({ ...editingSite, lat: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ลองจิจูด (Longitude)</label>
                                    <input
                                        type="number" step="any" required
                                        value={editingSite.lng || ''}
                                        onChange={e => setEditingSite({ ...editingSite, lng: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>

                                <div className="sm:col-span-2 pt-4 border-t border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={editingSite.site_exists ?? true}
                                            onChange={e => setEditingSite({ ...editingSite, site_exists: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-900"
                                        />
                                        <span className="text-sm font-bold text-slate-200">สถานที่นี้ยังมีอยู่จริง (Physical Site Exists)</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mt-2 px-1">หากติ๊กออก สถานที่นี้จะแสดงเป็นสีแดงบนพิกัดแผนที่ เพื่อแสดงว่าถูกรื้อถอน หรืออุปกรณ์สาบสูญไปแล้ว</p>
                                </div>
                            </div>
                        </form>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 shadow-blue-500/20"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==== Delete Confirmation Modal ==== */}
            {isDeleteOpen && deletingSite && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-6 flex flex-col items-center text-center -mt-8 pt-10">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-rose-500/20 relative">
                                <AlertOctagon size={40} className="text-rose-500" />
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">ลบสถานที่ถาวร?</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                คุณกำลังจะลบ <b>{deletingSite.name}</b> ออกจากระบบถาวร.<br />
                                <span className="text-rose-400 font-bold">ข้อมูลรูปภาพและความสัมพันธ์ทั้งหมดที่มีต่อโครงการจะสูญหายทันที ไม่สามารถกู้คืนได้เรื่อยๆตลอดกาล</span>
                            </p>

                            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">พิมพ์คำว่า <span className="text-rose-500 user-select-all">Delete</span> เพื่อยืนยัน</p>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={e => setDeleteInput(e.target.value)}
                                    placeholder="Delete"
                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 text-center text-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-slate-700 font-black tracking-widest"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isSaving}
                                className="px-6 py-3 w-full rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteInput !== 'Delete' || isSaving}
                                className={`px-6 py-3 w-full rounded-xl font-black uppercase text-sm flex justify-center items-center gap-2 transition-all shadow-lg ${deleteInput === 'Delete' && !isSaving ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                ยืนยันการลบทิ้ง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
