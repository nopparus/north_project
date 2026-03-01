import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import * as L from "leaflet";
import {
  Map as MapIcon,
  Table as TableIcon,
  Filter,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Info
} from "lucide-react";
import * as XLSX from "xlsx";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SurveyedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PendingIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = PendingIcon;

interface Site {
  id: number;
  request_id: string;
  circuit_id: string;
  location: string;
  sub_district: string;
  district: string;
  province: string;
  region: string;
  department: string;
  section: string;
  latitude: number;
  longitude: number;
  ip_address: string;
  electricity_request: string;
  power_source: string;
  survey_cost: number | null;
  survey_notes: string | null;
  survey_date: string | null;
  is_surveyed: number;
  has_consumer_unit: number | null;
  has_ground_rod: number | null;
  consumer_unit_cost: number | null;
  ground_rod_cost: number | null;
  main_wire_rate: number | null;
  main_wire_length: number | null;
  labor_cost: number | null;
}

interface FilterOptions {
  provinces: { province: string }[];
  districts: { province: string; district: string }[];
}

// Map component to handle center and zoom updates programmatically
function ChangeView({ center, zoom }: { center: [number, number] | null, zoom: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      const targetZoom = zoom || map.getZoom();
      map.setView(center, targetZoom);
    }
  }, [center?.[0], center?.[1], zoom, map]);
  return null;
}

// Map component to track pan/zoom and save to localStorage
function MapStateTracker() {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      localStorage.setItem('app7_map_state', JSON.stringify({ center: [center.lat, center.lng], zoom: map.getZoom() }));
    },
    zoomend: () => {
      const center = map.getCenter();
      localStorage.setItem('app7_map_state', JSON.stringify({ center: [center.lat, center.lng], zoom: map.getZoom() }));
    }
  });
  return null;
}

// Map component to track visible bounds and zoom
function MapBoundsTracker({ onBoundsChange, onZoomChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void, onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
      onZoomChange(map.getZoom());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
      onZoomChange(map.getZoom());
    },
  });

  // Set initial state
  useEffect(() => {
    onBoundsChange(map.getBounds());
    onZoomChange(map.getZoom());
  }, [map]);

  return null;
}

