import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Loader2, MapPin, Edit2, Trash2, X, AlertOctagon, Save, Settings, Layers, BoxSelect, Columns, Maximize2, Minimize2, Download, Upload } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as XLSX from 'xlsx';
import { locationsApi, mapsApi } from '../services/api';
import { NTLocation, MapLayer, DynamicColumnSchema } from '../types';

const customIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="color: #ef4444; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));"><svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="#ef4444" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

const LocationPicker = ({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number, province?: string) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const reverseGeocode = async (latitude: number, longitude: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=th`);
            const data = await res.json();

            // Extract province (state in OSM Nominatim)
            let province = data?.address?.state || data?.address?.province || data?.address?.region || '';

            // Auto-clean "จ.", "Province", "จังหวัด" prefix
            province = province.replace(/^จังหวัด\s*/u, '').replace('จ.', '').replace(/Province$/i, '').trim();

            onChange(latitude, longitude, province);
        } catch (err) {
            console.error('Reverse geocoding failed', err);
            onChange(latitude, longitude); // Fallback to just lat/lng
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&accept-language=th`);
            const data = await res.json();
            if (data && data.length > 0) {
                const newLat = parseFloat(data[0].lat);
                const newLng = parseFloat(data[0].lon);
                reverseGeocode(newLat, newLng);
            } else {
                alert('ไม่พบสถานที่ดังกล่าว กรุณาลองค้นหาด้วยคำอื่น');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการค้นหาพิกัด');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent submitting the parent form
            handleSearch();
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                reverseGeocode(e.latlng.lat, e.latlng.lng);
            }
        });
        return null;
    };

    const Recenter = ({ lat, lng }: { lat: number, lng: number }) => {
        const map = useMap();
        useEffect(() => {
            map.flyTo([lat, lng], 13);
        }, [lat, lng, map]);
        return null;
    };

    const MapResizer = () => {
        const map = useMap();
        useEffect(() => {
            const timeoutId = setTimeout(() => {
                map.invalidateSize();
            }, 300); // Wait for transition/render to finish
            return () => clearTimeout(timeoutId);
        }, [isFullScreen, map]);
        return null;
    };

    return (
        <div className={isFullScreen ? "fixed inset-0 z-[9999] bg-slate-950 flex flex-col p-2 md:p-6" : "h-72 w-full rounded-xl overflow-hidden border border-slate-700 relative z-10 mt-3 shadow-inner"}>

            {/* Search Bar & Overlay Controls */}
            <div className={`absolute top-2 left-2 right-2 md:top-4 md:left-auto md:right-4 z-[1000] flex flex-col md:flex-row gap-2 md:items-center ${isFullScreen ? 'md:top-8 md:right-8' : ''}`}>
                <div className="flex bg-white/95 backdrop-blur shadow-xl rounded-xl overflow-hidden border border-slate-200 pointer-events-auto w-full md:w-80">
                    <input
                        type="text"
                        placeholder="พิมพ์ค้นหา พิกัด, จังหวัด, หรือสถานที่..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2.5 text-xs text-slate-800 outline-none font-bold placeholder:font-normal"
                    />
                    <button type="button" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 text-white px-4 flex items-center justify-center transition-colors">
                        <Search size={16} />
                    </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto self-end">
                    <button
                        type="button"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="flex-1 md:flex-none justify-center bg-slate-800/90 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-600/50 pointer-events-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        {isFullScreen ? <><Minimize2 size={16} /> ย่อแผนที่</> : <><Maximize2 size={16} /> ขยายเต็มหน้าจอ</>}
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className={isFullScreen ? "flex-1 rounded-2xl overflow-hidden mt-16 md:mt-0 shadow-2xl border border-slate-800" : "h-full w-full"}>
                <MapContainer center={[lat || 18.7883, lng || 98.9853]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a>" />
                    <MapEvents />
                    <Recenter lat={lat || 18.7883} lng={lng || 98.9853} />
                    <MapResizer />
                    <Marker position={[lat || 18.7883, lng || 98.9853]} icon={customIcon} />
                </MapContainer>
            </div>

            {/* Loading Indicator Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center text-slate-800 font-bold text-xs uppercase tracking-widest gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    กำลังประมวลผลตำแหน่ง...
                </div>
            )}

            {/* Hint Overlay (Only visible in normal mode or large screens) */}
            <div className={`absolute bottom-3 left-3 bg-white/95 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-xl border border-slate-200 pointer-events-none flex items-center gap-2 z-[1000] ${isFullScreen ? 'md:bottom-8 md:left-8' : ''}`}>
                <MapPin size={14} className="text-rose-500" /> แตะเพื่อปักหมุด/หาจังหวัด
            </div>
        </div>
    );
};

