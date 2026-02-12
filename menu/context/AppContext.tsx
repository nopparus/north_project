
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubApp } from '../types';
import IframeApp from '../components/IframeApp';

interface AppContextType {
  apps: SubApp[];
  addApp: (folderName: string, displayName: string, icon: string) => void;
  updateApp: (id: string, updates: Partial<SubApp>) => void;
  removeApp: (id: string) => void;
  resetApps: () => void;
}

const DEFAULT_APPS: SubApp[] = [
  {
    id: 'rd-processor',
    name: 'RD Smart Processor',
    description: 'เครื่องมือจัดการข้อมูลมิเตอร์อัจฉริยะ RD03/RD05',
    icon: 'Data',
    color: 'text-cyan-400',
    path: '/app1',
    appType: 'iframe',
    iframeSrc: '/app1/',
    component: IframeApp
  },
  {
    id: 'ems-transform',
    name: 'EMS แปลงค่าไฟฟ้า',
    description: 'แปลงข้อมูลค่าไฟฟ้าจาก Excel เป็น CSV',
    icon: 'Cloud',
    color: 'text-yellow-400',
    path: '/app2',
    appType: 'iframe',
    iframeSrc: '/app2/',
    component: IframeApp
  },
  {
    id: 'file-merger',
    name: 'Excel & CSV Merger',
    description: 'รวม Excel/CSV หลายไฟล์เข้าเป็นหนึ่ง',
    icon: 'Stack',
    color: 'text-orange-400',
    path: '/app3',
    appType: 'iframe',
    iframeSrc: '/app3/',
    component: IframeApp
  },
  {
    id: 'fiberflow-boq',
    name: 'FiberFlow BOQ Planner',
    description: 'ออกแบบเครือข่ายไฟเบอร์และจัดทำ BOQ วัสดุอุปกรณ์',
    icon: 'Dev',
    color: 'text-emerald-400',
    path: '/app4',
    appType: 'iframe',
    iframeSrc: '/app4/',
    component: IframeApp
  },
  {
    id: 'pms-enterprise',
    name: 'PMS Enterprise',
    description: 'ระบบจัดการงานบำรุงรักษาเชิงป้องกันและสำรวจสถานที่',
    icon: 'Settings',
    color: 'text-purple-400',
    path: '/app5',
    appType: 'iframe',
    iframeSrc: '/app5/',
    component: IframeApp
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<SubApp[]>(() => {
    const saved = localStorage.getItem('nexus_registered_apps');
    if (saved) {
      const parsed = JSON.parse(saved);
      const restored: SubApp[] = parsed.map((app: any) => {
        const original = DEFAULT_APPS.find(d => d.id === app.id);
        return { ...app, component: original ? original.component : IframeApp };
      });
      // Merge: add any new DEFAULT_APPS not yet in saved list
      const savedIds = new Set(restored.map(a => a.id));
      const newDefaults = DEFAULT_APPS.filter(d => !savedIds.has(d.id));
      return [...restored, ...newDefaults];
    }
    return DEFAULT_APPS;
  });

  useEffect(() => {
    const toSave = apps.map(({ component, ...rest }) => rest);
    localStorage.setItem('nexus_registered_apps', JSON.stringify(toSave));
  }, [apps]);

  const addApp = (folderName: string, displayName: string, icon: string) => {
    const newApp: SubApp = {
      id: folderName.toLowerCase().replace(/\s+/g, '-'),
      name: displayName,
      description: `Application located at ${folderName}`,
      icon: icon || 'Dev',
      color: 'text-zinc-100',
      path: `/${folderName}`,
      appType: 'iframe',
      iframeSrc: `/${folderName}/`,
      component: IframeApp
    };
    setApps([...apps, newApp]);
  };

  const updateApp = (id: string, updates: Partial<SubApp>) => {
    setApps(apps.map(app => app.id === id ? { ...app, ...updates } : app));
  };

  const removeApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  const resetApps = () => {
    setApps(DEFAULT_APPS);
    localStorage.removeItem('nexus_registered_apps');
  };

  return (
    <AppContext.Provider value={{ apps, addApp, updateApp, removeApp, resetApps }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApps = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApps must be used within an AppProvider');
  }
  return context;
};
