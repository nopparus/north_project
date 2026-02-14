import React, { useState, useRef, useEffect } from 'react';
import { CustomIcon, Material } from '../types';
import { Plus, Trash2, Save, Info, Tag, Lock, Shield, Copy, Unlock, Code2, FileImage, ChevronDown, ChevronRight, FolderPlus, Edit2, GripVertical, X, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// @ts-ignore
import ImageTracer from 'imagetracerjs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  closestCorners,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Modal Component
interface GroupModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  isDark: boolean;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, title, onClose, onSubmit, placeholder, defaultValue, isDark }) => {
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    setValue(defaultValue || '');
  }, [defaultValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const bgOverlay = isDark ? 'bg-black/50' : 'bg-black/30';
  const bgModal = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const inputBg = isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${bgOverlay}`} onClick={onClose}>
      <div className={`${bgModal} border rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw]`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${textColor}`}>{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X size={20} className={textColor} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder || 'Enter group name...'}
            className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${inputBg}`}
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl font-bold text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 px-4 py-2 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface DroppableGroupProps {
  id: string;
  children: React.ReactNode;
}

const DroppableGroup: React.FC<DroppableGroupProps> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="min-h-[50px]">{children}</div>;
};

interface IconEditorProps {
  icons: CustomIcon[];
  setIcons: React.Dispatch<React.SetStateAction<CustomIcon[]>>;
  materials: Material[];
}

interface SortableIconProps {
  icon: CustomIcon;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  cls: any;
  isDark: boolean;
}

const SortableIcon: React.FC<SortableIconProps> = ({ icon, isActive, onClick, onDelete, cls, isDark }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: icon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-2xl border cursor-pointer transition-all outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? cls.iconItemActive : cls.iconItem}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1" onClick={onClick}>
          <div className={`w-12 h-12 border rounded-lg p-1 overflow-hidden ${cls.iconImgBg}`}>
            {icon.dataUrl ? (
              <img src={icon.dataUrl} className="w-full h-full object-contain" alt={icon.name} />
            ) : (
              <div className={`w-full h-full rounded flex items-center justify-center text-[8px] ${cls.iconNoImg}`}>NO IMG</div>
            )}
          </div>
          <div className="flex-1">
            <div className={`font-bold text-xs truncate max-w-[120px] ${cls.iconName}`}>{icon.name}</div>
            <div className={`text-[9px] font-bold uppercase ${cls.iconCat}`}>{icon.associatedCategory || 'Any Category'}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            {...attributes}
            {...listeners}
            className={`p-1.5 cursor-grab active:cursor-grabbing ${cls.deleteBtn}`}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`p-1.5 transition-colors ${cls.deleteBtn}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const IconEditor: React.FC<IconEditorProps> = ({ icons, setIcons, materials }) => {
  const { isDark } = useTheme();
  const [activeIcon, setActiveIcon] = useState<CustomIcon | null>(null);
  const [svgCode, setSvgCode] = useState('');
  const [isTracing, setIsTracing] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [emptyGroups, setEmptyGroups] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalPlaceholder, setModalPlaceholder] = useState('');
  const [modalDefaultValue, setModalDefaultValue] = useState('');
  const [modalAction, setModalAction] = useState<{ type: 'create' | 'rename' | 'dropdown', oldName?: string } | null>(null);

  // Load empty groups from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emptyIconGroups');
    if (saved) {
      try {
        setEmptyGroups(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading empty groups:', e);
      }
    }
  }, []);

  // Save empty groups to localStorage
  useEffect(() => {
    localStorage.setItem('emptyIconGroups', JSON.stringify(emptyGroups));
  }, [emptyGroups]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(materials.map(m => m.category))).sort() as string[];
  const symbolGroups = Array.from(new Set(materials.map(m => m.symbol_group).filter(Boolean))).sort() as string[];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    editorCard: 'bg-slate-900 border-slate-700',
    editorTitle: 'text-white',
    editorSubtitle: 'text-slate-400',
    inputBg: 'bg-slate-800 border-slate-700 text-white',
    selectBg: 'bg-slate-800 border-slate-700 text-white',
    selectIcon: 'text-slate-400',
    metaCard: 'bg-slate-900 border-slate-700',
    metaTitle: 'text-slate-400',
    metaHint: 'text-slate-400',
    actionBtn: 'bg-slate-800 text-slate-400 hover:bg-slate-700',
    previewCard: 'bg-slate-900 border-slate-700',
    previewImgBg: 'bg-slate-800 border-slate-700',
    previewTitle: 'text-slate-400',
    previewName: 'text-white',
    previewSubtitle: 'text-slate-400',
    emptyBg: 'bg-slate-800',
    emptyTitle: 'text-slate-400',
    emptyText: 'text-slate-400',
    labelText: 'text-slate-400',
    groupHeader: 'bg-slate-800 border-slate-700 text-slate-300',
    groupTitle: 'text-slate-200',
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
    editorCard: 'bg-white border-slate-200',
    editorTitle: 'text-slate-900',
    editorSubtitle: 'text-slate-500',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    selectBg: 'bg-white border-slate-300 text-slate-900',
    selectIcon: 'text-slate-500',
    metaCard: 'bg-white border-slate-200',
    metaTitle: 'text-slate-500',
    metaHint: 'text-slate-500',
    actionBtn: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    previewCard: 'bg-white border-slate-200',
    previewImgBg: 'bg-slate-100 border-slate-200',
    previewTitle: 'text-slate-500',
    previewName: 'text-slate-900',
    previewSubtitle: 'text-slate-500',
    emptyBg: 'bg-slate-100',
    emptyTitle: 'text-slate-500',
    emptyText: 'text-slate-400',
    labelText: 'text-slate-500',
    groupHeader: 'bg-slate-100 border-slate-200 text-slate-700',
    groupTitle: 'text-slate-800',
  };

  // Helper: Decode SVG from dataUrl
  const decodeSvg = (dataUrl: string): string => {
    if (!dataUrl || !dataUrl.startsWith('data:image/svg+xml')) return '';
    const encoded = dataUrl.split(',')[1];
    return decodeURIComponent(encoded);
  };

  // Helper: Encode SVG to dataUrl
  const encodeSvg = (svg: string): string => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // Sync svgCode when activeIcon changes
  useEffect(() => {
    if (activeIcon?.dataUrl?.startsWith('data:image/svg+xml')) {
      setSvgCode(decodeSvg(activeIcon.dataUrl));
    } else {
      setSvgCode('');
    }
  }, [activeIcon?.id]);

  // Group icons (including system icons in their groups)
  const groupedIcons = icons.reduce((acc, icon) => {
    const group = icon.iconGroup || 'Ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(icon);
    return acc;
  }, {} as Record<string, CustomIcon[]>);

  // Sort icons within each group
  Object.keys(groupedIcons).forEach(group => {
    groupedIcons[group].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  });

  // Get all group names for dropdown (convert null/undefined to "Ungrouped", include empty groups)
  const allGroupNames = Array.from(
    new Set([
      ...icons.map(i => i.iconGroup || 'Ungrouped'),
      ...emptyGroups
    ])
  ).sort();

  const createNew = () => {
    const maxSortOrder = Math.max(0, ...icons.filter(i => !i.isSystem).map(i => i.sortOrder || 0));
    const newIcon: CustomIcon = {
      id: `icon-${Date.now()}`,
      name: 'New SVG Icon',
      description: 'Custom Vector Icon',
      dots: [],
      dataUrl: encodeSvg('<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" fill="#3b82f6"/></svg>'),
      associatedCategory: categories[0] || '',
      iconGroup: 'Ungrouped',
      sortOrder: maxSortOrder + 1,
      isSystem: false
    };
    setActiveIcon(newIcon);
    setSvgCode(decodeSvg(newIcon.dataUrl!));
  };

  const saveIcon = async () => {
    if (!activeIcon) return;

    const updatedIcon = { ...activeIcon, dataUrl: encodeSvg(svgCode) };

    try {
      const isExisting = icons.some(i => i.id === activeIcon.id);
      const url = isExisting ? `/app4/api/icons/${activeIcon.id}` : '/app4/api/icons';
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
      alert('Icon saved successfully.');
    } catch (e: any) {
      console.error(e);
      alert('Error saving icon: ' + e.message);
    }
  };

  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeIcon) return;

    setIsTracing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const svgString = ImageTracer.imageToSVG(img.src, {
            ltres: 1,
            qtres: 1,
            scale: 1,
            strokewidth: 0,
            linefilter: true,
            numberofcolors: 16,
            mincolorratio: 0.02,
            colorsampling: 2,
            blurradius: 0,
            blurdelta: 20
          });

          setSvgCode(svgString);
          setIsTracing(false);
        } catch (err) {
          console.error('Tracing error:', err);
          alert('Error tracing image to SVG');
          setIsTracing(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDuplicate = async () => {
    if (!activeIcon) return;
    if (!confirm(`Duplicate "${activeIcon.name}"?`)) return;

    const maxSortOrder = Math.max(0, ...icons.filter(i => !i.isSystem && i.iconGroup === activeIcon.iconGroup).map(i => i.sortOrder || 0));
    const newIcon: CustomIcon = {
      ...activeIcon,
      id: `icon-${Date.now()}`,
      name: `${activeIcon.name} (Copy)`,
      isSystem: false,
      sortOrder: maxSortOrder + 1
    };

    try {
      const res = await fetch('/app4/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });
      if (!res.ok) throw new Error('Failed to save duplicate');

      setIcons(prev => [...prev, newIcon]);
      setActiveIcon(newIcon);
    } catch (err: any) {
      console.error(err);
      alert('Error duplicating icon: ' + err.message);
    }
  };

  const handleToggleLock = async () => {
    if (!activeIcon) return;
    const newSystemState = !activeIcon.isSystem;
    const msg = newSystemState
      ? "Lock this icon? It will become read-only but stay in this group."
      : "Unlock this icon? It will become editable.";

    if (!confirm(msg)) return;

    // Keep icon in same group when locking/unlocking
    const updated = { ...activeIcon, isSystem: newSystemState };

    try {
      const res = await fetch(`/app4/api/icons/${activeIcon.id}`, {
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const draggedIcon = icons.find(i => i.id === active.id);
    const targetIcon = icons.find(i => i.id === over.id);

    if (!draggedIcon || draggedIcon.isSystem) return;

    // 1. Dropping on a group directly (over.id starts with 'group:')
    if (String(over.id).startsWith('group:')) {
      const targetGroup = String(over.id).replace('group:', '');
      const sourceGroup = draggedIcon.iconGroup || 'Ungrouped';

      if (sourceGroup === targetGroup) return;

      const targetGroupIcons = icons.filter(i => (i.iconGroup || 'Ungrouped') === targetGroup);
      const updatedIcon = { ...draggedIcon, iconGroup: targetGroup };
      const updates = [...targetGroupIcons, updatedIcon].map((icon, index) => ({
        id: icon.id,
        iconGroup: targetGroup,
        sortOrder: index
      }));

      setIcons(prev => prev.map(icon => {
        const update = updates.find(u => u.id === icon.id);
        return update ? { ...icon, iconGroup: targetGroup, sortOrder: update.sortOrder } : icon;
      }));

      try {
        await fetch('/app4/api/icons/batch/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });
      } catch (err: any) {
        console.error('Reorder error:', err);
        alert('Error saving order: ' + err.message);
        window.location.reload();
      }
      return;
    }

    // 2. Dropping on another icon
    if (!targetIcon) return;

    const targetGroup = targetIcon.iconGroup || 'Ungrouped';
    const sourceGroup = draggedIcon.iconGroup || 'Ungrouped';

    // Get all icons in target group
    const targetGroupIcons = icons.filter(i => (i.iconGroup || 'Ungrouped') === targetGroup);

    // If moving between groups
    if (sourceGroup !== targetGroup) {
      // Add dragged icon to target group
      const updatedIcon = { ...draggedIcon, iconGroup: targetGroup };
      const newGroupIcons = [...targetGroupIcons, updatedIcon];

      // Find position in target group
      const targetIndex = newGroupIcons.findIndex(i => i.id === over.id);
      const draggedIndex = newGroupIcons.findIndex(i => i.id === active.id);

      const reordered = arrayMove(newGroupIcons, draggedIndex, targetIndex);

      // Update sort orders
      const updates = reordered.map((icon, index) => ({
        id: icon.id,
        iconGroup: targetGroup,
        sortOrder: index
      }));

      // Optimistic update
      setIcons(prev => prev.map(icon => {
        const update = updates.find(u => u.id === icon.id);
        if (update) {
          return { ...icon, iconGroup: update.iconGroup, sortOrder: update.sortOrder };
        }
        return icon;
      }));

      // Save to server
      try {
        const res = await fetch('/app4/api/icons/batch/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to reorder: ${errorText}`);
        }
      } catch (err: any) {
        console.error('Reorder error:', err);
        alert('Error saving order: ' + err.message);
        // Revert on error
        window.location.reload();
      }
    } else {
      // Moving within same group
      const oldIndex = targetGroupIcons.findIndex(i => i.id === active.id);
      const newIndex = targetGroupIcons.findIndex(i => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(targetGroupIcons, oldIndex, newIndex);

      // Update sort orders
      const updates = reordered.map((icon: CustomIcon, index) => ({
        id: icon.id,
        iconGroup: icon.iconGroup,
        sortOrder: index
      }));

      // Optimistic update
      setIcons(prev => prev.map(icon => {
        const update = updates.find(u => u.id === icon.id);
        return update ? { ...icon, sortOrder: update.sortOrder } : icon;
      }));

      // Save to server
      try {
        const res = await fetch('/app4/api/icons/batch/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to reorder: ${errorText}`);
        }
      } catch (err: any) {
        console.error('Reorder error:', err);
        alert('Error saving order: ' + err.message);
        // Revert on error
        window.location.reload();
      }
    }
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleModalSubmit = async (name: string) => {
    if (!name || !name.trim()) {
      setIsModalOpen(false);
      return;
    }

    const trimmed = name.trim();

    if (modalAction?.type === 'create') {
      // Add to empty groups so it shows up in UI
      setEmptyGroups(prev => [...new Set([...prev, trimmed])]);
    } else if (modalAction?.type === 'rename') {
      const oldName = modalAction.oldName!;
      if (oldName === trimmed) {
        setIsModalOpen(false);
        return;
      }

      // Rename in empty groups if it exists there
      if (emptyGroups.includes(oldName)) {
        setEmptyGroups(prev => prev.map(g => g === oldName ? trimmed : g));
      }

      // Rename in icons
      const iconsToUpdate = icons.filter(i => (i.iconGroup || 'Ungrouped') === oldName);
      if (iconsToUpdate.length > 0) {
        const updates = iconsToUpdate.map(icon => ({
          id: icon.id,
          iconGroup: trimmed,
          sortOrder: icon.sortOrder || 0
        }));

        // Optimistic update
        setIcons(prev => prev.map(icon => {
          const update = updates.find(u => u.id === icon.id);
          return update ? { ...icon, iconGroup: trimmed } : icon;
        }));

        try {
          const res = await fetch('/app4/api/icons/batch/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
          });
          if (!res.ok) throw new Error('Failed to rename group on server');
        } catch (err: any) {
          console.error(err);
          alert('Error renaming group: ' + err.message);
          window.location.reload();
        }
      }
    } else if (modalAction?.type === 'dropdown') {
      if (activeIcon) {
        setActiveIcon({ ...activeIcon, iconGroup: trimmed });
        // Also add to empty groups so it doesn't disappear from dropdown
        setEmptyGroups(prev => [...new Set([...prev, trimmed])]);
      }
    }

    setIsModalOpen(false);
  };

  const openCreateGroupModal = () => {
    setModalTitle('Create New Group');
    setModalPlaceholder('Enter new group name...');
    setModalDefaultValue('');
    setModalAction({ type: 'create' });
    setIsModalOpen(true);
  };

  const openRenameGroupModal = (oldName: string) => {
    setModalTitle('Rename Group');
    setModalPlaceholder('Enter new group name...');
    setModalDefaultValue(oldName);
    setModalAction({ type: 'rename', oldName });
    setIsModalOpen(true);
  };

  const createGroup = () => {
    openCreateGroupModal();
  };

  const renameGroup = (oldName: string) => {
    openRenameGroupModal(oldName);
  };

  const deleteGroup = async (groupName: string) => {
    if (!confirm(`Delete group "${groupName}"? Icons will be moved to "Ungrouped".`)) return;

    // Remove from empty groups if it exists there
    if (emptyGroups.includes(groupName)) {
      setEmptyGroups(prev => prev.filter(g => g !== groupName));
    }

    const iconsInGroup = groupedIcons[groupName] || [];
    if (iconsInGroup.length > 0) {
      const updates = iconsInGroup.map((icon, index) => ({
        id: icon.id,
        iconGroup: 'Ungrouped',
        sortOrder: icon.sortOrder || index
      }));

      try {
        const res = await fetch('/app4/api/icons/batch/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });
        if (!res.ok) throw new Error('Failed to delete group');

        setIcons(prev => prev.map(icon => {
          const update = updates.find(u => u.id === icon.id);
          return update ? { ...icon, iconGroup: 'Ungrouped' } : icon;
        }));
      } catch (err) {
        console.error('Delete group error:', err);
        alert('Error deleting group');
      }
    }
  };

  return (
    <div className={`flex h-full overflow-hidden ${cls.root}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r p-6 overflow-y-auto flex flex-col ${cls.sidebar}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-black uppercase tracking-tight ${cls.sidebarTitle}`}>Icon Library</h2>
          <div className="flex space-x-2">
            <button
              onClick={createGroup}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-shadow shadow-lg"
              title="Create new group"
            >
              <FolderPlus size={20} />
            </button>
            <button
              onClick={createNew}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow shadow-lg"
              title="Create new icon"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Grouped icons with drag-and-drop */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex-1 space-y-4">
            {allGroupNames.map(groupName => {
              const groupIcons = groupedIcons[groupName] || [];
              const isCollapsed = collapsedGroups.has(groupName);
              const systemCount = groupIcons.filter(i => i.isSystem).length;
              const customCount = groupIcons.filter(i => !i.isSystem).length;

              return (
                <div key={groupName} className="mb-2">
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${cls.groupHeader}`}
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      <span className={`text-xs font-bold truncate ${cls.groupTitle}`}>{groupName}</span>
                      <span className="text-[10px] opacity-60 flex-shrink-0">
                        ({systemCount > 0 && `${systemCount}🔒`} {customCount > 0 && `${customCount}✏️`}{groupIcons.length === 0 && 'Empty'})
                      </span>
                    </div>
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => renameGroup(groupName)}
                        className="p-1 hover:bg-slate-700/20 rounded"
                        title="Rename group"
                      >
                        <Edit2 size={12} />
                      </button>
                      {groupName !== 'Ungrouped' && (
                        <button
                          onClick={() => deleteGroup(groupName)}
                          className="p-1 hover:bg-red-700/20 rounded text-red-500"
                          title="Delete group"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {!isCollapsed && (
                    <DroppableGroup id={`group:${groupName}`}>
                      <div className="mt-2 space-y-2 ml-4 min-h-[50px]">
                        {groupIcons.length === 0 ? (
                          <div className={`text-[10px] italic p-4 rounded-xl border border-dashed ${isDark ? 'border-slate-700' : 'border-slate-300'} ${cls.emptyText} flex flex-col items-center justify-center opacity-60`}>
                            <FolderPlus size={16} className="mb-1 opacity-40" />
                            No icons in this group
                          </div>
                        ) : (
                          <SortableContext items={groupIcons.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {groupIcons.map(icon => (
                              <SortableIcon
                                key={icon.id}
                                icon={icon}
                                isActive={activeIcon?.id === icon.id}
                                onClick={() => {
                                  setActiveIcon(icon);
                                  setSvgCode(decodeSvg(icon.dataUrl!));
                                }}
                                onDelete={async () => {
                                  if (!confirm('Delete?')) return;
                                  try {
                                    const res = await fetch(`/app4/api/icons/${icon.id}`, { method: 'DELETE' });
                                    if (!res.ok) throw new Error('Failed to delete');
                                    setIcons(prev => prev.filter(i => i.id !== icon.id));
                                    if (activeIcon?.id === icon.id) setActiveIcon(null);
                                  } catch (err: any) {
                                    console.error('Delete error:', err);
                                    alert('Error deleting icon: ' + err.message);
                                  }
                                }}
                                cls={cls}
                                isDark={isDark}
                              />
                            ))}
                          </SortableContext>
                        )}
                      </div>
                    </DroppableGroup>
                  )}
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* Main Editor Area */}
      <div className="flex-grow p-8 overflow-y-auto">
        {activeIcon ? (
          <div className="max-w-5xl mx-auto flex gap-10">
            <div className="flex-grow">
              <div className={`p-8 rounded-[40px] shadow-2xl border ${cls.editorCard}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <Code2 size={24} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black tracking-tight ${cls.editorTitle}`}>SVG Code Editor</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${cls.editorSubtitle}`}>
                        {activeIcon.isSystem ? '🔒 Read-Only' : 'Vector Graphics'}
                      </p>
                    </div>
                  </div>
                </div>

                <textarea
                  value={svgCode}
                  onChange={(e) => setSvgCode(e.target.value)}
                  disabled={activeIcon.isSystem}
                  className={`w-full h-[500px] p-6 rounded-xl border-2 font-mono text-sm ${cls.inputBg} focus:ring-2 focus:ring-blue-500/30 outline-none resize-none ${activeIcon.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="<svg>...</svg>"
                  spellCheck={false}
                />

                <div className={`mt-6 p-6 rounded-xl border ${cls.previewImgBg} flex items-center justify-center`}>
                  <div className="w-32 h-32">
                    {svgCode && (
                      <img
                        src={encodeSvg(svgCode)}
                        alt="SVG Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
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
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${cls.labelText}`}>Icon Name</label>
                    <input
                      type="text"
                      disabled={activeIcon.isSystem}
                      className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${cls.inputBg} ${activeIcon.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={activeIcon.name}
                      onChange={e => setActiveIcon({ ...activeIcon, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5 ${cls.labelText}`}>
                      Palette Group (หมวดหมู่ใน Palette)
                      <div className="group relative">
                        <Info size={11} className="cursor-help opacity-60 hover:opacity-100" />
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg text-[10px] font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                          กำหนดกลุ่มที่ไอคอนนี้จะไปปรากฏในหน้า Network Design Palette
                        </div>
                      </div>
                    </label>
                    <select
                      className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/30 ${cls.selectBg}`}
                      value={activeIcon.iconGroup || 'Ungrouped'}
                      onChange={e => {
                        const selectedValue = e.target.value;
                        if (selectedValue === '__new__') {
                          setModalTitle('Create New Group');
                          setModalPlaceholder('Enter group name...');
                          setModalDefaultValue('');
                          setModalAction({ type: 'dropdown' });
                          setIsModalOpen(true);
                        } else {
                          setActiveIcon({ ...activeIcon, iconGroup: selectedValue });
                        }
                      }}
                    >
                      {allGroupNames.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                      <option value="__new__">+ Create New Group...</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5 ${cls.labelText}`}>
                      Link to Material Category (เชื่อมโยงหมวดหมู่)
                      <div className="group relative">
                        <Info size={11} className="cursor-help opacity-60 hover:opacity-100" />
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg text-[10px] font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                          ระบุว่าไอคอนนี้สัมพันธ์กับวัสดุประเภทใด เพื่อช่วยกรองรายการวัสดุเมื่อนำไปใช้งาน
                        </div>
                      </div>
                    </label>
                    <div className="relative">
                      <Tag size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${cls.selectIcon}`} />
                      <select
                        className={`w-full border rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none ${cls.selectBg}`}
                        value={activeIcon.associatedCategory}
                        onChange={e => setActiveIcon({ ...activeIcon, associatedCategory: e.target.value })}
                      >
                        <option value="">— ไม่ระบุ —</option>
                        <optgroup label="Symbol Groups">
                          {symbolGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
                        </optgroup>
                        <optgroup label="Categories">
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {!activeIcon.isSystem && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isTracing}
                      className={`w-full flex items-center justify-center space-x-3 p-4 rounded-2xl transition-colors ${cls.actionBtn} ${isTracing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FileImage size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {isTracing ? 'Tracing...' : 'Import Image → SVG'}
                      </span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport} />

                  <button
                    onClick={saveIcon}
                    className="w-full mt-4 flex items-center justify-center space-x-3 p-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                  >
                    <Save size={18} />
                    <span>Save {activeIcon.isSystem ? 'Metadata' : 'Icon'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={handleDuplicate} className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors ${cls.actionBtn}`}>
                    <Copy size={14} />
                    <span className="text-[10px] font-bold uppercase">Duplicate</span>
                  </button>
                  <button onClick={handleToggleLock} className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors ${cls.actionBtn} hover:text-amber-500`}>
                    {activeIcon.isSystem ? <Unlock size={14} /> : <Lock size={14} />}
                    <span className="text-[10px] font-bold uppercase">{activeIcon.isSystem ? 'Unlock' : 'Lock'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div className={`w-24 h-24 rounded-[32px] shadow-xl flex items-center justify-center mb-6 ${cls.emptyBg}`}>
              <Code2 size={48} className="opacity-30" />
            </div>
            <h3 className={`text-lg font-black uppercase tracking-tighter ${cls.emptyTitle}`}>SVG Icon Editor</h3>
            <p className={`text-sm font-medium ${cls.emptyText}`}>Select an icon from the sidebar to begin editing</p>
          </div>
        )}
      </div>

      {/* Group Name Modal */}
      <GroupModal
        isOpen={isModalOpen}
        title={modalTitle}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        placeholder={modalPlaceholder}
        defaultValue={modalDefaultValue}
        isDark={isDark}
      />
    </div>
  );
};

export default IconEditor;
