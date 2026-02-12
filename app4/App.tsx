
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Database, FileText, PenTool, Printer, Save, Palette, Shield, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import DesignCanvas from './pages/DesignCanvas';
import DatabasePage from './pages/Database';
import BOQSummary from './pages/BOQSummary';
import IconEditor from './pages/IconEditor';
import { INITIAL_MATERIALS } from './constants';
import { ProjectState, Material, CustomIcon, IconDot } from './types';
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

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('fiber_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [icons, setIcons] = useState<CustomIcon[]>(() => {
    const saved = localStorage.getItem('fiber_icons');
    if (saved) return JSON.parse(saved);

    // Default library based on professional symbols
    return [
      {
        id: 'exch-1',
        name: 'Telephone Exchange',
        description: 'Main Hub',
        dots: [
          ...generateBox(10, 10, 30, 30, '#1e293b'),
          ...generateBox(15, 15, 20, 20, '#ffffff'),
          { x: 15, y: 15, color: '#1e293b' }, { x: 34, y: 34, color: '#1e293b' },
          { x: 34, y: 15, color: '#1e293b' }, { x: 15, y: 34, color: '#1e293b' },
          ...generateBox(20, 20, 10, 10, '#3b82f6')
        ],
        associatedCategory: 'Exchange'
      },
      {
        id: 'cab-1',
        name: 'Cabinet (OFCCC)',
        description: 'Cross Connect Cabinet',
        dots: [
          ...generateBox(12, 18, 26, 20, '#475569'),
          ...generateCircle(25, 18, 12, '#475569'),
          ...generateBox(20, 24, 10, 8, '#ffffff')
        ],
        associatedCategory: 'Cabinet'
      },
      {
        id: 'odp-1',
        name: 'Proposed ODP',
        description: 'Distribution Point',
        dots: [
          ...generateCircle(25, 25, 15, '#1e293b'),
          ...generateBox(15, 24, 20, 2, '#ffffff'),
          ...generateBox(24, 15, 2, 20, '#ffffff')
        ],
        associatedCategory: 'ODP'
      },
      {
        id: 'sj-1',
        name: 'Straight Joint',
        description: 'Fiber Closure',
        dots: [
          ...generateCircle(25, 25, 8, '#000000'),
          ...generateBox(5, 24, 40, 2, '#000000')
        ],
        associatedCategory: 'Closure'
      },
      {
        id: 'bj-1',
        name: 'Branch Joint',
        description: 'Splice Enclosure',
        dots: [
          ...generateBox(10, 24, 30, 2, '#000000'),
          ...generateBox(24, 10, 2, 14, '#000000'),
          ...generateBox(20, 10, 10, 2, '#000000')
        ],
        associatedCategory: 'Closure'
      },
      {
        id: 'split-1',
        name: 'Primary Splitter',
        description: 'Splitter Box 1:8',
        dots: [
          ...generateBox(10, 15, 30, 20, '#3b82f6'),
          ...generateBox(15, 20, 5, 2, '#ffffff'),
          ...generateBox(15, 25, 5, 2, '#ffffff'),
          ...generateBox(30, 22, 5, 6, '#ffffff')
        ],
        associatedCategory: 'Splitter'
      },
      {
        id: 'tp-1',
        name: 'TOT Pole',
        description: 'Utility Pole',
        dots: [
          ...generateCircle(25, 20, 15, '#0ea5e9'),
          ...generateBox(24, 35, 2, 10, '#0ea5e9'),
          { x: 22, y: 18, color: '#ffffff' }, { x: 23, y: 18, color: '#ffffff' }, { x: 24, y: 18, color: '#ffffff' },
          { x: 23, y: 19, color: '#ffffff' }, { x: 23, y: 20, color: '#ffffff' }, { x: 23, y: 21, color: '#ffffff' }
        ],
        associatedCategory: 'Accessories'
      },
      {
        id: 'sdp-1',
        name: 'SDP',
        description: 'Service Delivery Point',
        dots: [
          ...generateBox(15, 15, 20, 20, '#0d9488'),
          ...generateBox(20, 20, 10, 10, '#ffffff'),
          ...generateBox(23, 23, 4, 4, '#0d9488')
        ],
        associatedCategory: 'SDP'
      },
      {
        id: 'mh-1',
        name: 'Manhole',
        description: 'Underground Vault',
        dots: [
          ...generateCircle(25, 25, 18, '#334155'),
          ...generateCircle(25, 25, 14, '#475569'),
          ...generateBox(20, 20, 10, 10, '#1e293b')
        ],
        associatedCategory: 'Accessories'
      }
    ];
  });

  const [project, setProject] = useState<ProjectState>(() => {
    const saved = localStorage.getItem('fiber_project');
    return saved ? JSON.parse(saved) : {
      nodes: [
        { id: '1', type: 'EXCHANGE', x: 100, y: 100, label: 'EXC_CENTRAL', materialId: 1 },
        { id: '2', type: 'CABINET', x: 400, y: 200, label: 'OFCCC#001', materialId: 64 }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2', materialId: 147, distance: 150 }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('fiber_project', JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem('fiber_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('fiber_icons', JSON.stringify(icons));
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
    localStorage.setItem('fiber_project', JSON.stringify(project));
    localStorage.setItem('fiber_materials', JSON.stringify(materials));
    localStorage.setItem('fiber_icons', JSON.stringify(icons));
    alert('Project and settings saved.');
  };

  const NavItem = ({ to, icon: Icon, label, hidden }: { to: string; icon: any; label: string; hidden?: boolean }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    if (hidden) return null;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          isActive
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

           <button onClick={handleSave} className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-all text-sm font-medium ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
            <Save size={16} />
            <span>Save</span>
          </button>
           <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-all text-sm font-medium shadow-lg shadow-indigo-600/20">
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </header>

      <main className={`flex-grow flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Routes>
          <Route path="/" element={<DesignCanvas project={project} setProject={setProject} materials={materials} customIcons={icons} />} />
          <Route path="/icons" element={<IconEditor icons={icons} setIcons={setIcons} materials={materials} />} />
          <Route path="/database" element={<DatabasePage materials={materials} setMaterials={setMaterials} icons={icons} setIcons={setIcons} />} />
          <Route path="/boq" element={<BOQSummary project={project} materials={materials} />} />
        </Routes>
      </main>
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
