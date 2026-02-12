
import React, { useState, useRef, useMemo } from 'react';
import { NodeType, ProjectState, Material, NetworkNode, NetworkEdge, CustomIcon } from '../types';
import { NODE_SYMBOL_MAP, PIN_PATH } from '../constants';
import { Trash2, Link as LinkIcon, Edit3, MousePointer2, ChevronDown, Package, Ruler, Square, Tag, HardDrive, Zap, Info, Grid3X3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DesignCanvasProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  materials: Material[];
  customIcons: CustomIcon[];
}

const GRID_SIZE = 20;

const DesignCanvas: React.FC<DesignCanvasProps> = ({ project, setProject, materials, customIcons }) => {
  const { isDark } = useTheme();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
  const [mode, setMode] = useState<'select' | 'connect'>('select');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

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
    panel: 'bg-slate-900 border-slate-700',
    panelTitle: 'text-white',
    panelClose: 'text-slate-400 hover:text-white',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    labelText: 'text-slate-400',
    materialListBg: 'border-slate-700 bg-slate-800/30',
    materialCatLabel: 'text-slate-400',
    materialItemInactive: 'hover:bg-slate-700 text-slate-300 bg-slate-800 border-slate-700',
    materialItemSubtext: 'text-slate-400',
    quantityBox: 'bg-blue-50 border-blue-100',
    quantityLabel: 'text-blue-700',
    quantityInput: 'bg-slate-800 border-blue-700 text-blue-300',
    quantityUnit: 'text-blue-700',
    edgeInput: 'bg-slate-800 border-slate-700 text-white',
    cableInactive: 'hover:bg-slate-700 text-slate-300 border-slate-700',
    cableInactivePrice: 'text-slate-400',
    nodeLabel: 'bg-slate-800 text-white',
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
    panel: 'bg-white border-slate-200',
    panelTitle: 'text-slate-900',
    panelClose: 'text-slate-500 hover:text-slate-900',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    labelText: 'text-slate-500',
    materialListBg: 'border-slate-200 bg-slate-50',
    materialCatLabel: 'text-slate-500',
    materialItemInactive: 'hover:bg-slate-100 text-slate-700 bg-white border-slate-200',
    materialItemSubtext: 'text-slate-500',
    quantityBox: 'bg-blue-50 border-blue-100',
    quantityLabel: 'text-blue-700',
    quantityInput: 'bg-white border-blue-300 text-blue-700',
    quantityUnit: 'text-blue-600',
    edgeInput: 'bg-white border-slate-300 text-slate-900',
    cableInactive: 'hover:bg-slate-100 text-slate-700 border-slate-200',
    cableInactivePrice: 'text-slate-500',
    nodeLabel: 'bg-slate-100 text-slate-800',
  };

  const snapValue = (val: number) => {
    return snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val;
  };

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
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const x = snapValue(rawX);
    const y = snapValue(rawY);

    // Logic: If icon has an associated category, find the first material in that category
    let defaultMaterialId = materials.find(m => m.material_type === 'T01')?.id;
    if (iconId) {
      const icon = customIcons.find(i => i.id === iconId);
      if (icon?.associatedCategory) {
        const catMat = materials.find(m => m.category === icon.associatedCategory && m.material_type === 'T01');
        if (catMat) defaultMaterialId = catMat.id;
      }
    }

    const newNode: NetworkNode = {
      id: `n-${Date.now()}`,
      type,
      iconId: iconId || undefined,
      x,
      y,
      label: iconId ? customIcons.find(i => i.id === iconId)?.name || 'Custom' : NODE_SYMBOL_MAP[type].label,
      materialId: defaultMaterialId,
      quantity: 1
    };

    setProject(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeId(newNode.id);
  };

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'connect' || isConnecting) {
      if (isConnecting && isConnecting !== id) {
        const newEdge: NetworkEdge = {
          id: `e-${Date.now()}`,
          source: isConnecting,
          target: id,
          materialId: materials.find(m => m.material_type === 'T02')?.id || 0,
          distance: 100
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

  const deleteSelected = () => {
    if (selectedNodeId) {
      setProject(prev => ({
        nodes: prev.nodes.filter(n => n.id !== selectedNodeId),
        edges: prev.edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId)
      }));
      setSelectedNodeId(null);
      setEditingItem(null);
    } else if (selectedEdgeId) {
      setProject(prev => ({ ...prev, edges: prev.edges.filter(e => e.id !== selectedEdgeId) }));
      setSelectedEdgeId(null);
      setEditingItem(null);
    }
  };

  const handleNodeDrag = (id: string, e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    setProject(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? {
        ...n,
        x: snapValue(rawX),
        y: snapValue(rawY)
      } : n)
    }));
  };

  const getEdgeCoords = (edge: NetworkEdge) => {
    const s = project.nodes.find(n => n.id === edge.source);
    const t = project.nodes.find(n => n.id === edge.target);
    if (!s || !t) return null;
    return { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
  };

  const renderTechnicalSymbol = (type: NodeType, isSelected: boolean) => {
    const color = isSelected ? '#3b82f6' : '#1e293b';
    const fill = 'white';

    switch (type) {
      case NodeType.CABINET:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path d="M8 26 L8 12 A8 8 0 0 1 24 12 L24 26 Z" fill={fill} stroke={color} strokeWidth="2" />
            <line x1="8" y1="26" x2="24" y2="26" stroke={color} strokeWidth="2" />
          </svg>
        );
      case NodeType.EXCHANGE:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="6" y="6" width="20" height="20" fill={fill} stroke={color} strokeWidth="2" />
            <path d="M6 6 L26 26 M6 26 L26 6" stroke={color} strokeWidth="1" />
            <path d="M6 6 L16 16 L6 26 Z" fill={color} />
            <path d="M26 6 L16 16 L26 26 Z" fill={color} />
          </svg>
        );
      case NodeType.STRAIGHT_JOINT:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <line x1="0" y1="12" x2="24" y2="12" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" />
            <circle cx="12" cy="12" r="4" fill={color} />
          </svg>
        );
      case NodeType.BRANCH_JOINT:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <line x1="0" y1="16" x2="24" y2="16" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" />
            <line x1="12" y1="4" x2="12" y2="15" stroke={color} strokeWidth="1.5" />
            <path d="M8 12 L12 16 L16 12" fill="none" stroke={color} strokeWidth="1.5" />
            <text x="13" y="10" fontSize="7" fontWeight="bold" fill={color}>BJ</text>
          </svg>
        );
      case NodeType.ODP:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32">
            <line x1="0" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" />
            <path d="M12 8 A10 10 0 0 1 12 24" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M20 8 A10 10 0 0 0 20 24" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="10" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1" />
            <line x1="6" y1="16" x2="10" y2="16" stroke={color} strokeWidth="2" />
            <path d="M6 14 L2 16 L6 18 Z" fill={color} />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderPin = (type: NodeType, isSelected: boolean) => {
    const techSymbol = renderTechnicalSymbol(type, isSelected);
    if (techSymbol) return techSymbol;

    const config = NODE_SYMBOL_MAP[type];
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d={PIN_PATH} fill={isSelected ? '#3b82f6' : config.color} stroke="white" strokeWidth="1" />
        <circle cx="12" cy="9" r="5" fill="white" fillOpacity="0.2" />
        <text x="12" y="11" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" style={{ pointerEvents: 'none' }}>
          {config.short}
        </text>
      </svg>
    );
  };

  const renderIcon = (node: NetworkNode) => {
    if (node.iconId) {
      const icon = customIcons.find(i => i.id === node.iconId);
      if (icon?.dataUrl) {
        return <img src={icon.dataUrl} className="w-10 h-10 object-contain image-pixelated" alt={icon.name} />;
      }
    }
    return renderPin(node.type, selectedNodeId === node.id);
  };

  const materialsByCategory = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    materials.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
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

  const CatalogSection = ({ title, types, description }: { title: string; types: NodeType[]; description?: string }) => (
    <div className="mb-6">
      <div className={`flex flex-col mb-3 px-1 border-l-2 ${cls.catalogSectionBorder} pl-3`}>
        <h4 className={`text-[10px] font-black ${cls.catalogSectionText} uppercase tracking-[0.1em]`}>{title}</h4>
        {description && <p className={`text-[8px] ${cls.catalogSectionDesc} font-medium italic mt-0.5`}>{description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-x-1 gap-y-1">
        {types.map(type => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors group border ${cls.catalogItem}`}
          >
            <div className="flex-shrink-0 scale-75">
              {renderPin(type, false)}
            </div>
            <span className={`text-[10px] font-bold truncate leading-none ${cls.catalogItemText}`}>
              {NODE_SYMBOL_MAP[type].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex h-full overflow-hidden select-none ${cls.root}`}>
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
             <CatalogSection
               title="Professional Symbols"
               description="General Plan Standard"
               types={[NodeType.EXCHANGE, NodeType.CABINET, NodeType.ODP, NodeType.STRAIGHT_JOINT, NodeType.BRANCH_JOINT]}
             />

             <CatalogSection
               title="Classic Markers"
               types={[NodeType.TOT_POLE, NodeType.MANHOLE, NodeType.DP, NodeType.SDP, NodeType.RISER, NodeType.AIS]}
             />

             {customIconsGrouped.map(([category, groupIcons]) => (
               <div key={category} className="mt-6">
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-3 px-1 border-l-2 border-blue-500 pl-3">{category}</h4>
                 <div className="space-y-1">
                   {groupIcons.map(icon => (
                     <div key={icon.id} draggable onDragStart={(e) => onDragStart(e, NodeType.CUSTOM, icon.id)} className={`flex items-center space-x-3 p-2 rounded-xl cursor-grab active:cursor-grabbing transition-all border shadow-sm ${cls.customIconBg}`}>
                        <div className={`w-8 h-8 border rounded overflow-hidden flex items-center justify-center shadow-inner ${cls.customIconImgBg}`}>
                          {icon.dataUrl ? (
                            <img src={icon.dataUrl} className="w-full h-full object-contain image-pixelated p-0.5" alt={icon.name} />
                          ) : (
                            <div className={`text-[8px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>BMP</div>
                          )}
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
                    .filter(([k]) => ![NodeType.EXCHANGE, NodeType.CABINET, NodeType.STRAIGHT_JOINT, NodeType.BRANCH_JOINT, NodeType.ODP, NodeType.SDP, NodeType.TOT_POLE, NodeType.MANHOLE, NodeType.DP, NodeType.RISER, NodeType.AIS, NodeType.CUSTOM].includes(k as NodeType))
                    .map(([key, type]) => (
                      <div
                        key={key}
                        draggable
                        onDragStart={(e) => onDragStart(e, type as NodeType)}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors group border border-transparent ${isDark ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="flex-shrink-0 scale-75">
                          {renderPin(type as NodeType, false)}
                        </div>
                        <span className={`text-[9px] font-bold truncate ${cls.otherNodesItemText}`}>
                          {NODE_SYMBOL_MAP[type as NodeType].label}
                        </span>
                      </div>
                    ))
                   }
                </div>
             </div>
          </div>
        </div>

        <div className={`p-4 border-t ${cls.sidebarFooter}`}>
           <button disabled={!selectedNodeId && !selectedEdgeId} onClick={deleteSelected} className={`w-full flex items-center justify-center space-x-2 p-2.5 rounded-lg transition-all text-xs font-bold ${selectedNodeId || selectedEdgeId ? `${cls.deleteEnabled} border` : `${cls.deleteDisabled} cursor-not-allowed`}`}>
              <Trash2 size={14} />
              <span>ลบรายการที่เลือก</span>
            </button>
        </div>
      </div>

      <div ref={canvasRef} className={`flex-grow relative canvas-grid overflow-hidden ${cls.canvas} ${mode === 'connect' ? 'cursor-crosshair' : 'cursor-default'}`} onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); setEditingItem(null); }} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onMouseMove={(e) => isDragging && handleNodeDrag(isDragging, e)} onMouseUp={() => setIsDragging(null)}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {project.edges.map(edge => {
            const coords = getEdgeCoords(edge);
            if (!coords) return null;
            const isSelected = selectedEdgeId === edge.id;
            return (
              <g key={edge.id} className="group pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }} onDoubleClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'edge', id: edge.id }); }}>
                <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke="transparent" strokeWidth="20" />
                <line x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? "3" : "1.5"} strokeDasharray={isSelected ? "none" : "8,4"} />
                <g transform={`translate(${(coords.x1 + coords.x2) / 2}, ${(coords.y1 + coords.y2) / 2})`}>
                  <rect x="-25" y="-10" width="50" height="20" rx="6" fill="white" stroke={isSelected ? '#3b82f6' : '#e2e8f0'} strokeWidth="1.5" className="filter drop-shadow-sm" />
                  <text className={`text-[9px] font-black ${isSelected ? 'fill-blue-600' : 'fill-slate-700'}`} textAnchor="middle" dominantBaseline="middle">{edge.distance}M</text>
                </g>
              </g>
            );
          })}
        </svg>

        {project.nodes.map(node => (
          <div key={node.id} onMouseDown={(e) => { e.stopPropagation(); if(mode === 'select') setIsDragging(node.id); }} onClick={(e) => handleNodeClick(node.id, e)} onDoubleClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'node', id: node.id }); }} className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all ${selectedNodeId === node.id ? 'z-20' : 'z-10'}`} style={{ left: node.x, top: node.y }}>
            <div className={`relative flex flex-col items-center transition-all ${selectedNodeId === node.id ? 'scale-125' : 'hover:scale-110'}`}>
              {renderIcon(node)}
              {/* Always visible label with high contrast */}
              <div className={`absolute top-full mt-2 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none transition-all shadow-md z-30 ${cls.nodeLabel} ${selectedNodeId === node.id ? 'ring-2 ring-blue-400 scale-110' : 'opacity-90'}`}>
                {node.label}
              </div>
            </div>
          </div>
        ))}

        {editingItem && (
          <div className={`absolute top-6 right-6 w-[400px] rounded-2xl shadow-2xl border p-6 z-50 animate-in fade-in slide-in-from-right-8 ${cls.panel}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-sm font-black uppercase tracking-tight flex items-center space-x-2 ${cls.panelTitle}`}>
                <Edit3 size={16} className="text-blue-400" />
                <span>คุณสมบัติ (Properties)</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className={`transition-colors ${cls.panelClose}`}>×</button>
            </div>

            <div className="space-y-5">
              {editingItem.type === 'node' ? (() => {
                const node = project.nodes.find(n => n.id === editingItem.id);
                const icon = node?.iconId ? customIcons.find(i => i.id === node.iconId) : null;
                const selectedMat = materials.find(m => m.id === node?.materialId);
                const isMeterUnit = selectedMat?.unit.toLowerCase() === 'm' || selectedMat?.unit === 'เมตร';

                return (
                  <>
                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>Label Tag</label>
                      <input type="text" className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${cls.inputBg}`} value={node?.label || ''} onChange={e => setProject(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === editingItem.id ? { ...n, label: e.target.value } : n) }))} />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>
                        Stationary Equipment (T1)
                      </label>
                      <div className={`max-h-64 overflow-y-auto space-y-4 border rounded-lg p-2 ${cls.materialListBg}`}>
                        {(Object.entries(materialsByCategory) as [string, Material[]][])
                          .filter(([cat]) => !icon?.associatedCategory || cat === icon.associatedCategory)
                          .map(([category, items]) => {
                            const relevantItems = items.filter(m => m.material_type === 'T01');
                            if (relevantItems.length === 0) return null;
                            return (
                              <div key={category}>
                                <div className="flex items-center space-x-1 mb-1 px-1">
                                  <Tag size={10} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${cls.materialCatLabel}`}>{category}</span>
                                </div>
                                <div className="space-y-1">
                                  {relevantItems.map(m => (
                                    <button key={m.id} onClick={() => { setProject(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === editingItem.id ? { ...n, materialId: m.id } : n) })); }} className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold flex flex-col transition-colors ${node?.materialId === m.id ? 'bg-blue-600 text-white shadow-sm' : `${cls.materialItemInactive} border`}`}>
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">{m.material_name}</span>
                                        <HardDrive size={10} className="opacity-40" />
                                      </div>
                                      <span className={`text-[9px] opacity-70 ${node?.materialId === m.id ? 'text-blue-100' : cls.materialItemSubtext}`}>฿{m.unit_price} / {m.unit}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {selectedMat && (
                      <div className={`p-3 rounded-xl border ${cls.quantityBox}`}>
                        <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 flex items-center ${cls.quantityLabel}`}>
                          {isMeterUnit ? <Ruler size={12} className="mr-1.5" /> : <Package size={12} className="mr-1.5" />}
                          {isMeterUnit ? 'Length (Meter)' : 'Quantity (Units)'}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step={isMeterUnit ? "0.01" : "1"}
                            className={`flex-grow border rounded-lg px-3 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 ${cls.quantityInput}`}
                            value={node?.quantity || 0}
                            onChange={e => setProject(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === editingItem.id ? { ...n, quantity: parseFloat(e.target.value) || 0 } : n) }))}
                          />
                          <span className={`text-xs font-black uppercase ${cls.quantityUnit}`}>{selectedMat.unit}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })() : (
                <>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>Segment Distance (M)</label>
                    <input type="number" className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none ${cls.edgeInput}`} value={project.edges.find(e => e.id === editingItem.id)?.distance || 0} onChange={e => setProject(prev => ({ ...prev, edges: prev.edges.map(ed => ed.id === editingItem.id ? { ...ed, distance: Number(e.target.value) } : ed) }))} />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>Cable Type (T2)</label>
                    <div className="space-y-1">
                      {materials.filter(m => m.material_type === 'T02').map(m => (
                        <button key={m.id} onClick={() => setProject(prev => ({ ...prev, edges: prev.edges.map(ed => ed.id === editingItem.id ? { ...ed, materialId: m.id } : ed) }))} className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold flex items-center justify-between transition-colors ${project.edges.find(e => e.id === editingItem.id)?.materialId === m.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : `${cls.cableInactive} border`}`}>
                          <div className="flex items-center space-x-2">
                            <Zap size={10} className={project.edges.find(e => e.id === editingItem.id)?.materialId === m.id ? 'text-white' : 'text-emerald-400'} />
                            <span>{m.material_name}</span>
                          </div>
                          <span className={`text-[9px] ${project.edges.find(e => e.id === editingItem.id)?.materialId === m.id ? 'text-white' : cls.cableInactivePrice}`}>฿{m.unit_price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignCanvas;
