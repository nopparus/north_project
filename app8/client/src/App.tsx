import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, LogOut, Loader2, 
  Shield, History, Server, AlertCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpDown, ArrowUp, ArrowDown, Cpu, CheckCircle2, XCircle, 
  Database, Network, Wifi, FileBarChart, Download, Settings2,
  Zap, Banknote, Layout, Bell, Users, RefreshCw
} from 'lucide-react';

// --- CONFIG ---
const API_BASE = '/app8/api';

const COLUMN_DISPLAY_MAP = {
    'installation_close_date': 'วันที่ปิดงานติดตั้ง',
    'request_id': 'รหัสใบคำขอ',
    'circuit_id': 'หมายเลขวงจร',
    'province': 'จังหวัด(ติดตั้ง)',
    'main_service': 'บริการหลัก',
    'speed': 'ความเร็ว',
    'price': 'ราคา (บาท/เดือน)',
    'service_name': 'ชื่อบริการ (Service Name)',
    'promotion_start_date': 'วันที่เริ่มโปรโมชัน',
    'section': 'ส่วน',
    'exchange': 'ชุมสาย',
    'cpe_brand_model': 'ยี่ห้อ/รุ่นอุปกรณ์ต้นทาง',
    'olt_brand_model': 'ยี่ห้อ/รุ่น OLT',
    'cpe_status': 'สถานะอุปกรณ์ (CPE Status)',
    'service_status': 'สถานะการใช้งาน',
};

const ONU_GET_OLT_COLUMNS = [
  { key: 'onu_actual_type', label: 'ONU Actual Type' },
  { key: 'mapped_brand', label: 'Mapped Brand' },
  { key: 'mapped_model', label: 'Mapped Model' },
  { key: 'brand', label: 'Brand (Raw)' },
  { key: 'province', label: 'Province' },
  { key: 'project', label: 'Project' },
  { key: 'onutype', label: 'ONU Type' },
  { key: 'service', label: 'Service' },
  { key: 'service_group', label: 'Service Group' },
  { key: 'start_date_css', label: 'Start Date CSS' }
];

const REPORT_COLUMNS = {
    ...COLUMN_DISPLAY_MAP,
    'mapped_brand': 'ยี่ห้อ ONU (มาตรฐาน)',
    'mapped_model': 'รุ่น ONU (มาตรฐาน)',
    'type': 'Type',
    'version': 'ONU Version',
    'lan_ge': 'ONU LAN GE',
    'lan_fe': 'ONU LAN FE',
    'wifi': 'ONU WiFi',
    'usage': 'ONU Usage',
    'grade': 'ONU Grade',
    'device_price': 'ONU Price',
    'device_max_speed': 'ONU Max Speed',
    'wifi_brand': 'WiFi Router: ยี่ห้อ (ดิบ)',
    'wifi_model': 'WiFi Router: รุ่น (ดิบ)',
    'wifi_version': 'WiFi Router: Version (ดิบ)',
    'wifi_mapped_brand': 'WiFi Router: ยี่ห้อ (มาตรฐาน)',
    'wifi_mapped_model': 'WiFi Router: รุ่น (มาตรฐาน)',
    'wifi_hw_type': 'WiFi Router: Hardware Type',
    'wifi_hw_version': 'WiFi Router: Hardware Version',
    'wifi_lan_ge': 'WiFi Router: LAN GE',
    'wifi_lan_fe': 'WiFi Router: LAN FE',
    'wifi_wifi_spec': 'WiFi Router: WiFi Spec',
    'wifi_usage': 'WiFi Router: Usage',
    'wifi_grade': 'WiFi Router: Grade',
    'wifi_price': 'WiFi Router: Price',
    'wifi_max_speed': 'WiFi Router: Max Speed',
    'olt_brand': 'OLT Brand (Raw)',
    'onu_actual_type_raw': 'ONU Actual Type (Raw)',
    'olt_mapped_brand': 'ONU Actual Type: ยี่ห้อ (มาตรฐาน)',
    'olt_mapped_model': 'ONU Actual Type: รุ่น (มาตรฐาน)',
    'olt_hw_type': 'ONU Actual Type: Type',
    'olt_hw_version': 'ONU Actual Type: Version',
    'olt_lan_ge': 'ONU Actual Type: LAN GE',
    'olt_lan_fe': 'ONU Actual Type: LAN FE',
    'olt_wifi_spec': 'ONU Actual Type: WiFi Spec',
    'olt_usage': 'ONU Actual Type: Usage',
    'olt_grade': 'ONU Actual Type: Grade',
    'olt_price': 'ONU Actual Type: Price',
    'olt_max_speed': 'ONU Actual Type: Max Speed',
    'onu_type_raw': 'ONU Type (Raw)',
    'service_id_raw': 'Service ID (Raw)',
    'start_date_css_raw': 'Start Date CSS (Raw)'
};

const WIFI_DISPLAY_MAP = {
  'circuit_id': 'หมายเลขวงจร',
  'brand': 'ยี่ห้อ',
  'model': 'รุ่น',
  'version': 'version'
};

// --- TYPES ---
interface User {
  id: number;
  username: string;
  role: string;
}

