
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CustomIcon, IconDot, Material } from '../types';
import { Plus, Trash2, Save, Palette, Info, Upload, Download, Eraser, Pipette, Tag, Lock, Shield, Copy, Unlock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface IconEditorProps {
  icons: CustomIcon[];
  setIcons: React.Dispatch<React.SetStateAction<CustomIcon[]>>;
  materials: Material[];
}

const GRID_SIZE = 50;
const CANVAS_DISPLAY_SIZE = 600;
const PRESET_COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#000000', '#64748b'];

const IconEditor: React.FC<IconEditorProps> = ({ icons, setIcons, materials }) => {
  const { isDark } = useTheme();
  const [activeIcon, setActiveIcon] = useState<CustomIcon | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [isPainting, setIsPainting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  // Fix: Explicitly cast categories as string array to prevent 'unknown' inference
  const categories = Array.from(new Set(materials.map(m => m.category))).sort() as string[];
  const symbolGroups = Array.from(new Set(materials.map(m => m.symbol_group).filter(Boolean))).sort() as string[];

  const cls = isDark ? {
    root: 'bg-slate-950',
    sidebar: 'bg-slate-900 border-slate-700',
    sidebarTitle: 'text-white',
    iconItem: 'bg-slate-800 border-slate-700 hover:border-slate-500',
    iconItemActive: 'bg-blue-900/40 border-blue-600 ring-2 ring-blue-800 shadow-sm',
    iconImgBg: 'bg-slate-700 border-slate-600',
    iconNoImg: 'bg-slate-800 text-slate-500',
    iconName: 'text-slate-300',
    iconCat: 'text-slate-400',
    deleteBtn: 'text-slate-300 hover:text-red-500',
    mainBg: '',
    editorCard: 'bg-slate-900 border-slate-700',
    editorTitle: 'text-white',
    editorSubtitle: 'text-slate-400',
    toolbarBg: 'bg-slate-800 border-slate-700',
    colorDivider: 'border-slate-700',
    canvas: 'bg-slate-950 border-slate-700',
    canvasHint: 'text-slate-400',
    metaCard: 'bg-slate-900 border-slate-700',
    metaTitle: 'text-slate-400',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    selectBg: 'bg-slate-800 border-slate-700 text-white',
    selectIcon: 'text-slate-400',
    metaHint: 'text-slate-400',
    actionBtn: 'bg-slate-800 text-slate-400 hover:bg-slate-700',
    previewCard: 'bg-slate-900 border-slate-700',
    previewTitle: 'text-slate-400',
    previewBadge: 'bg-slate-800 text-slate-500 border-slate-700',
    previewImgBg: 'bg-slate-800 border-slate-700',
    previewEmpty: 'text-slate-600',
    previewName: 'text-white',
    previewSubtitle: 'text-slate-400',
    emptyBg: 'bg-slate-800',
    emptyTitle: 'text-slate-400',
    emptyText: 'text-slate-400',
    labelText: 'text-slate-400',
  } : {
    root: 'bg-slate-50',
    sidebar: 'bg-white border-slate-200',
    sidebarTitle: 'text-slate-900',
    iconItem: 'bg-white border-slate-200 hover:border-slate-400',
    iconItemActive: 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-sm',
    iconImgBg: 'bg-slate-100 border-slate-200',
    iconNoImg: 'bg-slate-100 text-slate-400',
    iconName: 'text-slate-700',
    iconCat: 'text-slate-500',
    deleteBtn: 'text-slate-400 hover:text-red-500',
    mainBg: '',
    editorCard: 'bg-white border-slate-200',
    editorTitle: 'text-slate-900',
    editorSubtitle: 'text-slate-500',
    toolbarBg: 'bg-slate-100 border-slate-200',
    colorDivider: 'border-slate-200',
    canvas: 'bg-slate-50 border-slate-300',
    canvasHint: 'text-slate-500',
    metaCard: 'bg-white border-slate-200',
    metaTitle: 'text-slate-500',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    selectBg: 'bg-white border-slate-300 text-slate-900',
    selectIcon: 'text-slate-500',
    metaHint: 'text-slate-500',
    actionBtn: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    previewCard: 'bg-white border-slate-200',
    previewTitle: 'text-slate-500',
    previewBadge: 'bg-slate-100 text-slate-400 border-slate-200',
    previewImgBg: 'bg-slate-100 border-slate-200',
    previewEmpty: 'text-slate-400',
    previewName: 'text-slate-900',
    previewSubtitle: 'text-slate-500',
    emptyBg: 'bg-slate-100',
    emptyTitle: 'text-slate-500',
    emptyText: 'text-slate-400',
    labelText: 'text-slate-500',
  };

  const generateDataUrl = useCallback((dots: IconDot[]): string => {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    dots.forEach(dot => {
      ctx.fillStyle = dot.color;
      ctx.fillRect(dot.x, dot.y, 1, 1);
    });
    return canvas.toDataURL('image/png');
  }, []);

  const createNew = () => {
    const newIcon: CustomIcon = {
      id: `icon-${Date.now()}`,
      name: 'New 50x50 Icon',
      description: 'Fiber Network Component',
      dots: [],
      associatedCategory: categories[0] || ''
    };
    setActiveIcon(newIcon);
  };

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeIcon) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_DISPLAY_SIZE;
    canvas.height = CANVAS_DISPLAY_SIZE;

    const cellSize = CANVAS_DISPLAY_SIZE / GRID_SIZE;

    ctx.clearRect(0, 0, CANVAS_DISPLAY_SIZE, CANVAS_DISPLAY_SIZE);

    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = Math.floor(i * cellSize);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_DISPLAY_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_DISPLAY_SIZE, pos);
      ctx.stroke();
    }

    activeIcon.dots.forEach(dot => {
      ctx.fillStyle = dot.color;
      ctx.fillRect(
        Math.floor(dot.x * cellSize),
        Math.floor(dot.y * cellSize),
        Math.ceil(cellSize),
        Math.ceil(cellSize)
      );
    });
  }, [activeIcon, isDark]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const handleCanvasAction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!activeIcon || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = GRID_SIZE / rect.width;
    const scaleY = GRID_SIZE / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      const existingIndex = activeIcon.dots.findIndex(d => d.x === x && d.y === y);
      const isEraser = selectedColor === '#ffffff';

      if (isEraser) {
        if (existingIndex >= 0) {
          const newDots = activeIcon.dots.filter((_, i) => i !== existingIndex);
          setActiveIcon({ ...activeIcon, dots: newDots });
        }
      } else {
        if (existingIndex >= 0) {
          if (activeIcon.dots[existingIndex].color !== selectedColor) {
            const newDots = [...activeIcon.dots];
            newDots[existingIndex] = { x, y, color: selectedColor };
            setActiveIcon({ ...activeIcon, dots: newDots });
          }
        } else {
          setActiveIcon({ ...activeIcon, dots: [...activeIcon.dots, { x, y, color: selectedColor }] });
        }
      }
    }
  };

  const saveIcon = async () => {
    if (!activeIcon) return;
    const dataUrl = generateDataUrl(activeIcon.dots);
    const updatedIcon = { ...activeIcon, dataUrl };

    try {
      // Check if it exists in current state to decide POST vs PUT
      // Note: activeIcon.id is generated with Date.now() in createNew, technically unique.
      // But if we clicked an existing one, it matches.
      const isExisting = icons.some(i => i.id === activeIcon.id);
      const url = isExisting ? `api/icons/${activeIcon.id}` : 'api/icons';
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIcon)
      });
      if (!res.ok) throw new Error('Failed to save to server');

      setIcons(prev => {
        if (isExisting) return prev.map(i => i.id === activeIcon.id ? updatedIcon : i);
        return [...prev, updatedIcon];
      });
      alert('Icon definition saved to server.');
    } catch (e: any) {
      console.error(e);
      alert('Error saving icon: ' + e.message);
    }
  };

  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeIcon) return;

    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = GRID_SIZE;
      tempCanvas.height = GRID_SIZE;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;

      tCtx.imageSmoothingEnabled = false;
      tCtx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
      const imgData = tCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

      const newDots: IconDot[] = [];
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a > 128) {
          const pixelIdx = i / 4;
          const x = pixelIdx % GRID_SIZE;
          const y = Math.floor(pixelIdx / GRID_SIZE);
          const color = `rgb(${r},${g},${b})`;
          newDots.push({ x, y, color });
        }
      }
      setActiveIcon({ ...activeIcon, dots: newDots });
    };
    img.src = URL.createObjectURL(file);
  };

  const downloadIconImage = () => {
    if (!activeIcon) return;
    const link = document.createElement('a');
    link.download = `${activeIcon.name.replace(/\s+/g, '_')}_50x50.png`;
    link.href = generateDataUrl(activeIcon.dots);
    link.click();
  };

  const handleDuplicate = async () => {
    if (!activeIcon) return;
    if (!confirm(`Duplicate "${activeIcon.name}"?`)) return;

    const newIcon: CustomIcon = {
      ...activeIcon,
      id: `custom-${Date.now()}`, // Ensure new ID
      name: `${activeIcon.name} (Copy)`,
      isSystem: false, // Always custom
    };

    try {
      const res = await fetch('api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });
      if (!res.ok) throw new Error('Failed to save duplicate');

      setIcons(prev => [...prev, newIcon]);
      setActiveIcon(newIcon);
    } catch (err: any) {
      console.error(err);
      alert('Error duplication icon: ' + err.message);
    }
  };

  const handleToggleLock = async () => {
    if (!activeIcon) return;
    const newSystemState = !activeIcon.isSystem;
    const msg = newSystemState
      ? "Lock this icon? It will become a read-only Standard Symbol."
      : "Unlock this icon? It will become an editable Custom Icon.";

    if (!confirm(msg)) return;

    const updated = { ...activeIcon, isSystem: newSystemState };

    try {
      const res = await fetch(`api/icons/${activeIcon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Failed to update status');

      setIcons(prev => prev.map(i => i.id === activeIcon.id ? updated : i));
      setActiveIcon(updated);
    } catch (err: any) {
      console.error(err);
      alert('Error updating lock status: ' + err.message);
    }
  };

  return (
    <div className={`flex h-full overflow-hidden ${cls.root}`}>
      <div className={`w-80 border-r p-6 overflow-y-auto flex flex-col ${cls.sidebar}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-black uppercase tracking-tight ${cls.sidebarTitle}`}>Icon Library</h2>
          <button
            onClick={createNew}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-900/40"
            aria-label="Create new icon"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* System icons section */}
        {icons.some(i => i.isSystem) && (
          <div className="mb-6">
            <div className={`flex items-center gap-1.5 mb-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              <Shield size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Standard Symbols</span>
            </div>
            <div className="grid grid-cols-3 gap-2" role="list">
              {icons.filter(i => i.isSystem).map(icon => (
                <div
                  key={icon.id}
                  onClick={() => setActiveIcon(icon)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveIcon(icon)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all outline-none focus:ring-2 focus:ring-amber-500 flex flex-col items-center gap-1 ${activeIcon?.id === icon.id ? (isDark ? 'bg-amber-900/30 border-amber-600 ring-2 ring-amber-800' : 'bg-amber-50 border-amber-400 ring-2 ring-amber-200') : cls.iconItem}`}
                  aria-label={`View symbol ${icon.name}`}
                  title={icon.name}
                >
                  <div className={`w-10 h-10 border rounded-lg p-1 overflow-hidden ${cls.iconImgBg}`}>
                    {icon.dataUrl ? (
                      <img src={icon.dataUrl} className="w-full h-full object-contain" alt={icon.name} />
                    ) : (
                      <div className={`w-full h-full rounded flex items-center justify-center text-[8px] ${cls.iconNoImg}`}>SYS</div>
                    )}
                  </div>
                  <div className={`text-[8px] font-bold text-center leading-tight truncate w-full ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{icon.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {icons.some(i => i.isSystem) && icons.some(i => !i.isSystem) && (
          <div className={`border-t mb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
        )}

        {/* User icons section */}
        {icons.some(i => !i.isSystem) && (
          <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Custom Icons</div>
        )}
        <div className="space-y-3" role="list">
          {icons.filter(i => !i.isSystem).map(icon => (
            <div
              key={icon.id}
              onClick={() => setActiveIcon(icon)}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveIcon(icon)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all outline-none focus:ring-2 focus:ring-blue-500 ${activeIcon?.id === icon.id ? cls.iconItemActive : cls.iconItem}`}
              aria-label={`Edit icon ${icon.name}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 border rounded-lg p-1 overflow-hidden ${cls.iconImgBg}`}>
                    {icon.dataUrl ? (
                      <img src={icon.dataUrl} className="w-full h-full object-contain image-pixelated" alt={icon.name} />
                    ) : (
                      <div className={`w-full h-full rounded flex items-center justify-center text-[8px] ${cls.iconNoImg}`}>NO IMG</div>
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-xs truncate max-w-[120px] ${cls.iconName}`}>{icon.name}</div>
                    <div className={`text-[9px] font-bold uppercase ${cls.iconCat}`}>{icon.associatedCategory || 'Any Category'}</div>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm('Delete?')) return;
                    try {
                      const res = await fetch(`api/icons/${icon.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed to delete');
                      setIcons(prev => prev.filter(i => i.id !== icon.id));
                    } catch (err) {
                      alert('Error deleting icon');
                      console.error(err);
                    }
                  }}
                  className={`p-1.5 transition-colors ${cls.deleteBtn}`}
                  aria-label={`Delete icon ${icon.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow p-8 overflow-y-auto">
        {activeIcon?.isSystem ? (
          /* ── System icon — read-only view ─────────────────────────────── */
          <div className="max-w-md mx-auto">
            <div className={`p-8 rounded-[40px] shadow-2xl border ${cls.editorCard}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${cls.editorTitle}`}>Standard Symbol</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${cls.editorSubtitle}`}>Built-in — ไม่สามารถแก้ไขได้</p>
                </div>
              </div>

              {/* Large preview */}
              <div className="flex flex-col items-center mb-8">
                <div className={`w-40 h-40 rounded-3xl p-6 flex items-center justify-center border shadow-inner mb-4 ${cls.previewImgBg}`}>
                  {activeIcon.dataUrl && (
                    <img src={activeIcon.dataUrl} className="w-full h-full object-contain" alt={activeIcon.name} />
                  )}
                </div>
                <div className={`text-xl font-black ${cls.editorTitle}`}>{activeIcon.name}</div>
                <div className={`text-sm mt-1 ${cls.editorSubtitle}`}>{activeIcon.description}</div>
              </div>

              {/* Associated group — still editable */}
              <div>
                <label htmlFor="sys-icon-group" className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${cls.labelText}`}>กลุ่มสัญลักษณ์ / Associated Group</label>
                <div className="relative">
                  <Tag size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${cls.selectIcon}`} />
                  <select
                    id="sys-icon-group"
                    className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none ${cls.selectBg}`}
                    value={activeIcon.associatedCategory || ''}
                    onChange={e => {
                      const updated = { ...activeIcon, associatedCategory: e.target.value };
                      setActiveIcon(updated);
                      setIcons(prev => prev.map(i => i.id === updated.id ? updated : i));
                    }}
                  >
                    <option value="">— ไม่ระบุ (แสดงทั้งหมด) —</option>
                    <optgroup label="── กลุ่มสัญลักษณ์ (Symbol Groups) ──">
                      {symbolGroups.map(sg => (
                        <option key={`sg-${sg}`} value={sg}>{sg}</option>
                      ))}
                    </optgroup>
                    <optgroup label="── หมวดหมู่ Material (Categories) ──">
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <p className={`text-[9px] mt-2 font-medium px-1 ${cls.metaHint}`}>เชื่อมสัญลักษณ์นี้กับกลุ่มวัสดุ เพื่อกรองรายการวัสดุในหน้าออกแบบ</p>
              </div>

              {/* Actions */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                  onClick={handleDuplicate}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'} shadow-sm`}
                >
                  <Copy size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Duplicate</span>
                </button>

                <button
                  onClick={handleToggleLock}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'} shadow-sm group`}
                >
                  <Unlock size={20} className="text-amber-500 group-hover:text-amber-400" />
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Unlock</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeIcon ? (
          <div className="max-w-5xl mx-auto flex gap-10">
            <div className="flex-grow">
              <div className={`p-8 rounded-[40px] shadow-2xl border ${cls.editorCard}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <Palette size={24} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black tracking-tight ${cls.editorTitle}`}>Bitmap Editor</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${cls.editorSubtitle}`}>50 x 50 High Resolution</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center rounded-2xl p-2 space-x-2 border ${cls.toolbarBg}`} role="toolbar" aria-label="Color tools">
                      <div className={`flex space-x-1 pr-2 border-r ${cls.colorDivider}`}>
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white ring-2 ring-blue-500 scale-110 shadow-sm' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                            aria-label={`Select preset color ${c}`}
                            aria-pressed={selectedColor === c}
                          />
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 pl-1">
                        <div className="relative flex items-center">
                          <input
                            ref={colorPickerRef}
                            type="color"
                            className="absolute opacity-0 w-8 h-8 cursor-pointer"
                            value={selectedColor === '#ffffff' ? '#000000' : selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            aria-label="Custom color picker"
                          />
                          <button
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${selectedColor !== '#ffffff' && !PRESET_COLORS.includes(selectedColor) ? 'border-white ring-2 ring-blue-500 shadow-sm' : isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`}
                            style={{ backgroundColor: selectedColor !== '#ffffff' ? selectedColor : undefined }}
                            onClick={() => colorPickerRef.current?.click()}
                            aria-label={`Current custom color: ${selectedColor}`}
                          >
                            <Pipette size={14} className={selectedColor === '#ffffff' ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white mix-blend-difference'} />
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedColor('#ffffff')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${selectedColor === '#ffffff' ? 'bg-slate-300 border-slate-300 ring-2 ring-blue-500 shadow-sm' : isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-slate-200 border-slate-300 hover:bg-slate-300'}`}
                          aria-label="Eraser tool"
                          aria-pressed={selectedColor === '#ffffff'}
                        >
                          <Eraser size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <canvas
                    ref={canvasRef}
                    className={`w-full max-w-[600px] aspect-square mx-auto rounded-xl shadow-inner border-2 cursor-crosshair touch-none ${cls.canvas}`}
                    onMouseDown={(e) => { setIsPainting(true); handleCanvasAction(e); }}
                    onMouseMove={(e) => isPainting && handleCanvasAction(e)}
                    onMouseUp={() => setIsPainting(false)}
                    onMouseLeave={() => setIsPainting(false)}
                    onTouchStart={(e) => { setIsPainting(true); handleCanvasAction(e); }}
                    onTouchMove={(e) => isPainting && handleCanvasAction(e)}
                    onTouchEnd={() => setIsPainting(false)}
                    aria-label="Drawing canvas for bitmap icon"
                    role="img"
                  />
                  <div className={`absolute -bottom-10 left-0 right-0 text-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${cls.canvasHint}`}>
                    Click and drag to draw square pixels
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[320px] space-y-6">
              <div className={`p-6 rounded-[32px] shadow-xl border ${cls.metaCard}`}>
                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-6 flex items-center ${cls.metaTitle}`}>
                  <Info size={14} className="mr-2" /> Metadata
                </h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="icon-name" className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>Icon Name</label>
                    <input
                      id="icon-name"
                      type="text"
                      className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${cls.inputBg}`}
                      value={activeIcon.name}
                      onChange={e => setActiveIcon({ ...activeIcon, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="material-group" className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>กลุ่มสัญลักษณ์ / Associated Group</label>
                    <div className="relative">
                      <Tag size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${cls.selectIcon}`} />
                      <select
                        id="material-group"
                        className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none ${cls.selectBg}`}
                        value={activeIcon.associatedCategory}
                        onChange={e => setActiveIcon({ ...activeIcon, associatedCategory: e.target.value })}
                      >
                        <option value="">— ไม่ระบุ (แสดงทั้งหมด) —</option>
                        <optgroup label="── กลุ่มสัญลักษณ์ (Symbol Groups) ──">
                          {symbolGroups.map(sg => (
                            <option key={`sg-${sg}`} value={sg}>{sg}</option>
                          ))}
                        </optgroup>
                        <optgroup label="── หมวดหมู่ Material (Categories) ──">
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <p className={`text-[9px] mt-2 font-medium px-1 ${cls.metaHint}`}>จำกัดรายการวัสดุที่เลือกได้ในหน้าออกแบบ — เลือก Symbol Group หรือ Category</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-colors ${cls.actionBtn}`}
                    aria-label="Import image from file"
                  >
                    <Upload size={18} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Import</span>
                  </button>
                  <button
                    onClick={downloadIconImage}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-colors ${cls.actionBtn}`}
                    aria-label="Export icon as PNG"
                  >
                    <Download size={18} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Export</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport} />

                <button
                  onClick={saveIcon}
                  className="w-full mt-6 flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                  aria-label="Save icon changes"
                >
                  <Save size={18} />
                  <span>Save Definition</span>
                </button>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={handleDuplicate}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors ${cls.actionBtn}`}
                  >
                    <Copy size={14} />
                    <span className="text-[10px] font-bold uppercase">Duplicate</span>
                  </button>
                  <button
                    onClick={handleToggleLock}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors ${cls.actionBtn} hover:text-amber-500`}
                  >
                    <Lock size={14} />
                    <span className="text-[10px] font-bold uppercase">Lock</span>
                  </button>
                </div>
              </div>

              <div className={`p-8 rounded-[32px] shadow-2xl border ${cls.previewCard}`}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className={`text-[10px] font-black uppercase tracking-widest ${cls.previewTitle}`}>Render Preview</h4>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-bold border ${cls.previewBadge}`}>50x50px</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-2xl p-4 flex items-center justify-center border shadow-inner overflow-hidden mb-4 ${cls.previewImgBg}`} aria-label="Icon preview area">
                    {activeIcon.dots.length > 0 ? (
                      <img
                        src={generateDataUrl(activeIcon.dots)}
                        className="w-full h-full object-contain image-pixelated"
                        alt={`Preview of icon ${activeIcon.name}`}
                      />
                    ) : (
                      <div className={`text-xs italic font-bold ${cls.previewEmpty}`}>Canvas Empty</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-black truncate max-w-[200px] ${cls.previewName}`}>{activeIcon.name || 'Untitled'}</div>
                    <div className={`text-[10px] font-bold uppercase mt-1 ${cls.previewSubtitle}`}>Ready for BOQ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div className={`w-24 h-24 rounded-[32px] shadow-xl flex items-center justify-center mb-6 ${cls.emptyBg}`}>
              <Palette size={48} className="opacity-30" />
            </div>
            <h3 className={`text-lg font-black uppercase tracking-tighter ${cls.emptyTitle}`}>Icon Designer</h3>
            <p className={`text-sm font-medium ${cls.emptyText}`}>Select an icon from the sidebar to begin editing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconEditor;
