
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsApi, projectSitesApi } from '../services/api';
import { NTLocation } from '../types';
import { Loader2, Search, MapPin, ExternalLink, X, Settings } from 'lucide-react';

// Fix Leaflet's default icon path issues with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icons configuration
const createCustomIcon = (color: string, count: number = 1) => {
    // Badge HTML if count > 1
    const badgeHtml = count > 1
        ? `<div class="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">${count > 99 ? '99+' : count}</div>`
        : '';

    // Size adjustment for larger groups
    const size = count > 10 ? 40 : 32;

    return new L.DivIcon({
        className: 'custom-marker relative',
        html: `
            <div class="relative w-full h-full">
                <svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md filter">
                    <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-4.42-3.58-8-8-8z"/>
                    <circle cx="12" cy="8" r="2.5" fill="white"/>
                </svg>
                ${badgeHtml}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

const getIcon = (type: string, count: number) => {
    const colorMap: Record<string, string> = {
        A: '#dc2626', // Red
        B: '#f97316', // Orange
        C: '#22c55e', // Green
        D: '#3b82f6', // Blue
        pending: '#a855f7', // Purple
        default: '#64748b' // Slate
    };
    const color = colorMap[type] || colorMap.default;
    return createCustomIcon(color, count);
};

// Component to handle map view changes and events
const MapEvents: React.FC<{
    onChange: (bounds: L.LatLngBounds, zoom: number) => void;
    center: [number, number];
    zoom: number;
    onClickMap: () => void;
}> = ({ onChange, center, zoom, onClickMap }) => {
    const map = useMap();

    // Handle external updates (e.g. search)
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    // Handle internal map interactions
    useMapEvents({
        moveend: () => onChange(map.getBounds(), map.getZoom()),
        zoomend: () => onChange(map.getBounds(), map.getZoom()),
        click: () => onClickMap(), // Close popup on map click
    });

    // Initial load
    useEffect(() => {
        onChange(map.getBounds(), map.getZoom());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

// ----------------------------------------------------
// CENTER MODAL COMPONENT (Fixed Position)
// ----------------------------------------------------
const CenterModal: React.FC<{
    onClose: () => void;
    children: React.ReactNode;
}> = ({ onClose, children }) => {
    return (
        <div
            className="absolute top-0 left-0 w-full h-full z-[2000] pointer-events-auto flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-[90%] max-w-sm animate-in fade-in zoom-in duration-200 p-4"
                onClick={(e) => e.stopPropagation()} // Prevent close on content click
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors z-20"
                >
                    <X size={20} />
                </button>

                {children}
            </div>
        </div>
    );
};

// ----------------------------------------------------
// Main Map Component
// ----------------------------------------------------

const Component: React.FC<{ projectId?: string }> = ({ projectId }) => {
    const [locations, setLocations] = useState<NTLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([18.7883, 98.9853]);
    const [mapZoom, setMapZoom] = useState(12); // Initial zoom

    // Viewport state
    const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
    const [currentZoom, setCurrentZoom] = useState(12);

    // Grouped locations state
    const [visibleGroups, setVisibleGroups] = useState<Map<string, NTLocation[]>>(new Map());

    // Filter State
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['A', 'B', 'C', 'D', 'pending']);
    const [imageFilter, setImageFilter] = useState<'all' | 'has_image' | 'no_image'>('all');

    const toggleFilter = (type: string) => {
        setSelectedFilters(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // CONTROLLED POPUP STATE (For List View)
    const [activeGridKey, setActiveGridKey] = useState<string | null>(null);

    // CENTER MODAL STATE (For Editing)
    const [editingLocation, setEditingLocation] = useState<NTLocation | null>(null);

    // DEBUG VERSION
    useEffect(() => {
        console.log('VERSION: CENTER MODAL v7');
    }, []);

    // Ref to track if a marker was just clicked (to prevent map click from closing it)
    const isMarkerClick = useRef(false);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const [data, assignedIds] = await Promise.all([
                    locationsApi.listNT(),
                    projectId ? projectSitesApi.getSitesForProject(projectId) : Promise.resolve(null)
                ]);

                if (assignedIds) {
                    const assignedSet = new Set(assignedIds);
                    setLocations(data.filter(loc => assignedSet.has(loc.id)));
                } else {
                    setLocations(data);
                }
            } catch (err) {
                console.error('Failed to load NT locations', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, [projectId]);

    // Filtered Content (Instead of grouping, just filter)
    const filteredLocations = useMemo(() => {
        if (!currentBounds) return [];
        return locations.filter(loc => {
            const type = loc.type || 'D';
            if (!selectedFilters.includes(type)) return false;

            if (imageFilter === 'has_image' && (!loc.images || loc.images.length === 0)) return false;
            if (imageFilter === 'no_image' && (loc.images && loc.images.length > 0)) return false;

            if (!currentBounds.contains([loc.lat, loc.lng])) return false;

            return true;
        });
    }, [locations, currentBounds, selectedFilters, imageFilter]);

    const handleMapChange = (bounds: L.LatLngBounds, zoom: number) => {
        setCurrentBounds(bounds);
        setCurrentZoom(zoom);
    };

    const handleMapClick = () => {
        if (isMarkerClick.current) {
            return;
        }
        setActiveGridKey(null);
    };

    const handleSearch = () => {
        if (!searchTerm) return;
        const found = locations.find(l =>
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.locationId.includes(searchTerm)
        );
        if (found) {
            setMapCenter([found.lat, found.lng]);
            setMapZoom(16);
            setActiveGridKey(null);
            setEditingLocation(null);
        } else {
            alert('ไม่พบข้อมูล: ' + searchTerm);
        }
    };

    const handleUpdateLocation = async (id: number, data: Partial<NTLocation>) => {
        try {
            setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
            if (editingLocation && editingLocation.id === id) {
                setEditingLocation(prev => prev ? { ...prev, ...data } : null);
            }
            await locationsApi.updateNTDetails(id, data);
        } catch (err) {
            console.error('Failed to update location', err);
            alert('บันทึกไม่สำเร็จ');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <Loader2 className="animate-spin mr-2" /> กำลังโหลดข้อมูลพิกัด ({locations.length})...
            </div>
        );
    }

    return (
        <div className="relative h-full w-full flex flex-col bg-slate-900">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 z-[1000] flex gap-2 w-full max-w-sm pointer-events-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อชุมสาย หรือ Location ID..."
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white shadow-xl text-slate-900 font-bold outline-none border border-slate-200 focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Menu (Top Right) */}
            <div className="absolute top-4 right-4 z-[5000] bg-white p-3 rounded-xl shadow-xl border border-slate-200 w-48 pointer-events-auto">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Filter Locations</h3>
                <div className="space-y-2">
                    {[
                        { id: 'A', label: 'Type A (Large)', color: 'bg-red-500' },
                        { id: 'B', label: 'Type B (Provincial)', color: 'bg-orange-500' },
                        { id: 'C', label: 'Type C (District)', color: 'bg-green-500' },
                        { id: 'D', label: 'Type D (Small)', color: 'bg-blue-500' },
                        { id: 'pending', label: 'รอระบุประเภท', color: 'bg-purple-500' }
                    ].map((type) => (
                        <label key={type.id} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={selectedFilters.includes(type.id)}
                                    onChange={() => toggleFilter(type.id)}
                                />
                                <div className={`w-5 h-5 rounded border-2 border-slate-300 peer-checked:border-${type.color.replace('bg-', '')} peer-checked:${type.color} transition-all`}></div>
                                <svg className="absolute w-3 h-3 text-white pointer-events-none hidden peer-checked:block left-1 top-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{type.label}</span>
                        </label>
                    ))}
                </div>

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4 mb-3 border-b border-slate-100 pb-2">Image Status</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'has_image', label: 'Has Img' },
                        { id: 'no_image', label: 'No Img' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setImageFilter(opt.id as any)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${imageFilter === opt.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <MapContainer
                center={[18.7883, 98.9853]}
                zoom={12}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEvents
                    onChange={handleMapChange}
                    center={mapCenter}
                    zoom={mapZoom}
                    onClickMap={handleMapClick}
                />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    disableClusteringAtZoom={15}
                    showCoverageOnHover={false}
                    iconCreateFunction={(cluster) => {
                        const count = cluster.getChildCount();
                        return createCustomIcon('#64748b', count); // 64748b is slate color
                    }}
                >
                    {filteredLocations.map((loc) => (
                        <Marker
                            key={loc.id}
                            position={[loc.lat, loc.lng]}
                            icon={getIcon(loc.type || 'default', 1)}
                            eventHandlers={{
                                click: (e) => {
                                    isMarkerClick.current = true;
                                    setTimeout(() => { isMarkerClick.current = false; }, 200);
                                    L.DomEvent.stopPropagation(e.originalEvent);
                                    setEditingLocation(loc);
                                }
                            }}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* CENTER MODAL: Independent Overlay */}
            {editingLocation && (
                <CenterModal onClose={() => setEditingLocation(null)}>
                    <EditLocationContent
                        loc={editingLocation}
                        onUpdate={handleUpdateLocation}
                    />
                </CenterModal>
            )}
        </div>
    );
};

// Sub-component for List View (In Map Popup)
const StackedListContent: React.FC<{
    group: NTLocation[];
    onSelect: (loc: NTLocation) => void;
}> = ({ group, onSelect }) => {
    return (
        <div className="min-w-[200px] font-sans">
            <div className="bg-slate-100 p-2 rounded-t-lg border-b border-slate-200 mb-2">
                <h3 className="font-bold text-slate-700 text-sm flex items-center justify-between">
                    เลือกรายการที่จะแก้ไข
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{group.length}</span>
                </h3>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 p-1">
                {group.map((loc) => (
                    <div
                        key={loc.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(loc);
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all"
                    >
                        <div className="flex items-center space-x-2">
                            <div className={`min-w-2 h-2 rounded-full ${loc.type === 'A' ? 'bg-red-500' : loc.type === 'B' ? 'bg-orange-500' : loc.type === 'C' ? 'bg-green-500' : loc.type === 'D' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{loc.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{loc.locationId} | {loc.type || 'N/A'}</p>
                            </div>
                            <div className="text-slate-400">›</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------
// IMAGE COMPRESSION UTILITY
// ----------------------------------------------------
const IMAGE_SETTINGS_KEY = 'app5_image_settings';

interface ImageSettings {
    maxDimension: number; // Max width or height in pixels
    quality: number;      // JPEG quality 0.0 - 1.0
}

const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
    maxDimension: 1280,
    quality: 0.75,
};

const getImageSettings = (): ImageSettings => {
    try {
        const saved = localStorage.getItem(IMAGE_SETTINGS_KEY);
        if (saved) return { ...DEFAULT_IMAGE_SETTINGS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_IMAGE_SETTINGS;
};

const saveImageSettings = (settings: ImageSettings) => {
    localStorage.setItem(IMAGE_SETTINGS_KEY, JSON.stringify(settings));
};

const compressImage = (file: File, settings: ImageSettings): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            const maxDim = settings.maxDimension;

            // Only resize if larger than maxDimension
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round(height * (maxDim / width));
                    width = maxDim;
                } else {
                    width = Math.round(width * (maxDim / height));
                    height = maxDim;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Compression failed'));
                    const compressed = new File([blob], file.name.replace(/\.png$/i, '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    console.log(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB (${width}x${height})`);
                    resolve(compressed);
                },
                'image/jpeg',
                settings.quality
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
};

// Sub-component for Edit View (In Center Modal)
const EditLocationContent: React.FC<{
    loc: NTLocation;
    onUpdate: (id: number, data: Partial<NTLocation>) => Promise<void>
}> = ({ loc, onUpdate }) => {
    const [formData, setFormData] = useState<Partial<NTLocation>>({
        name: loc.name,
        locationId: loc.locationId,
        province: loc.province,
        serviceCenter: loc.serviceCenter,
        lat: loc.lat,
        lng: loc.lng,
        type: loc.type,
        images: loc.images || [],
        site_exists: loc.site_exists,
        olt_count: loc.olt_count,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [imgSettings, setImgSettings] = useState<ImageSettings>(getImageSettings);

    // Update local state when prop changes (e.g. if re-opened)
    useEffect(() => {
        setFormData({
            name: loc.name,
            locationId: loc.locationId,
            province: loc.province,
            serviceCenter: loc.serviceCenter,
            lat: loc.lat,
            lng: loc.lng,
            type: loc.type,
            images: loc.images || [],
            site_exists: loc.site_exists,
            olt_count: loc.olt_count,
        });
    }, [loc]);

    // Dirty state tracking
    const isDirty = useMemo(() => {
        return formData.name !== loc.name ||
            formData.type !== loc.type ||
            formData.province !== loc.province ||
            formData.serviceCenter !== loc.serviceCenter ||
            formData.lat !== loc.lat ||
            formData.lng !== loc.lng ||
            JSON.stringify(formData.images) !== JSON.stringify(loc.images) ||
            formData.site_exists !== loc.site_exists;
    }, [formData, loc]);

    const handleChange = (field: keyof NTLocation, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate(loc.id, formData);
        setIsSaving(false);
    };

    const updateImageSetting = (key: keyof ImageSettings, value: number) => {
        const newSettings = { ...imgSettings, [key]: value };
        setImgSettings(newSettings);
        saveImageSettings(newSettings);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    setIsUploading(true);
                    try {
                        const compressed = await compressImage(file, imgSettings);
                        const url = await locationsApi.uploadImage(compressed);
                        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
                    } catch (err) {
                        console.error('Upload failed', err);
                        alert('อัปโหลดรูปภาพไม่สำเร็จ');
                    } finally {
                        setIsUploading(false);
                    }
                }
            }
        }
    };

    return (
        <div
            className="text-slate-800 font-sans max-h-[80vh] overflow-y-auto"
            onPaste={handlePaste}
        >
            <div className="mb-4">
                <h2 className="font-bold text-lg text-slate-900 border-b pb-2 mb-2">แก้ไขข้อมูล</h2>

                <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-100 mb-3">
                    💡 <b>Tip:</b> กด Ctrl+V เพื่อวางรูปจาก Street View (บีบอัดอัตโนมัติ {imgSettings.maxDimension}px / {Math.round(imgSettings.quality * 100)}%)
                </div>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 w-full text-xs font-bold px-3 py-2 rounded-lg border transition-all mb-3 ${showSettings ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'}`}
                >
                    <Settings size={14} />
                    ⚙️ ตั้งค่าคุณภาพรูปภาพ
                    <span className="ml-auto font-mono text-blue-600">{imgSettings.maxDimension}px / {Math.round(imgSettings.quality * 100)}%</span>
                </button>

                {/* Image Settings Panel */}
                {showSettings && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                ขนาดสูงสุด (px): <span className="text-blue-600 font-mono">{imgSettings.maxDimension}px</span>
                            </label>
                            <input
                                type="range"
                                min="480" max="3840" step="160"
                                value={imgSettings.maxDimension}
                                onChange={(e) => updateImageSetting('maxDimension', parseInt(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>480px</span>
                                <span>1280px</span>
                                <span>1920px</span>
                                <span>3840px</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                คุณภาพ JPEG: <span className="text-blue-600 font-mono">{Math.round(imgSettings.quality * 100)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0.3" max="1.0" step="0.05"
                                value={imgSettings.quality}
                                onChange={(e) => updateImageSetting('quality', parseFloat(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>30% (เล็ก)</span>
                                <span>75%</span>
                                <span>100% (ชัด)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    {/* Image Previews */}
                    {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <img src={img} alt={`Location ${idx}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                                title="ลบรูปภาพ"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {isUploading && (
                        <div className="flex items-center justify-center w-full h-32 bg-slate-100/50 rounded-lg border border-slate-200 border-dashed text-slate-400">
                            <Loader2 className="animate-spin mr-2" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อชุมสาย <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full">มี {formData.olt_count || 1} OLTs</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">จังหวัด</label>
                        <input
                            type="text"
                            value={formData.province || ''}
                            onChange={(e) => handleChange('province', e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ศูนย์บริการ</label>
                        <input
                            type="text"
                            value={formData.serviceCenter || ''}
                            onChange={(e) => handleChange('serviceCenter', e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Lat</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.lat || 0}
                            onChange={(e) => handleChange('lat', parseFloat(e.target.value))}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Lng</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.lng || 0}
                            onChange={(e) => handleChange('lng', parseFloat(e.target.value))}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border font-mono"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ประเภท (Type)</label>
                    <div className="relative">
                        <select
                            value={formData.type || ''}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border pl-3 pr-8 appearance-none bg-white"
                        >
                            <option value="" disabled>-- ระบุประเภท --</option>
                            <option value="pending">รอระบุประเภท</option>
                            <option value="A">Type A (ชุมสายขนาดใหญ่)</option>
                            <option value="B">Type B (ระดับจังหวัด)</option>
                            <option value="C">Type C (ระดับอำเภอ)</option>
                            <option value="D">Type D (ขนาดเล็ก/หัวเสา)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Site Exists Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                        type="checkbox"
                        id="site_exists"
                        checked={formData.site_exists === true}
                        onChange={(e) => handleChange('site_exists', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="site_exists" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                        มีไซด์ (Site Exists)
                    </label>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUploading || !isDirty}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2
                            ${isDirty && !isSaving && !isUploading
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> กำลังบันทึก...
                            </>
                        ) : !isDirty ? (
                            <>
                                <span className="text-lg">—</span> ไม่มีการแก้ไข
                            </>
                        ) : (
                            <>
                                <span className="text-lg">✓</span> ยืนยันการแก้ไข
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${formData.lat},${formData.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all border border-blue-200 no-underline"
                >
                    <ExternalLink size={18} /> เปิดแผนที่ Google Maps
                </a>
            </div>
        </div>
    );
};

export default Component;