interface ONU {
  id: number;
  onu_serial: string;
  customer_name: string;
  brand: string;
  model: string;
  circuit_id: string;
  service_status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface CPEGroup {
  id: number;
  raw_name: string;
  brand: string | null;
  model: string | null;
  mapped_id: number | null;
  record_count?: number;
}

interface WiFiMapping {
  id: number;
  raw_brand: string;
  raw_model: string;
  target_brand: string | null;
  target_model: string | null;
  mapped_id: number | null;
  record_count?: number;
}

interface DeviceSpec {
  id: number;
  brand: string;
  model: string;
  type: string | null;
  version: string | null;
  lan_ge: string | null;
  lan_fe: string | null;
  wifi: string | null;
  usage: string | null;
  grade: string | null;
  price: number | null;
  max_speed: string | null;
  record_count?: number;
}

interface WiFiRouter {
  id: number;
  circuit_id: string;
  brand: string;
  model: string;
  version: string;
}

interface Log {
  id: number;
  username: string;
  action: string;
  target_table: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface PaginationProps {
  total: number;
  limit: number;
  page: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  jumpPage: string;
  setJumpPage: (val: string) => void;
}

const PaginationControls = ({ total, limit, page, setLimit, setPage, jumpPage, setJumpPage }: PaginationProps) => {
  const totalPages = Math.ceil(total / limit);
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (p > 0 && p <= totalPages) { setPage(p); setJumpPage(''); }
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-100">
      <div className="flex items-center gap-6">
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer">
          {[10, 25, 50, 100].map(v => <option key={v} value={v}>แสดง {v} รายการ</option>)}
        </select>
        <div className="h-6 w-px bg-slate-200"></div>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
          หน้า {page} / {totalPages || 1} <span className="mx-2 text-slate-200">|</span> ทั้งหมด {total.toLocaleString()} รายการ
        </span>
      </div>
      <div className="flex items-center gap-4">
        <form onSubmit={handleJump} className="flex items-center gap-3 mr-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ไปที่หน้า</span>
          <input type="number" value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} className="w-20 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-center outline-none focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="..." />
        </form>
        <div className="flex gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft size={20} /></button>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight size={20} /></button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  textClass?: string;
  compact?: boolean;
}

const AutocompleteInput = ({ value, onChange, options, placeholder, required, textClass = "text-indigo-600", compact = false }: AutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(value || '');
  const [prevValue, setPrevValue] = useState(value);
  const [filterText, setFilterText] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setInputText(value || '');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o: string) => {
    if (!filterText) return true;
    return o.toLowerCase().includes(filterText.toLowerCase());
  });

  const handleFocus = () => {
    setFilterText('');
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setFilterText(text);
    onChange(text);
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    setInputText(opt);
    setFilterText('');
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input 
        ref={inputRef}
        type="text" 
        value={inputText} 
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full ${compact ? 'px-3 py-2.5 text-sm rounded-xl focus:ring-2' : 'px-5 py-4 text-lg rounded-2xl focus:ring-4'} bg-slate-50 border border-slate-200 font-black ${textClass} outline-none focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-text`}
        required={required}
      />
      <div 
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen && filteredOptions.length > 0 ? 'rotate-180 text-indigo-500' : ''}`} />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div 
          className={`absolute left-0 right-0 z-[10000] bg-white border border-slate-200 mt-1 ${compact ? 'rounded-xl' : 'rounded-2xl'} shadow-[0_25px_70px_-15px_rgba(0,0,0,0.2)] max-h-80 overflow-auto`}
        >
          {filteredOptions.map((opt: string, idx: number) => (
            <div 
              key={idx} 
              className={`${compact ? 'px-4 py-3 text-sm' : 'px-5 py-3.5 text-base'} cursor-pointer font-bold transition-colors border-b border-slate-50 last:border-0 ${
                opt === value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (token: string, user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Shield size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-center text-slate-800 mb-2">ONU System</h2>
          <p className="text-slate-500 text-center text-base mb-10">ระบบจัดการและตรวจสอบข้อมูล ONU</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg font-medium" placeholder="ชื่อผู้ใช้" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg font-medium" placeholder="รหัสผ่าน" required />
            </div>
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-shake"><AlertCircle size={20} /> {error}</div>}
            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black rounded-2xl shadow-lg hover:shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3">{loading ? <Loader2 className="animate-spin" /> : 'เข้าสู่ระบบ'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [data, setData] = useState<ONU[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [cpeGroups, setCpeGroups] = useState<CPEGroup[]>([]);
  const [catalog, setCatalog] = useState<DeviceSpec[]>([]);
  const [allCatalog, setAllCatalog] = useState<DeviceSpec[]>([]);
  const [total, setTotal] = useState(0);
  const [, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Persistence
  type AppView = 'home' | 'onu' | 'wifi' | 'onu-get-olt' | 'cpe' | 'catalog' | 'report' | 'logs' | 'missing-mapping';
  const savedView = (localStorage.getItem('app8_view') as AppView) || 'home';
  const savedLimit = Number(localStorage.getItem('app8_limit')) || 10;
  const savedSearch = localStorage.getItem('app8_search') || '';
  const savedReportCols = localStorage.getItem('app8_report_columns');
  const initialReportCols = savedReportCols ? JSON.parse(savedReportCols) : [
    'request_id', 'circuit_id', 'main_service', 'speed', 'cpe_brand_model', 
    'mapped_brand', 'mapped_model', 'type', 'service_status'
  ];

  const [view, setView] = useState<AppView>(savedView);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any[]>([]);
  const [onuGetOltData, setOnuGetOltData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [wifiRouters, setWifiRouters] = useState<WiFiRouter[]>([]);
  const [selectedReportColumns, setSelectedReportColumns] = useState<string[]>(initialReportCols);
  const [searchTerm, setSearchTerm] = useState(savedSearch);
  const [searchInput, setSearchInput] = useState(savedSearch);
  const [editing, setEditing] = useState<Partial<ONU> | null>(null);
  const [editingWiFi, setEditingWiFi] = useState<Partial<WiFiRouter> | null>(null);
  const [mappingCPE, setMappingCPE] = useState<Partial<CPEGroup> | null>(null);
  const [editingSpec, setEditingSpec] = useState<Partial<DeviceSpec> | null>(null);
  const [editingOnuGetOlt, setEditingOnuGetOlt] = useState<any | null>(null);
  const [isSidebarMini, setIsSidebarMini] = useState(localStorage.getItem('app8_sidebar_mini') === 'true');
  const [showOnlyPending, setShowOnlyPending] = useState(false);


  // Pagination & Sorting
  const [page, setPage] = useState(Number(localStorage.getItem(`app8_page_${view}`)) || 1);
  const [limit, setLimit] = useState(savedLimit);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // WiFi Sorting
  const [wifiSortField, setWifiSortField] = useState<keyof WiFiRouter>('id');
  const [wifiSortOrder, setWifiSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [wifiSearchTerm, setWifiSearchTerm] = useState('');
  const [wifiSearchInput, setWifiSearchInput] = useState('');

  const [showReportSettings, setShowReportSettings] = useState(true);
  const [jumpPage, setJumpPage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [catalogBackupCount, setCatalogBackupCount] = useState(0);
  const catalogFileInputRef = useRef<HTMLInputElement>(null);

  // CPE Sorting (Frontend)
  const [cpeSortField, setCpeSortField] = useState<keyof CPEGroup>('raw_name');
  const [cpeSortOrder, setCpeSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Catalog Sorting (Server)
  const [catalogSortField, setCatalogSortField] = useState('brand');
  const [catalogSortOrder, setCatalogSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // New Discoveries
  const [newDiscoveries, setNewDiscoveries] = useState<{raw_name: string}[]>([]);
  const [newWifiDiscoveries, setNewWifiDiscoveries] = useState<{raw_brand: string, raw_model: string}[]>([]);
  const [newOnuGetOltDiscoveries, setNewOnuGetOltDiscoveries] = useState<{raw_name: string}[]>([]);
  const [showNewDiscoveries, setShowNewDiscoveries] = useState(false);
  const [mappingTab, setMappingTab] = useState<'onu' | 'wifi' | 'onu-get-olt'>('onu');
  const [wifiMappings, setWifiMappings] = useState<WiFiMapping[]>([]);
  const [mappingWifi, setMappingWifi] = useState<Partial<WiFiMapping> | null>(null);
  const [wifiMapSortField, setWifiMapSortField] = useState<keyof WiFiMapping>('raw_brand');
  const [wifiMapSortOrder, setWifiMapSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [catalogDiscovery, setCatalogDiscovery] = useState<any>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // --- Dashboard v2 (Circuit Summary) ---
  const [homeTab, setHomeTab] = useState<'circuit' | 'overview'>('circuit');
  const [dashboardV2Stats, setDashboardV2Stats] = useState<any>(null);
  const [circuitData, setCircuitData] = useState<any[]>([]);
  const [circuitTotal, setCircuitTotal] = useState(0);
  const [circuitPage, setCircuitPage] = useState(1);
  const [circuitJumpPage, setCircuitJumpPage] = useState('');
  const [circuitSearch, setCircuitSearch] = useState('');
  const [circuitSearchInput, setCircuitSearchInput] = useState('');
  const [circuitSortField, setCircuitSortField] = useState('circuit_norm');
  const [circuitSortOrder, setCircuitSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [serviceNames, setServiceNames] = useState<{service_name: string, circuit_count: string}[]>([]);
  const [noWifiData, setNoWifiData] = useState<{ no_wifi: any[], fe_only: any[] }>({ no_wifi: [], fe_only: [] });
  // Multi-select filters
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [isServiceFilterOpen, setIsServiceFilterOpen] = useState(false);
  const [isExportingCircuit, setIsExportingCircuit] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/onu`, { 
        params: { search: searchTerm, page, limit, sortField, sortOrder } 
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [searchTerm, page, limit, sortField, sortOrder]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/logs`, { params: { page, limit, sortField, sortOrder } });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, limit, sortField, sortOrder]);

  const fetchCPEGroups = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/cpe-groups`;
      const params: any = { search: searchTerm, page, limit, sortField: cpeSortField, sortOrder: cpeSortOrder };
      
      if (view === 'missing-mapping') {
        url = `${API_BASE}/cpe-groups/missing`;
      } else if (mappingTab === 'onu-get-olt') {
        url = `${API_BASE}/onu-get-olt-groups`;
        params.pendingOnly = showOnlyPending ? 'true' : 'false';
      } else {
        params.pendingOnly = showOnlyPending ? 'true' : 'false';
      }

      const res = await axios.get(url, { params });
      setCpeGroups(res.data.data);
      setTotal(res.data.total);
      
      const discUrl = mappingTab === 'onu-get-olt' ? `${API_BASE}/onu-get-olt-groups/new-discoveries` : `${API_BASE}/cpe-groups/new-discoveries`;
      const disc = await axios.get(discUrl);
      if (mappingTab === 'onu-get-olt') {
        setNewOnuGetOltDiscoveries(disc.data.data);
      } else {
        setNewDiscoveries(disc.data.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [view, searchTerm, page, limit, cpeSortField, cpeSortOrder, showOnlyPending, mappingTab]);

  const fetchWifiMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/wifi-mappings/groups`, { 
        params: { 
          search: searchTerm, 
          page, 
          limit, 
          sortField: wifiMapSortField, 
          sortOrder: wifiMapSortOrder,
          pendingOnly: showOnlyPending ? 'true' : 'false'
        } 
      });
      setWifiMappings(res.data.data);
      setTotal(res.data.total);

      const disc = await axios.get(`${API_BASE}/wifi-mappings/new-discoveries`);
      setNewWifiDiscoveries(disc.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [searchTerm, page, limit, wifiMapSortField, wifiMapSortOrder, showOnlyPending]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/device-catalog`, { params: { search: searchTerm, page, limit, sortField: catalogSortField, sortOrder: catalogSortOrder } });
      setCatalog(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [searchTerm, page, limit, catalogSortField, catalogSortOrder]);

  const fetchOnuGetOltMappings = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { search: searchTerm, page, limit, sortField: cpeSortField, sortOrder: cpeSortOrder };
      params.pendingOnly = showOnlyPending ? 'true' : 'false';

      const res = await axios.get(`${API_BASE}/onu-get-olt-groups`, { params });
      setCpeGroups(res.data.data);
      setTotal(res.data.total);
      
      const disc = await axios.get(`${API_BASE}/onu-get-olt-groups/new-discoveries`);
      setNewOnuGetOltDiscoveries(disc.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [searchTerm, page, limit, cpeSortField, cpeSortOrder, showOnlyPending]);

  const fetchWiFiRouters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/wifi-routers`, { params: { page, limit, search: wifiSearchTerm, sortField: wifiSortField, sortOrder: wifiSortOrder } });
      setWifiRouters(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, limit, wifiSearchTerm, wifiSortField, wifiSortOrder]);

  const fetchOnuGetOlt = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/onu-get-lt`, { params: { page, limit, search: searchTerm, sortField, sortOrder } });
      setOnuGetOltData(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, limit, searchTerm, sortField, sortOrder]);

  const fetchAllCatalog = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/device-catalog/all`);
      setAllCatalog(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchNewDiscoveries = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/cpe-groups/new-discoveries`);
      setNewDiscoveries(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get(`${API_BASE}/dashboard/stats`);
      setDashboardStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  // Dashboard v2 fetch functions
  const fetchStatsV2 = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedServices.length > 0) params.serviceFilter = selectedServices.join(',');
      const res = await axios.get(`${API_BASE}/dashboard/stats-v2`, { params });
      setDashboardV2Stats(res.data);
    } catch (err) { console.error('stats-v2 error:', err); }
  }, [selectedServices]);

  const fetchCircuitSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { search: circuitSearch, page: circuitPage, limit, sortField: circuitSortField, sortOrder: circuitSortOrder };
      if (selectedServices.length > 0) params.serviceFilter = selectedServices.join(',');
      const res = await axios.get(`${API_BASE}/dashboard/circuit-summary`, { params });
      setCircuitData(res.data.data || []);
      setCircuitTotal(res.data.total || 0);
    } catch (err) { console.error('circuit-summary error:', err); } finally { setLoading(false); }
  }, [circuitSearch, circuitPage, limit, circuitSortField, circuitSortOrder, selectedServices]);

  const fetchServiceNames = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/service-names`);
      setServiceNames(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchNoWifiSummary = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/no-wifi-summary`);
      setNoWifiData(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const handleCircuitExport = async () => {
    try {
      setIsExportingCircuit(true);
      const params1: any = { search: circuitSearch, page: 1, limit: 999999, sortField: circuitSortField, sortOrder: circuitSortOrder };
      if (selectedServices.length > 0) params1.serviceFilter = selectedServices.join(',');
      await axios.get(`${API_BASE}/dashboard/circuit-summary`, {
        params: params1,
        responseType: 'blob'
      });
      
      const params2: any = { search: circuitSearch };
      if (selectedServices.length > 0) params2.serviceFilter = selectedServices.join(',');
      const res2 = await axios.get(`${API_BASE}/dashboard/circuit-summary/export`, {
        params: params2,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res2.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `circuit_summary_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { 
      console.error('Circuit export error:', err);
      alert('Export failed'); 
    } finally { setIsExportingCircuit(false); }
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      await axios.post(`${API_BASE}/dashboard/refresh-view`);
      await Promise.all([
        fetchCircuitSummary(),
        fetchStatsV2(),
        fetchNoWifiSummary()
      ]);
      alert('รีเฟรชข้อมูลตารางเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDashboardExport = async () => {
    try {
      setIsExporting(true);
      const response = await axios.get(`${API_BASE}/dashboard/export`, {
        params: { search: searchTerm },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_summary_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error('Export Error:', err); } finally { setIsExporting(false); }
  };

  const handleTableExport = async (endpoint: string, defaultFilename: string) => {
    try {
      setIsExporting(true);
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        params: { search: searchTerm },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${defaultFilename}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { 
      console.error('Export Error:', err);
      alert('การดาวน์โหลดไฟล์ล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('app8_view', view);
    localStorage.setItem('app8_limit', limit.toString());
    localStorage.setItem('app8_search', searchTerm);
    localStorage.setItem('app8_sidebar_mini', isSidebarMini.toString());
    localStorage.setItem('app8_report_columns', JSON.stringify(selectedReportColumns));
  }, [view, limit, searchTerm, isSidebarMini, selectedReportColumns]);

  // Load all catalog once for autocomplete
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllCatalog();
  }, [fetchAllCatalog]);

  useEffect(() => {
    localStorage.setItem(`app8_page_${view}`, page.toString());
  }, [page, view]);

  const fetchCatalogDiscovery = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/device-catalog/discovery`);
      setCatalogDiscovery(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/reports/integrated-data`, { 
        params: { search: searchTerm, page, limit, sortField, sortOrder } 
      });
      setReportData(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [searchTerm, page, limit, sortField, sortOrder]);

  useEffect(() => {
    if (view === 'home') {
      fetchDashboard();
      fetchStatsV2();
      fetchCircuitSummary();
      fetchServiceNames();
      fetchNoWifiSummary();
    }
    else if (view === 'onu') { fetchData(); }
    else if (view === 'logs') fetchLogs();
    else if (view === 'cpe' || view === 'missing-mapping') {
      if (view === 'missing-mapping') fetchCPEGroups();
      else if (mappingTab === 'onu') fetchCPEGroups();
      else if (mappingTab === 'wifi') fetchWifiMappings();
      else fetchOnuGetOltMappings();
    }
    else if (view === 'catalog') {
      fetchCatalog();
      fetchCatalogDiscovery();
      axios.get(`${API_BASE}/device-catalog/backup-status`).then(res => setCatalogBackupCount(res.data.count)).catch(() => {});
    }
    else if (view === 'report') fetchReport();
    else if (view === 'wifi') { fetchWiFiRouters(); }
    else if (view === 'onu-get-olt') { fetchOnuGetOlt(); }
  }, [view, mappingTab, fetchData, fetchLogs, fetchCPEGroups, fetchWifiMappings, fetchCatalog, fetchReport, fetchWiFiRouters, fetchDashboard, fetchOnuGetOlt, fetchStatsV2, fetchCircuitSummary, fetchServiceNames, fetchNoWifiSummary]);

  // Re-fetch circuit when pagination/sort changes
  useEffect(() => {
    if (view === 'home') fetchCircuitSummary();
  }, [circuitPage, circuitSearch, circuitSortField, circuitSortOrder]);

  // Re-fetch stats when service filter changes
  useEffect(() => {
    if (view === 'home') fetchStatsV2();
  }, [selectedServices]);


  const handleSort = (field: string) => {
    if (sortField === field) setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setSortField(field); setSortOrder('ASC'); }
    setPage(1);
  };

  const handleCPESort = (field: keyof CPEGroup) => {
    if (cpeSortField === field) setCpeSortOrder(cpeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setCpeSortField(field); setCpeSortOrder('ASC'); }
  };

  const handleCatalogSort = (field: string) => {
    if (catalogSortField === field) setCatalogSortOrder(catalogSortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setCatalogSortField(field); setCatalogSortOrder('ASC'); }
    setPage(1);
  };

  const handleWiFiMapSort = (field: keyof WiFiMapping) => {
    if (wifiMapSortField === field) setWifiMapSortOrder(wifiMapSortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setWifiMapSortField(field); setWifiMapSortOrder('ASC'); }
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'wifi') {
      setWifiSearchTerm(wifiSearchInput);
    } else {
      setSearchTerm(searchInput);
      localStorage.setItem('app8_search', searchInput);
    }
    setPage(1);
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      if (editing.id) {
        const response = await axios.put(`${API_BASE}/onu/${editing.id}`, editing);
        const updatedItem = response.data;
        setData(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else {
        await axios.post(`${API_BASE}/onu`, editing);
        fetchData();
      }
      setEditing(null);
    } catch { alert('Save failed'); }
  };

  const handleSaveCPEMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingCPE) return;
    try {
      await axios.post(`${API_BASE}/cpe-devices`, mappingCPE);
      setMappingCPE(null);
      // Refetch everything to ensure counts and status are updated correctly
      if (mappingTab === 'onu-get-olt') {
        fetchOnuGetOltMappings();
      } else {
        fetchCPEGroups();
      }
      // Optional: fetch background to keep discoveries updated
      if (mappingTab === 'onu') {
        const disc = await axios.get(`${API_BASE}/cpe-groups/new-discoveries`);
        setNewDiscoveries(disc.data.data);
      } else if (mappingTab === 'onu-get-olt') {
        const disc = await axios.get(`${API_BASE}/onu-get-olt-groups/new-discoveries`);
        setNewOnuGetOltDiscoveries(disc.data.data);
      }
    } catch { alert('Mapping failed'); }
  };

  const handleSaveWiFi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWiFi) return;
    try {
      if (editingWiFi.id) {
        const response = await axios.put(`${API_BASE}/wifi-routers/${editingWiFi.id}`, editingWiFi);
        const updatedItem = response.data;
        setWifiRouters(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else {
        await axios.post(`${API_BASE}/wifi-routers`, editingWiFi);
        fetchWiFiRouters();
      }
      setEditingWiFi(null);
    } catch { alert('Save failed'); }
  };

  const handleSaveWifiMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingWifi) return;
    try {
      await axios.post(`${API_BASE}/wifi-mappings`, mappingWifi);
      setMappingWifi(null);
      fetchWifiMappings();
    } catch { alert('Save failed'); }
  };

  const handleDeleteWifiMapping = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบการตั้งค่า',
      message: 'ยืนยันการลบการตั้งค่ายี่ห้อ/รุ่น ของ WiFi Router นี้?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/wifi-mappings/${id}`);
          fetchWifiMappings();
        } catch { alert('Delete failed'); }
      }
    });
  };

  const handleSaveSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpec) return;
    try {
      let response;
      if (editingSpec.id) {
        response = await axios.put(`${API_BASE}/device-catalog/${editingSpec.id}`, editingSpec);
      } else {
        response = await axios.post(`${API_BASE}/device-catalog`, editingSpec);
      }
      const updatedItem = response.data;
      setCatalog(prev => {
        const exists = prev.find(item => item.id === updatedItem.id);
        if (exists) return prev.map(item => item.id === updatedItem.id ? updatedItem : item);
        return [updatedItem, ...prev]; // For new items, add to top
      });
      setEditingSpec(null);
      // Update all catalog options in background
      axios.get(`${API_BASE}/device-catalog/all`).then(res => setAllCatalog(res.data.data));
      // Refresh mappings in case brand/model names changed
      fetchCPEGroups();
      fetchWifiMappings();
    } catch { alert('Save failed'); }
  };

  const handleDeleteMapping = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบการตั้งค่า',
      message: 'ยืนยันการลบการตั้งค่ายี่ห้อ/รุ่น ของอุปกรณ์นี้? (จะทำให้สถานะกลับไปเป็น Pending)',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/cpe-devices/${id}`);
          fetchCPEGroups();
          fetchNewDiscoveries();
          setConfirmAction(null);
        } catch { alert('Delete failed'); }
      }
    });
  };

  const handleDelete = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบข้อมูล ONU',
      message: 'ยืนยันการลบข้อมูลรายการ ONU นี้?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/onu/${id}`);
          fetchData();
          setConfirmAction(null);
        } catch { alert('Delete failed'); }
      }
    });
  };

  const handleDeleteWiFi = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบข้อมูล WiFi Router',
      message: 'ยืนยันการลบข้อมูลรายการ WiFi Router นี้?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/wifi-routers/${id}`);
          fetchWiFiRouters();
          setConfirmAction(null);
        } catch { alert('Delete failed'); }
      }
    });
  };

  const handleDeleteCatalogSpec = async (id: number) => {
    try {
      const impactRes = await axios.get(`${API_BASE}/device-catalog/${id}/impact`);
      const { brand, model, cpeCount, wifiCount } = impactRes.data;
      
      let impactMessage = `ยืนยันการลบข้อมูลสเปกอุปกรณ์ ${brand} : ${model} จากฐานข้อมูล?`;
      if (cpeCount > 0 || wifiCount > 0) {
        impactMessage = `⚠️ คำเตือน: มีการใช้งานสเปกนี้อยู่ใน:\n- ONU Mapping: ${cpeCount} รายการ\n- WiFi Mapping: ${wifiCount} รายการ\n\nหากลบออก ข้อมูลการจับคู่เหล่านี้จะถูกยกเลิกด้วย คุณแน่ใจหรือไม่?`;
      }

      setConfirmAction({
        title: 'ยืนยันการลบสเปกอุปกรณ์',
        message: impactMessage,
        onConfirm: async () => {
          try {
            await axios.delete(`${API_BASE}/device-catalog/${id}`);
            fetchCatalog();
            setConfirmAction(null);
          } catch { alert('Delete failed'); }
        }
      });
    } catch (err) { console.error(err); alert('Error checking impact'); }
  };

  const handleSaveOnuGetOlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOnuGetOlt) return;
    try {
      if (editingOnuGetOlt.id) {
        const response = await axios.put(`${API_BASE}/onu-get-olt/${editingOnuGetOlt.id}`, editingOnuGetOlt);
        const updatedItem = response.data;
        setOnuGetOltData(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else {
        await axios.post(`${API_BASE}/onu-get-olt`, editingOnuGetOlt);
        fetchOnuGetOlt();
      }
      setEditingOnuGetOlt(null);
    } catch { alert('Save failed'); }
  };

  const handleDeleteOnuGetOlt = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบข้อมูล ONU Get OLT',
      message: 'ยืนยันการลบข้อมูลรายการ ONU Get OLT นี้?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/onu-get-olt/${id}`);
          fetchOnuGetOlt();
          setConfirmAction(null);
        } catch { alert('Delete failed'); }
      }
    });
  };


  // Removed unused ONU handlers

  const handleCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConfirmAction({
      title: 'ยืนยันการนำเข้าข้อมูล Catalog',
      message: 'ระบบจะทำการ Upsert ข้อมูล (อัปเดตรายการเดิมหรือสร้างใหม่หากไม่พบ ยี่ห้อ/รุ่น) และจะทำการสำรองข้อมูลเดิมไว้ ยืนยันหรือไม่?',
      onConfirm: async () => {
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        setConfirmAction(null);
        try {
          const res = await axios.post(`${API_BASE}/device-catalog/upload`, formData);
          fetchCatalog();
          const bkRes = await axios.get(`${API_BASE}/device-catalog/backup-status`);
          setCatalogBackupCount(bkRes.data.count);
          alert(`นำเข้าสำเร็จ: อัปเดต ${res.data.updated} รายการ, เพิ่มใหม่ ${res.data.inserted} รายการ`);
        } catch (err: any) {
          alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
          if (catalogFileInputRef.current) catalogFileInputRef.current.value = '';
        }
      }
    });
  };

  const handleCatalogRestore = async () => {
    setConfirmAction({
      title: 'ยืนยันการกู้คืนข้อมูล Catalog',
      message: 'การกู้คืนจะเขียนทับข้อมูล Catalog ทั้งหมดด้วยข้อมูลสำรองล่าสุด ยืนยันหรือไม่?',
      onConfirm: async () => {
        setLoading(true);
        setConfirmAction(null);
        try {
          await axios.post(`${API_BASE}/device-catalog/restore`);
          fetchCatalog();
          alert('กู้คืนข้อมูลสำเร็จ');
        } catch (err: any) {
          alert('Restore failed: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Removed unused WiFi handlers

  // Brand options
  const uniqueBrands = Array.from(new Set(allCatalog.map(d => d.brand))).filter(Boolean) as string[];
  
  // Model options: filter by brand if set, otherwise show ALL models
  const modelOptions = (brand: string | null | undefined): string[] => {
    if (!brand) return Array.from(new Set(allCatalog.map(d => d.model))).filter(Boolean) as string[];
    return allCatalog.filter(d => d.brand === brand).map(d => d.model).filter(Boolean) as string[];
  };

  // When model is selected, auto-fill brand if brand is empty
  const handleONUBrandChange = (val: string) => {
    setMappingCPE({ ...mappingCPE, brand: val, model: '' });
  };
  const handleONUModelChange = (val: string) => {
    const updates: Partial<CPEGroup> = { model: val };
    const found = allCatalog.find(d => d.model === val);
    if (found?.brand) updates.brand = found.brand;
    setMappingCPE({ ...mappingCPE, ...updates });
  };

  const handleWifiBrandChange = (val: string) => {
    setMappingWifi({ ...mappingWifi, target_brand: val, target_model: '' });
  };
  const handleWifiModelChange = (val: string) => {
    const updates: Partial<WiFiMapping> = { target_model: val };
    const found = allCatalog.find(d => d.model === val);
    if (found?.brand) updates.target_brand = found.brand;
    setMappingWifi({ ...mappingWifi, ...updates });
  };


  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans text-slate-900">
      {isExporting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border border-slate-100 max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Download className="text-indigo-600 animate-bounce" size={28} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2">กำลังเตรียมไฟล์...</h3>
              <p className="text-slate-500 font-bold text-sm">ระบบกำลังรวบรวมข้อมูลเพื่อสร้างไฟล์ Excel<br/>กรุณารอสักครู่</p>
            </div>
          </div>
        </div>
      )}
      <aside className={`${isSidebarMini ? 'w-24' : 'w-72'} bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 transition-all duration-300 relative`}>
        <button 
          onClick={() => setIsSidebarMini(!isSidebarMini)}
          className="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-30"
        >
          {isSidebarMini ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-8 border-b border-slate-50 flex items-center gap-4 ${isSidebarMini ? 'justify-center p-4' : ''}`}>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 flex-shrink-0"><Server size={24} /></div>
          {!isSidebarMini && <div><h1 className="font-black text-xl tracking-tighter text-slate-800">APP8 ONU</h1><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Management v2</p></div>}
        </div>

        <nav className={`flex-1 space-y-2 ${isSidebarMini ? 'p-4' : 'p-6'}`}>
          {[
            { id: 'home', icon: <Layout size={20} />, label: 'Dashboard' },
            { id: 'onu', icon: <Server size={20} />, label: 'ONU Records' },
            { id: 'wifi', icon: <Wifi size={20} />, label: 'WiFi Routers' },
            { id: 'onu-get-olt', icon: <Database size={20} />, label: 'ONU Get OLT' },
            { id: 'cpe', icon: <Cpu size={20} />, label: 'Device Mapping' },
            { id: 'missing-mapping', icon: <AlertCircle size={20} />, label: 'Missing Mapping' },
            { id: 'catalog', icon: <Database size={20} />, label: 'Device Catalog' },
            { id: 'report', icon: <FileBarChart size={20} />, label: 'Integrated Report' },
            { id: 'logs', icon: <History size={20} />, label: 'Activity Logs', admin: true },
          ].map((item) => {
            if (item.admin && user.role !== 'admin') return null;
            return (
              <button 
                key={item.id}
                onClick={() => { setView(item.id as AppView); setPage(1); }} 
                title={isSidebarMini ? item.label : ''}
                className={`w-full flex items-center rounded-2xl text-base font-black transition-all ${isSidebarMini ? 'justify-center p-4' : 'gap-4 px-6 py-4'} ${view === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {item.icon}
                {!isSidebarMini && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-slate-50 ${isSidebarMini ? 'p-4' : 'p-6'}`}>
          <div className={`flex items-center bg-slate-50 rounded-2xl mb-4 border border-slate-100 ${isSidebarMini ? 'justify-center p-2' : 'gap-4 p-4'}`}>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0">{user.username[0].toUpperCase()}</div>
            {!isSidebarMini && <div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{user.username}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.role}</p></div>}
          </div>
          <button onClick={onLogout} className={`flex items-center justify-center text-sm font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all ${isSidebarMini ? 'w-12 h-12 p-0' : 'w-full gap-3 px-6 py-4'}`}>
            <LogOut size={18} /> 
            {!isSidebarMini && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-6"><h2 className="text-2xl font-black text-slate-800 tracking-tight">{view === 'home' ? 'Dashboard Summary v2.1' : view === 'onu' ? 'รายการข้อมูล ONU' : view === 'wifi' ? 'รายการข้อมูล WiFi Router' : view === 'onu-get-olt' ? 'รายการข้อมูล ONU Get OLT' : view === 'cpe' ? 'จัดการยี่ห้อ/รุ่นอุปกรณ์' : view === 'catalog' ? 'ฐานข้อมูลอุปกรณ์' : view === 'report' ? 'Integrated Report' : 'ประวัติการใช้งาน'}</h2>{((view === 'home' ? circuitTotal : total) > 0) && (<div className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm border border-indigo-100 min-w-[160px] whitespace-nowrap"><span>ทั้งหมด {(view === 'home' ? circuitTotal : total).toLocaleString()} รายการ</span></div>)}</div>
          <div className="flex items-center gap-6">
            {(view === 'home' || view === 'onu' || view === 'report' || view === 'wifi' || view === 'onu-get-olt' || view === 'cpe' || view === 'catalog') && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาข้อมูล..." 
                    value={view === 'wifi' ? wifiSearchInput : searchInput} 
                    onChange={(e) => view === 'wifi' ? setWifiSearchInput(e.target.value) : setSearchInput(e.target.value)} 
                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-[400px] flex-shrink-0 transition-all" 
                  />
                </div>
                <button type="submit" className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">ค้นหา</button>
                {view === 'report' && (
                  <button type="button" onClick={handleDashboardExport} className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all whitespace-nowrap">
                    <Download size={18} /> <span>Export Excel</span>
                  </button>
                )}
              </form>
            )}
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 relative cursor-pointer hover:bg-white hover:text-indigo-600 transition-all">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col relative">
          {view === 'home' && (
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-slate-50/30">
              <div className="flex flex-col gap-8 max-w-[1600px] mx-auto">
                {/* --- Tab Navigation --- */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200">
                    <button onClick={() => setHomeTab('circuit')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${homeTab === 'circuit' ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>Circuit Summary (New)</button>
                    <button onClick={() => setHomeTab('overview')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${homeTab === 'overview' ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>Overview (Classic)</button>
                  </div>

                  {homeTab === 'circuit' && (
                    <div className="relative z-20">
                      <button 
                        onClick={() => setIsServiceFilterOpen(!isServiceFilterOpen)}
                        className={`flex items-center gap-2 px-5 py-3 bg-white border ${selectedServices.length > 0 ? 'border-blue-500 text-blue-600 shadow-blue-100' : 'border-slate-200 text-slate-600 hover:border-slate-300 shadow-slate-100'} rounded-2xl text-sm font-black shadow-md transition-all`}
                      >
                        <Database size={18} />
                        <span>ตัวกรอง Service Name {selectedServices.length > 0 ? `(${selectedServices.length})` : ''}</span>
                        <ChevronDown size={18} className={`ml-2 transition-transform duration-200 ${isServiceFilterOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isServiceFilterOpen && (
                        <>
                          {/* Invisible backdrop to close dropdown on click outside */}
                          <div className="fixed inset-0 z-40" onClick={() => setIsServiceFilterOpen(false)}></div>
                          
                          <div className="absolute top-[calc(100%+8px)] left-0 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                              <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text" 
                                  placeholder="ค้นหา (Search)..." 
                                  value={serviceSearchTerm}
                                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
                                  autoFocus
                                />
                              </div>
                            </div>
                            
                            <div className="max-h-[320px] overflow-y-auto scrollbar-thin p-2 flex flex-col gap-0.5">
                              {/* Select All Checkbox */}
                              <label className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
                                 <input 
                                   type="checkbox" 
                                   className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                   checked={
                                     serviceNames.filter(s => s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())).length > 0 &&
                                     serviceNames.filter(s => s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                                       .every(s => selectedServices.includes(s.service_name))
                                   }
                                   onChange={(e) => {
                                     const filtered = serviceNames.filter(s => s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())).map(s => s.service_name);
                                     if (e.target.checked) {
                                       setSelectedServices(prev => Array.from(new Set([...prev, ...filtered])));
                                     } else {
                                       setSelectedServices(prev => prev.filter(s => !filtered.includes(s)));
                                     }
                                   }}
                                 />
                                 <span className="text-sm font-black text-slate-800">(Select All{serviceSearchTerm ? ' Search Results' : ''})</span>
                              </label>
                              
                              <div className="h-px w-full bg-slate-100 my-1"></div>

                              {/* List of Services */}
                              {serviceNames.filter(s => s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())).map((s, i) => (
                                <label key={i} className={`flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all ${selectedServices.includes(s.service_name) ? 'bg-blue-50/50' : ''}`}>
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                      checked={selectedServices.includes(s.service_name)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedServices(prev => [...prev, s.service_name]);
                                        else setSelectedServices(prev => prev.filter(v => v !== s.service_name));
                                      }}
                                    />
                                    <span className={`text-sm font-bold truncate max-w-[200px] ${selectedServices.includes(s.service_name) ? 'text-blue-700' : 'text-slate-600'}`} title={s.service_name}>{s.service_name}</span>
                                  </div>
                                  <span className={`text-xs font-black ${selectedServices.includes(s.service_name) ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`}>{Number(s.circuit_count).toLocaleString()}</span>
                                </label>
                              ))}
                              {serviceNames.filter(s => s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())).length === 0 && (
                                <div className="py-8 text-center text-sm font-bold text-slate-400 flex flex-col items-center gap-2">
                                  <Search size={24} className="text-slate-300 opacity-50" />
                                  <span>ไม่พบ Service ที่ค้นหา</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                              <button onClick={() => setSelectedServices([])} className="px-4 py-2 text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">Clear Filter</button>
                              <button onClick={() => setIsServiceFilterOpen(false)} className="px-6 py-2 text-xs font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">OK</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {homeTab === 'circuit' && dashboardV2Stats && (
                  <>
                    {/* --- Stats Cards (V2) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {/* Card 1.1: ONU Type Breakdown */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layout size={18} /></div>
                          <h3 className="font-black text-slate-700 text-sm">จำนวน ONU (ตาม Type)</h3>
                        </div>
                        <div className="space-y-3 flex-1">
                          {dashboardV2Stats.card11_type_breakdown?.slice(0,3).map((t: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-500">{t.type}</span>
                              <span className="font-black text-indigo-600">{Number(t.total).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.2: FE Only */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Shield size={18} /></div>
                            <h3 className="font-black text-slate-700 text-sm">ONU Port 100M</h3>
                          </div>
                          <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-sm">{Number(dashboardV2Stats.card12_fe_only?.total || 0).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {dashboardV2Stats.card12_fe_only?.brands?.slice(0,4).map((b: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1">
                              <span className="font-bold text-slate-500">{b.brand}</span>
                              <span className="font-black text-rose-500">{Number(b.circuit_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.3: Service Names */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database size={18} /></div>
                          <h3 className="font-black text-slate-700 text-sm">ข้อมูลแยกตาม Service</h3>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[140px] scrollbar-thin">
                          {dashboardV2Stats.card13_by_service?.map((s: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-500 truncate max-w-[150px]">{s.service_name}</span>
                              <span className="font-black text-blue-600">{Number(s.circuit_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.4: Speed Mismatch */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
                            <h3 className="font-black text-slate-700 text-sm">สปีดไม่ถึงแพ็กเกจ</h3>
                          </div>
                          <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-sm">{dashboardV2Stats.card14_speed_mismatch?.reduce((a:any,b:any)=>a+Number(b.mismatch_count),0).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {dashboardV2Stats.card14_speed_mismatch?.map((m: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-500 truncate">{m.brand}</span>
                              <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{Number(m.mismatch_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* --- Circuit Table --- */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                      <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Zap size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-slate-800">สรุปข้อมูลระดับวงจร (Circuit Summary)</h2>
                            <p className="text-xs font-bold text-slate-400 mt-1">รวมศูนย์ข้อมูลอุปกรณ์จากทุกตาราง โดยใช้ Circuit ID เป็นหลัก</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="text" 
                              value={circuitSearchInput}
                              onChange={(e) => setCircuitSearchInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { setCircuitSearch(circuitSearchInput); setCircuitPage(1); } }}
                              placeholder="ค้นหาวงจร, ยี่ห้อ..."
                              className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-[250px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                          </div>
                          <button onClick={handleRefreshData} disabled={isRefreshing} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-blue-700 transition-all disabled:opacity-50">
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                          </button>
                          <button onClick={handleCircuitExport} disabled={isExportingCircuit} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50">
                            <Download size={16} /> {isExportingCircuit ? 'Exporting...' : 'Export Excel'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-auto scrollbar-thin">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th onClick={() => { if(circuitSortField==='circuit_norm') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('circuit_norm'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">หมายเลขวงจร</th>
                              <th onClick={() => { if(circuitSortField==='service_name') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('service_name'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">Service Name</th>
                              <th onClick={() => { if(circuitSortField==='speed') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('speed'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ความเร็ว (Mbps)</th>
                              <th onClick={() => { if(circuitSortField==='onu_brand') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('onu_brand'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ONU Device</th>
                              <th onClick={() => { if(circuitSortField==='onu_device_type') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('onu_device_type'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ONU Type</th>
                              <th onClick={() => { if(circuitSortField==='wifi_brand') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('wifi_brand'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">WiFi Router</th>
                              <th onClick={() => { if(circuitSortField==='effective_max_speed') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('effective_max_speed'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">Max Speed รวม</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {circuitData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-3 text-sm font-black text-indigo-600 flex items-center gap-2">
                                  {row.circuit_norm}
                                  {row.has_onu && row.has_olt && row.has_wifi ? <span className="w-2 h-2 rounded-full bg-slate-800" title="พบในทุกตาราง"></span> :
                                   row.has_wifi ? <span className="w-2 h-2 rounded-full bg-green-500" title="พบใน WiFi Router"></span> :
                                   row.has_olt ? <span className="w-2 h-2 rounded-full bg-blue-500" title="พบใน ONU Get OLT"></span> :
                                   <span className="w-2 h-2 rounded-full bg-indigo-400" title="พบเฉพาะ ONU Records"></span>}
                                </td>
                                <td className="px-6 py-3 text-sm font-bold text-slate-600">{row.service_name || '-'}</td>
                                <td className="px-6 py-3 text-sm font-bold text-slate-600">{(() => {
                                  if (!row.speed) return '-';
                                  const dlStr = row.speed.split('/')[0];
                                  const numStr = dlStr.replace(/[^0-9.]/g, '');
                                  if (!numStr) return row.speed;
                                  let num = parseFloat(numStr);
                                  if (dlStr.toLowerCase().includes('k')) {
                                    num = num / 1024;
                                  }
                                  return Math.round(num).toString();
                                })()}</td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-blue-600">{row.has_onu || row.has_olt ? (row.onu_brand || 'Pending Mapping') : '-'}</span>
                                    <span className="text-[10px] font-bold text-blue-400">{row.has_onu || row.has_olt ? row.onu_model : ''}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-xs font-bold text-slate-600">{row.onu_device_type || '-'}</span>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-emerald-600">{row.has_wifi ? (row.wifi_brand || 'Pending Mapping') : '-'}</span>
                                    <span className="text-[10px] font-bold text-emerald-500">{row.has_wifi ? row.wifi_model : ''}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-sm font-black text-amber-600">{row.effective_max_speed || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="shrink-0 border-t border-slate-100 bg-white">
                        <PaginationControls total={circuitTotal} limit={limit} page={circuitPage} setLimit={setLimit} setPage={setCircuitPage} jumpPage={circuitJumpPage} setJumpPage={setCircuitJumpPage} />
                      </div>
                    </div>

                    {/* --- No WiFi / GE Section --- */}
                    {noWifiData.no_wifi?.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mt-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Network size={20} /></div>
                          <div>
                            <h3 className="font-black text-slate-800">กลุ่ม ONU ที่ไม่มี WiFi ต่อพ่วง (Bridge Mode / มี Port GE)</h3>
                            <p className="text-xs font-bold text-slate-400">แยกตามยี่ห้อ (Top 10)</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {noWifiData.no_wifi.map((d, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-lg font-black text-slate-800 truncate" title={d.brand}>{d.brand}</span>
                                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{Number(d.total).toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col gap-4">
                                <div>
                                  <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
                                    {d.models?.length > 0 ? d.models.map((m: any, i: number) => (
                                      <div key={i} className="flex justify-between text-[11px] bg-white px-2 py-1.5 rounded border border-slate-100">
                                        <span className="font-bold text-slate-600 truncate mr-2" title={m.model}>{m.model}</span>
                                        <span className="font-black text-slate-800">{Number(m.count).toLocaleString()}</span>
                                      </div>
                                    )) : <span className="text-[10px] text-slate-400 italic">ไม่มีข้อมูล</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* --- FE Only Section --- */}
                    {noWifiData.fe_only?.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mt-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={20} /></div>
                          <div>
                            <h3 className="font-black text-slate-800">กลุ่ม ONU ที่เป็น Port FE ล้วน</h3>
                            <p className="text-xs font-bold text-slate-400">แยกตามยี่ห้อ (Top 10)</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {noWifiData.fe_only.map((d, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-lg font-black text-slate-800 truncate" title={d.brand}>{d.brand}</span>
                                <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{Number(d.total).toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col gap-4">
                                <div>
                                  <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-thin">
                                    {d.models?.length > 0 ? d.models.map((m: any, i: number) => (
                                      <div key={i} className="flex justify-between text-[11px] bg-white px-2 py-1.5 rounded border border-slate-100">
                                        <span className="font-bold text-slate-600 truncate mr-2" title={m.model}>{m.model}</span>
                                        <span className="font-black text-slate-800">{Number(m.count).toLocaleString()}</span>
                                      </div>
                                    )) : <span className="text-[10px] text-slate-400 italic">ไม่มีข้อมูล</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- Classic Overview (Tab B) --- */}
                {homeTab === 'overview' && dashboardStats && dashboardStats.summary && (
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'รายการทั้งหมด', value: dashboardStats.summary.total_records, icon: <Layout size={20} />, color: 'bg-indigo-600', sub: 'รายการอุปกรณ์รวม' },
                        { label: 'ONU All In One', value: dashboardStats.summary.all_in_one_count, icon: <Zap size={20} />, color: 'bg-emerald-500', sub: 'WiFi ในตัว' },
                        { label: 'ONU + WiFi Router', value: dashboardStats.summary.wifi_router_count, icon: <Wifi size={20} />, color: 'bg-blue-500', sub: 'ต่อพ่วงภายนอก' },
                        { label: 'ONU Bridge Only', value: dashboardStats.summary.only_onu_count, icon: <Shield size={20} />, color: 'bg-slate-700', sub: 'ไม่มี WiFi' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                              {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{Number(stat.value).toLocaleString()}</h3>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (ONU)</p>
                            <h3 className="text-2xl font-black text-amber-600 tracking-tight">{Number(dashboardStats.summary.pending_onu_mapping).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รายการ</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('onu'); setPage(1); }} className="px-6 py-3 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all">จัดการ</button>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (WiFi)</p>
                            <h3 className="text-2xl font-black text-rose-600 tracking-tight">{Number(dashboardStats.summary.pending_wifi_mapping).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รายการ</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('wifi'); setPage(1); }} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all">จัดการ</button>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (Get OLT)</p>
                            <h3 className="text-2xl font-black text-indigo-600 tracking-tight">{Number(dashboardStats.summary.pending_onu_get_olt_mapping || 0).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รุ่น</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('onu-get-olt'); setPage(1); }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">จัดการ</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><Zap className="text-emerald-500" /> All-In-One ONU Breakdown</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตามยี่ห้อ</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {(dashboardStats.all_in_one_by_brand || []).slice(0, 8).map((item: any, i: number) => {
                            const max = Math.max(...(dashboardStats.all_in_one_by_brand || []).map((x: any) => parseInt(x.count)), 1);
                            const pct = (parseInt(item.count) / max) * 100;
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black uppercase">
                                  <span className="text-slate-500">{item.brand}</span>
                                  <span className="text-emerald-600">{Number(item.count).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><Wifi className="text-blue-500" /> WiFi Router Breakdown</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตามยี่ห้อมาตรฐาน</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {(dashboardStats.wifi_router_by_brand || []).slice(0, 8).map((item: any, i: number) => {
                            const max = Math.max(...(dashboardStats.wifi_router_by_brand || []).map((x: any) => parseInt(x.count)), 1);
                            const pct = (parseInt(item.count) / max) * 100;
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black uppercase">
                                  <span className="text-slate-500">{item.brand}</span>
                                  <span className="text-blue-600">{Number(item.count).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          <div className={`${view !== 'home' ? 'flex-1 overflow-hidden flex flex-col' : 'hidden'}`}>
            <div className="flex-1 m-8 bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-0">
            {view === 'onu' && (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">ข้อมูลทั้งหมด</h3>
                  <button onClick={() => handleTableExport('/onu/export', 'onu_records')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                    <Download size={18} /> <span>Export Excel</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <table className="w-full text-left border-separate border-spacing-0 min-w-[2500px]">
                    <thead>
                      <tr>
                        {Object.keys(COLUMN_DISPLAY_MAP).map(key => (
                          <th key={key} onClick={() => handleSort(key)} className="sticky top-0 z-[30] bg-slate-50 px-6 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              {COLUMN_DISPLAY_MAP[key as keyof typeof COLUMN_DISPLAY_MAP]}
                              {sortField === key ? (sortOrder === 'ASC' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                            </div>
                          </th>
                        ))}
                        <th className="sticky top-0 right-0 z-20 bg-slate-50 px-6 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 text-right shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] border-b border-slate-200">ตัวเลือก</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">{data.map((item) => (<tr key={item.id} className="hover:bg-indigo-50/20 transition-colors group">{Object.keys(COLUMN_DISPLAY_MAP).map(key => (<td key={key} className={`px-6 py-4 text-sm font-bold truncate max-w-[300px] ${key === 'onu_serial' ? 'text-indigo-600 font-black' : 'text-slate-600'}`}>{key === 'service_status' ? (<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${item[key] === 'Active' || item[key] === 'ใช้งาน' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{item[key]}</span>) : item[key] || '-'}</td>))}<td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-indigo-50/20 transition-all shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)]"><div className="flex justify-end gap-2"><button onClick={() => setEditing(item)} className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-indigo-100"><Edit2 size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button></div></td></tr>))}</tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </>
            )}

            {view === 'cpe' && (
              <>
                <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit">
                      <button onClick={() => { setMappingTab('onu'); setPage(1); setShowOnlyPending(false); }} className={`px-10 py-3 rounded-[1.5rem] text-sm font-black transition-all ${mappingTab === 'onu' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>ONU Mapping</button>
                      <button onClick={() => { setMappingTab('wifi'); setPage(1); setShowOnlyPending(false); }} className={`px-10 py-3 rounded-[1.5rem] text-sm font-black transition-all ${mappingTab === 'wifi' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>WiFi Router Mapping</button>
                      <button onClick={() => { setMappingTab('onu-get-olt'); setPage(1); setShowOnlyPending(false); }} className={`px-10 py-3 rounded-[1.5rem] text-sm font-black transition-all ${mappingTab === 'onu-get-olt' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>ONU Get OLT Mapping</button>
                    </div>
                    <button onClick={() => handleTableExport(mappingTab === 'onu' ? '/cpe-groups/export' : mappingTab === 'wifi' ? '/wifi-mappings/groups/export' : '/onu-get-olt-groups/export', mappingTab === 'onu' ? 'onu_mapping' : mappingTab === 'wifi' ? 'wifi_mapping' : 'onu_get_olt_mapping')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                      <Download size={18} /> <span>Export Excel</span>
                    </button>
                  </div>
                  {((mappingTab === 'onu' && newDiscoveries.length > 0) || (mappingTab === 'wifi' && newWifiDiscoveries.length > 0) || (mappingTab === 'onu-get-olt' && newOnuGetOltDiscoveries.length > 0)) && (
                    <button 
                      onClick={() => { setShowOnlyPending(!showOnlyPending); setPage(1); }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all ${showOnlyPending ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100 animate-pulse hover:scale-105'}`}
                    >
                      {showOnlyPending ? (
                        <><Search size={18} /> แสดงทั้งหมด (คืนค่าการกรอง)</>
                      ) : (
                        <><AlertCircle size={18} /> พบรุ่นใหม่ที่ยังไม่ได้จับคู่ ({(mappingTab === 'onu' ? newDiscoveries : mappingTab === 'wifi' ? newWifiDiscoveries : newOnuGetOltDiscoveries).length})</>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin">
                  {mappingTab === 'onu' || mappingTab === 'onu-get-olt' ? (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr>
                          <th onClick={() => handleCPESort('raw_name')} className="sticky top-0 z-[30] bg-slate-50 px-8 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">Raw Name (จากไฟล์){cpeSortField === 'raw_name' ? (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleCPESort('record_count')} className="sticky top-0 z-[30] bg-slate-50 px-8 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200 text-center"><div className="flex items-center justify-center gap-2">จำนวนที่พบ{cpeSortField === 'record_count' ? (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleCPESort('brand')} className="sticky top-0 z-[30] bg-slate-50 px-8 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">ยี่ห้อ (มาตรฐาน){cpeSortField === 'brand' ? (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleCPESort('model')} className="sticky top-0 z-[30] bg-slate-50 px-8 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">รุ่น (มาตรฐาน){cpeSortField === 'model' ? (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th className="sticky top-0 z-[30] bg-slate-50 px-8 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 text-right border-b border-slate-200">สถานะ / จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cpeGroups.map((group, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-3 text-sm font-bold text-slate-600">{group.raw_name}</td>
                            <td className="px-8 py-3 text-sm font-black text-indigo-600 text-center">{(group.record_count || 0).toLocaleString()}</td>
                            <td className="px-8 py-3 text-sm font-black text-indigo-600">{group.brand || '-'}</td>
                            <td className="px-8 py-3 text-sm font-black text-slate-800">{group.model || '-'}</td>
                            <td className="px-8 py-3 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {group.mapped_id ? (<span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase border border-green-100"><CheckCircle2 size={12} /> OK</span>) : (<span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-100"><XCircle size={12} /> Pending</span>)}
                                <button onClick={() => setMappingCPE({ ...group })} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><Edit2 size={16} /></button>
                                {group.mapped_id && <button onClick={() => handleDeleteMapping(group.mapped_id!)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr>
                          <th onClick={() => handleWiFiMapSort('raw_brand')} className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">ยี่ห้อ (ดิบ){wifiMapSortField === 'raw_brand' ? (wifiMapSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleWiFiMapSort('raw_model')} className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">รุ่น (ดิบ){wifiMapSortField === 'raw_model' ? (wifiMapSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleWiFiMapSort('record_count')} className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200 text-center"><div className="flex items-center justify-center gap-2">จำนวนที่พบ{wifiMapSortField === 'record_count' ? (wifiMapSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleWiFiMapSort('target_brand')} className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">ยี่ห้อ (มาตรฐาน){wifiMapSortField === 'target_brand' ? (wifiMapSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th onClick={() => handleWiFiMapSort('target_model')} className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">รุ่น (มาตรฐาน){wifiMapSortField === 'target_model' ? (wifiMapSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                          <th className="sticky top-0 z-10 bg-slate-50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right border-b border-slate-200">สถานะ / จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {wifiMappings.map((group, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-3 text-sm font-bold text-slate-500">{group.raw_brand}</td>
                            <td className="px-8 py-3 text-sm font-bold text-slate-500">{group.raw_model}</td>
                            <td className="px-8 py-3 text-sm font-black text-indigo-600 text-center">{(group.record_count || 0).toLocaleString()}</td>
                            <td className="px-8 py-3 text-sm font-black text-indigo-600">{group.target_brand || '-'}</td>
                            <td className="px-8 py-3 text-sm font-black text-slate-800">{group.target_model || '-'}</td>
                            <td className="px-8 py-3 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {group.mapped_id ? (<span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase border border-green-100"><CheckCircle2 size={12} /> OK</span>) : (<span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-100"><XCircle size={12} /> Pending</span>)}
                                <button onClick={() => setMappingWifi({ ...group })} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><Edit2 size={16} /></button>
                                {group.mapped_id && <button onClick={() => handleDeleteWifiMapping(group.mapped_id!)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </>
            )}

            {view === 'report' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className={`border-b border-slate-100 bg-white shrink-0 transition-all ${showReportSettings ? 'p-8' : 'p-4'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => setShowReportSettings(!showReportSettings)}>
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Settings2 size={20} /></div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                          เลือกข้อมูลที่ต้องการนำมาแสดง
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showReportSettings ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {showReportSettings ? 'ย่อตัวเลือก (ซ่อน)' : 'ขยายตัวเลือก (แสดง)'}
                            {showReportSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </h3>
                        {showReportSettings && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ติ๊กเลือกหัวข้อที่ต้องการรวมข้อมูลในตาราง</p>}
                      </div>
                    </div>
                    {showReportSettings && (
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedReportColumns(Object.keys(REPORT_COLUMNS))} className="text-xs font-black text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">เลือกทั้งหมด</button>
                        <button onClick={() => setSelectedReportColumns([])} className="text-xs font-black text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">ล้างทั้งหมด</button>
                      </div>
                    )}
                  </div>
                  {showReportSettings && (
                    <>
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[60vh] overflow-y-auto pr-6 scrollbar-thin">
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">ข้อมูลบริการพื้นฐาน</h4>
                          <div className="space-y-2">
                            {Object.keys(COLUMN_DISPLAY_MAP).map(key => (
                              <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedReportColumns.includes(key) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedReportColumns.includes(key)} onChange={() => {
                                  if (selectedReportColumns.includes(key)) setSelectedReportColumns(selectedReportColumns.filter(c => c !== key));
                                  else setSelectedReportColumns([...selectedReportColumns, key]);
                                }} />
                                <span className={`text-[11px] font-bold ${selectedReportColumns.includes(key) ? 'text-indigo-700' : 'text-slate-500'}`}>{COLUMN_DISPLAY_MAP[key as keyof typeof COLUMN_DISPLAY_MAP]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg w-fit">ข้อมูล ONU (มาตรฐาน)</h4>
                          <div className="space-y-2">
                            {['mapped_brand', 'mapped_model', 'type', 'version', 'lan_ge', 'lan_fe', 'wifi', 'usage', 'grade', 'device_price', 'device_max_speed'].map(key => (
                              <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedReportColumns.includes(key) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedReportColumns.includes(key)} onChange={() => {
                                  if (selectedReportColumns.includes(key)) setSelectedReportColumns(selectedReportColumns.filter(c => c !== key));
                                  else setSelectedReportColumns([...selectedReportColumns, key]);
                                }} />
                                <span className={`text-[11px] font-bold ${selectedReportColumns.includes(key) ? 'text-indigo-700' : 'text-slate-500'}`}>{REPORT_COLUMNS[key as keyof typeof REPORT_COLUMNS]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">ข้อมูล WiFi Router</h4>
                          <div className="space-y-2">
                            {['wifi_brand', 'wifi_model', 'wifi_version', 'wifi_mapped_brand', 'wifi_mapped_model', 'wifi_hw_type', 'wifi_hw_version', 'wifi_lan_ge', 'wifi_lan_fe', 'wifi_wifi_spec', 'wifi_usage', 'wifi_grade', 'wifi_price', 'wifi_max_speed'].map(key => (
                              <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedReportColumns.includes(key) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedReportColumns.includes(key)} onChange={() => {
                                  if (selectedReportColumns.includes(key)) setSelectedReportColumns(selectedReportColumns.filter(c => c !== key));
                                  else setSelectedReportColumns([...selectedReportColumns, key]);
                                }} />
                                <span className={`text-[11px] font-bold ${selectedReportColumns.includes(key) ? 'text-indigo-700' : 'text-slate-500'}`}>{REPORT_COLUMNS[key as keyof typeof REPORT_COLUMNS]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg w-fit">ข้อมูล OLT (Raw Data)</h4>
                          <div className="space-y-2">
                            {['olt_brand', 'onu_actual_type_raw', 'onu_type_raw', 'service_id_raw', 'start_date_css_raw'].map(key => (
                              <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedReportColumns.includes(key) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedReportColumns.includes(key)} onChange={() => {
                                  if (selectedReportColumns.includes(key)) setSelectedReportColumns(selectedReportColumns.filter(c => c !== key));
                                  else setSelectedReportColumns([...selectedReportColumns, key]);
                                }} />
                                <span className={`text-[11px] font-bold ${selectedReportColumns.includes(key) ? 'text-indigo-700' : 'text-slate-500'}`}>{REPORT_COLUMNS[key as keyof typeof REPORT_COLUMNS]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center sticky bottom-0 bg-white/80 backdrop-blur-sm pb-4">
                        <button onClick={() => setShowReportSettings(false)} className="flex items-center gap-3 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all group">
                          <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" /> ยืนยันและแสดงผลลัพธ์
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin bg-slate-50/30">
                  <table className="w-full text-left border-separate border-spacing-0 min-w-max">
                    <thead className="relative z-[30]">
                      <tr className="shadow-sm">
                        {selectedReportColumns.map(key => (
                          <th key={key} onClick={() => handleSort(key)} className="sticky top-0 z-[30] bg-slate-50 px-6 py-5 text-[15px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 cursor-pointer hover:text-indigo-600 group transition-all">
                            <div className="flex items-center gap-2">
                              {REPORT_COLUMNS[key as keyof typeof REPORT_COLUMNS]}
                              {sortField === key ? (sortOrder === 'ASC' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                          {selectedReportColumns.map(key => (
                            <td key={key} className={`px-6 py-4 text-sm font-bold ${key.startsWith('mapped_') || ['type', 'lan_ge', 'wifi'].includes(key) ? 'text-indigo-600' : (key.includes('price') ? 'text-emerald-600' : (key.includes('max_speed') ? 'text-amber-600' : 'text-slate-600'))} whitespace-nowrap`}>
                              {key === 'service_status' ? (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${row[key] === 'Active' || row[key] === 'ใช้งาน' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{row[key]}</span>
                              ) : key.includes('price') ? (
                                row[key] ? Number(row[key]).toLocaleString() : '-'
                              ) : row[key] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </div>
            )}

            {view === 'missing-mapping' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-8 pb-4 shrink-0 bg-white border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">จัดการข้อมูลไม่สมบูรณ์</h3>
                      <p className="text-sm text-slate-500 font-bold mt-1">กลุ่มข้อมูลจาก ยี่ห้อ OLT : รุ่น สำหรับรายการที่ไม่มีข้อมูล ONU</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 text-xs font-black">
                      พบ {total.toLocaleString()} กลุ่มข้อมูล
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th 
                          onClick={() => { setCpeSortField('raw_name'); setCpeSortOrder(cpeSortOrder === 'ASC' ? 'DESC' : 'ASC'); }}
                          className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            ข้อมูลต้นทาง (OLT)
                            {cpeSortField === 'raw_name' && (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => { setCpeSortField('record_count'); setCpeSortOrder(cpeSortOrder === 'ASC' ? 'DESC' : 'ASC'); }}
                          className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-all"
                        >
                          <div className="flex items-center justify-center gap-2">
                            จำนวนวงจร
                            {cpeSortField === 'record_count' && (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => { setCpeSortField('brand'); setCpeSortOrder(cpeSortOrder === 'ASC' ? 'DESC' : 'ASC'); }}
                          className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            การจับคู่ Catalog
                            {cpeSortField === 'brand' && (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </div>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {total === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                              <Search size={48} className="opacity-20" />
                              <p className="font-bold text-lg">ไม่พบข้อมูลที่ต้องจัดการ</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cpeGroups.map((group, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-black flex-shrink-0">
                                  <AlertCircle size={20} />
                                </div>
                                <div>
                                  <div className="text-base font-black text-slate-800">{group.raw_name}</div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase mt-0.5">Raw Data (OLT Model)</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-black border border-slate-200">
                                {(group.record_count || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              {group.brand ? (
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800">{group.brand}</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-sm font-black text-indigo-600">{group.model}</span>
                                  </div>
                                  <div className="text-[10px] font-black text-emerald-500 uppercase mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Mapped Successfully
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-slate-400 italic">ยังไม่ได้จับคู่</span>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => { setMappingCPE({ ...group }); }}
                                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 ${group.brand ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}
                              >
                                {group.brand ? 'แก้ไขการจับคู่' : 'ระบุรุ่น ONU'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <PaginationControls 
                    total={total} 
                    limit={limit} 
                    page={page} 
                    setLimit={setLimit} 
                    setPage={setPage} 
                    jumpPage={jumpPage} 
                    setJumpPage={setJumpPage} 
                  />
                </div>
              </div>
            </div>
          )}

          {view === 'catalog' && (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">ฐานข้อมูลอุปกรณ์</h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowDiscovery(!showDiscovery)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm border ${showDiscovery ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-100' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600'}`}
                    >
                      <Zap size={18} /> <span>Data Discovery</span>
                    </button>
                    {user?.role === 'admin' && catalogBackupCount > 0 && (
                      <button onClick={handleCatalogRestore} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all font-bold text-sm shadow-lg shadow-rose-100">
                        <History size={18} /> <span>ยกเลิกการนำเข้าล่าสุด (Restore)</span>
                      </button>
                    )}
                    <button onClick={() => catalogFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm">
                      <Plus size={18} /> <span>Import Excel</span>
                    </button>
                    <button onClick={() => handleTableExport('/device-catalog/export', 'device_catalog')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                      <Download size={18} /> <span>Export Excel</span>
                    </button>
                  </div>
                </div>

                {showDiscovery && catalogDiscovery && (
                  <div className="p-8 bg-slate-50/50 border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* ONU Unmapped */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-amber-600">
                          <AlertCircle size={20} />
                          <h4 className="font-black text-sm uppercase tracking-wider">ONU ที่ยังไม่ได้จับคู่</h4>
                        </div>
                        <div className="space-y-3">
                          {catalogDiscovery.onuUnmapped.length === 0 ? <p className="text-xs text-slate-400 italic">ไม่มีรายการค้าง</p> : 
                            catalogDiscovery.onuUnmapped.map((d: any, i: number) => (
                              <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-700 truncate max-w-[120px]">{d.raw_name}</span>
                                  <span className="text-amber-600">{d.record_count}</span>
                                </div>
                                <button onClick={() => { setView('cpe'); setMappingTab('onu'); setPage(1); }} className="text-[10px] text-indigo-500 font-black hover:underline text-left">ไปจับคู่รุ่นมาตรฐาน</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* WiFi Unmapped */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-rose-500">
                          <AlertCircle size={20} />
                          <h4 className="font-black text-sm uppercase tracking-wider">WiFi ที่ยังไม่ได้จับคู่</h4>
                        </div>
                        <div className="space-y-3">
                          {catalogDiscovery.wifiUnmapped.length === 0 ? <p className="text-xs text-slate-400 italic">ไม่มีรายการค้าง</p> : 
                            catalogDiscovery.wifiUnmapped.map((d: any, i: number) => (
                              <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-700 truncate max-w-[120px]">{d.brand} : {d.model}</span>
                                  <span className="text-rose-600">{d.record_count}</span>
                                </div>
                                <button onClick={() => { setView('cpe'); setMappingTab('wifi'); setPage(1); }} className="text-[10px] text-indigo-500 font-black hover:underline text-left">ไปจับคู่รุ่นมาตรฐาน</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* ONU No Specs */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-3 mb-4 text-indigo-600">
                          <Plus size={20} />
                          <h4 className="font-black text-sm uppercase tracking-wider">ONU ที่ขาดสเปกใน Catalog</h4>
                        </div>
                        <div className="space-y-3">
                          {catalogDiscovery.onuNoSpecs.length === 0 ? <p className="text-xs text-slate-400 italic">ครบถ้วนแล้ว</p> : 
                            catalogDiscovery.onuNoSpecs.map((d: any, i: number) => (
                              <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-700 truncate max-w-[120px]">{d.brand} {d.model}</span>
                                  <span className="text-indigo-600">{d.record_count}</span>
                                </div>
                                <button onClick={() => setEditingSpec({ brand: d.brand, model: d.model })} className="text-[10px] text-indigo-500 font-black hover:underline text-left">+ เพิ่มสเปกใน Catalog</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* WiFi No Specs */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-3 mb-4 text-emerald-600">
                          <Plus size={20} />
                          <h4 className="font-black text-sm uppercase tracking-wider">WiFi ที่ขาดสเปกใน Catalog</h4>
                        </div>
                        <div className="space-y-3">
                          {catalogDiscovery.wifiNoSpecs.length === 0 ? <p className="text-xs text-slate-400 italic">ครบถ้วนแล้ว</p> : 
                            catalogDiscovery.wifiNoSpecs.map((d: any, i: number) => (
                              <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-700 truncate max-w-[120px]">{d.brand} {d.model}</span>
                                  <span className="text-emerald-600">{d.record_count}</span>
                                </div>
                                <button onClick={() => setEditingSpec({ brand: d.brand, model: d.model })} className="text-[10px] text-indigo-500 font-black hover:underline text-left">+ เพิ่มสเปกใน Catalog</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto scrollbar-thin">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr>
                        {[
                          { key: 'brand', label: 'ยี่ห้อ (Brand)' },
                          { key: 'model', label: 'รุ่น (Model)' },
                          { key: 'record_count', label: 'Devices', icon: <Users size={14}/> },
                          { key: 'type', label: 'Type' },
                          { key: 'version', label: 'Version' },
                          { key: 'lan_ge', label: 'LAN GE', icon: <Network size={14}/> },
                          { key: 'lan_fe', label: 'LAN FE', icon: <Network size={14}/> },
                          { key: 'wifi', label: 'WiFi', icon: <Wifi size={14}/> },
                          { key: 'max_speed', label: 'Max Speed', icon: <Zap size={14} className="text-amber-500" /> },
                          { key: 'price', label: 'ราคา', icon: <Banknote size={14} className="text-emerald-500" /> },
                          { key: 'usage', label: 'การใช้งาน' },
                          { key: 'grade', label: 'Grade' }
                        ].map(col => (
                          <th key={col.key} onClick={() => handleCatalogSort(col.key)} className="sticky top-0 z-[30] bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              {col.icon}{col.label}
                              {catalogSortField === col.key ? (catalogSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                            </div>
                          </th>
                        ))}
                        <th className="sticky top-0 right-0 z-20 bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 text-right shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] border-b border-slate-200">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">{catalog.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-2.5 text-sm font-black text-indigo-600">{item.brand}</td>
                        <td className="px-6 py-2.5 text-sm font-black text-slate-800">{item.model}</td>
                        <td className="px-6 py-2.5 text-sm font-black text-indigo-600 bg-indigo-50/30">
                          {item.record_count ? Number(item.record_count).toLocaleString() : '0'}
                        </td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.type || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.version || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.lan_ge || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.lan_fe || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.wifi || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-black text-amber-600">{item.max_speed || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-black text-emerald-600">{item.price ? Number(item.price).toLocaleString() : '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.usage || '-'}</td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.grade || '-'}</td>
                        <td className="px-6 py-2.5 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] transition-all">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingSpec(item)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteCatalogSpec(item.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
                <input type="file" ref={catalogFileInputRef} onChange={handleCatalogUpload} accept=".xlsx, .xls" className="hidden" />
              </>
            )}

            {view === 'wifi' && (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">รายการข้อมูล WiFi</h3>
                  <button onClick={() => handleTableExport('/wifi-routers/export', 'wifi_routers')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                    <Download size={18} /> <span>Export Excel</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="sticky top-0 bg-white border-b border-slate-100 z-10 shadow-sm">
                      <tr>
                        {Object.entries(WIFI_DISPLAY_MAP).map(([key, label]) => (
                          <th key={key} onClick={() => { setWifiSortField(key as keyof WiFiRouter); setWifiSortOrder(wifiSortOrder === 'ASC' ? 'DESC' : 'ASC'); setPage(1); }} className="px-10 py-6 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 bg-white transition-all">
                            <div className="flex items-center gap-2">{label} {wifiSortField === key && (wifiSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
                          </th>
                        ))}
                        <th className="px-10 py-6 text-[15px] font-black uppercase tracking-widest text-slate-400 text-right sticky right-0 bg-white shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] border-b border-slate-100">ตัวเลือก</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {wifiRouters.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-10 py-4 text-sm font-black text-indigo-600">{item.circuit_id}</td>
                          <td className="px-10 py-4 text-sm font-bold text-slate-600">{item.brand}</td>
                          <td className="px-10 py-4 text-sm font-black text-slate-800">{item.model}</td>
                          <td className="px-10 py-4 text-sm font-medium text-slate-400">{item.version || '-'}</td>
                          <td className="px-10 py-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-all shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingWiFi(item)} className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-indigo-100"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteWiFi(item.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </>
            )}

            {view === 'onu-get-olt' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-lg font-black text-slate-800">รายการข้อมูล ONU Get OLT</h3>
                  <button onClick={() => setEditingOnuGetOlt({})} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all"><Plus size={18} /> เพิ่มข้อมูลใหม่</button>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin bg-slate-50/30">
                  <table className="w-full text-left border-separate border-spacing-0 min-w-max">
                    <thead className="relative z-[30]">
                      <tr className="shadow-sm">
                        {ONU_GET_OLT_COLUMNS.map((col) => {
                          return (
                            <th key={col.key} onClick={() => handleSort(col.key)} className="sticky top-0 z-[30] bg-slate-50 px-6 py-5 text-[12px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 cursor-pointer hover:text-indigo-600 group transition-all">
                              <div className="flex items-center gap-2">
                                {col.label}
                                {sortField === col.key ? (sortOrder === 'ASC' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                              </div>
                            </th>
                          );
                        })}
                        <th className="sticky top-0 z-[30] bg-slate-50 px-6 py-5 text-[12px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {onuGetOltData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                              <Search size={48} className="opacity-20" />
                              <p className="font-bold text-lg text-slate-400 uppercase tracking-widest">ไม่พบข้อมูลในตาราง</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        onuGetOltData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                            {ONU_GET_OLT_COLUMNS.map(col => (
                              <td key={col.key} className="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap border-b border-slate-50">
                                {row[col.key] || '-'}
                              </td>
                            ))}
                            <td className="px-6 py-4 text-right border-b border-slate-50">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEditingOnuGetOlt(row)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteOnuGetOlt(row.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </div>
            )}

            {view === 'logs' && (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">ประวัติการใช้งาน</h3>
                  <button onClick={() => handleTableExport('/logs/export', 'activity_logs')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                    <Download size={18} /> <span>Export Excel</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('created_at')} className="sticky top-0 z-[30] bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">วันเวลา{sortField === 'created_at' ? (sortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                        <th onClick={() => handleSort('username')} className="sticky top-0 z-[30] bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">ผู้ใช้งาน{sortField === 'username' ? (sortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                        <th onClick={() => handleSort('action')} className="sticky top-0 z-[30] bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-200"><div className="flex items-center gap-2">การกระทำ{sortField === 'action' ? (sortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                        <th className="sticky top-0 z-[30] bg-slate-50 px-6 py-4 text-[15px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-indigo-50/30">
                          <td className="px-6 py-2.5 text-xs font-medium text-slate-400">{new Date(log.created_at).toLocaleString('th-TH')}</td>
                          <td className="px-6 py-2.5 text-sm font-black text-slate-800">{log.username}</td>
                          <td className="px-6 py-2.5 text-sm"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.action === 'DELETE' ? 'bg-red-50 text-red-600' : log.action === 'CREATE' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{log.action}</span></td>
                          <td className="px-6 py-2.5 text-xs font-medium text-slate-500 font-mono truncate max-w-xl">{JSON.stringify(log.details)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls total={total} limit={limit} page={page} setLimit={setLimit} setPage={setPage} jumpPage={jumpPage} setJumpPage={setJumpPage} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>

      {/* --- MODALS --- */}

      {/* Modal - ONU Edit/New */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  {editing.id ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">{editing.id ? 'แก้ไขข้อมูล ONU' : 'เพิ่มข้อมูล ONU ใหม่'}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">รหัสอ้างอิง: {editing.onu_serial || 'NEW_RECORD'}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 overflow-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                {Object.keys(COLUMN_DISPLAY_MAP).map(key => (
                  <div key={key} className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{COLUMN_DISPLAY_MAP[key as keyof typeof COLUMN_DISPLAY_MAP]}</label>
                    <input 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" 
                      value={editing[key] || ''} 
                      onChange={(e) => setEditing({...editing, [key]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                {editing.id ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - WiFi Router Edit/New */}
      {editingWiFi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSaveWiFi} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  {editingWiFi.id ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">{editingWiFi.id ? 'แก้ไขข้อมูล WiFi Router' : 'เพิ่มข้อมูล WiFi Router ใหม่'}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setEditingWiFi(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-auto flex-1">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">หมายเลขวงจร</label>
                <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingWiFi.circuit_id || ''} onChange={(e) => setEditingWiFi({...editingWiFi, circuit_id: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อ (Brand)</label>
                  <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingWiFi.brand || ''} onChange={(e) => setEditingWiFi({...editingWiFi, brand: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">รุ่น (Model)</label>
                  <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingWiFi.model || ''} onChange={(e) => setEditingWiFi({...editingWiFi, model: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Version</label>
                <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingWiFi.version || ''} onChange={(e) => setEditingWiFi({...editingWiFi, version: e.target.value})} />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setEditingWiFi(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                {editingWiFi.id ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - ONU Get OLT Edit/New */}
      {editingOnuGetOlt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSaveOnuGetOlt} className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  {editingOnuGetOlt.id ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">{editingOnuGetOlt.id ? 'แก้ไขข้อมูล ONU Get OLT' : 'เพิ่มข้อมูล ONU Get OLT ใหม่'}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setEditingOnuGetOlt(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 overflow-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {ONU_GET_OLT_COLUMNS.map(col => (
                  <div key={col.key} className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{col.label}</label>
                    <input 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" 
                      value={editingOnuGetOlt[col.key] || ''} 
                      onChange={(e) => setEditingOnuGetOlt({...editingOnuGetOlt, [col.key]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setEditingOnuGetOlt(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                {editingOnuGetOlt.id ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - CPE Mapping with Autocomplete */}
      {mappingCPE && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSaveCPEMapping} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-base font-black text-slate-800">กำหนดค่าอุปกรณ์</h2>
              <button type="button" onClick={() => setMappingCPE(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-visible flex-1 relative z-[1]">
              <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Raw Name (ต้นทาง)</label>
                <p className="text-sm font-black text-slate-800">{mappingCPE.raw_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อ (Brand)</label>
                  <AutocompleteInput 
                    value={mappingCPE.brand || ''} 
                    onChange={handleONUBrandChange} 
                    options={uniqueBrands} 
                    placeholder="ระบุหรือเลือกยี่ห้อ..." 
                    required 
                    textClass="text-indigo-600" 
                    compact={true}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">รุ่น (Model)</label>
                  <AutocompleteInput 
                    value={mappingCPE.model || ''} 
                    onChange={handleONUModelChange} 
                    options={modelOptions(mappingCPE.brand)} 
                    placeholder="ระบุหรือเลือกรุ่น..." 
                    required 
                    textClass="text-slate-800"
                    compact={true}
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setMappingCPE(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> บันทึกการกำหนดค่า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - WiFi Mapping with Autocomplete */}
      {mappingWifi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSaveWifiMapping} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-base font-black text-slate-800">กำหนดค่าอุปกรณ์ WiFi Router</h2>
              <button type="button" onClick={() => setMappingWifi(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-visible flex-1 relative z-[1]">
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Brand (ดิบ)</label>
                  <p className="text-sm font-black text-slate-800">{mappingWifi.raw_brand}</p>
                </div>
                <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Model (ดิบ)</label>
                  <p className="text-sm font-black text-slate-800">{mappingWifi.raw_model}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อ (มาตรฐาน)</label>
                  <AutocompleteInput 
                    value={mappingWifi.target_brand || ''} 
                    onChange={handleWifiBrandChange} 
                    options={uniqueBrands} 
                    placeholder="ระบุหรือเลือกยี่ห้อ..." 
                    required 
                    textClass="text-indigo-600" 
                    compact={true}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">รุ่น (มาตรฐาน)</label>
                  <AutocompleteInput 
                    value={mappingWifi.target_model || ''} 
                    onChange={handleWifiModelChange} 
                    options={modelOptions(mappingWifi.target_brand)} 
                    placeholder="ระบุหรือเลือกรุ่น..." 
                    required 
                    textClass="text-slate-800"
                    compact={true}
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setMappingWifi(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> บันทึกการกำหนดค่า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Device Catalog Spec */}
      {editingSpec && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <form onSubmit={handleSaveSpec} className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-base font-black text-slate-800">{editingSpec.id ? 'แก้ไขข้อมูลฮาร์ดแวร์' : 'เพิ่มรุ่นอุปกรณ์ใหม่'}</h2>
              <button type="button" onClick={() => setEditingSpec(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all"><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-3 overflow-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อ (Brand)</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.brand || ''} onChange={(e) => setEditingSpec({...editingSpec, brand: e.target.value})} required /></div>
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">รุ่น (Model)</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.model || ''} onChange={(e) => setEditingSpec({...editingSpec, model: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.type || ''} placeholder="ระบุ Type" onChange={(e) => setEditingSpec({...editingSpec, type: e.target.value})} /></div>
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Version</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.version || ''} placeholder="ระบุ Version" onChange={(e) => setEditingSpec({...editingSpec, version: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">LAN GE</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.lan_ge || ''} placeholder="จำนวนพอร์ต GE" onChange={(e) => setEditingSpec({...editingSpec, lan_ge: e.target.value})} /></div>
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">LAN FE</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.lan_fe || ''} placeholder="จำนวนพอร์ต FE" onChange={(e) => setEditingSpec({...editingSpec, lan_fe: e.target.value})} /></div>
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WiFi</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.wifi || ''} placeholder="สเปก WiFi" onChange={(e) => setEditingSpec({...editingSpec, wifi: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">การใช้งาน (Usage)</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.usage || ''} placeholder="ประเภทการใช้งาน" onChange={(e) => setEditingSpec({...editingSpec, usage: e.target.value})} /></div>
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grade</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.grade || ''} placeholder="ระบุเกรดอุปกรณ์" onChange={(e) => setEditingSpec({...editingSpec, grade: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1"><Banknote size={12}/> ราคาอุปกรณ์ (บาท)</label>
                  <input type="number" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all" value={editingSpec.price || ''} placeholder="0.00" onChange={(e) => setEditingSpec({...editingSpec, price: Number(e.target.value) || null})} />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1"><Zap size={12}/> ความเร็วสูงสุด (Max Speed)</label>
                  <input className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-amber-600 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all" value={editingSpec.max_speed || ''} placeholder="e.g. 1Gbps / 3000Mbps" onChange={(e) => setEditingSpec({...editingSpec, max_speed: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setEditingSpec(null)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-all">ยกเลิก</button>
              <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">บันทึกข้อมูลอุปกรณ์</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - New Discoveries */}
      {showNewDiscoveries && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-800">ตรวจพบอุปกรณ์ใหม่ในระบบ</h2>
                <p className="text-slate-500 font-bold">รายการเหล่านี้พบใน ONU Records แต่ยังไม่มีการกำหนดค่า ยี่ห้อ/รุ่น</p>
              </div>
              <button onClick={() => setShowNewDiscoveries(false)} className="w-12 h-12 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all"><Plus size={24} className="rotate-45" /></button>
            </div>
            <div className="p-8 overflow-auto flex-1 space-y-4 scrollbar-thin">
              {newDiscoveries.map((disc, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Cpu size={20} /></div>
                    <span className="font-black text-slate-700">{disc.raw_name}</span>
                  </div>
                  <button onClick={() => { setMappingCPE({ raw_name: disc.raw_name }); setShowNewDiscoveries(false); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100">กำหนดค่า</button>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-center bg-slate-50/50 shrink-0">
              <button onClick={() => setShowNewDiscoveries(false)} className="px-10 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-300 transition-all">ปิดหน้าต่างนี้</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm border border-red-100">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{confirmAction.title}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">{confirmAction.message}</p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 text-sm font-black text-slate-500 hover:text-slate-800 hover:bg-white rounded-2xl transition-all">ยกเลิก</button>
              <button onClick={confirmAction.onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-100 hover:bg-red-600 active:scale-95 transition-all">ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('app8_token'));
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const handleLogout = () => { 
    localStorage.removeItem('app8_token'); 
    setToken(null); 
    setUser(null); 
    delete axios.defaults.headers.common['Authorization']; 
  };

  const handleLogin = (token: string, user: User) => { 
    localStorage.setItem('app8_token', token); 
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token); 
    setUser(user); 
  };

  useEffect(() => { 
    const bootstrap = async () => {
      if (token) { 
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
        try {
          const res = await axios.get(`${API_BASE}/auth/me`);
          setUser(res.data);
        } catch {
          handleLogout();
        }
      }
      setBootstrapping(false);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (bootstrapping) return (<div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] gap-8 font-sans"><div className="relative"><div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><Shield className="text-indigo-500 animate-pulse" size={32} /></div></div><div className="flex flex-col items-center gap-2"><span className="text-white font-black text-sm uppercase tracking-[0.4em]">Establishing Secure Nexus</span><div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 animate-progress"></div></div></div></div>);
  return token && user ? (<Dashboard user={user} onLogout={handleLogout} />) : (<LoginPage onLogin={handleLogin} />);
};
export default App;
