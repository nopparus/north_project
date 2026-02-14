
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppGrid from './components/AppGrid';
import SettingsApp from './apps/SettingsApp';
import { useApps } from './context/AppContext';

const App: React.FC = () => {
  const { apps } = useApps();
  const location = useLocation();
  const isSettings = location.pathname === '/system-settings';
  const currentApp = apps.find(app => location.pathname.startsWith(app.path));

  // Sidebar visibility state controlled by mouse position
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] text-[#f8fafc] overflow-hidden relative">
      {/* 
          Hover Trigger Strip: 
          A permanent thin visual indicator on the left edge.
      */}
      <div 
        onMouseEnter={() => setIsSidebarVisible(true)}
        className="fixed left-0 top-0 bottom-0 w-2 z-[60] cursor-e-resize group flex items-center justify-center"
      >
        <div className="w-1 h-32 bg-slate-800 rounded-full group-hover:bg-sky-500/50 transition-colors duration-300" />
      </div>

      {/* Sidebar Overlay: Slides over content instead of pushing it */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-out transform ${
          isSidebarVisible ? 'translate-x-0 opacity-100 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : '-translate-x-full opacity-0'
        }`}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <Sidebar 
          apps={apps} 
          currentAppId={currentApp?.id} 
          isSettingsPage={isSettings} 
        />
      </div>

      {/* Main Content Area: No dynamic padding to prevent layout shifts */}
      <main className="flex-1 overflow-y-auto relative z-0 pl-2">
        <Routes>
          <Route path="/" element={<AppGrid apps={apps} />} />
          <Route path="/system-settings" element={<SettingsApp />} />
          {apps.map(app => (
            <React.Fragment key={app.id}>
              <Route
                path={`${app.path}/*`}
                element={<app.component />}
              />
            </React.Fragment>
          ))}
        </Routes>
      </main>

      {/* Subtle overlay when sidebar is active to guide focus */}
      {isSidebarVisible && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 pointer-events-none animate-in fade-in duration-500" />
      )}
    </div>
  );
};

export default App;
