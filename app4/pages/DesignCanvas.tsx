
import React, { useState, useRef, useMemo } from 'react';
import { NodeType, ProjectState, Material, NetworkNode, NetworkEdge, CustomIcon } from '../types';
import { NODE_SYMBOL_MAP, PIN_PATH } from '../constants';
import { Trash2, Link as LinkIcon, Edit3, MousePointer2, ChevronDown, Package, Ruler, Tag, Zap, Grid3X3, Cable, Check, X, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DesignCanvasProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  materials: Material[];
  customIcons: CustomIcon[];
}

const GRID_SIZE = 20;

interface ContextMenu { x: number; y: number; type: 'node' | 'edge'; id: string }
interface DraftNode extends Partial<NetworkNode> { id: string }
interface DraftEdge extends Partial<NetworkEdge> { id: string }

const DesignCanvas: React.FC<DesignCanvasProps> = ({ project, setProject, materials, customIcons }) => {
  const { isDark } = useTheme();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'connect'>('select');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
  const [draftNode, setDraftNode] = useState<DraftNode | null>(null);
  const [draftEdge, setDraftEdge] = useState<DraftEdge | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const cls = isDark ? {
    root: 'bg-slate-950',
    sidebar: 'bg-slate-900 border-slate-700 text-white',
    sidebarHeader: 'bg-slate-950 border-slate-700',
    sidebarHeaderText: 'text-white',
    toolbarBg: 'bg-slate-900 border-slate-700',
    toolbarInactiveBtn: 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700',
    catalogBg: 'bg-slate-900/30',
    catalogItem: 'hover:bg-slate-800 border-transparent hover:border-slate-700',
    catalogItemText: 'text-slate-300 group-hover:text-blue-400',
    catalogSectionBorder: 'border-slate-700',
    catalogSectionText: 'text-slate-300',
    catalogSectionDesc: 'text-slate-400',
    customIconBg: 'bg-slate-800/50 hover:bg-slate-800 hover:border-slate-700',
    customIconImgBg: 'bg-slate-700 border-slate-600',
    customIconName: 'text-slate-300',
    customIconCat: 'text-slate-400',
    otherNodesText: 'text-slate-400',
    otherNodesBorder: 'border-slate-700',
    otherNodesItemText: 'text-slate-500 group-hover:text-white',
    sidebarFooter: 'bg-slate-950 border-slate-700',
    deleteDisabled: 'text-slate-500 bg-slate-800',
    deleteEnabled: 'bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50',
    canvas: 'bg-slate-900',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    selectBg: 'bg-slate-800 border-slate-700 text-white',
    labelText: 'text-slate-400',
    nodeLabel: 'bg-slate-800 text-white',
    ctxMenu: 'bg-slate-800 border-slate-600 shadow-2xl',
    ctxItem: 'hover:bg-slate-700 text-slate-200',
    ctxDanger: 'hover:bg-red-900/40 text-red-400',
    modalCard: 'bg-slate-900 border-slate-700',
    modalTitle: 'text-white',
    sectionLabel: 'text-slate-400',
  } : {
    root: 'bg-slate-50',
    sidebar: 'bg-white border-slate-200 text-slate-900',
    sidebarHeader: 'bg-slate-50 border-slate-200',
    sidebarHeaderText: 'text-slate-900',
    toolbarBg: 'bg-white border-slate-200',
    toolbarInactiveBtn: 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200',
    catalogBg: 'bg-white/50',
    catalogItem: 'hover:bg-slate-100 border-transparent hover:border-slate-200',
    catalogItemText: 'text-slate-700 group-hover:text-blue-600',
    catalogSectionBorder: 'border-slate-300',
    catalogSectionText: 'text-slate-700',
    catalogSectionDesc: 'text-slate-500',
    customIconBg: 'bg-slate-50 hover:bg-slate-100 hover:border-slate-200',
    customIconImgBg: 'bg-slate-200 border-slate-300',
    customIconName: 'text-slate-700',
    customIconCat: 'text-slate-500',
    otherNodesText: 'text-slate-500',
    otherNodesBorder: 'border-slate-300',
    otherNodesItemText: 'text-slate-500 group-hover:text-slate-900',
    sidebarFooter: 'bg-slate-50 border-slate-200',
    deleteDisabled: 'text-slate-400 bg-slate-100',
    deleteEnabled: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100',
    canvas: 'bg-white',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    selectBg: 'bg-white border-slate-300 text-slate-900',
    labelText: 'text-slate-500',
    nodeLabel: 'bg-slate-100 text-slate-800',
    ctxMenu: 'bg-white border-slate-200 shadow-2xl',
    ctxItem: 'hover:bg-slate-100 text-slate-700',
    ctxDanger: 'hover:bg-red-50 text-red-500',
    modalCard: 'bg-white border-slate-200',
    modalTitle: 'text-slate-900',
    sectionLabel: 'text-slate-500',
  };

  const snapValue = (val: number) => snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val;

  // ── TER materials ──────────────────────────────────────────────────────────
  const terMaterials = useMemo(() =>
    materials.filter(m => m.symbol_group?.trim().toUpperCase().startsWith('TER')),
    [materials]);

  const terGroups = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    terMaterials.forEach(m => {
      const key = m.symbol_group?.trim() || 'TER';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'th'));
  }, [terMaterials]);

  // ── Cable materials (T02) grouped by symbol_group ─────────────────────────
  const cableGroups = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    materials.filter(m => m.material_type === 'T02').forEach(m => {
      const key = m.symbol_group?.trim() || '— ไม่ระบุกลุ่ม —';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '— ไม่ระบุกลุ่ม —') return 1;
      if (b === '— ไม่ระบุกลุ่ม —') return -1;
      return a.localeCompare(b, 'th');
    });
  }, [materials]);

  // ── Node materials grouped by symbol_group (T01 units) ────────────────────
  const materialsBySymbolGroup = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    materials.forEach(m => {
      const key = m.symbol_group?.trim() || '— ไม่ระบุกลุ่ม —';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '— ไม่ระบุกลุ่ม —') return 1;
      if (b === '— ไม่ระบุกลุ่ม —') return -1;
      return a.localeCompare(b, 'th');
    });
  }, [materials]);

  const customIconsGrouped = useMemo(() => {
    const groups: Record<string, CustomIcon[]> = {};
    customIcons.forEach(icon => {
      const cat = icon.associatedCategory || 'Other Icons';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(icon);
    });
    return Object.entries(groups).sort(([a], [b]) => a === 'Other Icons' ? 1 : b === 'Other Icons' ? -1 : a.localeCompare(b));
  }, [customIcons]);

  // ── Open modal ─────────────────────────────────────────────────────────────
  const openNodeModal = (id: string) => {
    const node = project.nodes.find(n => n.id === id);
    if (!node) return;
    setDraftNode({ ...node });
    setDraftEdge(null);
    setEditingItem({ type: 'node', id });
    setContextMenu(null);
  };

  const openEdgeModal = (id: string) => {
    const edge = project.edges.find(e => e.id === id);
    if (!edge) return;
    setDraftEdge({ ...edge });
    setDraftNode(null);
    setEditingItem({ type: 'edge', id });
    setContextMenu(null);
  };

  const confirmEdit = () => {
    if (editingItem?.type === 'node' && draftNode) {
      setProject(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draftNode.id ? { ...n, ...draftNode } as NetworkNode : n),
      }));
    } else if (editingItem?.type === 'edge' && draftEdge) {
      setProject(prev => ({
        ...prev,
        edges: prev.edges.map(e => e.id === draftEdge.id ? { ...e, ...draftEdge } as NetworkEdge : e),
      }));
    }
    setEditingItem(null);
    setDraftNode(null);
    setDraftEdge(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setDraftNode(null);
    setDraftEdge(null);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteItem = (type: 'node' | 'edge', id: string) => {
    if (type === 'node') {
      setProject(prev => ({
        nodes: prev.nodes.filter(n => n.id !== id),
        edges: prev.edges.filter(e => e.source !== id && e.target !== id),
      }));
      if (selectedNodeId === id) setSelectedNodeId(null);
    } else {
      setProject(prev => ({ ...prev, edges: prev.edges.filter(e => e.id !== id) }));
      if (selectedEdgeId === id) setSelectedEdgeId(null);
    }
    setContextMenu(null);
  };

  const deleteSelected = () => {
    if (selectedNodeId) deleteItem('node', selectedNodeId);
    else if (selectedEdgeId) deleteItem('edge', selectedEdgeId);
  };

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, type: NodeType, iconId?: string) => {
    e.dataTransfer.setData('nodeType', type);
    if (iconId) e.dataTransfer.setData('iconId', iconId);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    const iconId = e.dataTransfer.getData('iconId');
    const canvas = canvasRef.current;
    if (!canvas || !type) return;
    const rect = canvas.getBoundingClientRect();
    const x = snapValue(e.clientX - rect.left);
    const y = snapValue(e.clientY - rect.top);

    let defaultMaterialId = materials.find(m => m.unit !== 'm' && m.unit !== 'F')?.id;
    if (iconId) {
      const icon = customIcons.find(i => i.id === iconId);
      if (icon?.associatedCategory) {
        const catMat = materials.find(m => m.category === icon.associatedCategory && m.unit !== 'm' && m.unit !== 'F');
        if (catMat) defaultMaterialId = catMat.id;
      }
    }

    const newNode: NetworkNode = {
      id: `n-${Date.now()}`,
      type,
      iconId: iconId || undefined,
      x, y,
      label: iconId ? customIcons.find(i => i.id === iconId)?.name || 'Custom' : NODE_SYMBOL_MAP[type].label,
      materialId: defaultMaterialId,
      quantity: 1,
    };
    setProject(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeId(newNode.id);
  };

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    if (mode === 'connect' || isConnecting) {
      if (isConnecting && isConnecting !== id) {
        const newEdge: NetworkEdge = {
          id: `e-${Date.now()}`,
          source: isConnecting,
          target: id,
          materialId: materials.find(m => m.material_type === 'T02')?.id || 0,
          distance: 100,
        };
        setProject(prev => ({ ...prev, edges: [...prev.edges, newEdge] }));
        setIsConnecting(null);
        setMode('select');
      } else {
        setIsConnecting(id);
      }
    } else {
      setSelectedNodeId(id);
      setSelectedEdgeId(null);
    }
  };

  const handleNodeContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'node', id });
  };

  const handleEdgeContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEdgeId(id);
    setSelectedNodeId(null);
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'edge', id });
  };

  const handleNodeDrag = (id: string, e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setProject(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? {
        ...n,
        x: snapValue(e.clientX - rect.left),
        y: snapValue(e.clientY - rect.top),
      } : n),
    }));
  };

  const getEdgeCoords = (edge: NetworkEdge) => {
    const s = project.nodes.find(n => n.id === edge.source);
    const t = project.nodes.find(n => n.id === edge.target);
    if (!s || !t) return null;
    return { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
  };

  // ── Render symbols ─────────────────────────────────────────────────────────
  const renderTechnicalSymbol = (type: NodeType, isSelected: boolean) => {
    const color = isSelected ? '#3b82f6' : '#1e293b';
    switch (type) {
      case NodeType.CABINET:
        return <svg width="32" height="32" viewBox="0 0 32 32"><path d="M8 26 L8 12 A8 8 0 0 1 24 12 L24 26 Z" fill="white" stroke={color} strokeWidth="2" /><line x1="8" y1="26" x2="24" y2="26" stroke={color} strokeWidth="2" /></svg>;
      case NodeType.EXCHANGE:
        return <svg width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" fill="white" stroke={color} strokeWidth="2" /><path d="M6 6 L26 26 M6 26 L26 6" stroke={color} strokeWidth="1" /><path d="M6 6 L16 16 L6 26 Z" fill={color} /><path d="M26 6 L16 16 L26 26 Z" fill={color} /></svg>;
      case NodeType.STRAIGHT_JOINT:
        return <svg width="24" height="24" viewBox="0 0 24 24"><line x1="0" y1="12" x2="24" y2="12" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" /><circle cx="12" cy="12" r="4" fill={color} /></svg>;
      case NodeType.BRANCH_JOINT:
        return <svg width="24" height="24" viewBox="0 0 24 24"><line x1="0" y1="16" x2="24" y2="16" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" /><line x1="12" y1="4" x2="12" y2="15" stroke={color} strokeWidth="1.5" /><path d="M8 12 L12 16 L16 12" fill="none" stroke={color} strokeWidth="1.5" /><text x="13" y="10" fontSize="7" fontWeight="bold" fill={color}>BJ</text></svg>;
      case NodeType.ODP:
        return <svg width="32" height="32" viewBox="0 0 32 32"><line x1="0" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" /><path d="M12 8 A10 10 0 0 1 12 24" fill="none" stroke={color} strokeWidth="1.5" /><path d="M20 8 A10 10 0 0 0 20 24" fill="none" stroke={color} strokeWidth="1.5" /><line x1="10" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1" /><line x1="6" y1="16" x2="10" y2="16" stroke={color} strokeWidth="2" /><path d="M6 14 L2 16 L6 18 Z" fill={color} /></svg>;
      default: return null;
    }
  };

  const renderPin = (type: NodeType, isSelected: boolean) => {
    const tech = renderTechnicalSymbol(type, isSelected);
    if (tech) return tech;
    const config = NODE_SYMBOL_MAP[type];
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d={PIN_PATH} fill={isSelected ? '#3b82f6' : config.color} stroke="white" strokeWidth="1" />
        <circle cx="12" cy="9" r="5" fill="white" fillOpacity="0.2" />
        <text x="12" y="11" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" style={{ pointerEvents: 'none' }}>{config.short}</text>
      </svg>
    );
  };

  const renderIcon = (node: NetworkNode) => {
    if (node.iconId) {
      const icon = customIcons.find(i => i.id === node.iconId);
      if (icon?.dataUrl) return <img src={icon.dataUrl} className="w-10 h-10 object-contain image-pixelated" alt={icon.name} />;
    }
    return renderPin(node.type, selectedNodeId === node.id);
  };

  // ── Catalog section component ──────────────────────────────────────────────
  const CatalogSection = ({ title, types, description }: { title: string; types: NodeType[]; description?: string }) => (
    <div className="mb-6">
      <div className={`flex flex-col mb-3 px-1 border-l-2 ${cls.catalogSectionBorder} pl-3`}>
        <h4 className={`text-[10px] font-black ${cls.catalogSectionText} uppercase tracking-[0.1em]`}>{title}</h4>
        {description && <p className={`text-[8px] ${cls.catalogSectionDesc} font-medium italic mt-0.5`}>{description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-x-1 gap-y-1">
        {types.map(type => (
          <div key={type} draggable onDragStart={(e) => onDragStart(e, type)} className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors group border ${cls.catalogItem}`}>
            <div className="flex-shrink-0 scale-75">{renderPin(type, false)}</div>
            <span className={`text-[10px] font-bold truncate leading-none ${cls.catalogItemText}`}>{NODE_SYMBOL_MAP[type].label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Modal content (node) ───────────────────────────────────────────────────
  const renderNodeModal = () => {
    if (!draftNode) return null;
    const icon = draftNode.iconId ? customIcons.find(i => i.id === draftNode.iconId) : null;
    const ag = icon?.associatedCategory;
    const selectedMat = materials.find(m => m.id === draftNode.materialId);
    const isMeterUnit = selectedMat?.unit.toLowerCase() === 'm' || selectedMat?.unit === 'เมตร';

    // Build node material options filtered by icon's associated category
    const nodeMatGroups = materialsBySymbolGroup
      .map(([sg, items]) => {
        const relevant = items.filter(m =>
          m.unit !== 'm' && m.unit !== 'F' &&
          (!ag || m.symbol_group === ag || sg === ag)
        );
        return [sg, relevant] as [string, Material[]];
      })
      .filter(([, items]) => items.length > 0);

    // Connected edges for TER
    const connectedEdges = project.edges.filter(e => e.source === draftNode.id || e.target === draftNode.id);
    const terIds: (number | null)[] = connectedEdges.map((_, i) => draftNode.terMaterialIds?.[i] ?? null);

    const updateTer = (edgeIdx: number, matId: number | null) => {
      const next = connectedEdges.map((_, i) => i === edgeIdx ? matId : (draftNode.terMaterialIds?.[i] ?? null));
      setDraftNode(d => d ? { ...d, terMaterialIds: next } : d);
    };

    return (
      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${cls.sectionLabel}`}>Label Tag</label>
          <input
            type="text"
            className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${cls.inputBg}`}
            value={draftNode.label || ''}
            onChange={e => setDraftNode(d => d ? { ...d, label: e.target.value } : d)}
          />
        </div>

        {/* Material */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${cls.sectionLabel}`}>วัสดุ / อุปกรณ์</label>
          <select
            className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${cls.selectBg}`}
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
            value={draftNode.materialId ?? ''}
            onChange={e => setDraftNode(d => d ? { ...d, materialId: Number(e.target.value) || undefined } : d)}
          >
            <option value="">— ไม่ระบุวัสดุ —</option>
            {nodeMatGroups.map(([sg, items]) => (
              <optgroup key={sg} label={sg}>
                {items.map(m => (
                  <option key={m.id} value={m.id}>{m.material_name} — ฿{m.unit_price}/{m.unit}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Quantity */}
        {selectedMat && (
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${cls.sectionLabel}`}>
              {isMeterUnit ? <Ruler size={11} /> : <Package size={11} />}
              {isMeterUnit ? 'ระยะทาง (เมตร)' : `จำนวน (${selectedMat.unit})`}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={isMeterUnit ? '0.01' : '1'}
                className={`flex-grow border rounded-lg px-3 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 ${cls.inputBg}`}
                value={draftNode.quantity ?? 0}
                onChange={e => setDraftNode(d => d ? { ...d, quantity: parseFloat(e.target.value) || 0 } : d)}
              />
              <span className={`text-xs font-black uppercase ${cls.sectionLabel}`}>{selectedMat.unit}</span>
            </div>
          </div>
        )}

        {/* TER — one dropdown per connected edge */}
        {connectedEdges.length > 0 && terGroups.length > 0 && (
          <div className={`rounded-xl border p-3 space-y-2 ${isDark ? 'border-amber-800/40 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              <Cable size={11} />
              จุดต่อสาย (Terminal) — {connectedEdges.length} เส้น
            </div>
            {connectedEdges.map((edge, idx) => {
              const cableMat = materials.find(m => m.id === edge.materialId);
              return (
                <div key={edge.id}>
                  <label className={`block text-[9px] font-bold mb-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    สาย {idx + 1}: {cableMat?.material_name || 'ไม่ระบุสาย'}
                  </label>
                  <select
                    className={`w-full border rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 ${cls.selectBg}`}
                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                    value={terIds[idx] ?? ''}
                    onChange={e => updateTer(idx, Number(e.target.value) || null)}
                  >
                    <option value="">— ไม่ระบุ TER —</option>
                    {terGroups.map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName}>
                        {items.map(m => (
                          <option key={m.id} value={m.id}>{m.material_name} — ฿{m.unit_price}/{m.unit}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {/* GPS Coordinates */}
        <div className={`rounded-xl border p-3 space-y-2 ${isDark ? 'border-emerald-800/40 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <MapPin size={11} />
            พิกัด GPS (สำหรับ Google Map)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-[9px] font-bold mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Latitude</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="เช่น 13.756331"
                className={`w-full border rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${cls.inputBg}`}
                value={draftNode.metadata?.lat ?? ''}
                onChange={e => setDraftNode(d => d ? {
                  ...d,
                  metadata: { ...d.metadata, lat: e.target.value, lng: d.metadata?.lng ?? '' }
                } : d)}
              />
            </div>
            <div>
              <label className={`block text-[9px] font-bold mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Longitude</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="เช่น 100.501765"
                className={`w-full border rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${cls.inputBg}`}
                value={draftNode.metadata?.lng ?? ''}
                onChange={e => setDraftNode(d => d ? {
                  ...d,
                  metadata: { ...d.metadata, lng: e.target.value, lat: d.metadata?.lat ?? '' }
                } : d)}
              />
            </div>
          </div>
          {(draftNode.metadata?.lat && draftNode.metadata?.lng) && (
            <a
              href={`https://www.google.com/maps?q=${draftNode.metadata.lat},${draftNode.metadata.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-[9px] font-bold underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
            >
              <MapPin size={9} />
              เปิดใน Google Maps
            </a>
          )}
        </div>
      </div>
    );
  };

  // ── Modal content (edge) ───────────────────────────────────────────────────
  const renderEdgeModal = () => {
    if (!draftEdge) return null;
    return (
      <div className="space-y-4">
        {/* Distance */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${cls.sectionLabel}`}>ระยะทาง (เมตร)</label>
          <input
            type="number"
            className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none ${cls.inputBg}`}
            value={draftEdge.distance ?? 0}
            onChange={e => setDraftEdge(d => d ? { ...d, distance: Number(e.target.value) } : d)}
          />
        </div>

        {/* Cable type */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${cls.sectionLabel}`}>
            <Zap size={11} />
            ชนิดสาย (Cable Type)
          </label>
          <select
            className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${cls.selectBg}`}
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
            value={draftEdge.materialId ?? ''}
            onChange={e => setDraftEdge(d => d ? { ...d, materialId: Number(e.target.value) || 0 } : d)}
          >
            <option value="">— ไม่ระบุสาย —</option>
            {cableGroups.map(([sg, items]) => (
              <optgroup key={sg} label={sg}>
                {items.map(m => (
                  <option key={m.id} value={m.id}>{m.material_name} — ฿{m.unit_price}/{m.unit}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex h-full overflow-hidden select-none ${cls.root}`}
      onClick={() => { setContextMenu(null); }}
    >
      {/* ── Left sidebar ───────────────────────────────────────────────────── */}
      <div className={`w-[300px] border-r flex flex-col shadow-sm ${cls.sidebar}`}>
        <div className={`p-4 border-b flex items-center justify-between ${cls.sidebarHeader}`}>
          <h3 className={`text-xs font-black uppercase tracking-widest flex items-center ${cls.sidebarHeaderText}`}>
            <Package size={14} className="mr-2 text-blue-400" />
            Component Catalog
          </h3>
          <ChevronDown size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
        </div>

        <div className={`p-4 grid grid-cols-3 gap-2 border-b ${cls.toolbarBg}`}>
          <button onClick={() => setMode('select')} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${mode === 'select' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : cls.toolbarInactiveBtn}`}>
            <MousePointer2 size={16} />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Select</span>
          </button>
          <button onClick={() => setMode('connect')} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${mode === 'connect' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : cls.toolbarInactiveBtn}`}>
            <LinkIcon size={16} />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Connect</span>
          </button>
          <button onClick={() => setSnapToGrid(!snapToGrid)} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${snapToGrid ? 'bg-indigo-600 border-indigo-600 text-white shadow-inner shadow-indigo-900/50' : cls.toolbarInactiveBtn}`}>
            <Grid3X3 size={16} />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">Snap</span>
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto ${cls.catalogBg}`}>
          <div className="p-3">




            {customIconsGrouped.map(([category, groupIcons]) => (
              <div key={category} className="mt-6">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-3 px-1 border-l-2 border-blue-500 pl-3">{category}</h4>
                <div className="space-y-1">
                  {groupIcons.map(icon => (
                    <div key={icon.id} draggable onDragStart={(e) => onDragStart(e, NodeType.CUSTOM, icon.id)} className={`flex items-center space-x-3 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all border shadow-sm ${cls.customIconBg}`}>
                      <div className={`w-8 h-8 border rounded overflow-hidden flex items-center justify-center shadow-inner ${cls.customIconImgBg}`}>
                        {icon.dataUrl
                          ? <img src={icon.dataUrl} className="w-full h-full object-contain image-pixelated p-0.5" alt={icon.name} />
                          : <div className={`text-[8px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>BMP</div>
                        }
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className={`text-[10px] font-bold truncate ${cls.customIconName}`}>{icon.name}</div>
                        <div className={`text-[8px] uppercase font-black tracking-tight ${cls.customIconCat}`}>{category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-6">
              <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 px-1 border-l-2 pl-3 ${cls.otherNodesText} ${cls.otherNodesBorder}`}>Other Nodes</h4>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {Object.entries(NodeType)
                  .filter(([k]) => ![NodeType.CUSTOM].includes(k as NodeType))
                  .map(([key, type]) => (
                    <div key={key} draggable onDragStart={(e) => onDragStart(e, type as NodeType)} className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors group border border-transparent ${isDark ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-slate-100 hover:border-slate-200'}`}>
                      <div className="flex-shrink-0 scale-75">{renderPin(type as NodeType, false)}</div>
                      <span className={`text-[9px] font-bold truncate ${cls.otherNodesItemText}`}>{NODE_SYMBOL_MAP[type as NodeType].label}</span>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        </div>

        <div className={`p-4 border-t ${cls.sidebarFooter}`}>
          <button
            disabled={!selectedNodeId && !selectedEdgeId}
            onClick={deleteSelected}
            className={`w-full flex items-center justify-center space-x-2 p-2.5 rounded-lg transition-all text-xs font-bold ${selectedNodeId || selectedEdgeId ? `${cls.deleteEnabled} border` : `${cls.deleteDisabled} cursor-not-allowed`}`}
          >
            <Trash2 size={14} />
            <span>ลบรายการที่เลือก</span>
          </button>
        </div>
      </div>

      {/* ── Canvas area ────────────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        className={`flex-grow relative canvas-grid overflow-hidden ${cls.canvas} ${mode === 'connect' ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); setContextMenu(null); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onMouseMove={(e) => isDragging && handleNodeDrag(isDragging, e)}
        onMouseUp={() => setIsDragging(null)}
      >
        {/* Edges SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {project.edges.map(edge => {
            const coords = getEdgeCoords(edge);
            if (!coords) return null;
            const isSelected = selectedEdgeId === edge.id;
            return (
              <g
                key={edge.id}
                className="group pointer-events-auto cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); setContextMenu(null); }}
                onDoubleClick={(e) => { e.stopPropagation(); openEdgeModal(edge.id); }}
                onContextMenu={(e) => handleEdgeContextMenu(edge.id, e as unknown as React.MouseEvent)}
              >
                <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke="transparent" strokeWidth="20" />
                <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? '3' : '1.5'} strokeDasharray={isSelected ? 'none' : '8,4'} />
                <g transform={`translate(${(coords.x1 + coords.x2) / 2}, ${(coords.y1 + coords.y2) / 2})`}>
                  <rect x="-25" y="-10" width="50" height="20" rx="6" fill="white" stroke={isSelected ? '#3b82f6' : '#e2e8f0'} strokeWidth="1.5" />
                  <text className={`text-[9px] font-black`} fill={isSelected ? '#2563eb' : '#334155'} textAnchor="middle" dominantBaseline="middle">{edge.distance}M</text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {project.nodes.map(node => (
          <div
            key={node.id}
            onMouseDown={(e) => { e.stopPropagation(); if (mode === 'select') setIsDragging(node.id); }}
            onClick={(e) => handleNodeClick(node.id, e)}
            onDoubleClick={(e) => { e.stopPropagation(); openNodeModal(node.id); }}
            onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all ${selectedNodeId === node.id ? 'z-20' : 'z-10'}`}
            style={{ left: node.x, top: node.y }}
          >
            <div className={`relative flex flex-col items-center transition-all ${selectedNodeId === node.id ? 'scale-125' : 'hover:scale-110'}`}>
              {renderIcon(node)}
              <div className={`absolute top-full mt-2 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md z-30 ${cls.nodeLabel} ${selectedNodeId === node.id ? 'ring-2 ring-blue-400 scale-110' : 'opacity-90'}`}>
                {node.label}
              </div>
            </div>
          </div>
        ))}

        {/* ── Right-click context menu ──────────────────────────────────────── */}
        {contextMenu && (
          <div
            className={`fixed z-[100] rounded-xl border shadow-2xl overflow-hidden min-w-[140px] ${cls.ctxMenu}`}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold transition-colors ${cls.ctxItem}`}
              onClick={() => contextMenu.type === 'node' ? openNodeModal(contextMenu.id) : openEdgeModal(contextMenu.id)}
            >
              <Edit3 size={13} />
              ตั้งค่า / Properties
            </button>
            <div className={`h-px mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <button
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold transition-colors ${cls.ctxDanger}`}
              onClick={() => deleteItem(contextMenu.type, contextMenu.id)}
            >
              <Trash2 size={13} />
              ลบ
            </button>
          </div>
        )}
      </div>

      {/* ── Centered blocking modal ─────────────────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl border flex flex-col ${cls.modalCard}`}
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-4 shrink-0">
              <Edit3 size={16} className="text-blue-400" />
              <h3 className={`text-sm font-black uppercase tracking-tight ${cls.modalTitle}`}>
                {editingItem.type === 'node' ? 'คุณสมบัติอุปกรณ์' : 'คุณสมบัติเส้นสาย'}
              </h3>
            </div>

            {/* Modal body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
              {editingItem.type === 'node' ? renderNodeModal() : renderEdgeModal()}
            </div>

            {/* Confirm / Cancel */}
            <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-slate-200/50 mt-2">
              <button
                onClick={cancelEdit}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-bold transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
              >
                <X size={14} />
                ยกเลิก
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30"
              >
                <Check size={14} />
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default DesignCanvas;
