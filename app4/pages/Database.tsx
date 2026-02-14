
import React, { useState, useMemo, useEffect } from 'react';
import { Material, CustomIcon, SavedProject } from '../types';
import { Search, Plus, ChevronDown, Tag, Trash2, X, Check, Link as LinkIcon, Image as ImageIcon, Download, Upload, Edit3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DatabasePageProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  icons: CustomIcon[];
  setIcons: React.Dispatch<React.SetStateAction<CustomIcon[]>>;
  isAdmin?: boolean;
  savedProjects?: SavedProject[];
  setSavedProjects?: React.Dispatch<React.SetStateAction<SavedProject[]>>;
}

interface GroupEditorProps {
  initialValue: string;
  materialId: number;
  options: string[];
  isAdmin: boolean;
  onSave: (id: number, newGroup: string) => void;
  isDark: boolean;
}

const GroupEditor: React.FC<GroupEditorProps> = ({ initialValue, materialId, options, isAdmin, onSave, isDark }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleCommit = () => {
    if (value !== initialValue) {
      if (confirm(`ยืนยันการเปลี่ยนกลุ่มวัสดุเป็น "${value || 'ไม่ระบุ'}" ?`)) {
        onSave(materialId, value);
      } else {
        setValue(initialValue); // Revert
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur(); // Triggers onBlur
    }
  };

  return (
    <div className="relative flex-1 min-w-0">
      <input
        type="text"
        list="existing-symbol-groups"
        className={`w-full text-[11px] font-bold border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${value ? (isDark ? 'bg-purple-900/30 border-purple-700 text-purple-200' : 'bg-purple-50 border-purple-300 text-purple-800') : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-300')}`}
        placeholder="ระบุกลุ่ม..."
        value={value}
        disabled={!isAdmin}
        onChange={e => setValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

const DatabasePage: React.FC<DatabasePageProps> = ({ materials, setMaterials, icons, setIcons, isAdmin, savedProjects, setSavedProjects }) => {
  const { isDark } = useTheme();
  // ... existing state ...
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // ... form state ...
  const initialMaterialFormState: Partial<Material> = {
    category: '', material_code: '', material_name: '', unit: 'Each',
    unit_price: 0, cable_unit_price: 0, labor_unit_price: 0,
    action_type: 'ซื้อ', spec_brand: '', remark: '', symbol_group: ''
  };
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>(initialMaterialFormState);

  const cls = isDark ? {
    page: '',
    title: 'text-white',
    subtitle: 'text-slate-400',
    card: 'bg-slate-900 border-slate-700',
    searchBar: 'bg-slate-950/30 border-slate-700',
    searchInput: 'bg-slate-800 border-slate-700 text-white',
    filterBg: 'bg-slate-800 border-slate-700',
    filterInactive: 'text-slate-400 hover:bg-slate-700',
    thead: 'bg-slate-950/50',
    theadText: 'text-white',
    groupRow: 'bg-slate-900 hover:bg-slate-800',
    groupName: 'text-white',
    groupCount: 'bg-slate-800 text-slate-400',
    groupManage: 'text-slate-400 group-hover:text-blue-500',
    itemRow: 'hover:bg-slate-800/50 border-slate-800',
    codeText: 'text-slate-500',
    itemName: 'text-white',
    itemSpec: 'text-slate-500',
    unitText: 'text-slate-300',
    priceText: 'text-white',
    actionBuy: 'bg-emerald-500/10 text-emerald-600',
    actionWithdraw: 'bg-blue-500/10 text-blue-600',
    deleteBtn: 'text-slate-300 hover:text-red-500',
    emptyBg: 'bg-slate-800',
    emptyIcon: 'text-slate-600',
    emptyTitle: 'text-slate-500',
    emptyText: 'text-slate-400',
    modalOverlay: 'bg-slate-900/60',
    modalCard: 'bg-slate-900 border-slate-700',
    modalHeader: 'bg-slate-950/50 border-slate-700',
    modalTitle: 'text-white',
    modalSubtitle: 'text-slate-500',
    modalCloseBtn: 'text-slate-400 hover:bg-slate-800 hover:text-white',
    labelText: 'text-slate-400',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    selectBg: 'bg-slate-800 border-slate-700 text-white',
    pricePrefix: 'text-slate-400',
    modalFooter: 'bg-slate-950/50 border-slate-700',
    cancelBtn: 'text-slate-500 hover:text-white',
  } : {
    page: '',
    title: 'text-slate-900',
    subtitle: 'text-slate-500',
    card: 'bg-white border-slate-200',
    searchBar: 'bg-slate-50 border-slate-200',
    searchInput: 'bg-white border-slate-300 text-slate-900',
    filterBg: 'bg-slate-100 border-slate-200',
    filterInactive: 'text-slate-500 hover:bg-slate-200',
    thead: 'bg-slate-50',
    theadText: 'text-slate-700',
    groupRow: 'bg-slate-50 hover:bg-slate-100',
    groupName: 'text-slate-900',
    groupCount: 'bg-slate-100 text-slate-500',
    groupManage: 'text-slate-400 group-hover:text-blue-500',
    itemRow: 'hover:bg-slate-50 border-slate-100',
    codeText: 'text-slate-400',
    itemName: 'text-slate-900',
    itemSpec: 'text-slate-400',
    unitText: 'text-slate-600',
    priceText: 'text-slate-900',
    actionBuy: 'bg-emerald-50 text-emerald-600',
    actionWithdraw: 'bg-blue-50 text-blue-600',
    deleteBtn: 'text-slate-400 hover:text-red-500',
    emptyBg: 'bg-slate-100',
    emptyIcon: 'text-slate-400',
    emptyTitle: 'text-slate-500',
    emptyText: 'text-slate-400',
    modalOverlay: 'bg-slate-500/40',
    modalCard: 'bg-white border-slate-200',
    modalHeader: 'bg-slate-50 border-slate-200',
    modalTitle: 'text-slate-900',
    modalSubtitle: 'text-slate-400',
    modalCloseBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    labelText: 'text-slate-500',
    typeInactive: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300',
    typeActiveT01: 'bg-blue-50 border-blue-400 text-blue-700 shadow-lg shadow-blue-200/50',
    typeIconT01Active: 'bg-blue-600 text-white',
    typeIconInactive: 'bg-slate-200',
    typeActiveT02: 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-200/50',
    typeIconT02Active: 'bg-emerald-600 text-white',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    selectBg: 'bg-white border-slate-300 text-slate-900',
    pricePrefix: 'text-slate-500',
    modalFooter: 'bg-slate-50 border-slate-200',
    cancelBtn: 'text-slate-400 hover:text-slate-900',
  };

  const toggleGroup = (key: string) => {
    setOpenGroup(prev => prev === key ? null : key);
  };

  const groupedMaterials = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const filtered = materials.filter(m =>
      m.material_name.toLowerCase().includes(q) ||
      m.material_code.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.symbol_group || '').toLowerCase().includes(q)
    );

    const groups: Record<string, Material[]> = {};
    filtered.forEach(m => {
      const key = m.symbol_group?.trim() || '— ไม่ระบุกลุ่ม —';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    // Named groups sorted alphabetically, unnamed group last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '— ไม่ระบุกลุ่ม —') return 1;
      if (b === '— ไม่ระบุกลุ่ม —') return -1;
      return a.localeCompare(b, 'th');
    });
  }, [materials, searchTerm]);

  const handleAssociateIcon = async (category: string, iconId: string) => {
    // 1. Find the icon currently linked to this category (if any) and unlink it
    const oldIcon = icons.find(i => i.associatedCategory === category);
    if (oldIcon && oldIcon.id !== iconId) {
      try {
        await fetch(`api/icons/${oldIcon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...oldIcon, associatedCategory: undefined }) // Unlink
        });
      } catch (e) {
        console.error("Failed to unlink old icon", e);
      }
    }

    // 2. Link the new icon (if iconId is provided)
    if (iconId) {
      const newIcon = icons.find(i => i.id === iconId);
      if (newIcon) {
        try {
          await fetch(`api/icons/${newIcon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newIcon, associatedCategory: category })
          });
        } catch (e) {
          console.error("Failed to link new icon", e);
          alert("Failed to update icon association");
          return;
        }
      }
    }

    // 3. Update local state
    setIcons(prev => prev.map(icon => {
      if (icon.id === iconId) return { ...icon, associatedCategory: category };
      if (icon.associatedCategory === category) return { ...icon, associatedCategory: undefined };
      return icon;
    }));
  };

  const handleUpdateGroup = async (id: number, newGroup: string) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    try {
      const res = await fetch(`api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...material, symbol_group: newGroup })
      });
      if (!res.ok) throw new Error("Failed to update");

      setMaterials(prev => prev.map(m => m.id === id ? { ...m, symbol_group: newGroup } : m));
    } catch (e) {
      alert("Failed to save group: " + e);
      // Force refresh to revert UI? 
      // GroupEditor handles revert on simple cancel, but on API fail we might need to force update.
      // Actually, GroupEditor will keep 'newGroup' if we don't revert it. 
      // But since we don't update 'materials', GroupEditor prop 'initialValue' remains old.
      // But GroupEditor internal state 'value' remains new.
      // We should probably key the GroupEditor to force reset, or just alert.
      window.location.reload(); // Nuclear option for sync error, or fetch again.
    }
  };

  // ... handleUpdate, handleAdd, handleDelete ... (assume existing)

  const handleUpdate = () => {
    if (!editingMaterial) return;

    // API Call to update material
    fetch(`api/materials/${editingMaterial.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingMaterial)
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      })
      .then(updatedMaterial => {
        const formatted = {
          ...updatedMaterial,
          id: Number(updatedMaterial.id),
          unit_price: Number(updatedMaterial.unit_price),
          cable_unit_price: Number(updatedMaterial.cable_unit_price),
          labor_unit_price: Number(updatedMaterial.labor_unit_price),
        };
        setMaterials(materials.map(m => m.id === formatted.id ? formatted : m));
        setEditingMaterial(null);
      })
      .catch(err => alert('Failed to update material: ' + err.message));
  };

  const handleAdd = () => {
    if (!newMaterial.material_name || !newMaterial.category) {
      alert('Please fill in material name and category.');
      return;
    }
    // API Call to create material
    fetch('api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaterial)
    })
      .then(res => res.json())
      .then(savedMaterial => {
        // Convert numeric fields from string (if DB returns decimal as string) to number
        const formatted = {
          ...savedMaterial,
          id: Number(savedMaterial.id),
          unit_price: Number(savedMaterial.unit_price),
          cable_unit_price: Number(savedMaterial.cable_unit_price),
          labor_unit_price: Number(savedMaterial.labor_unit_price),
        };
        setMaterials(prev => [...prev, formatted]);
        setNewMaterial(initialMaterialFormState);
        setShowAddModal(false); // Replaced setIsAdding(false) with setShowAddModal(false)
      })
      .catch(err => alert('Failed to add material: ' + err.message));
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // API Call to delete
      fetch(`api/materials/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setMaterials(materials.filter(m => m.id !== id));
          } else {
            alert('Failed to delete');
          }
        })
        .catch(err => alert('Error deleting: ' + err.message));
    }
  };

  const categories = Array.from(new Set(materials.map(m => m.category))).sort();

  // ── Export / Import config ─────────────────────────────────────────────────
  const handleExportConfig = () => {
    const config = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      materials,
      customIcons: icons.filter(i => !i.isSystem),
      savedProjects: savedProjects ?? [],
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiberflow_config_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importInputRef = React.useRef<HTMLInputElement>(null);
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const config = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(config.materials)) throw new Error('ไม่พบข้อมูล materials ในไฟล์');
        setMaterials(config.materials);
        if (Array.isArray(config.customIcons) && config.customIcons.length > 0) {
          setIcons(prev => [
            ...prev.filter(i => i.isSystem),
            ...config.customIcons,
          ]);
        }
        if (Array.isArray(config.savedProjects) && config.savedProjects.length > 0 && setSavedProjects) {
          setSavedProjects(config.savedProjects);
        }
        const lines = [
          `• วัสดุ ${config.materials.length} รายการ`,
          config.customIcons?.length ? `• Custom icon ${config.customIcons.length} รายการ` : '',
          config.savedProjects?.length ? `• โปรเจกต์ ${config.savedProjects.length} โปรเจกต์` : '',
        ].filter(Boolean).join('\n');
        alert(`นำเข้าสำเร็จ:\n${lines}\n\nระบบจะบันทึกอัตโนมัติ`);
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-black ${cls.title}`}>Material Database</h2>
          <p className={`font-medium ${cls.subtitle}`}>Manage equipment and organize them into custom groups.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportConfig}
              />
              <button
                onClick={() => importInputRef.current?.click()}
                title="นำเข้าการตั้งค่าจากไฟล์ JSON"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${isDark ? 'border-amber-700 text-amber-400 hover:bg-amber-900/20' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}`}
              >
                <Upload size={16} />
                Import Config
              </button>
              <button
                onClick={handleExportConfig}
                title="ส่งออกการตั้งค่าปัจจุบันเป็นไฟล์ JSON"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${isDark ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/20' : 'border-emerald-500 text-emerald-700 hover:bg-emerald-50'}`}
              >
                <Download size={16} />
                Export Config
              </button>
            </>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              <Plus size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Add New Material</span>
            </button>
          )}
        </div>
      </div>

      <div className={`rounded-[32px] shadow-2xl border overflow-hidden ${cls.card}`}>
        {/* Search & Filter Bar */}
        <div className={`p-6 border-b flex items-center space-x-6 ${cls.searchBar}`}>
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, code, or category..."
              className={`w-full pl-12 pr-4 py-3 border rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-black ${cls.searchInput}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>

        {/* Global datalist for symbol_group autocomplete */}
        <datalist id="existing-symbol-groups">
          {Array.from(new Set(materials.map(m => m.symbol_group).filter(Boolean))).sort().map(g => (
            <option key={g} value={g as string} />
          ))}
        </datalist>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={cls.thead}>
              <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-28 ${cls.theadText}`}>รหัส</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest ${cls.theadText}`}>รายการ</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-20 text-center ${cls.theadText}`}>หน่วย</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-32 text-right ${cls.theadText}`}>ราคาวัสดุ</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-32 text-right ${cls.theadText}`}>ค่าแรง</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-48 text-center ${cls.theadText}`}>กลุ่มสัญลักษณ์</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest w-24 text-center ${cls.theadText}`}>ประเภท</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            {groupedMaterials.map(([symbolGroup, items]) => {
              const isCollapsed = openGroup !== symbolGroup;
              const isUnnamed = symbolGroup === '— ไม่ระบุกลุ่ม —';
              const groupIcon = !isUnnamed ? icons.find(i => i.associatedCategory === symbolGroup) : undefined;

              return (
                <React.Fragment key={symbolGroup}>
                  <tbody className={`border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <tr
                      className={`cursor-pointer transition-colors select-none group ${cls.groupRow}`}
                      onClick={() => toggleGroup(symbolGroup)}
                    >
                      <td colSpan={8} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Chevron */}
                            <div className={`shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}>
                              <ChevronDown size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                            </div>

                            {/* Icon thumbnail with picker */}
                            {!isUnnamed && (
                              <div
                                className="relative shrink-0"
                                title="คลิกเพื่อเลือก icon สำหรับกลุ่มนี้"
                                onClick={e => e.stopPropagation()}
                              >
                                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center overflow-hidden shadow-sm transition-all ${groupIcon ? (isDark ? 'border-purple-500 bg-slate-800' : 'border-purple-400 bg-purple-50') : (isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white')}`}>
                                  {groupIcon?.dataUrl
                                    ? <img src={groupIcon.dataUrl} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} alt={groupIcon.name} />
                                    : <ImageIcon size={18} className={isDark ? 'text-slate-500' : 'text-slate-300'} />
                                  }
                                </div>
                                <select
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  style={{ colorScheme: 'light' }}
                                  value={groupIcon?.id || ''}
                                  disabled={!isAdmin}
                                  onChange={e => handleAssociateIcon(symbolGroup, e.target.value)}
                                >
                                  <option value="">— ไม่ระบุ icon —</option>
                                  <optgroup label="── Standard Symbols ──">
                                    {icons.filter(i => i.isSystem).map(icon => (
                                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="── Custom Icons ──">
                                    {icons.filter(i => !i.isSystem).map(icon => (
                                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                                    ))}
                                  </optgroup>
                                </select>
                              </div>
                            )}

                            {/* Group name */}
                            <div className="flex flex-col">
                              <span className={`text-sm font-black tracking-tight ${isUnnamed ? (isDark ? 'text-slate-500 italic' : 'text-slate-400 italic') : cls.groupName}`}>
                                {symbolGroup}
                              </span>
                              {!isUnnamed && groupIcon && (
                                <span className={`text-[10px] font-medium ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>{groupIcon.name}</span>
                              )}
                              {!isUnnamed && !groupIcon && (
                                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>คลิกเลือก icon</span>
                              )}
                            </div>

                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${cls.groupCount}`}>
                              {items.length} รายการ
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {!isCollapsed && items.map(m => {
                      const sgIcon = icons.find(i => i.associatedCategory === m.symbol_group && m.symbol_group);
                      return (
                        <tr key={m.id} className={`transition-colors group border-t ${cls.itemRow}`}>
                          {/* รหัส */}
                          <td className={`px-6 py-4 text-[11px] font-mono font-bold ${cls.codeText}`}>{m.material_code}</td>
                          {/* รายการ */}
                          <td className="px-6 py-4">
                            <div className={`text-sm font-black leading-tight ${cls.itemName}`}>{m.material_name}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center ${cls.itemSpec}`}>
                              <Tag size={10} className="mr-1 opacity-60" />
                              {m.spec_brand || 'Standard Spec'}
                              {isAdmin && (
                                <button
                                  onClick={() => setEditingMaterial(m)}
                                  className="ml-2 hover:text-blue-500 transition-colors"
                                  title="Edit Details"
                                >
                                  <Edit3 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                          {/* หน่วย */}
                          <td className={`px-6 py-4 text-xs text-center font-black uppercase ${cls.unitText}`}>{m.unit}</td>
                          {/* ราคาวัสดุ */}
                          <td className={`px-6 py-4 text-sm font-black text-right ${cls.priceText}`}>
                            ฿{m.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          {/* ค่าแรง */}
                          <td className={`px-6 py-4 text-sm font-black text-right ${m.labor_unit_price > 0 ? 'text-amber-500' : cls.priceText}`}>
                            {m.labor_unit_price > 0
                              ? `฿${m.labor_unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                              : <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>—</span>
                            }
                          </td>
                          {/* กลุ่มสัญลักษณ์ — icon thumbnail + editable badge */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* Mini icon picker */}
                              <div className="relative shrink-0" title={sgIcon ? sgIcon.name : 'เลือก icon สำหรับกลุ่มนี้'}>
                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all ${sgIcon ? (isDark ? 'border-purple-500 bg-slate-800' : 'border-purple-400 bg-purple-50') : (isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50')}`}>
                                  {sgIcon?.dataUrl
                                    ? <img src={sgIcon.dataUrl} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} alt={sgIcon.name} />
                                    : <ImageIcon size={14} className={isDark ? 'text-slate-500' : 'text-slate-300'} />
                                  }
                                </div>
                                <select
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  style={{ colorScheme: 'light' }}
                                  value={sgIcon?.id || ''}
                                  disabled={!isAdmin || !m.symbol_group}
                                  title={!isAdmin ? 'Admin Only' : (!m.symbol_group ? 'กรอกชื่อกลุ่มก่อน' : 'เลือก icon')}
                                  onChange={e => handleAssociateIcon(m.symbol_group || '', e.target.value)}
                                >
                                  <option value="">— ไม่ระบุ icon —</option>
                                  <optgroup label="── Standard Symbols ──">
                                    {icons.filter(i => i.isSystem).map(icon => (
                                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="── Custom Icons ──">
                                    {icons.filter(i => !i.isSystem).map(icon => (
                                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                                    ))}
                                  </optgroup>
                                </select>
                              </div>
                              {/* Editable group name */}
                              <GroupEditor
                                initialValue={m.symbol_group || ''}
                                materialId={m.id}
                                options={Array.from(new Set(materials.map(m => m.symbol_group).filter(Boolean))) as string[]}
                                isAdmin={isAdmin || false}
                                onSave={handleUpdateGroup}
                                isDark={isDark}
                              />
                            </div>
                          </td>
                          {/* ประเภท ซื้อ/เบิก */}
                          <td className="px-4 py-4 text-center">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${m.action_type === 'ซื้อ' ? cls.actionBuy : cls.actionWithdraw}`}>
                              {m.action_type}
                            </span>
                          </td>
                          {/* Delete */}
                          <td className="px-4 py-4 text-right">
                            {isAdmin && (
                              <button onClick={() => handleDelete(m.id)} className={`p-2 transition-colors opacity-0 group-hover:opacity-100 ${cls.deleteBtn}`}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </React.Fragment>
              );
            })}
          </table>
          {groupedMaterials.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${cls.emptyBg}`}>
                <Search size={40} className={cls.emptyIcon} />
              </div>
              <h3 className={`text-xl font-black uppercase tracking-tighter ${cls.emptyTitle}`}>No materials found</h3>
              <p className={`text-sm font-medium ${cls.emptyText}`}>Try adjusting your search or category filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in ${cls.modalOverlay}`}>
          <div className={`w-full max-w-2xl rounded-[40px] shadow-2xl border overflow-hidden animate-in zoom-in-95 ${cls.modalCard}`}>
            <div className={`px-10 py-8 border-b flex items-center justify-between ${cls.modalHeader}`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${cls.modalTitle}`}>Edit Material</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${cls.modalSubtitle}`}>ID: {editingMaterial.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingMaterial(null)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${cls.modalCloseBtn}`}>
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Group / Category</label>
                  <input
                    list="existing-categories"
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                    value={editingMaterial.category}
                    onChange={e => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Code</label>
                  <input
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                    value={editingMaterial.material_code}
                    onChange={e => setEditingMaterial({ ...editingMaterial, material_code: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Name</label>
                <input
                  className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                  value={editingMaterial.material_name}
                  onChange={e => setEditingMaterial({ ...editingMaterial, material_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Price / Unit</label>
                  <div className="relative">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold ${cls.pricePrefix}`}>฿</span>
                    <input
                      type="number"
                      className={`w-full border rounded-2xl pl-10 pr-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                      value={editingMaterial.unit_price}
                      onChange={e => setEditingMaterial({ ...editingMaterial, unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Labor / Unit</label>
                  <div className="relative">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold ${cls.pricePrefix}`}>฿</span>
                    <input
                      type="number"
                      className={`w-full border rounded-2xl pl-10 pr-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-amber-500/20 transition-all ${cls.inputBg}`}
                      value={editingMaterial.labor_unit_price}
                      onChange={e => setEditingMaterial({ ...editingMaterial, labor_unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-10 py-8 border-t flex items-center justify-end space-x-6 ${cls.modalFooter}`}>
              <button
                onClick={() => setEditingMaterial(null)}
                className={`text-sm font-black uppercase tracking-widest transition-colors ${cls.cancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center space-x-3 px-10 py-4 bg-amber-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-amber-600 shadow-2xl shadow-amber-500/30 transition-all"
              >
                <Check size={20} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in ${cls.modalOverlay}`}>
          <div className={`w-full max-w-2xl rounded-[40px] shadow-2xl border overflow-hidden animate-in zoom-in-95 ${cls.modalCard}`}>
            <div className={`px-10 py-8 border-b flex items-center justify-between ${cls.modalHeader}`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${cls.modalTitle}`}>New Material</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${cls.modalSubtitle}`}>FiberFlow Inventory System</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${cls.modalCloseBtn}`}>
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Group / Category</label>
                  <div className="relative">
                    <input
                      list="existing-categories"
                      className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                      placeholder="e.g. Splitter, ODP"
                      value={newMaterial.category}
                      onChange={e => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    />
                    <datalist id="existing-categories">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Internal Part Code</label>
                  <input
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                    placeholder="1A100XXXXX"
                    value={newMaterial.material_code}
                    onChange={e => setNewMaterial({ ...newMaterial, material_code: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Full Description</label>
                <input
                  className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                  placeholder="Official description of the item..."
                  value={newMaterial.material_name}
                  onChange={e => setNewMaterial({ ...newMaterial, material_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Unit</label>
                  <select
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none ${cls.selectBg}`}
                    value={newMaterial.unit}
                    onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                  >
                    <option value="ST">ST (Set)</option>
                    <option value="M">M (Meter)</option>
                    <option value="PC">PC (Piece)</option>
                    <option value="RO">RO (Roll)</option>
                    <option value="ม.">ม. (เมตร)</option>
                    <option value="ตัว">ตัว</option>
                    <option value="ชุด">ชุด</option>
                    <option value="เครื่อง">เครื่อง</option>
                    <option value="Core">Core</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Procurement</label>
                  <select
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none ${cls.selectBg}`}
                    value={newMaterial.action_type}
                    onChange={e => setNewMaterial({ ...newMaterial, action_type: e.target.value })}
                  >
                    <option value="ซื้อ">ซื้อ (Purchase)</option>
                    <option value="เบิก">เบิก (Withdraw)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>กลุ่มสัญลักษณ์ (Symbol Group)</label>
                <input
                  list="existing-symbol-groups"
                  className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-purple-500/20 transition-all ${cls.inputBg}`}
                  placeholder="เช่น FDF, ODP, Pole, SDP ..."
                  value={newMaterial.symbol_group || ''}
                  onChange={e => setNewMaterial({ ...newMaterial, symbol_group: e.target.value })}
                />
                <p className={`text-[10px] mt-1.5 ml-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  ใช้กำหนดว่า icon สัญลักษณ์ใดสามารถเลือกวัสดุนี้ได้ในหน้าออกแบบ
                </p>
                <datalist id="existing-symbol-groups">
                  {Array.from(new Set(materials.map(m => m.symbol_group).filter(Boolean))).sort().map(g => (
                    <option key={g} value={g as string} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>ราคาวัสดุ / Unit</label>
                  <div className="relative">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold ${cls.pricePrefix}`}>฿</span>
                    <input
                      type="number"
                      className={`w-full border rounded-2xl pl-10 pr-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                      placeholder="0.00"
                      value={newMaterial.unit_price}
                      onChange={e => setNewMaterial({ ...newMaterial, unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>ค่าแรง / Unit</label>
                  <div className="relative">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold ${cls.pricePrefix}`}>฿</span>
                    <input
                      type="number"
                      className={`w-full border rounded-2xl pl-10 pr-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-amber-500/20 transition-all ${cls.inputBg}`}
                      placeholder="0.00"
                      value={newMaterial.labor_unit_price}
                      onChange={e => setNewMaterial({ ...newMaterial, labor_unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-10 py-8 border-t flex items-center justify-end space-x-6 ${cls.modalFooter}`}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`text-sm font-black uppercase tracking-widest transition-colors ${cls.cancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className={`text-sm font-black uppercase tracking-widest transition-colors ${cls.cancelBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all"
              >
                <Check size={20} />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage;
