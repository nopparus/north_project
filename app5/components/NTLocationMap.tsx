
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsApi, projectSitesApi, projectRecordsApi } from '../services/api';
import { NTLocation, Project, ProjectFieldSchema, ProjectSiteRecord } from '../types';
import { Loader2, Search, MapPin, ExternalLink, X, Settings, Layers, Image as ImageIcon, Map as MapIcon, Globe } from 'lucide-react';

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

const getIcon = (type: string, count: number, status?: string) => {
    const colorMap: Record<string, string> = {
        A: '#dc2626', // Red
        B: '#f97316', // Orange
        C: '#22c55e', // Green
        D: '#3b82f6', // Blue
        pending: '#a855f7', // Purple
        default: '#64748b', // Slate
        // Status colors
        Completed: '#059669', // Emerald
        'In Progress': '#2563eb', // Blue
        Issue: '#e11d48', // Rose
    };
    
    // Priority: Status color > Type color
    let color = colorMap.default;
    if (status && colorMap[status]) {
        color = colorMap[status];
    } else {
        color = colorMap[type] || colorMap.default;
    }
    
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

const Component: React.FC<{ projectId?: string; project?: Project | null }> = ({ projectId, project }) => {
    // Persistence Keys
    const MAP_STATE_KEY = 'app5_map_state';

    const getInitialMapState = () => {
        try {
            const saved = localStorage.getItem(MAP_STATE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return { center: [18.7883, 98.9853], zoom: 12, layer: 'clean' };
    };

    const initialMapState = getInitialMapState();

    const [locations, setLocations] = useState<NTLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialMapState.center);
    const [mapZoom, setMapZoom] = useState(initialMapState.zoom); // Initial zoom

    // Viewport state
    const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
    const [currentZoom, setCurrentZoom] = useState(initialMapState.zoom);
    const [mapLayer, setMapLayer] = useState<'osm' | 'clean' | 'vivid' | 'satellite'>(initialMapState.layer);

    const mapLayers = {
        osm: {
            name: 'มาตรฐาน (OSM)',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            icon: MapIcon
        },
        clean: {
            name: 'สะอาด (Clean)',
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            icon: ImageIcon
        },
        vivid: {
            name: 'ชัดเจน (Vivid)',
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            icon: Layers
        },
        satellite: {
            name: 'ดาวเทียม',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community',
            icon: Globe
        }
    };

    // Grouped locations state
    const [visibleGroups, setVisibleGroups] = useState<Map<string, NTLocation[]>>(new Map());

    // Filter State - respect project filterConfig if set, otherwise default all
    // If filterConfig.allowedTypes is [] or undefined → no filter (show all)
    // If filterConfig.allowedTypes has values → restrict to those values
    const allowedByProject = project?.filterConfig?.allowedTypes;
    const hasProjectFilter = !!allowedByProject && allowedByProject.length > 0;

    // User-controlled filter for projects without filterConfig (free filter)
    const ALL_TYPES = ['A', 'B', 'C', 'D', 'pending'];
    const [selectedFilters, setSelectedFilters] = useState<string[]>(ALL_TYPES);
    const [imageFilter, setImageFilter] = useState<'all' | 'has_image' | 'no_image'>('all');
    // Filter panel visible only when no project filter is set
    const isFilterLocked = hasProjectFilter;

    // Per-project site records
    const [projectRecords, setProjectRecords] = useState<Map<number, ProjectSiteRecord>>(new Map());

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

    // Ref to track if a marker was just clicked (to prevent map click from closing it)
    const isMarkerClick = useRef(false);

    // Debounced fetch to avoid excessive API calls
    const fetchTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async (bounds?: L.LatLngBounds) => {
        if (!projectId) return;
        
        // If it's the first load (no bounds), show loader
        if (!bounds) setLoading(true);

        try {
            const b = bounds || currentBounds;
            const boundsParam = b ? {
                minLat: b.getSouth(),
                maxLat: b.getNorth(),
                minLng: b.getWest(),
                maxLng: b.getEast()
            } : undefined;

            const [items, records] = await Promise.all([
                locationsApi.listNT(undefined, boundsParam, projectId),
                // Only fetch records once if we don't have them yet, or maybe always for freshness?
                // For now, let's fetch sites based on bounds, but records for the whole project 
                // (records are usually small compared to thousands of sites)
                projectRecords.size === 0 ? projectRecordsApi.getForProject(projectId) : Promise.resolve(null)
            ]);

            setLocations(items);

            if (records) {
                const recMap = new Map<number, ProjectSiteRecord>();
                records.forEach(r => recMap.set(r.siteId, r));
                setProjectRecords(recMap);
            }
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            if (!bounds) setLoading(false);
        }
    };

    // Initial load for records and maybe initial locations
    useEffect(() => {
        if (!projectId) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Fetch on bounds change with debounce
    useEffect(() => {
        if (!projectId || !currentBounds) return;

        if (fetchTimer.current) clearTimeout(fetchTimer.current);
        fetchTimer.current = setTimeout(() => {
            fetchData(currentBounds);
        }, 400); // 400ms debounce

        return () => {
            if (fetchTimer.current) clearTimeout(fetchTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBounds]);

    // Filtered Content (Instead of grouping, just filter)
    const STANDARD_TYPES = ['A', 'B', 'C', 'D', 'pending'];
    const filteredLocations = useMemo(() => {
        if (!currentBounds) return [];
        return locations.filter(loc => {
            const type = loc.type || '';

            // Apply filter:
            // - If project has allowedTypes defined (non-empty): only show matching types
            // - If no project filter: apply the user-selected filter panel (standard types only)
            if (hasProjectFilter) {
                if (!allowedByProject!.includes(type)) return false;
            } else {
                // Standard type filter (only applies to A/B/C/D/pending — unknown types always show)
                if (STANDARD_TYPES.includes(type) && !selectedFilters.includes(type)) return false;
            }

            if (imageFilter === 'has_image' && (!loc.images || loc.images.length === 0)) return false;
            if (imageFilter === 'no_image' && (loc.images && loc.images.length > 0)) return false;

            if (!currentBounds.contains([loc.lat, loc.lng])) return false;

            return true;
        });
    }, [locations, currentBounds, selectedFilters, imageFilter, hasProjectFilter, allowedByProject]);


    const handleMapChange = (bounds: L.LatLngBounds, zoom: number) => {
        setCurrentBounds(bounds);
        setCurrentZoom(zoom);

        // Persist center and zoom
        const center = bounds.getCenter();
        try {
            const current = getInitialMapState();
            localStorage.setItem(MAP_STATE_KEY, JSON.stringify({
                ...current,
                center: [center.lat, center.lng],
                zoom: zoom
            }));
        } catch { /* ignore */ }
    };

    const handleMapClick = () => {
        if (isMarkerClick.current) {
            return;
        }
        setActiveGridKey(null);
    };

    const handleSearch = async () => {
        if (!searchTerm) return;
        
        // 1. Search in current visible locations
        let found = locations.find(l =>
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.locationId.includes(searchTerm)
        );
        
        // 2. If not found, search in globally assigned project locations via API
        if (!found && projectId) {
            try {
                // Fetching without bounds to find it globally in the project
                const globalResults = await locationsApi.listNT(undefined, undefined, projectId);
                found = globalResults.find(l =>
                    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    l.locationId.includes(searchTerm)
                );
            } catch (err) { console.error('Global search failed', err); }
        }

        if (found) {
            setMapCenter([found.lat, found.lng]);
            setMapZoom(17); // Zoom in closer for specific search
            setEditingLocation(found); // Open for editing directly
            setActiveGridKey(null);
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
            {/* Map Selector removed - map now shows only project sites, no layer switching needed */}
            {/* Filter Menu (Top Right) - Hidden when project enforces its own filter, UNLESS we want to show it dynamically */}
            <div className="absolute top-4 right-4 z-[5000] bg-white p-3 rounded-xl shadow-xl border border-slate-200 w-48 pointer-events-auto">
                {hasProjectFilter || !project?.fieldsSchema?.length ? (
                    <>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Filter Locations</h3>
                        <div className="space-y-2">
                            {hasProjectFilter && allowedByProject && allowedByProject.length > 0 ? (
                                // Render project-specific dynamic filters
                                allowedByProject.map((type, idx) => {
                                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
                                    const color = colors[idx % colors.length];
                                    return (
                                        <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={selectedFilters.includes(type)}
                                                    onChange={() => toggleFilter(type)}
                                                />
                                                <div className={`w-5 h-5 rounded border-2 border-slate-300 peer-checked:border-${color.replace('bg-', '')} peer-checked:${color} transition-all`}></div>
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none hidden peer-checked:block left-1 top-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase">{type}</span>
                                        </label>
                                    );
                                })
                            ) : (
                                // Standard fallback filters
                                [
                                    { id: 'A', label: 'Type A (Large)', color: 'bg-red-500' },
                                    { id: 'B', label: 'Type B (Provincial)', color: 'bg-orange-500' },
                                    { id: 'C', label: 'Type C (District)', color: 'bg-green-500' },
                                    { id: 'D', label: 'Type D (Small)', color: 'bg-blue-500' },
                                    { id: 'pending', label: 'รอระบุประเภท', color: 'bg-slate-400' }
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
                                ))
                            )}
                        </div>
                    </>
                ) : null}

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

            {/* Map Layer Selector (Bottom Left) */}
            <div className="absolute bottom-6 left-6 z-[4000] flex flex-col gap-2 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 overflow-hidden flex flex-col w-44">
                    <div className="px-3 py-2 border-b border-slate-100/50 bg-slate-50/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Styles</span>
                    </div>
                    {(Object.entries(mapLayers) as [keyof typeof mapLayers, typeof mapLayers['osm']][]).map(([key, layer]) => {
                        const Icon = layer.icon;
                        const isActive = mapLayer === key;
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setMapLayer(key);
                                    try {
                                        const current = getInitialMapState();
                                        localStorage.setItem(MAP_STATE_KEY, JSON.stringify({ ...current, layer: key }));
                                    } catch { /* ignore */ }
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 transition-all text-left group border-b border-slate-50 last:border-0 ${isActive ? 'bg-blue-50/80 text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                    <Icon size={14} />
                                </div>
                                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {layer.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <MapContainer
                center={[18.7883, 98.9853]}
                zoom={12}
                zoomControl={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    key={mapLayer}
                    url={mapLayers[mapLayer].url}
                    attribution={mapLayers[mapLayer].attribution}
                />

                <MapEvents
                    onChange={handleMapChange}
                    center={mapCenter}
                    zoom={mapZoom}
                    onClickMap={handleMapClick}
                />

                <MarkerClusterGroup
                    chunkedLoading={true}
                    maxClusterRadius={40}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    animate={true} 
                    zoomToBoundsOnClick={true}
                    removeOutsideVisibleBounds={true} // Performance optimization
                    iconCreateFunction={(cluster) => {
                        const count = cluster.getChildCount();
                        return createCustomIcon('#64748b', count); // 64748b is slate color
                    }}
                >
                    {filteredLocations.map((loc) => {
                        const record = projectRecords.get(loc.id);
                        const status = record?.customData?.status;
                        
                        return (
                            <Marker
                                key={loc.id}
                                position={[loc.lat, loc.lng]}
                                icon={getIcon(loc.type || 'default', 1, status)}
                                eventHandlers={{
                                    click: (e) => {
                                        isMarkerClick.current = true;
                                        setTimeout(() => { isMarkerClick.current = false; }, 200);
                                        L.DomEvent.stopPropagation(e.originalEvent);
                                        setEditingLocation(loc);
                                    }
                                }}
                            />
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>

            {/* CENTER MODAL: Independent Overlay */}
            {
                editingLocation && (
                    <CenterModal onClose={() => setEditingLocation(null)}>
                        <EditLocationContent
                            loc={editingLocation}
                            onUpdate={handleUpdateLocation}
                            project={project}
                            projectRecord={projectRecords.get(editingLocation.id)}
                            onSaveProjectRecord={async (siteId, data) => {
                                if (!projectId) return;
                                const saved = await projectRecordsApi.upsert({ projectId, siteId, ...data });
                                setProjectRecords(prev => new Map(prev).set(siteId, saved));
                            }}
                        />
                    </CenterModal>
                )
            }
        </div >
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
    onUpdate: (id: number, data: Partial<NTLocation>) => Promise<void>;
    project?: Project | null;
    projectRecord?: ProjectSiteRecord;
    onSaveProjectRecord?: (siteId: number, data: { customData: Record<string, any>; images: string[] }) => Promise<void>;
}> = ({ loc, onUpdate, project, projectRecord, onSaveProjectRecord }) => {
    // --- Master site data (type, province, name etc.) ---
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
    // --- Project-specific custom data ---
    const [customData, setCustomData] = useState<Record<string, any>>(projectRecord?.customData || {});
    const [projImages, setProjImages] = useState<string[]>(projectRecord?.images || []);
    const [isSavingMaster, setIsSavingMaster] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [imgSettings, setImgSettings] = useState<ImageSettings>(getImageSettings);

    // Sync when site changes
    useEffect(() => {
        setFormData({
            name: loc.name, locationId: loc.locationId, province: loc.province,
            serviceCenter: loc.serviceCenter, lat: loc.lat, lng: loc.lng,
            type: loc.type, images: loc.images || [], site_exists: loc.site_exists,
            olt_count: loc.olt_count,
        });
        setCustomData(projectRecord?.customData || {});
        setProjImages(projectRecord?.images || []);
    }, [loc, projectRecord]);

    const hasProjectFields = project?.fieldsSchema && project.fieldsSchema.length > 0;
    const isProjectRecordDirty = JSON.stringify(customData) !== JSON.stringify(projectRecord?.customData || {}) ||
        JSON.stringify(projImages) !== JSON.stringify(projectRecord?.images || []);

    // isDirty tracks master data changes
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
        setIsSavingMaster(true);
        await onUpdate(loc.id, formData);
        setIsSavingMaster(false);
    };

    const handleSaveProjectRecord = async () => {
        if (!onSaveProjectRecord) return;
        setIsSavingProject(true);
        await onSaveProjectRecord(loc.id, { customData, images: projImages });
        setIsSavingProject(false);
    };

    const handlePasteProjectImage = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    setIsUploading(true);
                    try {
                        const compressed = await compressImage(file, imgSettings);
                        const url = await locationsApi.uploadImage(compressed, loc.name, loc.id);
                        setProjImages(prev => [...prev, url]);
                    } catch { alert('อัปโหลดไม่สำเร็จ'); }
                    finally { setIsUploading(false); }
                }
            }
        }
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
                        const url = await locationsApi.uploadImage(compressed, loc.name, loc.id);
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

    // NT North = master project (has no custom fieldsSchema)
    const isMasterProject = !hasProjectFields;

    return (
        <div className="text-slate-800 font-sans max-h-[80vh] overflow-y-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b pb-2 mb-3 pr-10">
                <div>
                    <h2 className="font-bold text-base text-slate-900">{loc.name}</h2>
                    <span className="text-[10px] text-slate-400">{loc.province} · {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>
                </div>
                {/* Google Maps link */}
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-2 py-1 flex items-center gap-1 no-underline"
                >
                    <ExternalLink size={12} /> Maps
                </a>
            </div>

            {/* ── MASTER SECTION: Only for NT North (no custom schema) ── */}
            {isMasterProject && (
                <div onPaste={handlePaste}>
                    <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-100 mb-3">
                        💡 <b>Tip:</b> กด Ctrl+V เพื่อวางรูปจาก Street View (บีบอัดอัตโนมัติ {imgSettings.maxDimension}px / {Math.round(imgSettings.quality * 100)}%)
                    </div>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 w-full text-xs font-bold px-3 py-2 rounded-lg border transition-all mb-3 ${showSettings ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <Settings size={14} /> ⚙️ ตั้งค่าคุณภาพรูปภาพ
                        <span className="ml-auto font-mono text-blue-600">{imgSettings.maxDimension}px / {Math.round(imgSettings.quality * 100)}%</span>
                    </button>

                    {showSettings && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">ขนาดสูงสุด: <span className="text-blue-600 font-mono">{imgSettings.maxDimension}px</span></label>
                                <input type="range" min="480" max="3840" step="160" value={imgSettings.maxDimension}
                                    onChange={e => updateImageSetting('maxDimension', parseInt(e.target.value))}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>480px</span><span>1280px</span><span>3840px</span></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">คุณภาพ JPEG: <span className="text-blue-600 font-mono">{Math.round(imgSettings.quality * 100)}%</span></label>
                                <input type="range" min="0.3" max="1.0" step="0.05" value={imgSettings.quality}
                                    onChange={e => updateImageSetting('quality', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>30% (เล็ก)</span><span>75%</span><span>100%</span></div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Image Previews (master) */}
                        <div className="grid grid-cols-2 gap-2">
                            {(formData.images || []).map((img, idx) => (
                                <div key={idx} className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />
                                    <button onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {isUploading && (
                                <div className="flex items-center justify-center w-full h-32 bg-slate-100/50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                                    <Loader2 className="animate-spin" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                ชื่อชุมสาย <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full">มี {formData.olt_count || 1} OLTs</span>
                            </label>
                            <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">จังหวัด</label>
                                <input type="text" value={formData.province || ''} onChange={e => handleChange('province', e.target.value)}
                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">ศูนย์บริการ</label>
                                <input type="text" value={formData.serviceCenter || ''} onChange={e => handleChange('serviceCenter', e.target.value)}
                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Lat</label>
                                <input type="number" step="any" value={formData.lat || 0} onChange={e => handleChange('lat', parseFloat(e.target.value))}
                                    className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Lng</label>
                                <input type="number" step="any" value={formData.lng || 0} onChange={e => handleChange('lng', parseFloat(e.target.value))}
                                    className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border font-mono" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ประเภท (Type)</label>
                            <select value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border bg-white">
                                <option value="" disabled>-- ระบุประเภท --</option>
                                <option value="pending">รอระบุประเภท</option>
                                <option value="A">Type A (ชุมสายขนาดใหญ่)</option>
                                <option value="B">Type B (ระดับจังหวัด)</option>
                                <option value="C">Type C (ระดับอำเภอ)</option>
                                <option value="D">Type D (ขนาดเล็ก/หัวเสา)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <input type="checkbox" id="site_exists" checked={formData.site_exists === true}
                                onChange={e => handleChange('site_exists', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer" />
                            <label htmlFor="site_exists" className="text-sm font-bold text-slate-700 cursor-pointer select-none">มีไซด์ (Site Exists)</label>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <button onClick={handleSave} disabled={isSavingMaster || isUploading || !isDirty}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2
                                    ${isDirty && !isSavingMaster && !isUploading ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                {isSavingMaster ? <><Loader2 className="animate-spin" size={18} /> กำลังบันทึก...</>
                                    : !isDirty ? <>— ไม่มีการแก้ไข</>
                                        : <>✓ บันทึกข้อมูลหลัก</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PROJECT SECTION: Photos + Custom fields (ALL projects) ── */}
            {!isMasterProject && onSaveProjectRecord && (
                <div onPaste={handlePasteProjectImage}>
                    {/* Image quality settings */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 w-full text-xs font-bold px-3 py-2 rounded-lg border transition-all mb-3 ${showSettings ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <Settings size={14} /> ⚙️ ตั้งค่าคุณภาพรูปภาพ
                        <span className="ml-auto font-mono text-blue-600">{imgSettings.maxDimension}px / {Math.round(imgSettings.quality * 100)}%</span>
                    </button>
                    {showSettings && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">ขนาดสูงสุด: <span className="text-blue-600 font-mono">{imgSettings.maxDimension}px</span></label>
                                <input type="range" min="480" max="3840" step="160" value={imgSettings.maxDimension}
                                    onChange={e => updateImageSetting('maxDimension', parseInt(e.target.value))}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">คุณภาพ: <span className="text-blue-600 font-mono">{Math.round(imgSettings.quality * 100)}%</span></label>
                                <input type="range" min="0.3" max="1.0" step="0.05" value={imgSettings.quality}
                                    onChange={e => updateImageSetting('quality', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-100 mb-3">
                        💡 กด <b>Ctrl+V</b> เพื่อวางรูปภาพโครงการ
                    </div>

                    {/* Project images */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {projImages.map((img, idx) => (
                            <div key={idx} className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <img src={img} alt={`proj-${idx}`} className="w-full h-full object-cover" />
                                <button onClick={() => setProjImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {isUploading && (
                            <div className="flex items-center justify-center h-28 bg-slate-100/50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                                <Loader2 className="animate-spin" size={20} />
                            </div>
                        )}
                        {projImages.length === 0 && !isUploading && (
                            <div className="col-span-2 flex flex-col items-center justify-center h-20 border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                                ยังไม่มีรูปภาพ — กด Ctrl+V เพื่อวางรูป
                            </div>
                        )}
                    </div>

                    {/* Custom fields */}
                    {project?.fieldsSchema && project.fieldsSchema.length > 0 && (
                        <div className="space-y-3 mb-4">
                            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b pb-1">ข้อมูลโครงการ</h3>
                            {project.fieldsSchema.map(field => {
                                const isStatusField = field.id === 'status' || field.label.toLowerCase().includes('status');
                                return (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {(field.type === 'dropdown' || isStatusField) ? (
                                            <select value={customData[field.id] || ''}
                                                onChange={e => setCustomData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border bg-white">
                                                <option value="">-- เลือก --</option>
                                                {isStatusField && !field.options ? (
                                                    <>
                                                        <option value="Pending">Pending (รอเข้าตรวจ)</option>
                                                        <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                                                        <option value="Completed">Completed (ตรวจเสร็จแล้ว)</option>
                                                        <option value="Issue">Issue (พบปัญหา)</option>
                                                    </>
                                                ) : (
                                                    field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)
                                                )}
                                            </select>
                                        ) : field.type === 'number' ? (
                                            <input type="number" value={customData[field.id] ?? ''}
                                                onChange={e => setCustomData(prev => ({ ...prev, [field.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                                                className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border" />
                                        ) : field.type === 'checkbox' ? (
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={!!customData[field.id]}
                                                    onChange={e => setCustomData(prev => ({ ...prev, [field.id]: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer" />
                                                <span className="text-sm text-slate-600">{field.label}</span>
                                            </div>
                                        ) : (
                                            <input type="text" value={customData[field.id] || ''}
                                                onChange={e => setCustomData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                className="w-full text-sm border-slate-300 rounded-md px-3 py-2 border" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button onClick={handleSaveProjectRecord} disabled={isSavingProject || !isProjectRecordDirty}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                            ${isProjectRecordDirty && !isSavingProject ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        {isSavingProject ? <><Loader2 className="animate-spin" size={18} /> กำลังบันทึก...</>
                            : !isProjectRecordDirty ? <>— ไม่มีการแก้ไข</>
                                : <>✓ บันทึกข้อมูลโครงการ</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Component;

