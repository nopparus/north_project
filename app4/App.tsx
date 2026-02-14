
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Database, FileText, PenTool, Printer, Save, Palette, Shield, User, ShieldCheck, Sun, Moon, ChevronDown, FolderOpen, Plus, Trash2, Map as MapIcon, Upload } from 'lucide-react';
import DesignCanvas from './pages/DesignCanvas';
import DatabasePage from './pages/Database';
import BOQSummary from './pages/BOQSummary';
import IconEditor from './pages/IconEditor';
import NetworkPrintModal from './pages/NetworkPrintModal';
import { ProjectState, Material, CustomIcon, IconDot, SavedProject } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';


const generateBox = (xStart: number, yStart: number, width: number, height: number, color: string): IconDot[] => {
  const dots: IconDot[] = [];
  for (let x = xStart; x < xStart + width; x++) {
    for (let y = yStart; y < yStart + height; y++) {
      dots.push({ x, y, color });
    }
  }
  return dots;
};

const generateCircle = (cx: number, cy: number, r: number, color: string): IconDot[] => {
  const dots: IconDot[] = [];
  for (let x = cx - r; x <= cx + r; x++) {
    for (let y = cy - r; y <= cy + r; y++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) dots.push({ x, y, color });
    }
  }
  return dots;
};

