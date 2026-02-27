import React, { useState, useEffect, useRef } from 'react';
import {
  FileUp,
  Download,
  PieChart as PieIcon,
  Table as TableIcon,
  CheckCircle2,
  Loader2,
  Trash2,
  ArrowRight,
  Database,
  Layers,
  Settings as SettingsIcon,
  Plus,
  Save,
  RotateCcw,
  GripVertical,
  X,
  Search,
  Edit3,
  Check,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { RDMode, SummaryData, GroupRule, Condition, Operator } from './types';
import { processExcelFile, exportProcessedExcel } from './services/excelProcessor';
import { RD03_COLS, RD05_COLS, DEFAULT_RD03_RULES, DEFAULT_RD05_RULES, COLUMN_NAMES_TH } from './constants';
import { configService } from './services/configService';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const OPERATORS: { label: string; value: Operator }[] = [
  { label: 'เท่ากับ (= equals)', value: 'equals' },
  { label: 'ไม่เท่ากับ (!= not_equals)', value: 'not_equals' },
  { label: 'มีคำว่า (LIKE contains)', value: 'contains' },
  { label: 'อยู่ในรายการ (IN list)', value: 'in_list' },
  { label: 'ไม่อยู่ในรายการ (NOT IN)', value: 'not_in_list' },
  { label: 'อยู่ระหว่าง (BETWEEN)', value: 'between' },
  { label: 'มากกว่า (> greater than)', value: 'gt' },
  { label: 'มากกว่าหรือเท่ากับ (>= gte)', value: 'gte' },
  { label: 'น้อยกว่า (< less than)', value: 'lt' },
  { label: 'น้อยกว่าหรือเท่ากับ (<= lte)', value: 'lte' },
];

interface ConfigProfile {
  name: string;
  rd03: GroupRule[];
  rd05: GroupRule[];
  timestamp: number;
}

export default function App() {
  const [mode, setMode] = useState<RDMode>(() => (localStorage.getItem('rd_mode') as RDMode) || 'RD03');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [view, setView] = useState<'summary' | 'table' | 'settings'>(
    () => (localStorage.getItem('rd_view') as 'summary' | 'table' | 'settings') || 'summary'
  );

  const [rd03Rules, setRd03Rules] = useState<GroupRule[]>([]);
  const [rd05Rules, setRd05Rules] = useState<GroupRule[]>([]);
  const [settingsMode, setSettingsMode] = useState<RDMode>(() => (localStorage.getItem('rd_settings_mode') as RDMode) || 'RD03');
  const [searchCol, setSearchCol] = useState('');
  const [profiles, setProfiles] = useState<ConfigProfile[]>([]);
  const [configTab, setConfigTab] = useState<'mapping' | 'grouping'>('mapping');

  // Drag & drop
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Condition editor modal
  const [condModal, setCondModal] = useState<{ ruleId: string; column: string; editIndex?: number } | null>(null);
  const [condOp, setCondOp] = useState<Operator>('equals');
  const [condValue, setCondValue] = useState('');
  const [condValue2, setCondValue2] = useState('');

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'info' | 'error';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const exportLockRef = useRef(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadConfigs = async () => {
      // 1. Load from DB
      const dbConfigs = await configService.getConfigs();

      // 2. Load from LocalStorage (Fallback/Legacy)
      const saved03 = localStorage.getItem('rd03_rules_v2');
      const saved05 = localStorage.getItem('rd05_rules_v2');
      const savedProfiles = localStorage.getItem('rd_profiles');

      safeSetRd03Rules(dbConfigs.rd03_rules_v2 || DEFAULT_RD03_RULES);
      safeSetRd05Rules(dbConfigs.rd05_rules_v2 || DEFAULT_RD05_RULES);
      setProfiles(dbConfigs.rd_profiles || []);
    };

    loadConfigs();
  }, []);

  useEffect(() => { localStorage.setItem('rd_view', view); }, [view]);
  useEffect(() => { localStorage.setItem('rd_mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('rd_settings_mode', settingsMode); }, [settingsMode]);

  // ── Source of Truth Sanitization ──
  const sanitizeRules = (rules: GroupRule[]): GroupRule[] => {
    return rules.map(r => {
      const groupingRegex = /^[0-9]+(\.[0-9]+)+/;
      const isGroupingPattern =
        groupingRegex.test(String(r.id)) ||
        groupingRegex.test(String(r.name)) ||
        (r.resultValue && groupingRegex.test(String(r.resultValue)));
      const expectedTarget = isGroupingPattern ? 'Group' : 'GroupConcession';

      if (r.targetField !== expectedTarget) {
        return { ...r, targetField: expectedTarget as any };
      }
      return r;
    });
  };

  const safeSetRd03Rules = (updater: GroupRule[] | ((prev: GroupRule[]) => GroupRule[])) => {
    setRd03Rules(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return sanitizeRules(next);
    });
  };

  const safeSetRd05Rules = (updater: GroupRule[] | ((prev: GroupRule[]) => GroupRule[])) => {
    setRd05Rules(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return sanitizeRules(next);
    });
  };

  // Active rules for current settings mode & tab
  const activeRules = (settingsMode === 'RD03' ? rd03Rules : rd05Rules)
    .filter(r => configTab === 'mapping' ? r.targetField === 'GroupConcession' : (r.targetField !== 'GroupConcession'))
    .sort((a, b) => a.priority - b.priority);

  // Helper to update rules in the correct state list
  const updateRuleInList = (ruleId: string, updater: (r: GroupRule) => GroupRule) => {
    const listUpdater = (prev: GroupRule[]) => prev.map(r => r.id === ruleId ? updater(r) : r);
    if (settingsMode === 'RD03') safeSetRd03Rules(listUpdater);
    else safeSetRd05Rules(listUpdater);
  };

  const saveRules = async () => {
    const sanitized03 = sanitizeRules(rd03Rules);
    const sanitized05 = sanitizeRules(rd05Rules);

    // Save to LocalStorage
    localStorage.setItem('rd03_rules_v2', JSON.stringify(sanitized03));
    localStorage.setItem('rd05_rules_v2', JSON.stringify(sanitized05));

    // Save to DB
    const p1 = configService.saveConfig('rd03_rules_v2', sanitized03);
    const p2 = configService.saveConfig('rd05_rules_v2', sanitized05);

    await Promise.all([p1, p2]);
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'บันทึกสำเร็จ',
      message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
      onConfirm: () => setConfirmModal(null)
    });
  };

  const syncFromDB = async () => {
    setIsProcessing(true);
    try {
      const dbConfigs = await configService.getConfigs();
      safeSetRd03Rules(dbConfigs.rd03_rules_v2 || []);
      safeSetRd05Rules(dbConfigs.rd05_rules_v2 || []);
      setProfiles(dbConfigs.rd_profiles || []);
      setConfirmModal({
        isOpen: true,
        type: 'info',
        title: 'ซิงค์ข้อมูลสำเร็จ',
        message: 'ดึงข้อมูลล่าสุดจาก Database เรียบร้อยแล้ว',
        onConfirm: () => setConfirmModal(null)
      });
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ดึงข้อมูลล้มเหลว: โปรดตรวจสอบว่า Backend API พร้อมใช้งาน',
        onConfirm: () => setConfirmModal(null)
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const startProcessing = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const rules = mode === 'RD03' ? rd03Rules : rd05Rules;
      const result = await processExcelFile(file, mode, rules);
      setData(result.rows);
      setSummary(result.summary);
      setView('summary');
    } catch (err) {
      setError(`ประมวลผลล้มเหลว: โปรดตรวจสอบรูปแบบไฟล์ให้ตรงกับโหมด ${mode}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!file || !summary || isExporting || exportLockRef.current) return;

    const prefix = Math.floor(1000 + Math.random() * 9000);
    const baseName = file.name.split('.').slice(0, -1).join('.');
    const fileName = `${prefix}_Processed_${mode}_${baseName}.xlsx`;

    exportLockRef.current = true;
    setIsExporting(true);
    console.log("[App] Starting immediate export for:", fileName);

    // Use setTimeout to allow UI to render the loading state first
    setTimeout(async () => {
      try {
        await exportProcessedExcel(data, fileName, mode, summary);
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setIsExporting(false);
        exportLockRef.current = false;
        console.log("[App] Export finished");
      }
    }, 100);
  };

  const handleAuthSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (authPassword === 'admin123') {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthPassword('');
      setAuthError(false);
      setView('settings');
    } else {
      setAuthError(true);
      setAuthPassword('');
    }
  };

  const handleToggleSettings = () => {
    if (view === 'settings') {
      setView('summary');
    } else {
      if (isAuthenticated) {
        setView('settings');
      } else {
        setShowAuthModal(true);
      }
    }
  };
  const handleAddRule = () => {
    const newRule: GroupRule = {
      id: configTab === 'mapping' ? `gc-${Date.now()}` : `group-${Date.now()}`,
      name: configTab === 'mapping' ? 'ชื่อกลุ่มหลัก...' : '9.9.9 กลุ่มใหม่',
      conditions: [],
      priority: activeRules.length > 0 ? Math.max(...activeRules.map(r => r.priority)) + 1 : 100,
      targetField: configTab === 'mapping' ? 'GroupConcession' : 'Group'
    };

    if (settingsMode === 'RD03') safeSetRd03Rules(prev => [...prev, newRule]);
    else safeSetRd05Rules(prev => [...prev, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      title: 'ลบกลุ่มเป้าหมาย',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มนี้และเงื่อนไขทั้งหมดที่เกี่ยวข้อง?',
      onConfirm: () => {
        if (settingsMode === 'RD03') safeSetRd03Rules(prev => prev.filter(r => r.id !== id));
        else safeSetRd05Rules(prev => prev.filter(r => r.id !== id));
        setConfirmModal(null);
      }
    });
  };

  const handleRenameRule = (ruleId: string, newName: string) => {
    const updater = (prev: GroupRule[]) => prev.map(r => r.id === ruleId ? { ...r, name: newName } : r);
    if (settingsMode === 'RD03') safeSetRd03Rules(updater);
    else safeSetRd05Rules(updater);
  };

  const handleUpdateDescription = (ruleId: string, newDesc: string) => {
    const updater = (prev: GroupRule[]) => prev.map(r => r.id === ruleId ? { ...r, description: newDesc } : r);
    if (settingsMode === 'RD03') safeSetRd03Rules(updater);
    else safeSetRd05Rules(updater);
  };

  const handleToggleOnlyIfEmpty = (ruleId: string) => {
    const updater = (prev: GroupRule[]) => prev.map(r => r.id === ruleId ? { ...r, onlyIfEmpty: !r.onlyIfEmpty } : r);
    if (settingsMode === 'RD03') safeSetRd03Rules(updater);
    else safeSetRd05Rules(updater);
  };

  const handleDeleteCondition = (ruleId: string, idx: number) => {
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      title: 'ลบเงื่อนไข',
      message: 'คุณต้องการลบเงื่อนไขนี้ใช่หรือไม่?',
      onConfirm: () => {
        updateRuleInList(ruleId, r => ({
          ...r,
          conditions: r.conditions.filter((_, i) => i !== idx)
        }));
        setConfirmModal(null);
      }
    });
  };

  const openCondModal = (ruleId: string, column: string, editIndex?: number) => {
    if (editIndex !== undefined) {
      const rule = activeRules.find(r => r.id === ruleId);
      if (!rule) return;
      const cond = rule.conditions[editIndex];
      setCondOp(cond.operator);
      if (cond.operator === 'in_list' || cond.operator === 'not_in_list') {
        setCondValue(Array.isArray(cond.value) ? cond.value.join('\n') : String(cond.value));
        setCondValue2('');
      } else if (cond.operator === 'between') {
        const arr = Array.isArray(cond.value) ? cond.value : [0, 0];
        setCondValue(String(arr[0]));
        setCondValue2(String(arr[1]));
      } else {
        setCondValue(String(cond.value));
        setCondValue2('');
      }
    } else {
      setCondOp('equals');
      setCondValue('');
      setCondValue2('');
    }
    setCondModal({ ruleId, column, editIndex });
  };

  const handleSaveCondition = () => {
    if (!condModal) return;
    let value: any;
    if (condOp === 'in_list' || condOp === 'not_in_list') {
      value = condValue.split('\n').map(s => s.trim()).filter(Boolean);
    } else if (condOp === 'between') {
      value = [parseFloat(condValue) || 0, parseFloat(condValue2) || 0];
    } else {
      value = condValue;
    }
    const newCond: Condition = { column: condModal.column, operator: condOp, value };

    updateRuleInList(condModal.ruleId, r => {
      const newConditions = condModal.editIndex !== undefined
        ? r.conditions.map((c, i) => (i === condModal.editIndex ? newCond : c))
        : [...r.conditions, newCond];
      return { ...r, conditions: newConditions };
    });

    setCondModal(null);
  };

  // ── Drag & Drop ──
  const handleDragOver = (e: React.DragEvent, ruleId: string) => {
    e.preventDefault();
    setDropTarget(ruleId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, ruleId: string) => {
    e.preventDefault();
    setDropTarget(null);
    if (!draggedCol) return;
    openCondModal(ruleId, draggedCol);
    setDraggedCol(null);
  };

  const OP_SYMBOL: Partial<Record<Operator, string>> = {
    equals: '=', not_equals: '!=', contains: 'LIKE', in_list: 'IN', not_in_list: 'NOT IN', between: 'BETWEEN',
    gt: '>', gte: '>=', lt: '<', lte: '<=',
  };

  // Display helper for condition chip
  const condValueDisplay = (c: Condition): string => {
    if (Array.isArray(c.value)) {
      if (c.operator === 'between') return `${c.value[0]} – ${c.value[1]}`;
      if (c.value.length > 3) return `${c.value.slice(0, 3).join(', ')}… (+${c.value.length - 3})`;
      return c.value.join(', ');
    }
    return String(c.value);
  };

  const activeCols = settingsMode === 'RD03' ? RD03_COLS : RD05_COLS;
  const filteredCols = activeCols.filter(c => c.toLowerCase().includes(searchCol.toLowerCase()));

  const groupChartData = summary
    ? Object.entries(summary.groups).map(([name, value]) => ({ name, value }))
    : [];
  const concessionChartData = summary
    ? Object.entries(summary.concessions).map(([name, value]) => ({ name, value }))
    : [];

  const isNumericOp = (op: Operator) => ['gt', 'gte', 'lt', 'lte'].includes(op);

  const isSaveDisabled =
    condOp === 'in_list'
      ? !condValue.trim()
      : condOp === 'between'
        ? !condValue
        : !condValue.trim();

  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 flex flex-col font-['Sarabun']">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Database className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">RD Smart Processor</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Infrastructure Logic Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {summary && view !== 'settings' && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          )}
          <button
            onClick={syncFromDB}
            disabled={isProcessing}
            title="Sync from Database"
            className="p-2.5 bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-700 hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <RotateCcw size={20} className={isProcessing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleToggleSettings}
            className={`p-2.5 rounded-lg transition-all border ${view === 'settings'
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50 shadow-inner'
              : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700'
              }`}
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        {view === 'settings' ? (
          /* ── Rule Editor ── */
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 text-indigo-400 rounded-xl">
                  <SettingsIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Configuration Editor</h3>
                  <p className="text-xs text-slate-500">จัดการเงื่อนไขการจัดกลุ่มข้อมูล {settingsMode}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Configuration Mode</label>
                  <select
                    value={settingsMode}
                    onChange={e => setSettingsMode(e.target.value as RDMode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-lg text-xs font-bold transition-all outline-none focus:border-indigo-500 min-w-[120px]"
                  >
                    <option value="RD03">RD03 Mode</option>
                    <option value="RD05">RD05 Mode</option>
                  </select>
                </div>
                <button
                  onClick={saveRules}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  <Save size={14} /> Save Rules
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[700px]">
              {/* Column Palette */}
              <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      placeholder="Search Columns..."
                      value={searchCol}
                      onChange={e => setSearchCol(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-300 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
                    Available Columns {configTab === 'mapping' ? '(Mapping)' : ''}
                  </div>
                  {(settingsMode === 'RD03' ? RD03_COLS : RD05_COLS)
                    .filter(c => configTab === 'mapping' ? c === 'Concession' : true)
                    .filter(c => c.toLowerCase().includes(searchCol.toLowerCase()))
                    .map(col => (
                      <div
                        key={col} draggable onDragStart={() => setDraggedCol(col)} onDragEnd={() => setDraggedCol(null)}
                        className={`flex items-center gap-2 p-2.5 bg-slate-800/50 border rounded-lg transition-all cursor-grab active:cursor-grabbing group select-none ${draggedCol === col ? 'border-indigo-500/60 bg-indigo-950/30 opacity-60' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800'}`}
                      >
                        <GripVertical size={12} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 truncate">
                          {col} {COLUMN_NAMES_TH[col] ? `(${COLUMN_NAMES_TH[col]})` : ''}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="p-3 border-t border-slate-800 bg-slate-800/10">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 mb-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Integrity Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <p className="text-[10px] text-amber-500 font-bold">Mapping</p>
                        <p className="text-xl font-black text-white">
                          {(settingsMode === 'RD03' ? rd03Rules : rd05Rules).filter(r => r.targetField === 'GroupConcession').length}
                        </p>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <p className="text-[10px] text-indigo-400 font-bold">Groups</p>
                        <p className="text-xl font-black text-white">
                          {(settingsMode === 'RD03' ? rd03Rules : rd05Rules).filter(r => r.targetField === 'Group').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 text-center">ลากคอลัมน์ไปวางบนกลุ่มเพื่อเพิ่มเงื่อนไข</p>
                </div>
              </div>

              {/* Rules Canvas */}
              <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="p-0 border-b border-slate-800 bg-slate-800/30 flex flex-col">
                  <div className="flex bg-slate-900/50 p-1">
                    <button
                      onClick={() => setConfigTab('mapping')}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${configTab === 'mapping' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      1. Concession Mapping
                    </button>
                    <button
                      onClick={() => setConfigTab('grouping')}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${configTab === 'grouping' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      2. Group Classification
                    </button>
                  </div>
                  <div className="p-4 flex justify-between items-center border-t border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">
                        {configTab === 'mapping' ? 'จัดการเงื่อนไขผู้รับสัมปทาน' : `จัดการเงื่อนไขการจัดกลุ่ม (${settingsMode})`}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {configTab === 'mapping' ? 'แปลงข้อมูลจากคอลัมน์ Concession ให้เป็นกลุ่มหลัก' : 'นำกลุ่มหลักมาจัดเลขกลุ่มตามเงื่อนไขอื่นๆ'}
                      </p>
                    </div>
                    <button
                      onClick={handleAddRule}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-600/10 transition-all border border-transparent hover:border-indigo-500/30"
                    >
                      <Plus size={12} /> {configTab === 'mapping' ? 'New Mapping Rule' : 'New Group Rule'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20">
                  {activeRules.map(rule => (
                    <div
                      key={rule.id} onDragOver={e => handleDragOver(e, rule.id)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, rule.id)}
                      className={`bg-slate-900 border rounded-xl p-5 transition-all shadow-sm ${dropTarget === rule.id ? 'border-indigo-500 bg-indigo-950/20 shadow-indigo-500/10 shadow-lg' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-slate-800 px-3 py-1 rounded text-xs font-bold text-indigo-400 shrink-0" title={`Internal ID: ${rule.id}`}>
                          {rule.resultValue || rule.id}
                        </div>
                        {rule.targetField === 'GroupConcession' && (
                          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shrink-0">
                            Concession Mapping
                          </div>
                        )}
                        <div className="flex flex-col gap-1 flex-1">
                          <input
                            className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 focus:outline-none w-full hover:bg-slate-800/40 focus:bg-slate-800/60 rounded px-2 py-0.5 transition-all"
                            value={rule.name} onChange={e => handleRenameRule(rule.id, e.target.value)} placeholder="ชื่อกลุ่ม..."
                          />
                          <textarea
                            className="bg-transparent border-none text-slate-400 text-[10px] focus:ring-0 focus:outline-none w-full hover:bg-slate-800/40 focus:bg-slate-800/60 rounded px-2 py-1 transition-all resize-none min-h-[32px] font-medium placeholder:italic"
                            value={rule.description || ''}
                            onChange={e => handleUpdateDescription(rule.id, e.target.value)}
                            placeholder="เพิ่มคำอธิบายเงื่อนไข..."
                            rows={1}
                          />
                        </div>

                        {/* Only If Empty Checkbox */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/40 rounded-lg group/check cursor-pointer hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
                          onClick={() => handleToggleOnlyIfEmpty(rule.id)}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rule.onlyIfEmpty ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                            {rule.onlyIfEmpty && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">ตรวจสอบเฉพาะช่องว่าง</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0 ml-auto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Conditions */}
                      <div className="flex flex-wrap gap-2 min-h-[34px]">
                        {rule.conditions.map((c, ci) => (
                          <div
                            key={ci}
                            className="flex items-center gap-0 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden group/chip hover:border-indigo-500/40 transition-all"
                          >
                            <button
                              onClick={() => openCondModal(rule.id, c.column, ci)}
                              className="px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-700/60 transition-all text-left"
                              title="คลิกเพื่อแก้ไข"
                            >
                              <span className="text-[10px] font-bold text-slate-400">{c.column}</span>
                              <span className="text-[10px] text-indigo-400 font-bold">{OP_SYMBOL[c.operator] ?? c.operator}</span>
                              <span className="text-[10px] font-semibold text-slate-200">{condValueDisplay(c)}</span>
                              <Edit3 size={9} className="text-slate-600 group-hover/chip:text-indigo-400 transition-colors" />
                            </button>
                            <button
                              onClick={() => handleDeleteCondition(rule.id, ci)}
                              className="px-2 py-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all border-l border-slate-700"
                              title="ลบเงื่อนไขนี้"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        {rule.conditions.length === 0 && (
                          <p className={`text-[10px] italic py-1 px-1 transition-colors ${dropTarget === rule.id ? 'text-indigo-400' : 'text-slate-700'
                            }`}>
                            {dropTarget === rule.id ? '✦ วางที่นี่เพื่อเพิ่มเงื่อนไข' : 'ลากคอลัมน์มาวาง หรือจะว่างไว้เพื่อจับทุกแถว'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {activeRules.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-700">
                      <Plus size={32} className="mb-3 opacity-30" />
                      <p className="text-sm">ยังไม่มีกลุ่ม คลิก "New Group Rule" เพื่อเพิ่ม</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : !summary ? (
          /* ── Upload / Landing ── */
          <div className="max-w-3xl mx-auto mt-20 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">RD Data Processor</h2>
              <p className="text-slate-500 font-medium">คัดแยกและวิเคราะห์ข้อมูลโครงสร้างพื้นฐานโดยอัตโนมัติ</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl mb-8 flex gap-2">
              <button
                onClick={() => setMode('RD03')}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all ${mode === 'RD03' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                RD03 Mode
              </button>
              <button
                onClick={() => setMode('RD05')}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all ${mode === 'RD05' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                RD05 Mode
              </button>
            </div>
            <div
              className={`bg-slate-900/50 border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900'
                }`}
            >
              {!file ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                    <FileUp size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Upload your data</h3>
                    <p className="text-slate-500 text-sm mt-1">ลากไฟล์ Excel มาวาง หรือคลิกเพื่อเลือกไฟล์</p>
                  </div>
                  <label className="cursor-pointer inline-block px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
                    เลือกไฟล์ XLSX
                    <input
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 max-w-md mx-auto">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    <div className="text-left truncate">
                      <p className="text-white font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        {Math.round(file.size / 1024)} KB • Ready to process
                      </p>
                    </div>
                    <button onClick={() => setFile(null)} className="ml-2 text-slate-500 hover:text-red-400">
                      <X size={20} />
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="px-16 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <><Loader2 className="animate-spin" /> Processing...</>
                    ) : (
                      <><ArrowRight /> Start Processing</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Analysis Dashboard ── */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Total Records', value: summary.totalRows.toLocaleString(), icon: Database },
                { label: 'Identified Groups', value: Object.keys(summary.groups).length, icon: Layers },
                { label: 'Unique Owners', value: Object.keys(summary.concessions).length, icon: Database },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-bold text-white">{item.value}</h3>
                    <item.icon size={18} className="text-indigo-500 mb-1" />
                  </div>
                </div>
              ))}
              <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-600/20 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-bold">Process Done</h4>
                  <button onClick={() => setSummary(null)} className="text-white/50 hover:text-white">
                    <RotateCcw size={16} />
                  </button>
                </div>
                <p className="text-white/70 text-xs font-medium">เรียบร้อย! ข้อมูลถูกจัดกลุ่มตามลำดับความสำคัญแล้ว</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex p-2 bg-slate-950/50 border-b border-slate-800">
                <button
                  onClick={() => setView('summary')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${view === 'summary' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <PieIcon size={14} /> Analytics View
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${view === 'table' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <TableIcon size={14} /> Data List View
                </button>
              </div>
              <div className="p-8">
                {view === 'summary' ? (
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Group Distribution</h4>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <PieChart>
                            <Pie
                              data={groupChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {groupChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Concession Analytics</h4>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={concessionChartData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/50 border-b border-slate-800">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Group ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">PEA Area</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Owner / Concession</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Line Type</th>
                            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distance (km)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                          {data.slice(0, 100).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-white font-bold text-sm bg-slate-800 px-2 py-1 rounded-md">{row.Group}</span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-300">{row.PEA}</td>
                              <td className="px-6 py-4">
                                <p className="text-white text-sm font-bold">{row.Concession}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase">{row.GroupConcession}</p>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-indigo-400">{row.Line_Type}</td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-white tabular-nums">
                                {parseFloat(row.Total_Distance).toFixed(3)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center opacity-30">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Infrastructure Automation • Ver 2.0</p>
      </footer>

      {/* ── Condition Editor Modal ── */}
      {condModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setCondModal(null); }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                  {condModal.editIndex !== undefined ? 'แก้ไขเงื่อนไข' : 'เพิ่มเงื่อนไข'}
                </p>
                <h3 className="text-white font-bold text-lg">{condModal.column}</h3>
              </div>
              <button
                onClick={() => setCondModal(null)}
                className="text-slate-500 hover:text-slate-200 p-2 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Operator selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operator</label>
                <select
                  value={condOp}
                  onChange={e => {
                    setCondOp(e.target.value as Operator);
                    setCondValue('');
                    setCondValue2('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Value input — varies by operator */}
              {condOp === 'in_list' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    ค่าในรายการ (หนึ่งค่าต่อบรรทัด)
                  </label>
                  <textarea
                    value={condValue}
                    onChange={e => setCondValue(e.target.value)}
                    rows={6}
                    placeholder={'ค่าที่ 1\nค่าที่ 2\nค่าที่ 3'}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all resize-none font-mono"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-600 mt-1">
                    {condValue.split('\n').filter(s => s.trim()).length} ค่า
                  </p>
                </div>
              ) : condOp === 'between' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ช่วงค่า</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={condValue}
                      onChange={e => setCondValue(e.target.value)}
                      placeholder="ค่าต่ำสุด"
                      className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                      autoFocus
                    />
                    <span className="text-slate-500 font-bold shrink-0">–</span>
                    <input
                      type="number"
                      value={condValue2}
                      onChange={e => setCondValue2(e.target.value)}
                      placeholder="ค่าสูงสุด"
                      className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : isNumericOp(condOp) ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    ค่าตัวเลข
                  </label>
                  <input
                    type="number"
                    value={condValue}
                    onChange={e => setCondValue(e.target.value)}
                    placeholder="ใส่ตัวเลข..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveCondition(); }}
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ค่า</label>
                  <input
                    type="text"
                    value={condValue}
                    onChange={e => setCondValue(e.target.value)}
                    placeholder={condOp === 'contains' ? 'ข้อความที่ต้องมี...' : 'ค่าที่ต้องเท่ากับ...'}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveCondition(); }}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setCondModal(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveCondition}
                disabled={isSaveDisabled}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {condModal.editIndex !== undefined ? 'บันทึกการแก้ไข' : 'เพิ่มเงื่อนไข'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setConfirmModal(null)} />
          <div className={`bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 fade-in duration-300`}>
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${confirmModal.type === 'confirm' ? 'bg-red-500/10 border-red-500/20' :
                confirmModal.type === 'error' ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                {confirmModal.type === 'confirm' ? <Trash2 size={32} className="text-red-500" /> :
                  confirmModal.type === 'error' ? <AlertTriangle size={32} className="text-amber-500" /> :
                    <CheckCircle2 size={32} className="text-indigo-500" />
                }
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              {confirmModal.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-bold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(null);
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all"
                  >
                    ยืนยันการลบ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${confirmModal.type === 'error' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'} text-white`}
                >
                  ตกลง
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAuthModal(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 fade-in duration-300">
            <form onSubmit={handleAuthSubmit} className="p-8">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                <SettingsIcon size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">เข้าสู่ส่วนการตั้งค่า</h3>
              <p className="text-slate-400 text-sm mb-6 text-center">กรุณาใส่รหัสผ่านเพื่อดำเนินการต่อ</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => {
                      setAuthPassword(e.target.value);
                      if (authError) setAuthError(false);
                    }}
                    className={`w-full bg-slate-800 border ${authError ? 'border-red-500/50' : 'border-slate-700'} text-white rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all font-medium`}
                    placeholder="••••••••"
                    autoFocus
                  />
                  {authError && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest px-1">รหัสผ่านไม่ถูกต้อง</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3 text-slate-500 hover:text-slate-300 text-xs font-bold transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
