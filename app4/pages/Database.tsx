
import React, { useState, useMemo } from 'react';
import { Material, CustomIcon } from '../types';
import { Search, Plus, Filter, ChevronDown, Tag, Trash2, X, Check, Layers, HardDrive, Zap, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DatabasePageProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  icons: CustomIcon[];
  setIcons: React.Dispatch<React.SetStateAction<CustomIcon[]>>;
}

const DatabasePage: React.FC<DatabasePageProps> = ({ materials, setMaterials, icons, setIcons }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'T01' | 'T02'>('ALL');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    material_type: 'T01',
    category: '',
    material_code: '',
    material_name: '',
    unit: 'ST',
    unit_price: 0,
    action_type: 'เบิก',
    spec_brand: '',
    remark: ''
  });

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
    iconPickerBg: 'bg-slate-800 border-slate-700 hover:border-blue-600 hover:bg-slate-700',
    iconPickerImgBg: 'bg-slate-700 border-slate-600 group-hover/picker:border-blue-500',
    iconPickerLabel: 'text-slate-500 group-hover/picker:text-blue-400',
    iconPickerName: 'text-white',
    groupName: 'text-white',
    groupCount: 'bg-slate-800 text-slate-400',
    groupManage: 'text-slate-400 group-hover:text-blue-500',
    itemRow: 'hover:bg-slate-800/50 border-slate-800',
    badgeT01: 'bg-blue-900/40 border-blue-700 text-blue-400',
    badgeT02: 'bg-emerald-900/40 border-emerald-700 text-emerald-400',
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
    typeInactive: 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600',
    typeActiveT01: 'bg-blue-900/40 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10',
    typeIconT01Active: 'bg-blue-600 text-white',
    typeIconInactive: 'bg-slate-700',
    typeActiveT02: 'bg-emerald-900/40 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10',
    typeIconT02Active: 'bg-emerald-600 text-white',
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
    iconPickerBg: 'bg-white border-slate-200 hover:border-blue-500 hover:bg-slate-50',
    iconPickerImgBg: 'bg-slate-100 border-slate-200 group-hover/picker:border-blue-400',
    iconPickerLabel: 'text-slate-400 group-hover/picker:text-blue-500',
    iconPickerName: 'text-slate-800',
    groupName: 'text-slate-900',
    groupCount: 'bg-slate-100 text-slate-500',
    groupManage: 'text-slate-400 group-hover:text-blue-500',
    itemRow: 'hover:bg-slate-50 border-slate-100',
    badgeT01: 'bg-blue-50 border-blue-200 text-blue-600',
    badgeT02: 'bg-emerald-50 border-emerald-200 text-emerald-600',
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

  const toggleGroup = (category: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedGroups(newCollapsed);
  };

  const groupedMaterials = useMemo(() => {
    const filtered = materials.filter(m => {
      const matchesSearch = m.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || m.material_type === typeFilter;
      return matchesSearch && matchesType;
    });

    const groups: Record<string, Material[]> = {};
    filtered.forEach(m => {
      const cat = m.category || 'Uncategorized';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(m);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [materials, searchTerm, typeFilter]);

  const handleAssociateIcon = (category: string, iconId: string) => {
    setIcons(prev => prev.map(icon => {
      // 1. If this is the specific icon we want to link to this category
      if (icon.id === iconId) {
        return { ...icon, associatedCategory: category };
      }
      // 2. If this icon was previously linked to THIS category, unlink it
      if (icon.associatedCategory === category) {
        return { ...icon, associatedCategory: undefined };
      }
      return icon;
    }));
  };

  const handleAddMaterial = () => {
    if (!newMaterial.material_name || !newMaterial.category || !newMaterial.material_type) {
      alert('Please fill in material name, category, and type (T01/T02).');
      return;
    }

    const id = Math.max(0, ...materials.map(m => m.id)) + 1;
    setMaterials([...materials, { ...newMaterial as Material, id }]);
    setShowAddModal(false);
    setNewMaterial({
      material_type: 'T01',
      category: '',
      material_code: '',
      material_name: '',
      unit: 'ST',
      unit_price: 0,
      action_type: 'เบิก',
      spec_brand: '',
      remark: ''
    });
  };

  const deleteMaterial = (id: number) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const categories = Array.from(new Set(materials.map(m => m.category))).sort();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-black ${cls.title}`}>Material Database</h2>
          <p className={`font-medium ${cls.subtitle}`}>Manage T1 (Stationary) &amp; T2 (Cabling) equipment and organize them into custom groups.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
        >
          <Plus size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Add New Material</span>
        </button>
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

          <div className={`flex items-center border rounded-2xl p-1.5 space-x-1 shadow-sm ${cls.filterBg}`}>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-lg' : cls.filterInactive}`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('T01')}
              className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center space-x-2 ${typeFilter === 'T01' ? 'bg-blue-600 text-white shadow-lg' : cls.filterInactive}`}
            >
              <HardDrive size={12} />
              <span>T1: Stationary</span>
            </button>
            <button
              onClick={() => setTypeFilter('T02')}
              className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center space-x-2 ${typeFilter === 'T02' ? 'bg-emerald-600 text-white shadow-lg' : cls.filterInactive}`}
            >
              <Zap size={12} />
              <span>T2: Cabling</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={cls.thead}>
              <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] w-24 ${cls.theadText}`}>Type</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] w-32 ${cls.theadText}`}>Code</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${cls.theadText}`}>Description</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] w-24 text-center ${cls.theadText}`}>Unit</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] w-36 text-right ${cls.theadText}`}>Price</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] w-32 text-center ${cls.theadText}`}>Action</th>
                <th className="px-8 py-5 w-12"></th>
              </tr>
            </thead>
            {groupedMaterials.map(([category, items]) => {
              const isCollapsed = collapsedGroups.has(category);
              const associatedIcon = icons.find(i => i.associatedCategory === category);

              return (
                <React.Fragment key={category}>
                  <tbody className={`border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <tr
                      className={`cursor-pointer transition-colors select-none group ${cls.groupRow}`}
                      onClick={() => toggleGroup(category)}
                    >
                      <td colSpan={7} className="px-8 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-1.5 rounded-full transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>
                              <ChevronDown size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                            </div>

                            {/* Icon Logic Container */}
                            <div className={`flex items-center space-x-3 border rounded-2xl p-1.5 pr-4 transition-all group/picker ${cls.iconPickerBg}`} onClick={e => e.stopPropagation()}>
                               <div className="relative">
                                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden shadow-sm ${cls.iconPickerImgBg} ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                                     {associatedIcon?.dataUrl ? (
                                       <img src={associatedIcon.dataUrl} className="w-full h-full object-contain image-pixelated p-1" alt={category} />
                                     ) : (
                                       <ImageIcon size={20} />
                                     )}
                                  </div>
                                  <select
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    value={associatedIcon?.id || ''}
                                    onChange={(e) => handleAssociateIcon(category, e.target.value)}
                                    title={`Assign icon to ${category}`}
                                  >
                                    <option value="">-- No Icon --</option>
                                    {icons.map(icon => (
                                      <option key={icon.id} value={icon.id}>{icon.name}</option>
                                    ))}
                                  </select>
                               </div>
                               <div className="flex flex-col">
                                  <span className={`text-[9px] font-black uppercase ${cls.iconPickerLabel}`}>Represented by</span>
                                  <span className={`text-[11px] font-bold truncate max-w-[120px] ${cls.iconPickerName}`}>
                                    {associatedIcon ? associatedIcon.name : 'Select Icon'}
                                  </span>
                               </div>
                            </div>

                            <span className={`text-base font-black tracking-tight uppercase ml-2 ${cls.groupName}`}>
                              {category}
                            </span>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${cls.groupCount}`}>
                              {items.length} Items
                            </span>
                          </div>

                          <div className={`flex items-center space-x-2 transition-colors opacity-0 group-hover:opacity-100 ${cls.groupManage}`}>
                             <span className="text-[10px] font-black uppercase">Click to Manage</span>
                             <LinkIcon size={14} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {!isCollapsed && items.map(m => (
                      <tr key={m.id} className={`transition-colors group border-t ${cls.itemRow}`}>
                        <td className="px-8 py-5">
                           <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${m.material_type === 'T01' ? cls.badgeT01 : cls.badgeT02}`}>
                             {m.material_type === 'T01' ? 'T1' : 'T2'}
                           </span>
                        </td>
                        <td className={`px-8 py-5 text-[11px] font-mono font-bold ${cls.codeText}`}>{m.material_code}</td>
                        <td className="px-8 py-5">
                          <div className={`text-sm font-black leading-tight ${cls.itemName}`}>{m.material_name}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center ${cls.itemSpec}`}>
                            <Tag size={10} className="mr-1.5 opacity-60" />
                            {m.spec_brand || 'Standard Spec'}
                          </div>
                        </td>
                        <td className={`px-8 py-5 text-xs text-center font-black uppercase ${cls.unitText}`}>{m.unit}</td>
                        <td className={`px-8 py-5 text-sm font-black text-right ${cls.priceText}`}>
                          ฿{m.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${m.action_type === 'ซื้อ' ? cls.actionBuy : cls.actionWithdraw}`}>
                            {m.action_type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => deleteMaterial(m.id)} className={`p-2 transition-colors opacity-0 group-hover:opacity-100 ${cls.deleteBtn}`}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-3 ml-1 ${cls.labelText}`}>Classification Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewMaterial({...newMaterial, material_type: 'T01'})}
                    className={`flex items-center space-x-4 p-6 rounded-3xl border-2 transition-all ${newMaterial.material_type === 'T01' ? cls.typeActiveT01 : cls.typeInactive}`}
                  >
                    <div className={`p-2 rounded-xl ${newMaterial.material_type === 'T01' ? cls.typeIconT01Active : cls.typeIconInactive}`}>
                      <HardDrive size={24} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">T1 Code</div>
                      <div className="text-sm font-black uppercase">Stationary Equipment</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewMaterial({...newMaterial, material_type: 'T02'})}
                    className={`flex items-center space-x-4 p-6 rounded-3xl border-2 transition-all ${newMaterial.material_type === 'T02' ? cls.typeActiveT02 : cls.typeInactive}`}
                  >
                    <div className={`p-2 rounded-xl ${newMaterial.material_type === 'T02' ? cls.typeIconT02Active : cls.typeIconInactive}`}>
                      <Zap size={24} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">T2 Code</div>
                      <div className="text-sm font-black uppercase">Cabling &amp; Wiring</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Group / Category</label>
                  <div className="relative">
                    <input
                      list="existing-categories"
                      className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                      placeholder="e.g. Splitter, ODP"
                      value={newMaterial.category}
                      onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}
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
                    onChange={e => setNewMaterial({...newMaterial, material_code: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Full Description</label>
                <input
                  className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                  placeholder="Official description of the item..."
                  value={newMaterial.material_name}
                  onChange={e => setNewMaterial({...newMaterial, material_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Unit</label>
                  <select
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none ${cls.selectBg}`}
                    value={newMaterial.unit}
                    onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}
                  >
                    <option value="ST">ST (Set)</option>
                    <option value="M">M (Meter)</option>
                    <option value="PC">PC (Piece)</option>
                    <option value="RO">RO (Roll)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Cost Per Unit</label>
                  <div className="relative">
                    <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-bold ${cls.pricePrefix}`}>฿</span>
                    <input
                      type="number"
                      className={`w-full border rounded-2xl pl-10 pr-5 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${cls.inputBg}`}
                      placeholder="0.00"
                      value={newMaterial.unit_price}
                      onChange={e => setNewMaterial({...newMaterial, unit_price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>Procurement</label>
                  <select
                    className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none ${cls.selectBg}`}
                    value={newMaterial.action_type}
                    onChange={e => setNewMaterial({...newMaterial, action_type: e.target.value})}
                  >
                    <option value="ซื้อ">ซื้อ (Purchase)</option>
                    <option value="เบิก">เบิก (Withdraw)</option>
                  </select>
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
                onClick={handleAddMaterial}
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