export default function AdminSiteMaster() {
    const [maps, setMaps] = useState<MapLayer[]>([]);
    const [activeMapId, setActiveMapId] = useState<string>('');
    const [sites, setSites] = useState<NTLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMapFormOpen, setIsMapFormOpen] = useState(false);
    const [isSchemaFormOpen, setIsSchemaFormOpen] = useState(false);

    // Editing contexts
    const [editingSite, setEditingSite] = useState<Partial<NTLocation> | null>(null);
    const [deletingSite, setDeletingSite] = useState<NTLocation | null>(null);
    const [editingMapName, setEditingMapName] = useState('');

    // Schema Editing 
    const [editingSchema, setEditingSchema] = useState<DynamicColumnSchema[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Import Advanced Options
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importMode, setImportMode] = useState<'create' | 'append' | 'sync'>('sync');
    const [importDeleteMissing, setImportDeleteMissing] = useState(false);
    const [importNewMapName, setImportNewMapName] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);

    // Initialize Map Layers

    useEffect(() => {
        loadMaps();
    }, []);

    const loadMaps = async () => {
        try {
            const data = await mapsApi.list();
            setMaps(data);
            if (data.length > 0 && !activeMapId) {
                setActiveMapId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load maps', err);
        }
    };

    // Load items for selected map
    useEffect(() => {
        if (!activeMapId) return;
        loadSites(activeMapId);
    }, [activeMapId]);

    const loadSites = async (mapId: string) => {
        setLoading(true);
        try {
            const data = await locationsApi.listNT(mapId);
            setSites(data);
        } catch (err) {
            alert('โหลดข้อมูลแผนที่ล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    const activeMap = maps.find(m => m.id === activeMapId);
    const schema = activeMap?.schema || [];

    const filteredSites = useMemo(() => {
        if (!search) return sites;
        const lower = search.toLowerCase();
        return sites.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.province.toLowerCase().includes(lower) ||
            s.type.toLowerCase().includes(lower)
        );
    }, [sites, search]);

    // ─── SITE CRUD ──────────────────────────────────────────────────────────

    const handleSaveSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSite) return;
        setIsSaving(true);

        try {
            const payload = { ...editingSite, map_id: activeMapId };

            if (payload.id) {
                const updated = await locationsApi.updateNTDetails(payload.id, payload);
                setSites(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                const created = await locationsApi.createNT(payload);
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

    const handleDeleteSite = async () => {
        if (!deletingSite) return;
        if (deleteInput !== 'Delete') return;

        setIsSaving(true);
        try {
            await locationsApi.deleteNT(deletingSite.id);
            setSites(prev => prev.filter(s => s.id !== deletingSite.id));
            setIsDeleteOpen(false);
            setDeletingSite(null);
            setDeleteInput('');
        } catch (err) {
            alert('ไม่สามารถลบสถานที่ได้');
        } finally {
            setIsSaving(false);
        }
    };

    const openAddSite = () => {
        if (!activeMapId) return alert('กรุณาสร้างและเลือกแผนที่ก่อน');
        setEditingSite({
            name: '',
            province: 'เชียงใหม่',
            latitude: 18.7883,
            longitude: 98.9853,
            type: 'ทั่วไป',
            serviceCenter: '',
            site_exists: true,
            map_id: activeMapId,
            custom_data: {},
            images: []
        } as any);
        setShowMapPicker(false);
        setIsFormOpen(true);
    };

    const openEditSite = (site: NTLocation) => {
        setEditingSite({
            ...site,
            name: site.name,
            province: site.province,
            lat: site.lat,
            lng: site.lng,
            custom_data: site.custom_data || {}
        });
        setShowMapPicker(false);
        setIsFormOpen(true);
    };

    const openDeleteSite = (site: NTLocation) => {
        setDeletingSite(site);
        setIsDeleteOpen(true);
    };

    // ─── MAP CRUD ──────────────────────────────────────────────────────────

    const handleSaveMap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMapName.trim()) return;
        setIsSaving(true);
        try {
            const created = await mapsApi.create({ name: editingMapName, schema: [] });
            setMaps([...maps, created]);
            setActiveMapId(created.id);
            setIsMapFormOpen(false);
            setEditingMapName('');
        } catch (err) {
            alert('สร้างแผนที่ล้มเหลว');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── SCHEMA CRUD ────────────────────────────────────────────────────────

    const openSchemaSettings = () => {
        if (!activeMap) return;
        setEditingSchema([...(activeMap.schema || [])]);
        setIsSchemaFormOpen(true);
    };

    const addSchemaColumn = () => {
        setEditingSchema([
            ...editingSchema,
            { id: `col_${Date.now()}`, name: 'New Column', type: 'text' }
        ]);
    };

    const updateSchemaColumn = (index: number, key: string, value: any) => {
        const newSchema = [...editingSchema];
        newSchema[index] = { ...newSchema[index], [key]: value };
        setEditingSchema(newSchema);
    };

    const removeSchemaColumn = (index: number) => {
        const newSchema = [...editingSchema];
        newSchema.splice(index, 1);
        setEditingSchema(newSchema);
    };

    const handleSaveSchema = async () => {
        if (!activeMap) return;
        setIsSaving(true);
        try {
            const updated = await mapsApi.update(activeMap.id, { schema: editingSchema });
            setMaps(prev => prev.map(m => m.id === updated.id ? updated : m));
            setIsSchemaFormOpen(false);
        } catch (err) {
            alert('บันทึกโครงสร้างล้มเหลว');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── EXPORT / IMPORT ───────────────────────────────────────────────────

    const handleExportMap = () => {
        if (!activeMap || sites.length === 0) return alert('ไม่มีข้อมูลสำหรับส่งออก');

        // Prepare data with dynamic columns
        const exportData = sites.map(site => {
            const row: any = {
                'System ID': site.id, // Included for sync/upsert operations
                'ชื่อสถานที่': site.name,
                'จังหวัด': site.province,
                'ศูนย์บริการ': site.serviceCenter || '',
                'ละติจูด (Lat)': site.lat,
                'ลองจิจูด (Lng)': site.lng,
                'ประเภท': site.type,
                'ยังมีอยู่จริง': site.site_exists ? 'ใช่' : 'ไม่ใช่'
            };

            // Add custom schema columns
            schema.forEach(col => {
                row[col.name] = site.custom_data?.[col.id] || '';
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');

        XLSX.writeFile(workbook, `${activeMap.name}_Export.xlsx`);
    };

    const handleImportMapClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeMapId || !activeMap) return alert('กรุณาเลือกหรือสร้างแผนที่ก่อนนำเข้า');
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFile(file);
        setImportNewMapName(`${activeMap.name} (นำเข้าใหม่)`);
        setIsImportModalOpen(true);

        // Reset file input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const executeImport = async () => {
        if (!importFile || !activeMapId) return;
        setIsSaving(true);
        try {
            const data = await importFile.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            if (jsonData.length === 0) {
                alert('ไม่พบข้อมูลในไฟล์ Excel');
                return;
            }

            let targetMapId = activeMapId;

            // Handle "Create New Map" first
            if (importMode === 'create') {
                if (!importNewMapName.trim()) {
                    alert('กรุณาระบุชื่อแผนที่ใหม่');
                    return;
                }
                const newMap = await mapsApi.create({ name: importNewMapName, schema: schema });
                setMaps(prev => [...prev, newMap]);
                targetMapId = newMap.id;
            }

            const payload: Partial<NTLocation>[] = jsonData.map(row => {
                // Map custom data
                const custom_data: any = {};
                schema.forEach(col => {
                    if (row[col.name] !== undefined) {
                        custom_data[col.id] = row[col.name];
                    }
                });

                return {
                    id: row['System ID'] || undefined, // Capture for Sync Mode
                    name: row['ชื่อสถานที่'] || 'Unnamed Site',
                    province: row['จังหวัด'] || '',
                    serviceCenter: row['ศูนย์บริการ'] || '',
                    lat: parseFloat(row['ละติจูด (Lat)']) || 0,
                    lng: parseFloat(row['ลองจิจูด (Lng)']) || 0,
                    type: row['ประเภท'] || 'ทั่วไป',
                    site_exists: row['ยังมีอยู่จริง'] === 'ไม่ใช่' ? false : true,
                    map_id: targetMapId,
                    custom_data
                };
            });

            const apiMode = importMode === 'create' ? 'append' : importMode;

            const result = await locationsApi.advancedBulkImport({
                mode: apiMode,
                mapId: targetMapId,
                deleteMissing: importMode === 'sync' ? importDeleteMissing : false,
                locations: payload
            });

            if (result.success) {
                alert(`นำเข้าสำเร็จ!\n- เพิ่มใหม่: ${result.results?.inserted || 0} รายการ\n- อัปเดตทับ: ${result.results?.updated || 0} รายการ\n- ข้ามข้อมูลซ้ำ: ${result.results?.skipped || 0} รายการ\n- ย้ายไปถังขยะ: ${result.results?.deleted || 0} รายการ`);
                if (importMode === 'create') {
                    setActiveMapId(targetMapId); // switch to new map
                } else {
                    await loadSites(targetMapId); // reload current map
                }
                setIsImportModalOpen(false);
            } else {
                alert('เกิดข้อผิดพลาดในการนำเข้า');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์ กรุณาตรวจสอบรูปแบบไฟล์ และความถูกต้องของข้อมูล');
        } finally {
            setIsSaving(false);
            setImportFile(null);
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Maps Dropdown & Setup Controls */}
            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                        <Layers size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">เลือกแผนที่ (Map Layer)</p>
                        <div className="relative">
                            <select
                                value={activeMapId}
                                onChange={e => setActiveMapId(e.target.value)}
                                className="w-full md:w-64 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none cursor-pointer"
                            >
                                {maps.length === 0 && <option value="">ไม่มีแผนที่</option>}
                                {maps.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <BoxSelect size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={() => setIsMapFormOpen(true)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-700 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={14} /> แผนที่ใหม่
                    </button>
                    {activeMap && (
                        <>
                            <button
                                onClick={handleExportMap}
                                className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold rounded-xl transition-colors border border-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
                                title="ส่งออกเป็น Excel"
                            >
                                <Download size={14} /> ส่งออก
                            </button>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImportMapClick}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSaving}
                                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white text-xs font-bold rounded-xl transition-colors border border-amber-500/20 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                title="นำเข้าจาก Excel"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} นำเข้า
                            </button>
                            <button
                                onClick={openSchemaSettings}
                                className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-bold rounded-xl transition-colors border border-indigo-500/20 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Columns size={14} /> ตั้งค่า Columns ฐานข้อมูล
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาสถานที่..."
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
                {loading || !activeMapId ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-900/50 backdrop-blur-sm">
                        {loading && <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />}
                        <p className="font-bold tracking-widest uppercase text-xs">
                            {!activeMapId ? 'กรุณาเลือกหรือสร้างแผนที่' : 'กำลังโหลดข้อมูลแผนที่...'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Site Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Coordinates</th>
                                    {/* Dynamic Columns */}
                                    {schema.map(col => (
                                        <th key={col.id} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 whitespace-nowrap">
                                            {col.name}
                                        </th>
                                    ))}
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            <div>{site.lat?.toFixed(6)}</div>
                                            <div>{site.lng?.toFixed(6)}</div>
                                        </td>

                                        {/* Dynamic Columns Render */}
                                        {schema.map(col => (
                                            <td key={col.id} className="px-6 py-4 text-xs text-slate-300">
                                                {site.custom_data?.[col.id] || '-'}
                                            </td>
                                        ))}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditSite(site)}
                                                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-colors border border-blue-500/20 hover:border-blue-500"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteSite(site)}
                                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-colors border border-rose-500/20 hover:border-rose-500"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3 + schema.length} className="px-6 py-16 text-center text-slate-500 font-medium italic">
                                            <div className="flex justify-center mb-4 opacity-30">
                                                <MapPin size={48} />
                                            </div>
                                            ไม่พบข้อมูลสถานที่
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
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pb-12">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 mt-safe">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    {editingSite.id ? <Edit2 size={18} /> : <Plus size={18} />}
                                </div>
                                {editingSite.id ? 'แก้ไขข้อมูล' : `เพิ่มลงใน ${activeMap?.name}`}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveSite} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Base System Fields */}
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อสถานที่</label>
                                    <input
                                        type="text" required
                                        value={editingSite.name || ''}
                                        onChange={e => setEditingSite({ ...editingSite, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">จังหวัด</label>
                                    <input
                                        type="text" required
                                        value={editingSite.province || ''}
                                        onChange={e => setEditingSite({ ...editingSite, province: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

                                {/* Map Picker Button & Component */}
                                <div className="sm:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMapPicker(!showMapPicker)}
                                        className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 text-blue-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 border-dashed"
                                    >
                                        <MapPin size={16} /> {showMapPicker ? 'ซ่อนแผนที่เลือกพิกัด' : 'เลือกพิกัดจากแผนที่ (Select on Map)'}
                                    </button>
                                    {showMapPicker && (
                                        <LocationPicker
                                            lat={editingSite.lat || 18.7883}
                                            lng={editingSite.lng || 98.9853}
                                            onChange={(lat, lng, province) => {
                                                if (province) {
                                                    setEditingSite({ ...editingSite, lat, lng, province });
                                                } else {
                                                    setEditingSite({ ...editingSite, lat, lng });
                                                }
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Dynamic Fields Render */}
                                {schema.length > 0 && <div className="sm:col-span-2 h-px bg-slate-800 my-2" />}
                                {schema.length > 0 && (
                                    <div className="sm:col-span-2">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Columns size={14} /> ข้อมูลเพิ่มเติม (Custom Database)
                                        </h4>
                                    </div>
                                )}

                                {schema.map(col => (
                                    <div key={col.id} className={col.type === 'text' ? 'sm:col-span-2' : ''}>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{col.name}</label>

                                        {col.type === 'dropdown' ? (
                                            <select
                                                value={editingSite.custom_data?.[col.id] || ''}
                                                onChange={e => setEditingSite({ ...editingSite, custom_data: { ...(editingSite.custom_data || {}), [col.id]: e.target.value } })}
                                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="">-- เลือก --</option>
                                                {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : col.type === 'date' ? (
                                            <input
                                                type="date"
                                                value={editingSite.custom_data?.[col.id] || ''}
                                                onChange={e => setEditingSite({ ...editingSite, custom_data: { ...(editingSite.custom_data || {}), [col.id]: e.target.value } })}
                                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        ) : (
                                            <input
                                                type={col.type === 'number' ? 'number' : 'text'}
                                                value={editingSite.custom_data?.[col.id] || ''}
                                                onChange={e => setEditingSite({ ...editingSite, custom_data: { ...(editingSite.custom_data || {}), [col.id]: e.target.value } })}
                                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        )}
                                    </div>
                                ))}

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
                                onClick={handleSaveSite}
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
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md pb-12">
                    <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">ลบสถานที่ถาวร?</h3>
                            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 relative mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">พิมพ์คำว่า <span className="text-rose-500">Delete</span> เพื่อยืนยัน</p>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={e => setDeleteInput(e.target.value)}
                                    placeholder="Delete"
                                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 text-center text-lg focus:ring-2 focus:ring-rose-500 outline-none font-black"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-6 py-3 w-full rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700">ยกเลิก</button>
                            <button
                                onClick={handleDeleteSite}
                                disabled={deleteInput !== 'Delete' || isSaving}
                                className={`px-6 py-3 w-full rounded-xl font-black uppercase text-sm flex justify-center items-center gap-2 shadow-lg ${deleteInput === 'Delete' && !isSaving ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                            >
                                ยืนยันการลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==== Map Form Modal ==== */}
            {isMapFormOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pb-12">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-white">สร้างแผนที่ใหม่</h3>
                            <button onClick={() => setIsMapFormOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveMap} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อรูปแบบแผนที่</label>
                                <input
                                    type="text" required autoFocus
                                    value={editingMapName}
                                    onChange={e => setEditingMapName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="เช่น CCTV Zones"
                                />
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl flex justify-center gap-2">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} บันทึกสร้างแผนที่
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ==== Schema Settings Modal ==== */}
            {isSchemaFormOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md pb-12">
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Columns size={18} /></div>
                                    จัดการ Database Columns ({activeMap?.name})
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 font-bold">เพิ่มฟิลด์ที่ต้องการเก็บข้อมูลแบบ Dynamic ตัวอย่างเช่น ประเภทไฟ, รหัสเสา</p>
                            </div>
                            <button onClick={() => setIsSchemaFormOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-xl"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {editingSchema.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Columns size={32} className="mx-auto text-slate-600 mb-3" />
                                    <p className="text-slate-400 font-bold">ยังไม่มีคอลัมน์พิเศษในแผนที่นี้</p>
                                </div>
                            )}

                            {editingSchema.map((col, idx) => (
                                <div key={col.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group">
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ชื่อคอลัมน์ (หัวตาราง)</label>
                                        <input
                                            type="text" value={col.name}
                                            onChange={e => updateSchemaColumn(idx, 'name', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="ตัวอย่าง: รุ่นกล้องวงจรปิด"
                                        />
                                    </div>
                                    <div className="w-full sm:w-48">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ชนิดการเก็บข้อมูล</label>
                                        <select
                                            value={col.type}
                                            onChange={e => updateSchemaColumn(idx, 'type', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                        >
                                            <option value="text">ข้อความ (Text)</option>
                                            <option value="number">ตัวเลข (Number)</option>
                                            <option value="date">วันที่ (Date)</option>
                                            <option value="dropdown">ตัวเลือก (Dropdown List)</option>
                                        </select>
                                    </div>
                                    {col.type === 'dropdown' && (
                                        <div className="w-full sm:w-64">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ตัวเลือก (คั่นด้วยลูกน้ำ ,)</label>
                                            <input
                                                type="text" value={col.options?.join(', ') || ''}
                                                onChange={e => updateSchemaColumn(idx, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="Opt 1, Opt 2, Opt 3"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeSchemaColumn(idx)}
                                        className="sm:self-end mt-4 sm:mt-0 p-2.5 text-rose-500 hover:bg-rose-500/20 rounded-xl transition-colors shrink-0 border border-rose-500/20"
                                        title="ลบคอลัมน์"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addSchemaColumn}
                                className="w-full py-4 border-2 border-dashed border-indigo-500/30 text-indigo-400 hover:border-indigo-500 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all"
                            >
                                <Plus size={16} /> เพิ่มคอลัมน์ใหม่
                            </button>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsSchemaFormOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-800">ยกเลิก</button>
                            <button
                                onClick={handleSaveSchema} disabled={isSaving}
                                className="px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} บันทึกโครงสร้าง
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ==== Import Options Modal ==== */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md pb-12">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Upload size={18} /></div>
                                    ตัวเลือกการนำเข้า
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 font-bold">เลือกรูปแบบการนำเข้าแผนที่ให้เหมาะสมกับไฟล์ข้อมูล</p>
                            </div>
                            <button onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-xl"><X size={18} /></button>
                        </div>

                        <div className="flex-1 p-6 space-y-4">
                            <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="sync"
                                    checked={importMode === 'sync'}
                                    onChange={() => setImportMode('sync')}
                                    className="mt-1 sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${importMode === 'sync' ? 'border-blue-500' : 'border-slate-500'}`}>
                                    {importMode === 'sync' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-md">อัปเดตและเขียนทับทั้งหมด (Sync / Upsert)</h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        ระบบจะดึง <b>System ID</b> จากไฟล์ Excel มาตรวจสอบ หากมีอยู่แล้วจะอัปเดตข้อมูลทับ (โดยคง ID เดิมไว้) หากไม่มีจะสร้างใหม่<br />
                                        <span className="text-emerald-400">แนะนำ: ปลอดภัยที่สุดสำหรับข้อมูลที่มีโปรเจคผูกอยู่แล้ว</span>
                                    </p>

                                    {importMode === 'sync' && (
                                        <label className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={importDeleteMissing}
                                                onChange={(e) => setImportDeleteMissing(e.target.checked)}
                                                className="rounded bg-slate-900 border-slate-600 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900"
                                            />
                                            <span className="text-red-400 text-xs font-bold">ลบสถานที่ในแผนที่ปัจจบุันที่ไม่มีในไฟล์ Excel นี้ทิ้ง (ย้ายลง Temp)</span>
                                        </label>
                                    )}
                                </div>
                            </label>

                            <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="append"
                                    checked={importMode === 'append'}
                                    onChange={() => setImportMode('append')}
                                    className="mt-1 sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${importMode === 'append' ? 'border-blue-500' : 'border-slate-500'}`}>
                                    {importMode === 'append' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-md">เพิ่มของใหม่ลงแผนที่เดิม (Append)</h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        เพิ่มเฉพาะรายการใหม่ลงในแผนที่ปัจจุบัน หากข้อมูลซ้ำ (ชื่อสถานที่+จังหวัด) จะข้ามไป
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="create"
                                    checked={importMode === 'create'}
                                    onChange={() => setImportMode('create')}
                                    className="mt-1 sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${importMode === 'create' ? 'border-blue-500' : 'border-slate-500'}`}>
                                    {importMode === 'create' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-white text-md">สร้างเป็นแผนที่ใหม่ (Create New Map)</h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed mb-3">
                                        ระบบจะสร้าง Map Layer ใหม่และโคลน Schema ไปให้ แล้วนำข้อมูลทั้งหมดใส่ในแผนที่ใหม่
                                    </p>

                                    {importMode === 'create' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-slate-400 font-bold uppercase">ชื่อแผนที่ใหม่</label>
                                            <input
                                                type="text"
                                                value={importNewMapName}
                                                onChange={e => setImportNewMapName(e.target.value)}
                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-800">ยกเลิก</button>
                            <button
                                onClick={executeImport} disabled={isSaving}
                                className="px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} ยืนยันการนำเข้า
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
