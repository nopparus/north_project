import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, LogOut, Loader2, 
  Shield, History, Server, AlertCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpDown, ArrowUp, ArrowDown, Cpu, CheckCircle2, XCircle, 
  Database, Network, Wifi, FileBarChart, Download, Settings2
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
    'service_name': 'servicesname',
    'promotion_start_date': 'วันที่เริ่มโปรโมชัน',
    'section': 'ส่วน',
    'exchange': 'ชุมสาย',
    'cpe_brand_model': 'ยี่ห้อ CPE : รุ่น',
    'olt_brand_model': 'ยี่ห้อ OLT : รุ่น',
    'cpe_status': 'สถานะอุปกรณ์ปลายทาง (CPE)',
    'service_status': 'สถานะบริการ'
};

const REPORT_COLUMNS = {
    ...COLUMN_DISPLAY_MAP,
    'mapped_brand': 'ยี่ห้อ ONU (มาตรฐาน)',
    'mapped_model': 'รุ่น ONU (มาตรฐาน)',
    'onu_type': 'ONU Type',
    'version': 'ONU Version',
    'lan_ge': 'ONU LAN GE',
    'lan_fe': 'ONU LAN FE',
    'wifi': 'ONU WiFi',
    'usage': 'ONU Usage',
    'grade': 'ONU Grade',
    'wifi_brand': 'WiFi Router: ยี่ห้อ (ดิบ)',
    'wifi_model': 'WiFi Router: รุ่น (ดิบ)',
    'wifi_version': 'WiFi Router: Version (ดิบ)',
    'wifi_mapped_brand': 'WiFi Router: ยี่ห้อ (มาตรฐาน)',
    'wifi_mapped_model': 'WiFi Router: รุ่น (มาตรฐาน)',
    'wifi_hw_type': 'WiFi Router: Hardware Type',
    'wifi_lan_ge': 'WiFi Router: LAN GE',
    'wifi_lan_fe': 'WiFi Router: LAN FE',
    'wifi_wifi_spec': 'WiFi Router: WiFi Spec'
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
  [key: string]: any;
}

interface CPEGroup {
  raw_name: string;
  brand: string | null;
  model: string | null;
  mapped_id: number | null;
}

interface WiFiMapping {
  raw_brand: string;
  raw_model: string;
  target_brand: string | null;
  target_model: string | null;
  mapped_id: number | null;
}

interface DeviceSpec {
  id: number;
  brand: string;
  model: string;
  onu_type: string | null;
  version: string | null;
  lan_ge: string | null;
  lan_fe: string | null;
  wifi: string | null;
  usage: string | null;
  grade: string | null;
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
  details: any;
  created_at: string;
}

// --- COMPONENTS ---