function SiteMarkers({
  sites,
  onMarkerClick,
  onSurveyButtonClick,
  surveyedIcon,
  pendingIcon
}: {
  sites: any[],
  onMarkerClick: (site: any) => void,
  onSurveyButtonClick: (site: any) => void,
  surveyedIcon: L.Icon,
  pendingIcon: L.Icon
}) {
  return (
    <>
      {sites.map(site => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={site.is_surveyed ? surveyedIcon : pendingIcon}
          eventHandlers={{
            click: () => onMarkerClick(site)
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-indigo-600 mb-1">{site.location}</h3>
              <p className="text-xs text-slate-500 mb-2">{site.district}, {site.province}</p>
              <div className="flex items-center gap-1 text-xs mb-1">
                <span className="font-semibold">Request ID:</span> {site.request_id}
              </div>
              <div className="flex items-center gap-1 text-xs mb-2">
                <span className="font-semibold">Circuit ID:</span> {site.circuit_id}
              </div>
              {site.is_surveyed ? (
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> สำรวจแล้ว: {site.survey_cost} บาท
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> ยังไม่ได้สำรวจ
                </div>
              )}
              {!site.is_surveyed && (
                <button
                  onClick={() => onSurveyButtonClick(site)}
                  className="w-full mt-2 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  บันทึกผลสำรวจ
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function App() {
  const [view, setView] = useState<"map" | "table">("map");
  const [sites, setSites] = useState<Site[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ provinces: [], districts: [] });
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [surveyCost, setSurveyCost] = useState("");
  const [surveyNotes, setSurveyNotes] = useState("");
  const [mainWireLength, setMainWireLength] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [loading, setLoading] = useState(true);
  const [dynamicCenter, setDynamicCenter] = useState<[number, number] | null>(null);
  const [dynamicZoom, setDynamicZoom] = useState<number | null>(null);

  // Pagination & Volume state
  const initialMapState = useMemo(() => {
    try {
      const saved = localStorage.getItem('app7_map_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.center && parsed.zoom) {
          return { center: parsed.center as [number, number], zoom: parsed.zoom as number };
        }
      }
    } catch (e) { }
    return { center: [13.7367, 100.5231] as [number, number], zoom: 6 };
  }, []);

  // Pagination & Volume state
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [zoomLevel, setZoomLevel] = useState(initialMapState.zoom);

  // Debounced bounds for API calls
  const [debouncedBounds, setDebouncedBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBounds(mapBounds);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [mapBounds]);

  const isInitialLoad = useRef(true);
  const prevFilters = useRef({ province: "", district: "", search: "" });

  // Default rates for calculation
  const [consumerUnitRate, setConsumerUnitRate] = useState(2200);
  const [groundRodRate, setGroundRodRate] = useState(600);
  const [mainWireRate, setMainWireRate] = useState(20);

  const calculatedCost = useMemo(() => {
    let total = 0;
    total += consumerUnitRate;
    total += groundRodRate;
    const length = parseFloat(mainWireLength) || 0;
    total += length * mainWireRate;
    const labor = parseFloat(laborCost) || 0;
    total += labor;
    return total;
  }, [mainWireLength, laborCost, consumerUnitRate, groundRodRate, mainWireRate]);

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
    setSurveyNotes(site.survey_notes || "");

    if (site.is_surveyed) {
      setMainWireLength(site.main_wire_length?.toString() || "");
      setLaborCost(site.labor_cost?.toString() || "");
      setConsumerUnitRate(site.consumer_unit_cost ?? (site.has_consumer_unit ? 2200 : 0));
      setGroundRodRate(site.ground_rod_cost ?? (site.has_ground_rod ? 600 : 0));
      setMainWireRate(site.main_wire_rate ?? 20);
    } else {
      // Load last used values from localStorage if available
      try {
        const saved = localStorage.getItem('app7_last_survey_values');
        if (saved) {
          const defaults = JSON.parse(saved);
          setMainWireLength(defaults.mainWireLength || "");
          setLaborCost(defaults.laborCost?.toString() || "");
          setConsumerUnitRate(defaults.consumerUnitRate ?? 2200);
          setGroundRodRate(defaults.groundRodRate ?? 600);
          setMainWireRate(defaults.mainWireRate ?? 20);
          return;
        }
      } catch (e) {
        console.error("Failed to load stored defaults", e);
      }

      // Fallback to absolute defaults
      setMainWireLength("");
      setLaborCost("");
      setConsumerUnitRate(2200);
      setGroundRodRate(600);
      setMainWireRate(20);
    }
  };

  const isDirty = useMemo(() => {
    if (!selectedSite) return false;

    if (surveyNotes !== (selectedSite.survey_notes || "")) return true;
    if (mainWireLength !== (selectedSite.main_wire_length?.toString() || "")) return true;
    if (laborCost !== (selectedSite.labor_cost?.toString() || "")) return true;

    const baseConsumer = selectedSite.consumer_unit_cost ?? (selectedSite.has_consumer_unit ? 2200 : 0);
    if (consumerUnitRate !== baseConsumer) return true;

    const baseGround = selectedSite.ground_rod_cost ?? (selectedSite.has_ground_rod ? 600 : 0);
    if (groundRodRate !== baseGround) return true;

    const baseWireRate = selectedSite.main_wire_rate ?? 20;
    if (mainWireRate !== baseWireRate) return true;

    return false;
  }, [selectedSite, surveyNotes, mainWireLength, laborCost, consumerUnitRate, groundRodRate, mainWireRate]);

  useEffect(() => {
    fetchFilters();
    fetchSites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, selectedDistrict, selectedStatus, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchSites();
  }, [selectedProvince, selectedDistrict, selectedStatus, currentPage, itemsPerPage, view, debouncedBounds]);

  // Auto-centering effect
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      if (localStorage.getItem('app7_map_state')) {
        return;
      }
    }
  }, []); // Only handles initial load logic now, centering is done in fetchSites

  const fetchFilters = async () => {
    try {
      const res = await fetch("/app7/api/filters");
      const data = await res.json();
      setFilterOptions(data);
    } catch (err) {
      console.error("Failed to fetch filters", err);
    }
  };

  const fetchSites = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedStatus) params.append("status", selectedStatus);
      if (searchTerm) params.append("search", searchTerm);

      const filtersChanged =
        selectedProvince !== prevFilters.current.province ||
        selectedDistrict !== prevFilters.current.district ||
        searchTerm !== prevFilters.current.search;

      if (view === "map") {
        params.append("fields", "map");
        // Skip bounds filter if we just changed a major filter (province/district/search)
        // because we want to find the center of the NEW filter set.
        if (debouncedBounds && !filtersChanged) {
          params.append("minLat", debouncedBounds.getSouth().toString());
          params.append("maxLat", debouncedBounds.getNorth().toString());
          params.append("minLng", debouncedBounds.getWest().toString());
          params.append("maxLng", debouncedBounds.getEast().toString());
        }
      } else if (view === "table") {
        params.append("page", currentPage.toString());
        params.append("limit", itemsPerPage.toString());
      }

      const res = await fetch(`/app7/api/sites?${params.toString()}`);
      const data = await res.json();

      // If too many sites, don't show markers to prevent crash
      if (view === "map" && data.totalCount > 4000) {
        setSites([]);
      } else {
        setSites(data.sites);
      }

      setTotalCount(data.totalCount);

      if (data.center && filtersChanged) {
        setDynamicCenter(data.center);
        // If zooming is required to pass the constraint
        if (zoomLevel < 11) {
          setDynamicZoom(11);
          setZoomLevel(11);
        } else {
          setDynamicZoom(null);
        }
      }

      // Update prev filters ref
      prevFilters.current = { province: selectedProvince, district: selectedDistrict, search: searchTerm };
    } catch (err) {
      console.error("Failed to fetch sites", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;

    const editedLocation: [number, number] = [selectedSite.latitude, selectedSite.longitude];

    try {
      const res = await fetch(`/app7/api/survey/${selectedSite.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cost: calculatedCost,
          notes: surveyNotes,
          consumerUnitCost: consumerUnitRate,
          groundRodCost: groundRodRate,
          mainWireRate: mainWireRate,
          mainWireLength: mainWireLength ? parseFloat(mainWireLength) : null,
          laborCost: laborCost ? parseFloat(laborCost) : null
        })
      });

      if (res.ok) {
        // Save to localStorage
        localStorage.setItem('app7_last_survey_values', JSON.stringify({
          consumerUnitRate,
          groundRodRate,
          mainWireRate,
          laborCost: laborCost ? parseFloat(laborCost) : 0,
          mainWireLength: mainWireLength || ""
        }));

        setDynamicCenter(editedLocation);
        setSelectedSite(null);
        setSurveyCost("");
        setSurveyNotes("");
        setMainWireLength("");
        setLaborCost("");
        setConsumerUnitRate(2200);
        setGroundRodRate(600);
        fetchSites();
      }
    } catch (err) {
      console.error("Failed to submit survey", err);
    }
  };

  // Site data for display (already filtered by backend)
  const filteredSites = sites;

  const exportToExcel = () => {
    const exportData = filteredSites.map(site => ({
      "Request ID": site.request_id,
      "Circuit ID": site.circuit_id,
      "สถานที่": site.location,
      "ตำบล": site.sub_district,
      "อำเภอ": site.district,
      "จังหวัด": site.province,
      "ละติจูด": site.latitude,
      "ลองจิจูด": site.longitude,
      "สถานะการสำรวจ": site.is_surveyed ? "สำรวจแล้ว" : "รอสำรวจ",
      "ค่า Consumer Unit": site.consumer_unit_cost || 0,
      "ค่า Ground Rod": site.ground_rod_cost || 0,
      "ระยะสายไฟเมน (เมตร)": site.main_wire_length || 0,
      "ค่าสายไฟ/เมตร": site.main_wire_rate || 0,
      "รวมค่าสายไฟเมน (บาท)": (site.main_wire_length || 0) * (site.main_wire_rate || 0),
      "ค่าจ้างแรงช่าง (บาท)": site.labor_cost || 0,
      "ค่าใช้จ่ายรวม (บาท)": site.survey_cost || 0,
      "หมายเหตุ": site.survey_notes || "",
      "วันที่สำรวจ": site.survey_date ? new Date(site.survey_date).toLocaleString('th-TH') : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WiFi Sites Survey");
    XLSX.writeFile(workbook, "wifi_sites_survey.xlsx");
  };

  const availableDistricts = useMemo(() => {
    if (!selectedProvince) return [];
    return filterOptions.districts.filter(d => d.province === selectedProvince);
  }, [selectedProvince, filterOptions.districts]);

  // Calculate map center based on sites
  const mapCenter: [number, number] = useMemo(() => {
    // The `lastEditedCenter` variable is not defined in the provided context.
    // Assuming `dynamicCenter` is intended for this purpose.
    if (dynamicCenter) return dynamicCenter;

    if (filteredSites.length > 0) {
      const lat = filteredSites.reduce((sum, s) => sum + s.latitude, 0) / filteredSites.length;
      const lng = filteredSites.reduce((sum, s) => sum + s.longitude, 0) / filteredSites.length;
      return [lat, lng];
    }
    return [13.7367, 100.5231]; // Default to Bangkok
  }, [filteredSites, dynamicCenter]); // Changed lastEditedCenter to dynamicCenter

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <MapIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">WiFi Site Electricity Meter Survey</h1>
            <p className="text-sm text-slate-500">ระบบสำรวจค่าใช้จ่ายในการเปลี่ยนมิเตอร์ไฟฟ้า</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setView("map")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                view === "map" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <MapIcon size={18} />
              <span className="text-sm font-medium">แผนที่</span>
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                view === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TableIcon size={18} />
              <span className="text-sm font-medium">ตาราง</span>
            </button>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="text-sm font-medium">ส่งออก Excel</span>
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center gap-4 z-10">
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter size={18} className="text-slate-400" />
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedDistrict("");
            }}
          >
            <option value="">ทุกจังหวัด</option>
            {filterOptions.provinces.map(p => (
              <option key={p.province} value={p.province}>{p.province}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedProvince}
          >
            <option value="">ทุกอำเภอ</option>
            {availableDistricts.map(d => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[150px]">
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="surveyed">สำรวจแล้ว</option>
            <option value="pending">รอสำรวจ</option>
          </select>
        </div>

        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อสถานที่, Request ID, Circuit ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-slate-500 font-medium">
          พบทั้งหมด <span className="text-indigo-600">{totalCount.toLocaleString()}</span> รายการ
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        )}

        {view === "map" ? (
          <div className="h-full w-full">
            <MapContainer
              center={initialMapState.center}
              zoom={initialMapState.zoom}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeView center={dynamicCenter} zoom={dynamicZoom} />
              <MapStateTracker />
              <MapBoundsTracker onBoundsChange={(b) => setMapBounds(b)} onZoomChange={(z) => setZoomLevel(z)} />

              {totalCount > 4000 && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-indigo-100 flex items-center gap-2 animate-bounce">
                    <Info className="text-indigo-600 w-5 h-5" />
                    <span className="text-sm font-bold text-slate-800">กรุณาซูมเข้าเพื่อดูตำแหน่งจุดสำรวจ (จำนวนจุดหนาแน่นเกินไป: {totalCount.toLocaleString()} จุด)</span>
                  </div>
                </div>
              )}

              {filteredSites.length > 20 ? (
                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={150} // Increase radius to cluster more aggressively
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                >
                  <SiteMarkers
                    sites={filteredSites}
                    onMarkerClick={(site) => handleSelectSite(site)}
                    onSurveyButtonClick={(site) => handleSelectSite(site)}
                    surveyedIcon={SurveyedIcon}
                    pendingIcon={PendingIcon}
                  />
                </MarkerClusterGroup>
              ) : (
                <SiteMarkers
                  sites={filteredSites}
                  onMarkerClick={(site) => handleSelectSite(site)}
                  onSurveyButtonClick={(site) => handleSelectSite(site)}
                  surveyedIcon={SurveyedIcon}
                  pendingIcon={PendingIcon}
                />
              )}
            </MapContainer>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Circuit ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">สถานที่ติดตั้ง</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">อำเภอ/จังหวัด</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ค่าใช้จ่าย (บาท)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSites.map(site => (
                    <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {site.is_surveyed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 size={14} /> สำรวจแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertCircle size={14} /> รอสำรวจ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{site.request_id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{site.circuit_id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{site.location}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{site.district}, {site.province}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {site.survey_cost ? site.survey_cost.toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSelectSite(site)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-bold"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-slate-50 border-t-2 border-indigo-600 px-6 py-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600">V2-FIX</span>
                  <span>แสดง</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-900 font-bold"
                  >
                    {[10, 20, 50, 100].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  <span>รายการ/หน้า</span>
                </div>
                <div>
                  หน้า <span className="font-semibold">{Math.min(totalCount, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="font-semibold">{Math.min(totalCount, currentPage * itemsPerPage)}</span> จากทั้งหมด <span className="font-semibold">{totalCount.toLocaleString()}</span> รายการ
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <div className="text-sm font-medium px-4 text-slate-700">
                  หน้า {currentPage} / {Math.ceil(totalCount / itemsPerPage) || 1}
                </div>
                <button
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )
        }
      </main>

      {/* Survey Modal */}
      {selectedSite && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <Info className="text-indigo-600 w-4 h-4" />
                <h2 className="text-base font-bold text-slate-900">บันทึกข้อมูลการสำรวจ</h2>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSurveySubmit} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">สถานที่</p>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{selectedSite.location}</p>
                  <p className="text-xs text-slate-500">{selectedSite.district}, {selectedSite.province}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Request / Circuit</p>
                  <p className="text-xs font-medium text-slate-700">{selectedSite.request_id}</p>
                  <p className="text-xs text-slate-500">{selectedSite.circuit_id}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-1">ค่าอุปกรณ์และสายไฟ (บาท)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Consumer Unit</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" value={consumerUnitRate} onChange={e => setConsumerUnitRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Ground Rod</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" value={groundRodRate} onChange={e => setGroundRodRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">ค่าสายไฟ/เมตร</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" value={mainWireRate} onChange={e => setMainWireRate(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ระยะสายไฟเมน (เมตร)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={mainWireLength}
                    onChange={(e) => setMainWireLength(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ค่าจ้างแรงช่าง (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">ค่าใช้จ่ายในการเปลี่ยนมิเตอร์</label>
                <input
                  type="text"
                  readOnly
                  className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg px-3 py-2 text-base font-bold outline-none cursor-not-allowed"
                  value={calculatedCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={surveyNotes}
                  onChange={(e) => setSurveyNotes(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSite(null)}
                  className="flex-1 px-3 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!isDirty}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm",
                    isDirty
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Save size={16} />
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