const AppContent: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('fiber_is_admin') === 'true';
  });

  /* 
   * Materials State Management (Migrated to Server-Side DB)
   * 
   * OLD LOGIC: Read from localStorage -> if empty, use INITIAL_MATERIALS
   * NEW LOGIC: Initialize empty array -> Fetch from API on mount
   */
  const [materials, setMaterials] = useState<Material[]>([]);
  const isMaterialLoaded = useRef(false);

  // Fetch materials from API on startup
  useEffect(() => {
    if (isMaterialLoaded.current) return;
    isMaterialLoaded.current = true;

    fetch('/app4/api/materials')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch materials');
        return res.json();
      })
      .then(data => {
        // Convert numeric strings to numbers if DB returns them as strings (pg default for decimal)
        const parsed = data.map((m: any) => ({
          ...m,
          id: Number(m.id),
          unit_price: Number(m.unit_price),
          cable_unit_price: Number(m.cable_unit_price),
          labor_unit_price: Number(m.labor_unit_price),
        }));
        setMaterials(parsed);
      })
      .catch(err => {
        console.error("Error loading materials:", err);
        // User requested "Database on server only", so we do NOT fall back to local constants.
        // We set empty list or handle error UI.
        setMaterials([]);
      });
  }, []);

  // Icons state - initially just system icons until fetched
  const [icons, setIcons] = useState<CustomIcon[]>([]);
  const isIconsLoaded = useRef(false);

  useEffect(() => {
    if (isIconsLoaded.current) return;
    isIconsLoaded.current = true;

    const fetchAndMigrateIcons = async () => {
      try {
        const res = await fetch('/app4/api/icons');
        if (!res.ok) throw new Error('Failed to fetch icons');
        const serverIcons: CustomIcon[] = await res.json();

        // Migration Check: If server empty but localStorage has data
        const localSaved = localStorage.getItem('fiber_icons');
        if (serverIcons.length === 0 && localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed)) {
              const userIcons = parsed.filter((i: any) => !i.isSystem && !i.id.startsWith('sys-'));
              if (userIcons.length > 0) {
                console.log("Migrating icons to server...");
                // Migrate one by one
                for (const icon of userIcons) {
                  await fetch('/app4/api/icons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(icon)
                  });
                }
                const newRes = await fetch('/app4/api/icons');
                const newIcons = await newRes.json();
                setIcons(newIcons);
                // localStorage.removeItem('fiber_icons'); // Optional: keep as backup or remove? prefer remove to be clean
                return;
              }
            }
          } catch (e) {
            console.error("Migration failed:", e);
          }
        }

        // Normal load
        setIcons(serverIcons);
      } catch (err) {
        console.error("Error loading icons:", err);
      }
    };

    fetchAndMigrateIcons();
  }, []);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Fetch projects from server on mount
  useEffect(() => {
    fetch('/app4/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Parse state if it's a string (though our API parses it before sending, check index.js)
          // The API we wrote: res.json(projects) where project.state is already parsed.
          // But let's be safe.
          setSavedProjects(data);

          // If we have an active ID in LS (or just use first), set it.
          // User might want to keep active ID logic or reset. 
          // Let's keep active ID in LS for convenience (it's essentially a session preference), 
          // or just pick the first one. User said "Remove client DB", session prefs are usually ok.
          // But to be strict, let's just pick the first one if the current active one isn't found.
          const storedId = localStorage.getItem('fiber_active_project_id');
          const found = data.find((p: any) => p.id === storedId);
          if (found) {
            // It will be set by state initializer? No, initializer ran already.
            // We need to set it here if we want to ensure it matches.
            // But activeProjectId state is already set.
          } else if (data.length > 0) {
            setActiveProjectId(data[0].id);
          }
        }
      })
      .catch(err => console.error("Failed to load projects:", err));
  }, []);

  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    localStorage.getItem('fiber_active_project_id') || ''
  );

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [showNetworkPrint, setShowNetworkPrint] = useState(false);
  const [kmlExporting, setKmlExporting] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectProvince, setNewProjectProvince] = useState('');
  const [newProjectBudgetYear, setNewProjectBudgetYear] = useState(() => String(new Date().getFullYear() + 544));
  const [newProjectArea, setNewProjectArea] = useState('');
  const [newProjectWorkType, setNewProjectWorkType] = useState<'ทดแทนของเดิม' | 'ขอพาดสายสื่อสารใหม่'>('ทดแทนของเดิม');

  const [project, setProject] = useState<ProjectState>(() => {
    // Initial state can be empty or default, will be populated by useEffect when savedProjects loads
    return { nodes: [], edges: [] };
  });

  const isLoadingProject = useRef(false);
  const importProjectRef = useRef<HTMLInputElement>(null);

  // Sync project state when active project changes
  useEffect(() => {
    const active = savedProjects.find(p => p.id === activeProjectId);
    if (active) {
      isLoadingProject.current = true;
      setProject(active.state);
    }
  }, [activeProjectId]);

  // Auto-save project state back to savedProjects when project changes
  useEffect(() => {
    if (isLoadingProject.current) {
      isLoadingProject.current = false;
      return;
    }

    // 1. Update local list state for UI responsiveness
    setSavedProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, state: project } : p
    ));

    // 2. Debounce save to server
    const timer = setTimeout(() => {
      const currentProj = savedProjects.find(p => p.id === activeProjectId);
      if (currentProj) {
        // Construct the payload. Note: currentProj from closure might be stale regarding 'state',
        // but we have the latest 'project' state here.
        // We need updated metadata (name etc) which might have changed?
        // Usually only state changes here.

        // To be safe, we should use functional update or refs, but for now:
        const payload = { ...currentProj, state: project };

        fetch(`/app4/api/projects/${activeProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(e => console.error("Auto-save failed:", e));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [project]);

  // Removed localStorage sync
  // useEffect(() => {
  //   localStorage.setItem('fiber_saved_projects', JSON.stringify(savedProjects));
  // }, [savedProjects]);

  useEffect(() => {
    localStorage.setItem('fiber_active_project_id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    // Only persist user-created icons; system icons are always regenerated from SYSTEM_ICONS constant
    localStorage.setItem('fiber_icons', JSON.stringify(icons.filter(i => !i.isSystem)));
  }, [icons]);

  useEffect(() => {
    localStorage.setItem('fiber_is_admin', isAdmin.toString());
  }, [isAdmin]);

  // Migration: Ensure all icons have dataUrl computed from dots
  useEffect(() => {
    const needsDataUrl = icons.some(i => !i.dataUrl && i.dots && i.dots.length > 0);
    if (needsDataUrl) {
      const updatedIcons = icons.map(icon => {
        if (!icon.dataUrl && icon.dots && icon.dots.length > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = 50;
          canvas.height = 50;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            icon.dots.forEach(dot => {
              ctx.fillStyle = dot.color;
              ctx.fillRect(dot.x, dot.y, 1, 1);
            });
            return { ...icon, dataUrl: canvas.toDataURL() };
          }
        }
        return icon;
      });
      setIcons(updatedIcons);
    }
  }, [icons]);

  const handleSave = () => {
    // sync latest state first
    setSavedProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, state: project } : p));
    // open save-as modal
    const activeProj = savedProjects.find(p => p.id === activeProjectId);
    setSaveFileName(activeProj?.name || 'project');
    setIsSaveModalOpen(true);
  };

  const handleDownloadProject = (e: React.FormEvent) => {
    e.preventDefault();
    const activeProj = savedProjects.find(p => p.id === activeProjectId);
    if (!activeProj) return;
    const data = { ...activeProj, state: project };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveFileName.replace(/[\\/]/g, '_') || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsSaveModalOpen(false);
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string) as SavedProject;
        // Basic validation
        if (!data.state || !Array.isArray(data.state.nodes)) throw new Error('ไฟล์ไม่ถูกต้อง');

        const newId = `proj-${Date.now()}`;
        const imported: SavedProject = { ...data, id: newId, name: data.name || file.name.replace('.json', '') };

        // Optimistic update
        setSavedProjects(prev => [...prev, imported]);
        setActiveProjectId(newId);

        // Sync to Server
        fetch('/app4/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported)
        }).catch(err => {
          console.error("Import sync failed:", err);
          alert("บันทึกไปยัง Server ไม่สำเร็จ แต่ใช้งานได้ชั่วคราว");
        });

      } catch (err: any) {
        alert(`นำเข้าไม่สำเร็จ: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSwitchProject = (id: string) => {
    setSavedProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, state: project } : p));
    setActiveProjectId(id);
    setIsProjectDropdownOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `proj-${Date.now()}`;
    const newProj: SavedProject = {
      id,
      name: newProjectName,
      description: '',
      createdAt: new Date().toISOString(),
      state: { nodes: [], edges: [] },
      province: newProjectProvince,
      budgetYear: newProjectBudgetYear,
      area: newProjectArea,
      workType: newProjectWorkType,
    };

    // Optimistic update
    setSavedProjects(prev => [...prev, newProj]);
    setActiveProjectId(id);

    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectProvince('');
    setNewProjectBudgetYear(String(new Date().getFullYear() + 544));
    setNewProjectArea('');
    setNewProjectWorkType('ทดแทนของเดิม');

    // Server Sync
    fetch('/app4/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj)
    }).catch(err => console.error("Create project failed:", err));
  };

  const handleDeleteProject = (id: string) => {
    const proj = savedProjects.find(p => p.id === id);
    if (!proj) return;

    setProjectToDelete(proj);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;

    const remaining = savedProjects.filter(p => p.id !== projectToDelete.id);
    setSavedProjects(remaining);

    if (activeProjectId === projectToDelete.id) {
      if (remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      } else {
        setActiveProjectId('');
        // Reset project state to empty
        setProject({ nodes: [], edges: [] });
        // Remove from local storage
        localStorage.removeItem('fiber_active_project_id');
      }
    }

    // Server Sync
    fetch(`/app4/api/projects/${projectToDelete.id}`, { method: 'DELETE' })
      .catch(err => console.error("Delete failed:", err));

    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // ── KML Export ────────────────────────────────────────────────────────────
  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const handleExportKML = async () => {
    const projectName = savedProjects.find(p => p.id === activeProjectId)?.name || 'FiberFlow Network';

    // Build map: nodeId → {lat, lng} for nodes that have valid coordinates
    const nodeCoords: Record<string, { lat: number; lng: number }> = {};
    project.nodes.forEach(node => {
      const lat = parseFloat(node.metadata?.lat || '');
      const lng = parseFloat(node.metadata?.lng || '');
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        nodeCoords[node.id] = { lat, lng };
      }
    });

    const nodesWithCoords = project.nodes.filter(n => nodeCoords[n.id]);
    const edgesWithCoords = project.edges.filter(e => nodeCoords[e.source] && nodeCoords[e.target]);

    if (nodesWithCoords.length === 0) {
      alert('ยังไม่มีอุปกรณ์ที่ระบุพิกัด GPS\nกรุณาดับเบิลคลิกที่อุปกรณ์แต่ละตัวเพื่อใส่ Latitude / Longitude ก่อน');
      return;
    }

    setKmlExporting(true);

    // ── OSRM routing helper ────────────────────────────────────────────────────
    const fetchOSRMCoords = async (
      s: { lat: number; lng: number },
      t: { lat: number; lng: number }
    ): Promise<string> => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${s.lng},${s.lat};${t.lng},${t.lat}?overview=full&geometries=geojson`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates;
        if (!coords || coords.length === 0) throw new Error('no route');
        return coords.map(c => `${c[0]},${c[1]},0`).join(' ');
      } catch {
        // Fallback: straight line
        return `${s.lng},${s.lat},0 ${t.lng},${t.lat},0`;
      }
    };

    // Node styles by type
    const typeColor: Record<string, string> = {
      EXCHANGE: 'ff0000ff', CABINET: 'ff004080', ODP: 'ff008080',
      SDP: 'ff209020', TOT_POLE: 'ff60b0ff', MANHOLE: 'ff404040',
      DP: 'ff0040c0', BRANCH_JOINT: 'ff606060', STRAIGHT_JOINT: 'ff808080',
    };

    const nodeStyles = [...new Set(nodesWithCoords.map(n => n.type))].map((type: any) => {
      const color = typeColor[type] || 'ff0000ff';
      return `    <Style id="s-${type}">
      <IconStyle>
        <color>${color}</color>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href></Icon>
        <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>`;
    }).join('\n');

    const lineStyle = `    <Style id="s-fiber">
      <LineStyle><color>ff0080ff</color><width>3</width></LineStyle>
    </Style>`;

    const nodesKML = nodesWithCoords.map(node => {
      const { lat, lng } = nodeCoords[node.id];
      const mat = materials.find(m => m.id === node.materialId);
      const desc = [
        mat ? `วัสดุ: ${mat.material_name}` : '',
        node.quantity ? `จำนวน: ${node.quantity} ${mat?.unit || ''}` : '',
        `พิกัด: ${lat}, ${lng}`,
      ].filter(Boolean).join('&#10;');
      return `    <Placemark>
      <name>${escapeXml(node.label)}</name>
      <description>${escapeXml(desc)}</description>
      <styleUrl>#s-${node.type}</styleUrl>
      <Point><coordinates>${lng},${lat},0</coordinates></Point>
    </Placemark>`;
    }).join('\n');

    // Fetch OSRM routes for all edges in parallel
    const edgeRoutedCoords = await Promise.all(
      edgesWithCoords.map(edge => fetchOSRMCoords(nodeCoords[edge.source], nodeCoords[edge.target]))
    );

    const edgesKML = edgesWithCoords.map((edge, i) => {
      const srcNode = project.nodes.find(n => n.id === edge.source);
      const tgtNode = project.nodes.find(n => n.id === edge.target);
      const mat = materials.find(m => m.id === edge.materialId);
      const name = `${srcNode?.label || ''} → ${tgtNode?.label || ''} (${edge.distance}M)`;
      const desc = mat ? `${mat.material_name} — ${edge.distance} เมตร` : `${edge.distance} เมตร`;
      return `    <Placemark>
      <name>${escapeXml(name)}</name>
      <description>${escapeXml(desc)}</description>
      <styleUrl>#s-fiber</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${edgeRoutedCoords[i]}</coordinates>
      </LineString>
    </Placemark>`;
    }).join('\n');

    const skippedNodes = project.nodes.length - nodesWithCoords.length;
    const skippedEdges = project.edges.length - edgesWithCoords.length;
    const noteLines = [];
    if (skippedNodes > 0) noteLines.push(`• อุปกรณ์ไม่มีพิกัด: ${skippedNodes} รายการ (ไม่ถูก export)`);
    if (skippedEdges > 0) noteLines.push(`• เส้นสายไม่ครบพิกัด: ${skippedEdges} เส้น (ไม่ถูก export)`);

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(projectName)}</name>
    <description>สร้างโดย FiberFlow BOQ Planner (เส้นทางตามถนน OSRM)&#10;${noteLines.join('&#10;')}</description>
${nodeStyles}
${lineStyle}
    <Folder>
      <name>อุปกรณ์ (Nodes)</name>
${nodesKML}
    </Folder>
    <Folder>
      <name>เส้นสาย (Cables)</name>
${edgesKML}
    </Folder>
  </Document>
</kml>`;

    setKmlExporting(false);

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/[\s/\\]/g, '_')}_network.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ExportKMLButton = () => {
    const location = useLocation();
    if (location.pathname !== '/') return null;
    return (
      <button
        onClick={handleExportKML}
        disabled={kmlExporting}
        title={kmlExporting ? 'กำลังคำนวณเส้นทางตามถนน (OSRM)...' : 'Export เส้นทางตามถนนเป็น KML สำหรับ Google Earth'}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-wait transition-all text-sm font-medium shadow-lg shadow-emerald-600/20"
      >
        {kmlExporting ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span>กำลัง Route...</span>
          </>
        ) : (
          <>
            <MapIcon size={16} />
            <span>KML</span>
          </>
        )}
      </button>
    );
  };

  const PrintButton = () => {
    const location = useLocation();
    const isDesign = location.pathname === '/';
    return (
      <button
        onClick={() => isDesign ? setShowNetworkPrint(true) : window.print()}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-all text-sm font-medium shadow-lg shadow-indigo-600/20"
      >
        <Printer size={16} />
        <span>Print</span>
      </button>
    );
  };

  const NavItem = ({ to, icon: Icon, label, hidden }: { to: string; icon: any; label: string; hidden?: boolean }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    if (hidden) return null;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${isActive
          ? 'bg-blue-600 text-white shadow-md'
          : isDark
            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
      >
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  const location = useLocation();
  const isNetworkDesignPage = location.pathname === '/';

  return (
    <div className={`flex flex-col min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <header className={`no-print backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>FiberFlow BOQ</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Planner</p>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all max-w-[200px] ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <FolderOpen size={15} className="shrink-0 text-blue-500" />
              <span className="truncate">{savedProjects.find(p => p.id === activeProjectId)?.name || 'No Project'}</span>
              <ChevronDown size={14} className="shrink-0" />
            </button>
            {isProjectDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-72 rounded-xl border shadow-2xl z-[200] overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500 border-b border-slate-800' : 'text-slate-400 border-b border-slate-100'}`}>โปรเจกต์ทั้งหมด</div>
                {savedProjects.map(p => (
                  <div key={p.id} className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all ${p.id === activeProjectId ? 'bg-blue-600 text-white' : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <span className="text-sm font-medium truncate flex-1" onClick={() => handleSwitchProject(p.id)}>{p.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className={`ml-2 p-1 rounded opacity-50 hover:opacity-100 ${p.id === activeProjectId ? 'hover:bg-blue-500' : 'hover:bg-red-500 hover:text-white'}`}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <div className={`border-t px-3 py-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button onClick={() => { setIsNewProjectModalOpen(true); setIsProjectDropdownOpen(false); }} className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-400 font-medium w-full">
                    <Plus size={14} />
                    <span>สร้างโปรเจกต์ใหม่</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex space-x-2">
          <NavItem to="/" icon={PenTool} label="Network Design" />
          <NavItem to="/icons" icon={Palette} label="Icon Creator" hidden={!isAdmin} />
          <NavItem to="/database" icon={Database} label="Material Database" hidden={!isAdmin} />
          <NavItem to="/boq" icon={FileText} label="BOQ Summary" />
        </nav>

        <div className="flex items-center space-x-3">
          {/* Admin Toggle */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all text-xs font-black uppercase tracking-tighter border ${isAdmin ? 'bg-amber-900/30 border-amber-700/50 text-amber-400' : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'}`}
          >
            {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
            <span>{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            aria-label="Toggle light/dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <input ref={importProjectRef} type="file" accept=".json" className="hidden" onChange={handleImportProject} />

          {/* Show Import/Save buttons only on Network Design page */}
          {isNetworkDesignPage && (
            <>
              <button onClick={() => importProjectRef.current?.click()} className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-all text-sm font-medium ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`} title="นำเข้าโปรเจกต์จากไฟล์ .json">
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button onClick={handleSave} className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-all text-sm font-medium ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`} title="บันทึกโปรเจกต์นี้เป็นไฟล์ .json">
                <Save size={16} />
                <span>Save</span>
              </button>
            </>
          )}
          <ExportKMLButton />
          <PrintButton />
        </div>
      </header>

      <main className={`flex-grow flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Routes>
          <Route path="/" element={<DesignCanvas project={project} setProject={setProject} materials={materials} customIcons={icons} />} />
          <Route path="/icons" element={<IconEditor icons={icons} setIcons={setIcons} materials={materials} />} />
          <Route path="/database" element={<DatabasePage materials={materials} setMaterials={setMaterials} icons={icons} setIcons={setIcons} isAdmin={isAdmin} savedProjects={savedProjects} setSavedProjects={setSavedProjects} />} />
          <Route path="/boq" element={<BOQSummary project={project} materials={materials} savedProject={savedProjects.find(p => p.id === activeProjectId)} />} />
        </Routes>
      </main>

      {/* Network Print Modal — rendered at root level to escape header's backdrop-blur stacking context */}
      {showNetworkPrint && (
        <NetworkPrintModal
          project={project}
          materials={materials}
          savedProject={savedProjects.find(p => p.id === activeProjectId)}
          customIcons={icons}
          onClose={() => setShowNetworkPrint(false)}
        />
      )}

      {/* ── Save-as modal ──────────────────────────────────────────────────── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`px-6 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>บันทึกโปรเจกต์เป็นไฟล์</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ไฟล์ .json สามารถ Import กลับมาใช้ได้ทุกเครื่อง</p>
            </div>
            <form onSubmit={handleDownloadProject} className="p-6 space-y-4">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ชื่อไฟล์</label>
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    required
                    value={saveFileName}
                    onChange={e => setSaveFileName(e.target.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>.json</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsSaveModalOpen(false)} className={`flex-1 py-2.5 rounded-xl border font-bold text-sm ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>ยกเลิก</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25">
                  <Save size={14} />
                  ดาวน์โหลด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-lg shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>สร้างโปรเจกต์ใหม่</h3>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">

              {/* ชื่อโปรเจกต์ */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ชื่อโปรเจกต์ / สัญญา <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="เช่น งานสร้างข่ายสายใยแก้วนำแสง OFC 48F..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
              </div>

              {/* จังหวัด + งบประมาณปี */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>จังหวัด</label>
                  <input
                    list="province-list"
                    value={newProjectProvince}
                    onChange={e => setNewProjectProvince(e.target.value)}
                    placeholder="เลือกหรือพิมพ์จังหวัด"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                  />
                  <datalist id="province-list">
                    {['กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'].map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>งบประมาณประจำปี พ.ศ.</label>
                  <input
                    type="text"
                    value={newProjectBudgetYear}
                    onChange={e => setNewProjectBudgetYear(e.target.value)}
                    placeholder="2570"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>

              {/* พื้นที่ */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>พื้นที่ / หน่วยงาน</label>
                <input
                  type="text"
                  value={newProjectArea}
                  onChange={e => setNewProjectArea(e.target.value)}
                  placeholder="เช่น ส่วนขายและบริการลูกค้า เชียงใหม่"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
              </div>

              {/* ประเภทงาน */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ประเภทงาน</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ทดแทนของเดิม', 'ขอพาดสายสื่อสารใหม่'] as const).map(opt => (
                    <button
                      key={opt} type="button"
                      onClick={() => setNewProjectWorkType(opt)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${newProjectWorkType === opt
                        ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : isDark ? 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setIsNewProjectModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25">สร้าง</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`rounded-xl w-full max-w-sm shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>ยืนยันการลบโปรเจกต์?</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                คุณกำลังจะลบโปรเจกต์ <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{projectToDelete.name}"</span>
                <br />การกระทำนี้ไม่สามารถเรียกคืนได้
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-lg border font-bold text-sm ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteProject}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  ลบโปรเจกต์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