const AutocompleteInput = ({ value, onChange, options, placeholder, required, textClass = "text-indigo-600", compact = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(value || '');
  const [filterText, setFilterText] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setInputText(value || ''); }, [value]);

  const updatePos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const filteredOptions = options.filter((o: string) => {
    if (!filterText) return true;
    return o.toLowerCase().includes(filterText.toLowerCase());
  });

  const handleFocus = () => {
    updatePos();
    setFilterText('');
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setFilterText(text);
    onChange(text);
    updatePos();
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    setInputText(opt);
    setFilterText('');
    onChange(opt);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => { if (isOpen) setIsOpen(false); };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input 
        ref={inputRef}
        type="text" 
        value={inputText} 
        onChange={handleChange}
        onFocus={handleFocus}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
        className={`w-full ${compact ? 'px-3 py-2.5 text-sm rounded-xl focus:ring-2' : 'px-5 py-4 text-lg rounded-2xl focus:ring-4'} bg-slate-50 border border-slate-200 font-black ${textClass} outline-none focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-text`}
        required={required}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen && filteredOptions.length > 0 ? 'rotate-180 text-indigo-500' : ''}`} />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div 
          style={{ 
            position: 'fixed', 
            top: pos.top, 
            left: pos.left, 
            width: pos.width,
            zIndex: 9999 
          }}
          className={`bg-white border border-slate-200 ${compact ? 'rounded-xl' : 'rounded-2xl'} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] max-h-52 overflow-auto`}
        >
          {filteredOptions.map((opt: string, idx: number) => (
            <div 
              key={idx} 
              className={`${compact ? 'px-3 py-2 text-xs' : 'px-5 py-3.5 text-base'} cursor-pointer font-bold transition-colors border-b border-slate-50 last:border-0 ${
                opt === value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(opt)}
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
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
  const [loading, setLoading] = useState(true);
  
  // Persistence
  const savedView = localStorage.getItem('app8_view') as any || 'onu';
  const savedLimit = Number(localStorage.getItem('app8_limit')) || 10;
  const savedSearch = localStorage.getItem('app8_search') || '';

  const [view, setView] = useState<'onu' | 'logs' | 'cpe' | 'catalog' | 'report' | 'wifi'>(savedView);
  const [reportData, setReportData] = useState<any[]>([]);
  const [wifiRouters, setWifiRouters] = useState<WiFiRouter[]>([]);
  const [selectedReportColumns, setSelectedReportColumns] = useState<string[]>(['request_id', 'circuit_id', 'cpe_brand_model', 'mapped_brand', 'mapped_model', 'onu_type']);
  const [searchTerm, setSearchTerm] = useState(savedSearch);
  const [searchInput, setSearchInput] = useState(savedSearch);
  const [editing, setEditing] = useState<Partial<ONU> | null>(null);
  const [mappingCPE, setMappingCPE] = useState<Partial<CPEGroup> | null>(null);
  const [editingSpec, setEditingSpec] = useState<Partial<DeviceSpec> | null>(null);

  // Pagination & Sorting
  const [page, setPage] = useState(Number(localStorage.getItem(`app8_page_${view}`)) || 1);
  const [limit, setLimit] = useState(savedLimit);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // WiFi Sorting
  const [wifiSortField, setWifiSortField] = useState<keyof WiFiRouter>('id');
  const [wifiSortOrder, setWifiSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [showReportSettings, setShowReportSettings] = useState(true);
  const [jumpPage, setJumpPage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [backupCount, setBackupCount] = useState(0);
  const [wifiBackupCount, setWifiBackupCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wifiFileInputRef = useRef<HTMLInputElement>(null);

  // CPE Sorting (Frontend)
  const [cpeSortField, setCpeSortField] = useState<keyof CPEGroup>('raw_name');
  const [cpeSortOrder, setCpeSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Catalog Sorting (Server)
  const [catalogSortField, setCatalogSortField] = useState('brand');
  const [catalogSortOrder, setCatalogSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // New Discoveries
  const [newDiscoveries, setNewDiscoveries] = useState<{raw_name: string}[]>([]);
  const [newWifiDiscoveries, setNewWifiDiscoveries] = useState<{raw_brand: string, raw_model: string}[]>([]);
  const [showNewDiscoveries, setShowNewDiscoveries] = useState(false);
  const [mappingTab, setMappingTab] = useState<'onu' | 'wifi'>('onu');
  const [wifiMappings, setWifiMappings] = useState<WiFiMapping[]>([]);
  const [mappingWifi, setMappingWifi] = useState<Partial<WiFiMapping> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/onu`, { 
        params: { search: searchTerm, page, limit, sortField, sortOrder } 
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/logs`, { params: { page, limit } });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCPEGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/cpe-groups`, { params: { page, limit, sortField: cpeSortField, sortOrder: cpeSortOrder } });
      setCpeGroups(res.data.data);
      setTotal(res.data.total);
      
      const disc = await axios.get(`${API_BASE}/cpe-groups/new-discoveries`);
      setNewDiscoveries(disc.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchWifiMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/wifi-mappings/groups`, { params: { page, limit } });
      setWifiMappings(res.data.data);
      setTotal(res.data.total);

      const disc = await axios.get(`${API_BASE}/wifi-mappings/new-discoveries`);
      setNewWifiDiscoveries(disc.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/device-catalog`, { params: { page, limit, sortField: catalogSortField, sortOrder: catalogSortOrder } });
      setCatalog(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchWiFiRouters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/wifi-routers`, { params: { page, limit, search: searchTerm, sortField: wifiSortField, sortOrder: wifiSortOrder } });
      setWifiRouters(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAllCatalog = async () => {
    try {
      const res = await axios.get(`${API_BASE}/device-catalog/all`);
      setAllCatalog(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchNewDiscoveries = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cpe-groups/new-discoveries`);
      setNewDiscoveries(res.data.data);
    } catch (err) { console.error(err); }
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('app8_view', view);
    localStorage.setItem('app8_limit', limit.toString());
    localStorage.setItem('app8_search', searchTerm);
  }, [view, limit, searchTerm]);

  // Load all catalog once for autocomplete
  useEffect(() => {
    fetchAllCatalog();
  }, []);

  useEffect(() => {
    localStorage.setItem(`app8_page_${view}`, page.toString());
  }, [page, view]);

  useEffect(() => {
    // Reset page to what was saved for this view
    const p = Number(localStorage.getItem(`app8_page_${view}`)) || 1;
    setPage(p);
  }, [view]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/reports/integrated-data`, { 
        params: { search: searchTerm, page, limit, sortField, sortOrder } 
      });
      setReportData(res.data.data);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (view === 'onu') {
      fetchData();
      axios.get(`${API_BASE}/onu/backup-status`).then(res => setBackupCount(res.data.count)).catch(() => {});
    }
    else if (view === 'logs') fetchLogs();
    else if (view === 'cpe') {
      if (mappingTab === 'onu') fetchCPEGroups();
      else fetchWifiMappings();
    }
    else if (view === 'catalog') fetchCatalog();
    else if (view === 'report') fetchReport();
    else if (view === 'wifi') {
      fetchWiFiRouters();
      axios.get(`${API_BASE}/wifi-routers/backup-status`).then(res => setWifiBackupCount(res.data.count)).catch(() => {});
    }
  }, [view, searchTerm, page, limit, sortField, sortOrder, cpeSortField, cpeSortOrder, catalogSortField, catalogSortOrder, wifiSortField, wifiSortOrder]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
    localStorage.setItem('app8_search', searchInput);
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      if (editing.id) await axios.put(`${API_BASE}/onu/${editing.id}`, editing);
      else await axios.post(`${API_BASE}/onu`, editing);
      setEditing(null);
      fetchData();
    } catch (err) { alert('Save failed'); }
  };

  const handleSaveCPEMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingCPE) return;
    try {
      await axios.post(`${API_BASE}/cpe-devices`, mappingCPE);
      setMappingCPE(null);
      fetchCPEGroups();
    } catch (err) { alert('Mapping failed'); }
  };

  const handleSaveWifiMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingWifi) return;
    try {
      await axios.post(`${API_BASE}/wifi-mappings`, mappingWifi);
      setMappingWifi(null);
      fetchWifiMappings();
    } catch (err) { alert('Save failed'); }
  };

  const handleDeleteWifiMapping = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบการตั้งค่า',
      message: 'ยืนยันการลบการตั้งค่ายี่ห้อ/รุ่น ของ WiFi Router นี้?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/wifi-mappings/${id}`);
          fetchWifiMappings();
        } catch (err) { alert('Delete failed'); }
      }
    });
  };

  const handleSaveSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpec) return;
    try {
      await axios.post(`${API_BASE}/device-catalog`, editingSpec);
      setEditingSpec(null);
      fetchCatalog();
    } catch (err) { alert('Save failed'); }
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
        } catch (err) { alert('Delete failed'); }
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
        } catch (err) { alert('Delete failed'); }
      }
    });
  };

  const handleDeleteCatalogSpec = async (id: number) => {
    setConfirmAction({
      title: 'ยืนยันการลบสเปกอุปกรณ์',
      message: 'ยืนยันการลบข้อมูลสเปกอุปกรณ์นี้จากฐานข้อมูล?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/device-catalog/${id}`);
          fetchCatalog();
          setConfirmAction(null);
        } catch (err) { alert('Delete failed'); }
      }
    });
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/reports/export-excel`, {
        params: { 
          search: searchTerm,
          columns: selectedReportColumns.join(',')
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `integrated_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) { alert('Export failed'); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConfirmAction({
      title: 'ยืนยันการนำเข้าข้อมูลใหม่',
      message: 'การนำเข้าจะเขียนทับข้อมูล ONU ทั้งหมดในปัจจุบัน ระบบจะสำรองข้อมูลเดิมไว้ให้ 1 ชุด ยืนยันที่จะดำเนินการต่อหรือไม่?',
      onConfirm: async () => {
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        setConfirmAction(null);
        try {
          await axios.post(`${API_BASE}/onu/upload`, formData);
          fetchData();
          const backupRes = await axios.get(`${API_BASE}/onu/backup-status`);
          setBackupCount(backupRes.data.count);
          alert('นำเข้าข้อมูลสำเร็จ');
        } catch (err) {
          alert('Upload failed');
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleRestore = async () => {
    setConfirmAction({
      title: 'ยืนยันการกู้คืนข้อมูล',
      message: 'ระบบจะนำข้อมูลที่สำรองไว้กลับมาเขียนทับข้อมูลปัจจุบัน ยืนยันหรือไม่?',
      onConfirm: async () => {
        setLoading(true);
        setConfirmAction(null);
        try {
          await axios.post(`${API_BASE}/onu/restore`);
          fetchData();
          alert('กู้คืนข้อมูลสำเร็จ');
        } catch (err) {
          alert('Restore failed');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleWiFiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setConfirmAction({
      title: 'ยืนยันการนำเข้าข้อมูล WiFi Router',
      message: 'การนำเข้าจะเขียนทับข้อมูล WiFi Router ทั้งหมดในปัจจุบัน ยืนยันหรือไม่?',
      onConfirm: async () => {
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        setConfirmAction(null);
        try {
          await axios.post(`${API_BASE}/wifi-routers/upload`, formData);
          fetchWiFiRouters();
          const backupRes = await axios.get(`${API_BASE}/wifi-routers/backup-status`);
          setWifiBackupCount(backupRes.data.count);
          alert('นำเข้าข้อมูล WiFi สำเร็จ');
        } catch (err) { alert('Upload failed'); } finally {
          setLoading(false);
          if (wifiFileInputRef.current) wifiFileInputRef.current.value = '';
        }
      }
    });
  };

  const handleWiFiRestore = async () => {
    setConfirmAction({
      title: 'ยืนยันการกู้คืนข้อมูล WiFi Router',
      message: 'ระบบจะนำข้อมูลที่สำรองไว้กลับมาเขียนทับข้อมูลปัจจุบัน ยืนยันหรือไม่?',
      onConfirm: async () => {
        setLoading(true);
        setConfirmAction(null);
        try {
          await axios.post(`${API_BASE}/wifi-routers/restore`);
          fetchWiFiRouters();
          alert('กู้คืนข้อมูลสำเร็จ');
        } catch (err) { alert('Restore failed'); } finally { setLoading(false); }
      }
    });
  };

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
    const updates: any = { model: val };
    const found = allCatalog.find(d => d.model === val);
    if (found?.brand) updates.brand = found.brand;
    setMappingCPE({ ...mappingCPE, ...updates });
  };

  const handleWifiBrandChange = (val: string) => {
    setMappingWifi({ ...mappingWifi, target_brand: val, target_model: '' });
  };
  const handleWifiModelChange = (val: string) => {
    const updates: any = { target_model: val };
    const found = allCatalog.find(d => d.model === val);
    if (found?.brand) updates.target_brand = found.brand;
    setMappingWifi({ ...mappingWifi, ...updates });
  };

  const PaginationControls = () => {
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

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><Server size={24} /></div>
          <div><h1 className="font-black text-xl tracking-tighter text-slate-800">APP8 ONU</h1><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Management v2</p></div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => { setView('onu'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'onu' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><Server size={20} /> ONU Records</button>
          <button onClick={() => { setView('wifi'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'wifi' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><Wifi size={20} /> WiFi Routers</button>
          <button onClick={() => { setView('cpe'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'cpe' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><Cpu size={20} /> Device Mapping</button>
          <button onClick={() => { setView('catalog'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'catalog' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><Database size={20} /> Device Catalog</button>
          <button onClick={() => { setView('report'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'report' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><FileBarChart size={20} /> Integrated Report</button>
          {user.role === 'admin' && (<button onClick={() => { setView('logs'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${view === 'logs' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}><History size={20} /> Activity Logs</button>)}
        </nav>
        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100"><div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">{user.username[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{user.username}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.role}</p></div></div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-6"><h2 className="text-2xl font-black text-slate-800 tracking-tight">{view === 'onu' ? 'รายการข้อมูล ONU' : view === 'wifi' ? 'รายการข้อมูล WiFi Router' : view === 'cpe' ? 'จัดการยี่ห้อ/รุ่นอุปกรณ์' : view === 'catalog' ? 'ฐานข้อมูลอุปกรณ์' : view === 'report' ? 'Integrated Report' : 'ประวัติการใช้งาน'}</h2>{(view === 'onu' || view === 'report' || view === 'wifi') && (<div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm border border-indigo-100"><span>ทั้งหมด {total.toLocaleString()} รายการ</span></div>)}</div>
          <div className="flex items-center gap-6">
            {(view === 'onu' || view === 'report' || view === 'wifi') && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาข้อมูล..." 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-[450px] transition-all" 
                  />
                </div>
                <button type="submit" className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">ค้นหา</button>
              </form>
            )}
            {view === 'catalog' && (<button onClick={() => setEditingSpec({})} className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-base font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"><Plus size={22} /> เพิ่มรุ่นอุปกรณ์ใหม่</button>)}
            {view === 'onu' && (
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-100 transition-all">
                  <Download size={20} className="rotate-180" /> นำเข้า (Excel)
                </button>
                {backupCount > 0 && (
                  <button onClick={handleRestore} className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                    <History size={18} /> กู้คืนข้อมูลสำรอง
                  </button>
                )}
                <button onClick={() => setEditing({})} className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-base font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"><Plus size={22} /> เพิ่มรายการใหม่</button>
              </div>
            )}
            {view === 'wifi' && (
              <div className="flex gap-2">
                <input type="file" ref={wifiFileInputRef} onChange={handleWiFiUpload} accept=".xlsx, .xls" className="hidden" />
                <button onClick={() => wifiFileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-100 transition-all">
                  <Download size={20} className="rotate-180" /> นำเข้า WiFi (Excel)
                </button>
                {wifiBackupCount > 0 && (
                  <button onClick={handleWiFiRestore} className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                    <History size={18} /> กู้คืนข้อมูลสำรอง
                  </button>
                )}
              </div>
            )}
            {view === 'report' && (<button onClick={handleExportExcel} className="flex items-center gap-3 px-8 py-3.5 bg-green-600 text-white rounded-2xl text-base font-black shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"><Download size={22} /> Export Excel</button>)}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 relative">
          {loading && (<div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="text-lg font-black text-indigo-600 uppercase tracking-widest animate-pulse">กำลังประมวลผลข้อมูล...</p></div>)}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            {view === 'onu' && (
              <>
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <table className="w-full text-left border-separate border-spacing-0 min-w-[2500px]">
                    <thead className="sticky top-0 bg-white border-b-2 border-slate-100 z-10 shadow-sm">
                      <tr>{Object.keys(COLUMN_DISPLAY_MAP).map(key => (<th key={key} onClick={() => handleSort(key)} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all border-b border-slate-100"><div className="flex items-center gap-2 whitespace-nowrap">{COLUMN_DISPLAY_MAP[key as keyof typeof COLUMN_DISPLAY_MAP]}{sortField === key ? (sortOrder === 'ASC' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>))}<th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right sticky right-0 bg-white shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] border-b border-slate-100">ตัวเลือก</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">{data.map((item) => (<tr key={item.id} className="hover:bg-indigo-50/20 transition-colors group">{Object.keys(COLUMN_DISPLAY_MAP).map(key => (<td key={key} className={`px-6 py-4 text-sm font-bold truncate max-w-[300px] ${key === 'onu_serial' ? 'text-indigo-600 font-black' : 'text-slate-600'}`}>{key === 'service_status' ? (<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${item[key] === 'Active' || item[key] === 'ใช้งาน' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{item[key]}</span>) : item[key] || '-'}</td>))}<td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-indigo-50/20 transition-all shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)]"><div className="flex justify-end gap-2"><button onClick={() => setEditing(item)} className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-indigo-100"><Edit2 size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button></div></td></tr>))}</tbody>
                  </table>
                </div>
                <PaginationControls />
              </>
            )}

            {view === 'cpe' && (
              <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">จัดการการจับคู่อุปกรณ์ (Device Mapping)</h3>
                      <p className="text-slate-500 font-bold">ตรวจสอบและกำหนดชื่อมาตรฐานให้กับอุปกรณ์ที่ตรวจพบในระบบ</p>
                    </div>
                    {((mappingTab === 'onu' && newDiscoveries.length > 0) || (mappingTab === 'wifi' && newWifiDiscoveries.length > 0)) && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-100 animate-pulse">
                        <AlertCircle size={18} /> พบรุ่นใหม่ที่ยังไม่ได้จับคู่ ({(mappingTab === 'onu' ? newDiscoveries : newWifiDiscoveries).length})
                      </div>
                    )}
                  </div>

                  <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit">
                    <button onClick={() => { setMappingTab('onu'); setPage(1); }} className={`px-10 py-3 rounded-[1.5rem] text-sm font-black transition-all ${mappingTab === 'onu' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>ONU Mapping</button>
                    <button onClick={() => { setMappingTab('wifi'); setPage(1); }} className={`px-10 py-3 rounded-[1.5rem] text-sm font-black transition-all ${mappingTab === 'wifi' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>WiFi Router Mapping</button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    {mappingTab === 'onu' ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th onClick={() => handleCPESort('raw_name')} className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all"><div className="flex items-center gap-2">Raw Name (จากไฟล์){cpeSortField === 'raw_name' ? (cpeSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}</div></th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">ยี่ห้อ (มาตรฐาน)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">รุ่น (มาตรฐาน)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">สถานะ / จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {cpeGroups.map((group, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-3 text-sm font-bold text-slate-600">{group.raw_name}</td>
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
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">ยี่ห้อ (ดิบ)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">รุ่น (ดิบ)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">ยี่ห้อ (มาตรฐาน)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">รุ่น (มาตรฐาน)</th>
                              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">สถานะ / จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {wifiMappings.map((group, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-8 py-3 text-sm font-bold text-slate-500">{group.raw_brand}</td>
                                <td className="px-8 py-3 text-sm font-bold text-slate-500">{group.raw_model}</td>
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
                      </div>
                    )}
                    <PaginationControls />
                  </div>
                </div>
              </div>
            )}

            {view === 'report' && (
              <div className="flex flex-col h-full overflow-hidden">
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
                            {['mapped_brand', 'mapped_model', 'onu_type', 'version', 'lan_ge', 'lan_fe', 'wifi', 'usage', 'grade'].map(key => (
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
                            {['wifi_brand', 'wifi_model', 'wifi_version', 'wifi_mapped_brand', 'wifi_mapped_model', 'wifi_hw_type', 'wifi_lan_ge', 'wifi_lan_fe', 'wifi_wifi_spec'].map(key => (
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
                    <thead className="sticky top-0 bg-white border-b border-slate-200 z-10 shadow-sm">
                      <tr>{selectedReportColumns.map(key => (<th key={key} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-white border-b border-slate-100">{REPORT_COLUMNS[key as keyof typeof REPORT_COLUMNS]}</th>))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                          {selectedReportColumns.map(key => (
                            <td key={key} className={`px-6 py-4 text-sm font-bold ${key.startsWith('mapped_') || ['onu_type', 'lan_ge', 'wifi'].includes(key) ? 'text-indigo-600' : 'text-slate-600'} whitespace-nowrap`}>
                              {key === 'service_status' ? (<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${row[key] === 'Active' || row[key] === 'ใช้งาน' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{row[key]}</span>) : row[key] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls />
              </div>
            )}

            {view === 'catalog' && (
              <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-10">
                  <div><h3 className="text-2xl font-black text-slate-800">ฐานข้อมูลอุปกรณ์</h3><p className="text-slate-500 font-bold">จัดการคุณสมบัติฮาร์ดแวร์ ยี่ห้อ/รุ่น ของอุปกรณ์ทั้งหมด</p></div>
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col">
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left whitespace-nowrap min-w-[1200px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {[
                              { key: 'brand', label: 'ยี่ห้อ (Brand)' },
                              { key: 'model', label: 'รุ่น (Model)' },
                              { key: 'onu_type', label: 'ONU Type' },
                              { key: 'version', label: 'Version' },
                              { key: 'lan_ge', label: 'LAN GE', icon: <Network size={14}/> },
                              { key: 'lan_fe', label: 'LAN FE', icon: <Network size={14}/> },
                              { key: 'wifi', label: 'WiFi', icon: <Wifi size={14}/> },
                              { key: 'usage', label: 'การใช้งาน' },
                              { key: 'grade', label: 'Grade' }
                            ].map(col => (
                              <th key={col.key} onClick={() => handleCatalogSort(col.key)} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 group transition-all">
                                <div className="flex items-center gap-2">
                                  {col.icon}{col.label}
                                  {catalogSortField === col.key ? (catalogSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />}
                                </div>
                              </th>
                            ))}
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right sticky right-0 bg-slate-50 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)]">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">{catalog.map((item) => (<tr key={item.id} className="hover:bg-slate-50/50 transition-all group"><td className="px-6 py-2.5 text-sm font-black text-indigo-600">{item.brand}</td><td className="px-6 py-2.5 text-sm font-black text-slate-800">{item.model}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.onu_type || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.version || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.lan_ge || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.lan_fe || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.wifi || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.usage || '-'}</td><td className="px-6 py-2.5 text-sm font-bold text-slate-500">{item.grade || '-'}</td><td className="px-6 py-2.5 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] transition-all"><div className="flex justify-end gap-2"><button onClick={() => setEditingSpec(item)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><Edit2 size={16} /></button><button onClick={() => handleDeleteCatalogSpec(item.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button></div></td></tr>))}</tbody>
                      </table>
                    </div>
                    <PaginationControls />
                  </div>
                </div>
              </div>
            )}

            {view === 'wifi' && (
              <div className="flex-1 overflow-auto p-10 bg-slate-50/20">
                <div className="max-w-7xl mx-auto space-y-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">รายการข้อมูล WiFi Router</h3>
                    <p className="text-slate-500 font-bold">ข้อมูล Access Point ที่ติดตั้งร่วมกับ ONU (อ้างอิงตามหมายเลขวงจร)</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {Object.entries(WIFI_DISPLAY_MAP).map(([key, label]) => (
                              <th key={key} onClick={() => { setWifiSortField(key as keyof WiFiRouter); setWifiSortOrder(wifiSortOrder === 'ASC' ? 'DESC' : 'ASC'); setPage(1); }} className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-indigo-600 transition-all">
                                <div className="flex items-center gap-2">{label} {wifiSortField === key && (wifiSortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {wifiRouters.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-10 py-4 text-sm font-black text-indigo-600">{item.circuit_id}</td>
                              <td className="px-10 py-4 text-sm font-bold text-slate-600">{item.brand}</td>
                              <td className="px-10 py-4 text-sm font-black text-slate-800">{item.model}</td>
                              <td className="px-10 py-4 text-sm font-medium text-slate-400">{item.version || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls />
                  </div>
                </div>
              </div>
            )}

            {view === 'logs' && (
              <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-10">
                  <div><h3 className="text-2xl font-black text-slate-800">Activity Logs</h3><p className="text-slate-500 font-bold">ประวัติการใช้งานและแก้ไขข้อมูลในระบบ</p></div>
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr><th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">วันเวลา</th><th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">ผู้ใช้งาน</th><th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">การกระทำ</th><th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">รายละเอียด</th></tr>
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
                    <PaginationControls />
                  </div>
                </div>
              </div>
            )}
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
            <div className="p-5 space-y-3 overflow-auto flex-1">
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
            <div className="p-5 space-y-3 overflow-auto flex-1">
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
                <div className="space-y-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ONU Type</label><input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" value={editingSpec.onu_type || ''} placeholder="ระบุ ONU Type" onChange={(e) => setEditingSpec({...editingSpec, onu_type: e.target.value})} /></div>
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
  useEffect(() => { if (token) { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; axios.get(`${API_BASE}/auth/me`).then(res => setUser(res.data)).catch(() => handleLogout()).finally(() => setBootstrapping(false)); } else { setBootstrapping(false); } }, [token]);
  const handleLogin = (token: string, user: User) => { localStorage.setItem('app8_token', token); setToken(token); setUser(user); };
  const handleLogout = () => { localStorage.removeItem('app8_token'); setToken(null); setUser(null); delete axios.defaults.headers.common['Authorization']; };
  if (bootstrapping) return (<div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] gap-8 font-sans"><div className="relative"><div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><Shield className="text-indigo-500 animate-pulse" size={32} /></div></div><div className="flex flex-col items-center gap-2"><span className="text-white font-black text-sm uppercase tracking-[0.4em]">Establishing Secure Nexus</span><div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 animate-progress"></div></div></div></div>);
  return token && user ? (<Dashboard user={user} onLogout={handleLogout} />) : (<LoginPage onLogin={handleLogin} />);
};
export default App;
