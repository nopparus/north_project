/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Calendar,
  MapPin,
  Shield,
  Clock,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  RotateCcw,
  X,
  Printer,
  Sun,
  Moon,
  Upload
} from 'lucide-react';
import { format, addMonths, startOfMonth, parse, endOfMonth, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getMonthStats, PROVINCES, MonthStats, DEFAULT_THAI_HOLIDAYS, ThaiHoliday, REGIONS, PROVINCE_REGIONS, SHIFT_PROFILES, ShiftProfile, getEffectiveHolidays } from './constants';
import { getMinimumWage } from './services/geminiService';
import { exportBudgetToExcel } from './services/excelExportService';
import { profileService } from './services/profileService';
import { wageService } from './services/wageService';
import { authService } from './services/authService';
import { FileSpreadsheet, Lock, LogOut, User } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalculationRow {
  id: string;
  location: string;
  province: string;
  points: number;
  minWage: number;
  isLoadingWage: boolean;
  selectedProfileId: string;
}

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'budget' | 'holidays' | 'wages' | 'settings'>('budget');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM'));
  const [endDate, setEndDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM'));
  const [customHolidays, setCustomHolidays] = useState<ThaiHoliday[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wages, setWages] = useState<Record<string, number>>({});
  const [holidayModal, setHolidayModal] = useState<{ isOpen: boolean; date: string; name: string } | null>(null);
  const [importModal, setImportModal] = useState<{ isOpen: boolean; data: any } | null>(null);
  const [exportModal, setExportModal] = useState<{ isOpen: boolean; filename: string } | null>(null);
  const [csvExportModal, setCsvExportModal] = useState<{ isOpen: boolean; filename: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profiles, setProfiles] = useState<ShiftProfile[]>(SHIFT_PROFILES);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onResolve: (value: boolean) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onResolve: () => { }
  });

  const [rows, setRows] = useState<CalculationRow[]>([
    {
      id: crypto.randomUUID(),
      location: '',
      province: '',
      points: 1,
      minWage: 0,
      isLoadingWage: false,
      selectedProfileId: ''
    }
  ]);

  const [settings, setSettings] = useState({
    socialSecurityRate: 5,
    managementFeeRate: 20,
    otNormalRate: 1.25,
    otHolidayRate: 3.0,
    holidayPayRate: 1.0,
  });

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('security_budget_config');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.startDate) setStartDate(data.startDate);
        if (data.endDate) setEndDate(data.endDate);
        if (data.settings) setSettings(data.settings);
        if (data.rows) {
          // Ensure backwards compatibility with older saved rows
          const rowsWithProfiles = data.rows.map((r: any) => ({
            ...r,
            selectedProfileId: r.selectedProfileId || 'p1'
          }));
          setRows(rowsWithProfiles);
        }
        if (data.customHolidays) {
          setCustomHolidays(data.customHolidays);
        }
        if (data.wages) {
          // Filter out any non-Thai province names (e.g. English names from old data)
          const filteredWages: Record<string, number> = {};
          Object.entries(data.wages).forEach(([key, value]) => {
            if (PROVINCES.includes(key)) {
              filteredWages[key] = value as number;
            }
          });
          setWages(filteredWages);
        }
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        if (data.profiles) {
          const mapped = data.profiles.map((p: any) => ({
            ...p,
            shiftsPerPointNormal: p.shiftsPerPointNormal ?? p.shiftsPerPoint ?? 1,
            shiftsPerPointHoliday: p.shiftsPerPointHoliday ?? p.shiftsPerPoint ?? 1,
            holidayNormalHours: p.holidayNormalHours ?? p.normalHours ?? 8,
            holidayOtHours: p.holidayOtHours ?? p.otHours ?? 0
          }));
          setProfiles(mapped);
        }
      } catch (e) {
        console.error("Failed to load saved config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadServerData = async () => {
      try {
        const [serverProfiles, serverWages] = await Promise.all([
          profileService.getAll(),
          wageService.getAll()
        ]);

        // Profiles Sync Logic
        if (serverProfiles.length === 0 && profiles.length > 0) {
          await profileService.sync(profiles);
          const syncedProfiles = await profileService.getAll();
          setProfiles(syncedProfiles);
        } else if (serverProfiles.length > 0) {
          setProfiles(serverProfiles);
        }

        // Wages Sync Logic
        if (Object.keys(serverWages).length === 0 && Object.keys(wages).length > 0) {
          await wageService.sync(wages);
          const syncedWages = await wageService.getAll();
          setWages(syncedWages);
        } else if (Object.keys(serverWages).length > 0) {
          setWages(serverWages);
        }
      } catch (error) {
        console.error("Failed to load data from server", error);
      }
    };

    if (isLoaded) {
      loadServerData();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const config = {
        startDate,
        endDate,
        settings,
        rows,
        customHolidays,
        // wages: removed from persistence as it is now server-side
        activeTab,
        isDarkMode
        // profiles: removed from persistence as it is now server-side
      };
      localStorage.setItem('security_budget_config', JSON.stringify(config));
    }
  }, [startDate, endDate, settings, rows, customHolidays, wages, activeTab, isDarkMode, isLoaded]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const saveToLocalStorage = () => {
    const defaultFilename = `security-budget-${format(new Date(), 'yyyy-MM-dd')}`;
    setExportModal({ isOpen: true, filename: defaultFilename });
  };

  const confirmExport = () => {
    if (!exportModal) return;

    const config = {
      startDate,
      endDate,
      settings,
      rows,
      customHolidays,
      // wages: removed from JSON export
      activeTab,
      isDarkMode
      // profiles: removed from JSON export
    };
    const json = JSON.stringify(config, null, 2);
    localStorage.setItem('security_budget_config', json);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportModal.filename || 'security-budget'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportModal(null);
    alert('บันทึกข้อมูลและดาวน์โหลดไฟล์เรียบร้อยแล้ว');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setImportModal({ isOpen: true, data });
      } catch (err) {
        alert('ไฟล์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const applyImport = (mode: 'overwrite' | 'merge') => {
    if (!importModal?.data) return;
    const data = importModal.data;

    if (mode === 'overwrite') {
      if (data.startDate) setStartDate(data.startDate);
      if (data.endDate) setEndDate(data.endDate);
      if (data.settings) setSettings(data.settings);
      if (data.rows) setRows(data.rows);
      if (data.customHolidays) setCustomHolidays(data.customHolidays);
      if (data.wages) setWages(data.wages);
    } else {
      // Merge logic
      if (data.rows) {
        setRows(prev => [...prev, ...data.rows.map((r: any) => ({ ...r, id: crypto.randomUUID() }))]);
      }
      if (data.customHolidays) {
        setCustomHolidays(prev => {
          const newHolidays = [...prev];
          data.customHolidays.forEach((h: ThaiHoliday) => {
            if (!newHolidays.find(nh => nh.date === h.date)) {
              newHolidays.push(h);
            }
          });
          return newHolidays;
        });
      }
      if (data.wages) {
        setWages(prev => ({ ...prev, ...data.wages }));
      }
      if (data.profiles) {
        // Simple merge: replace existing or append new
        setProfiles(prev => {
          const merged = [...prev];
          data.profiles.forEach((p: ShiftProfile) => {
            const idx = merged.findIndex(existing => existing.id === p.id);
            if (idx >= 0) merged[idx] = p;
            else merged.push(p);
          });
          return merged;
        });
      }
    }

    setImportModal(null);
    alert('นำเข้าข้อมูลเรียบร้อยแล้ว');
  };

  // Auto-fill default holidays for newly selected years if they have no holidays defined
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const startY = parse(startDate, 'yyyy-MM', new Date()).getFullYear();
      const endY = parse(endDate, 'yyyy-MM', new Date()).getFullYear();

      setCustomHolidays(prev => {
        let toAdd: ThaiHoliday[] = [];
        for (let y = startY; y <= endY; y++) {
          const hasHolidayForYear = prev.some(h => h.date.startsWith(`${y}-`));
          if (!hasHolidayForYear) {
            toAdd = [...toAdd, ...DEFAULT_THAI_HOLIDAYS(y)];
          }
        }
        if (toAdd.length > 0) {
          return [...prev, ...toAdd];
        }
        return prev;
      });
    } catch (e) { }
  }, [isLoaded, startDate, endDate]);

  // Initialize wages if empty
  useEffect(() => {
    if (isLoaded && Object.keys(wages).length === 0) {
      const initialWages: Record<string, number> = {};
      PROVINCES.forEach(p => {
        // Set some reasonable defaults if we don't have them
        if (p === 'กรุงเทพมหานคร') initialWages[p] = 363;
        else if (p === 'ภูเก็ต') initialWages[p] = 370;
        else initialWages[p] = 350;
      });
      setWages(initialWages);
    }
  }, [isLoaded, wages]);

  // --- Calculations ---
  const months = useMemo(() => {
    const start = parse(startDate, 'yyyy-MM', new Date());
    const end = parse(endDate, 'yyyy-MM', new Date());
    const result: MonthStats[] = [];
    let current = startOfMonth(start);
    const last = startOfMonth(end);

    while (current <= last) {
      result.push(getMonthStats(current.getMonth(), current.getFullYear(), customHolidays));
      current = addMonths(current, 1);
    }
    return result;
  }, [startDate, endDate, customHolidays]);

  const periodStats = useMemo(() => {
    if (months.length === 0) return null;
    const total = months.reduce((acc, m) => {
      const newDayOfWeekCounts = acc.dayOfWeekCounts.map((count, i) => count + m.dayOfWeekCounts[i]);
      return {
        netWorkDays: acc.netWorkDays + m.netWorkDays,
        netHolidayDays: acc.netHolidayDays + m.netHolidayDays,
        totalWorkDays: acc.totalWorkDays + m.totalWorkDays,
        totalSaturdays: acc.totalSaturdays + m.totalSaturdays,
        totalSundays: acc.totalSundays + m.totalSundays,
        totalHolidays: acc.totalHolidays + m.totalHolidays,
        holidaysOnWorkDays: acc.holidaysOnWorkDays + m.holidaysOnWorkDays,
        totalDays: acc.totalDays + m.totalDays,
        dayOfWeekCounts: newDayOfWeekCounts
      };
    }, {
      netWorkDays: 0,
      netHolidayDays: 0,
      totalWorkDays: 0,
      totalSaturdays: 0,
      totalSundays: 0,
      totalHolidays: 0,
      holidaysOnWorkDays: 0,
      totalDays: 0,
      dayOfWeekCounts: [0, 0, 0, 0, 0, 0, 0]
    });

    return {
      ...total,
      avgWorkDays: total.netWorkDays / months.length,
      avgHolidays: total.netHolidayDays / months.length,
      totalWeeks: Math.floor(total.totalDays / 7),
      remainingDays: total.totalDays % 7
    };
  }, [months]);

  // --- Handlers ---
  const addRow = () => {
    setRows([...rows, {
      id: crypto.randomUUID(),
      location: '',
      province: '',
      points: 1,
      minWage: 0,
      isLoadingWage: false,
      selectedProfileId: ''
    }]);
  };

  const removeRow = (id: string) => {
    confirmAction({
      title: 'ยืนยันการลบแถว',
      message: 'คุณต้องการลบรายการแถวงบประมาณนี้ใช่หรือไม่?'
    }).then(confirmed => {
      if (confirmed) {
        setRows(rows.filter(r => r.id !== id));
      }
    });
  };

  const updateRow = (id: string, updates: Partial<CalculationRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateProvinceWage = async (province: string, wage: number) => {
    if (!isAuthenticated) return;
    try {
      await wageService.save(province, wage);
      setWages(prev => ({ ...prev, [province]: wage }));
    } catch (error) {
      alert('ไม่สามารถบันทึกค่าแรงได้');
    }
  };

  const addProfile = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const newId = `p${Date.now()}`;
    const newProfile: ShiftProfile = {
      id: newId,
      name: 'โปรไฟล์ใหม่',
      normalHours: 8,
      otHours: 0,
      holidayNormalHours: 8,
      holidayOtHours: 0,
      shiftsPerPointNormal: 1,
      shiftsPerPointHoliday: 1
    };

    try {
      await profileService.save(newProfile);
      setProfiles([...profiles, newProfile]);
    } catch (error) {
      alert('ไม่สามารถเพิ่มโปรไฟล์ได้');
    }
  };

  const updateProfile = async (id: string, updates: Partial<ShiftProfile>) => {
    if (!isAuthenticated) return;
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    const updated = { ...profile, ...updates };
    try {
      await profileService.save(updated);
      setProfiles(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const removeProfile = async (id: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (profiles.length <= 1) {
      alert('ต้องมีรูปแบบผลัดอย่างน้อย 1 รายการ');
      return;
    }

    const confirmed = await confirmAction({
      title: 'ยืนยันการลบรูปแบบผลัด',
      message: 'การลบรูปแบบผลัดอาจส่งผลต่อการคำนวณในแถวที่เลือกใช้โปรไฟล์นี้ คุณยืนยันที่จะลบหรือไม่?'
    });

    if (!confirmed) return;

    try {
      await profileService.delete(id);
      const remainingProfiles = profiles.filter(p => p.id !== id);
      setProfiles(remainingProfiles);
      // Re-assign rows using this profile to the first available one
      setRows(prev => prev.map(r => r.selectedProfileId === id ? { ...r, selectedProfileId: remainingProfiles[0].id } : r));
    } catch (error) {
      alert('ไม่สามารถลบโปรไฟล์ได้');
    }
  };

  const exportWagesCSV = () => {
    const defaultFilename = `minimum-wages-${format(new Date(), 'yyyy-MM-dd')}`;
    setCsvExportModal({ isOpen: true, filename: defaultFilename });
  };

  const confirmCSVExport = () => {
    if (!csvExportModal) return;
    const header = "จังหวัด,ค่าแรงขั้นต่ำ\n";
    const rows = PROVINCES.map(p => `${p},${wages[p] || 350}`).join("\n");
    const csvContent = "\uFEFF" + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${csvExportModal.filename || 'minimum-wages'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCsvExportModal(null);
  };

  const importWagesCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        const newWages: Record<string, number> = {};

        // Skip header, start from index 1
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const [province, wage] = line.split(',');
          if (province && !isNaN(Number(wage))) {
            newWages[province.trim()] = Number(wage);
          }
        }

        await wageService.sync(newWages);
        setWages(newWages);
        alert('นำเข้าข้อมูลค่าแรงเรียบร้อยแล้ว');
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการนำเข้า กรุณาตรวจสอบอีกครั้ง');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleHoliday = async (date: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const exists = customHolidays.find(h => h.date === date);
    if (exists) {
      const confirmed = await confirmAction({
        title: 'ยืนยันการลบวันหยุด',
        message: `คุณต้องการลบวันหยุด "${exists.name}" ใช่หรือไม่?`
      });

      if (confirmed) {
        setCustomHolidays(prev => prev.filter(h => h.date !== date));
      }
    } else {
      // Check if it's a standard holiday to suggest name
      const year = new Date(date).getFullYear();
      const standard = DEFAULT_THAI_HOLIDAYS(year).find(h => h.date === date);
      setHolidayModal({
        isOpen: true,
        date,
        name: standard ? standard.name : 'วันหยุดพิเศษ'
      });
    }
  };

  const confirmAddHoliday = () => {
    if (holidayModal) {
      setCustomHolidays(prev => [...prev, { date: holidayModal.date, name: holidayModal.name }]);
      setHolidayModal(null);
    }
  };

  const resetHolidays = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const confirmed = await confirmAction({
      title: 'รีเซ็ตวันหยุด',
      message: 'คุณต้องการรีเซ็ตวันหยุดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (การเปลี่ยนแปลงที่คุณทำจะหายไป)'
    });

    if (confirmed) {
      const startYear = parse(startDate, 'yyyy-MM', new Date()).getFullYear();
      const endYear = parse(endDate, 'yyyy-MM', new Date()).getFullYear();

      const newHolidays: ThaiHoliday[] = [];
      for (let y = startYear; y <= endYear; y++) {
        newHolidays.push(...DEFAULT_THAI_HOLIDAYS(y));
      }

      setCustomHolidays(newHolidays);
    }
  };

  const updateHolidayName = (date: string, newName: string) => {
    setCustomHolidays(customHolidays.map(h => h.date === date ? { ...h, name: newName } : h));
  };

  // --- Calculation Logic ---
  const calculateBudget = (row: CalculationRow) => {
    if (!periodStats) return null;

    const profile = profiles.find(p => p.id === row.selectedProfileId) || {
      id: '',
      name: '',
      normalHours: 0,
      otHours: 0,
      holidayNormalHours: 0,
      holidayOtHours: 0,
      shiftsPerPointNormal: 0,
      shiftsPerPointHoliday: 0
    };
    const hourlyRate = row.minWage / 8;
    const normalHours = profile.normalHours;
    const otHours = profile.otHours;

    // RULE 1: Total Period Calculation (No more averages)
    const netWorkDaysPeriod = periodStats.netWorkDays;
    const netHolidayDaysPeriod = periodStats.netHolidayDays;

    // RULE 2: Normal Day Pay (Always calculates regular hours + OT if specified)
    const normalDayWage = (normalHours * hourlyRate) + (otHours * hourlyRate * settings.otNormalRate);
    const totalNormalPay = normalDayWage * netWorkDaysPeriod * profile.shiftsPerPointNormal;

    // RULE 3: Holiday Pay Logic based on Profile specifics
    let holidayWage = 0;
    const hNormalHours = profile.holidayNormalHours ?? profile.normalHours;
    const hOtHours = profile.holidayOtHours ?? profile.otHours;

    if (profile.shiftsPerPointHoliday > 0) {
      if (hOtHours > 0) {
        // Condition A: If they work on holidays AND have OT -> Double pay logic applies
        holidayWage = (hNormalHours * hourlyRate * 2) + (hOtHours * hourlyRate * settings.otHolidayRate);
      } else {
        // Condition B: If they work on holidays but NO OT is specified in profile -> Flat rate
        holidayWage = (hNormalHours * hourlyRate);
      }
    } else {
      // Condition C: If nobody works on holidays, wage is 0
      holidayWage = 0;
    }

    const totalHolidayPay = holidayWage * netHolidayDaysPeriod * profile.shiftsPerPointHoliday;

    // 4. Total Period Base (for 1 point covering full 21 months)
    const baseTotal = totalNormalPay + totalHolidayPay;

    // 5. Social Security (per person limit logic is ignored for flat 5% calculation as requested in spreadsheet)
    const socialSecurity = (baseTotal * settings.socialSecurityRate) / 100;

    // 6. Management Fee & Profit
    const managementFee = (baseTotal * settings.managementFeeRate) / 100;

    // 7. Total per point (Period length)
    const totalPerPoint = baseTotal + socialSecurity + managementFee;

    // 8. Grand Total (Total per point x Number of points)
    const grandTotal = totalPerPoint * row.points;

    return {
      hourlyRate,
      totalNormalPay,
      totalHolidayPay,
      baseTotal,
      socialSecurity,
      managementFee,
      totalPerPoint,
      grandTotal,
      // Metadata for Print Report
      totalShiftsNormal: netWorkDaysPeriod * profile.shiftsPerPointNormal,
      totalShiftsHoliday: netHolidayDaysPeriod * profile.shiftsPerPointHoliday,
      totalShiftsCombined: (netWorkDaysPeriod * profile.shiftsPerPointNormal) + (netHolidayDaysPeriod * profile.shiftsPerPointHoliday)
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const success = await authService.login(loginForm.username, loginForm.password);
      if (success) {
        setIsAuthenticated(true);
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const confirmAction = ({ title, message }: { title: string; message: string }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        onResolve: resolve
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ระบบคำนวณงบประมาณ รปภ.</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Security Budget Intelligence v1.0</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('budget')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === 'budget' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              งบประมาณ
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === 'holidays' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              วันหยุด
            </button>
            <button
              onClick={() => setActiveTab('wages')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === 'wages' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              ค่าแรงขั้นต่ำ
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === 'settings' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              การตั้งค่า
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                window.focus();
                window.print();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              ส่งออกเป็น PDF
            </button>
            <button
              onClick={() => exportBudgetToExcel({ rows, startDate, endDate, settings, periodStats, profiles, calculateBudget })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              ส่งออกเป็น Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
        {activeTab === 'budget' ? (
          <>
            {/* Configuration Section */}
            {/* Date Range & Basic Info */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">กำหนดระยะเวลาและข้อมูลพื้นฐาน</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      id="import-file"
                      className="hidden"
                      accept=".json"
                      onChange={handleImportFile}
                    />
                    <label
                      htmlFor="import-file"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      นำเข้าข้อมูล
                    </label>
                  </div>
                  <button
                    onClick={saveToLocalStorage}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 dark:shadow-none"
                  >
                    <Shield className="w-4 h-4" />
                    บันทึก/ส่งออก
                  </button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">เดือน/ปี เริ่มต้น</label>
                  <input
                    type="month"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">เดือน/ปี สิ้นสุด</label>
                  <input
                    type="month"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed w-full">
                      <p className="font-bold mb-3">สรุปจำนวนวันทำงานและวันหยุดตลอดช่วงเวลา:</p>

                      {/* 7 Day Breakdown */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                          <div key={day} className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                            <span className={cn("block text-[10px] font-bold uppercase mb-1", i === 0 || i === 6 ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>
                              {day}
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{periodStats?.dayOfWeekCounts[i]}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
                        <div>
                          <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">วันทำงานปกติ</span>
                          <span className="text-lg font-bold">{periodStats?.netWorkDays} วัน</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">วันหยุด ส-อา</span>
                          <span className="text-lg font-bold">{(periodStats?.totalSaturdays || 0) + (periodStats?.totalSundays || 0)} วัน</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">วันหยุดนักขัตฤกษ์ (จ-ศ)</span>
                          <button
                            onClick={() => setActiveTab('holidays')}
                            className="text-lg font-bold text-indigo-900 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-dotted underline-offset-4 transition-all text-left w-fit"
                          >
                            {periodStats?.holidaysOnWorkDays} วัน
                          </button>
                        </div>
                        <div>
                          <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">รวมทั้งสิ้น</span>
                          <span className="text-lg font-bold">
                            {periodStats?.totalWeeks} สัปดาห์ {periodStats?.remainingDays} วัน
                            <span className="block text-[10px] opacity-60 font-normal">({periodStats?.totalDays} วัน)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Calculation Table */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">รายการคำนวณงบประมาณรายจุด</h2>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {rows.map((row) => {
                    const profile = profiles.find(p => p.id === row.selectedProfileId) || {
                      id: '',
                      name: '',
                      normalHours: 0,
                      otHours: 0,
                      holidayNormalHours: 0,
                      holidayOtHours: 0,
                      shiftsPerPointNormal: 0,
                      shiftsPerPointHoliday: 0
                    };
                    const budget = calculateBudget(row);
                    return (
                      <motion.div
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group flex flex-col gap-6"
                      >
                        {/* Line 1: Inputs */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <div className="flex-1 min-w-[200px] space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> สถานที่
                            </label>
                            <input
                              type="text"
                              placeholder="ระบุสถานที่"
                              value={row.location}
                              onChange={(e) => updateRow(row.id, { location: e.target.value })}
                              className="w-full text-sm font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            />
                          </div>

                          <div className="w-full md:w-48 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">จังหวัด</label>
                            <select
                              value={row.province}
                              onChange={(e) => {
                                const newProvince = e.target.value;
                                updateRow(row.id, {
                                  province: newProvince,
                                  minWage: wages[newProvince] || 0
                                });
                              }}
                              className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                            >
                              <option value="" disabled hidden>เลือกจังหวัด</option>
                              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>

                          <div className="w-full md:w-64 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">รูปแบบผลัด / โปรไฟล์</label>
                            <select
                              value={row.selectedProfileId}
                              onChange={(e) => updateRow(row.id, { selectedProfileId: e.target.value })}
                              className="w-full text-sm font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="" disabled hidden>เลือกรูปแบบผลัด / โปรไฟล์</option>
                              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>

                          <div className="w-24 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">จำนวนจุด</label>
                            <input
                              type="number"
                              min="1"
                              value={row.points}
                              onChange={(e) => updateRow(row.id, { points: Number(e.target.value) })}
                              className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                            />
                          </div>

                          <button
                            onClick={() => removeRow(row.id)}
                            className="p-2.5 mt-4 text-slate-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:text-red-500 transition-colors self-end md:self-auto"
                            title="ลบสถานที่นี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Line 2: Computation Details */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 px-4 items-center">
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ค่าแรงขั้นต่ำ / ชม.</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={row.minWage}
                                onChange={(e) => updateRow(row.id, { minWage: Number(e.target.value) })}
                                className="w-full max-w-[80px] text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                              />
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">{(row.minWage / 8).toLocaleString(undefined, { minimumFractionDigits: 2 })} บ./ชม.</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">วันทำงานปกติ (ผลัด)</span>
                            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">{(budget?.totalShiftsNormal || 0).toLocaleString()} ผลัด</span>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">วันหยุด/นักขัตฯ (ผลัด)</span>
                            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">{(budget?.totalShiftsHoliday || 0).toLocaleString()} ผลัด</span>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">รวมฐานค่าแรง/จุด (1)</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">฿ {budget?.baseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">บริหาร + กำไร + สปส.</span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                              <div className="flex justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-0.5">
                                <span>สปส. {settings.socialSecurityRate}%</span>
                                <span className="font-mono">฿ {budget?.socialSecurity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>
                              <div className="flex justify-between gap-2 pt-0.5">
                                <span>บริหาร {settings.managementFeeRate}%</span>
                                <span className="font-mono">฿ {budget?.managementFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm text-right">
                            <span className="block text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">รวมทั้งช่วงเวลา/จุด ({profile.shiftsPerPointNormal} ปกติ, {profile.shiftsPerPointHoliday} หยุด)</span>
                            <div className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                              ฿ {budget?.totalPerPoint.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Location Button - centered when empty, at end of list when items exist */}
                {rows.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <button
                      onClick={addRow}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มสถานที่
                    </button>
                  </div>
                ) : (
                  <div className="p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={addRow}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มสถานที่
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Per-row Summary Breakdown */}
            {rows.length > 0 && rows.some(r => calculateBudget(r) !== null) && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">สรุปงบประมาณรายสถานที่ (ตลอดช่วงเวลา)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">สถานที่</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">จังหวัด</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">รูปแบบผลัด</th>
                        <th className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">จำนวนจุด</th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">งบ/จุด</th>
                        <th className="text-right text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-4 py-3">รวมทั้งสิ้น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {rows.map((row) => {
                        const budget = calculateBudget(row);
                        const profile = profiles.find(p => p.id === row.selectedProfileId);
                        return (
                          <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                              {row.location || <span className="text-slate-400 italic">ไม่ระบุชื่อ</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.province || '-'}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px]">{profile?.name || '-'}</td>
                            <td className="px-4 py-3 text-center font-mono font-medium">{row.points}</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              {budget ? `฿ ${budget.totalPerPoint.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {budget ? `฿ ${budget.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td colSpan={3} className="px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">รวมทั้งหมด</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-indigo-700 dark:text-indigo-300">
                          {rows.reduce((acc, r) => acc + r.points, 0)} จุด
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-right font-mono font-black text-lg text-indigo-700 dark:text-indigo-300">
                          ฿ {rows.reduce((acc, row) => acc + (calculateBudget(row)?.grandTotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Summary Footer */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1 bg-indigo-600 dark:bg-indigo-600/90 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">งบประมาณรวมทั้งสิ้น (ตลอดช่วงเวลา)</p>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                      ฿ {rows.reduce((acc, row) => acc + (calculateBudget(row)?.grandTotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="h-px w-full md:w-px md:h-12 bg-white/20" />
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-indigo-200 text-xs font-bold uppercase">จำนวนจุดทั้งหมด</p>
                      <p className="text-2xl font-bold">{rows.reduce((acc, r) => acc + r.points, 0)} จุด</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-indigo-200 text-xs font-bold uppercase">จำนวนบุคลากร</p>
                      <p className="text-2xl font-bold">{rows.reduce((acc, r) => {
                        const profile = profiles.find(p => p.id === r.selectedProfileId) || profiles[0];
                        return acc + (r.points * profile.shiftsPerPointNormal);
                      }, 0)} คน</p>
                    </div>
                  </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <Shield className="w-64 h-64" />
                </div>
              </div>
            </div>

            {/* Legal Disclaimer / Footer */}
            <footer className="text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">
                * การคำนวณนี้เป็นการประมาณการเบื้องต้นตามกฎหมายแรงงานไทย (OT 1.25x / 2.5x และค่าทำงานวันหยุด 2x)
              </p>
              <p className="text-xs text-slate-400">
                ข้อมูลค่าแรงขั้นต่ำอ้างอิงจากฐานข้อมูล AI ล่าสุด โปรดตรวจสอบประกาศกระทรวงแรงงานอีกครั้งเพื่อความถูกต้อง
              </p>
            </footer>
          </>
        ) : activeTab === 'wages' ? (
          /* Wages Management Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    จัดการค่าแรงขั้นต่ำรายจังหวัด
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ข้อมูลค่าแรงขั้นต่ำจะถูกนำไปใช้ในการคำนวณงบประมาณโดยอัตโนมัติ</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      onClick={exportWagesCSV}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-md transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ส่งออก CSV
                    </button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <label className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                      isAuthenticated ? "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer" : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    )}>
                      <Upload className="w-3.5 h-3.5" />
                      นำเข้า CSV
                      {isAuthenticated && <input type="file" accept=".csv" className="hidden" onChange={importWagesCSV} />}
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-10">
                {Object.entries(REGIONS).map(([key, regionName]) => {
                  const regionProvinces = PROVINCES.filter(p => PROVINCE_REGIONS[p] === regionName);
                  if (regionProvinces.length === 0) return null;

                  return (
                    <div key={key} className="space-y-4">
                      <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                        {regionName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {regionProvinces.map(province => (
                          <div key={province} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-600 transition-colors">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{province}</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={wages[province] || 350}
                                disabled={!isAuthenticated}
                                onChange={(e) => updateProvinceWage(province, Number(e.target.value))}
                                className="w-16 text-right text-sm font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                              />
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">฿</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>
        ) : activeTab === 'holidays' ? (
          /* Holiday Management Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    จัดการวันหยุดนักขัตฤกษ์
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">คลิกที่วันที่ในปฏิทินเพื่อกำหนดหรือยกเลิกวันหยุดนักขัตฤกษ์</p>
                </div>
                <button
                  onClick={resetHolidays}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all",
                    isAuthenticated ? "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700" : "text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  รีเซ็ตค่าเริ่มต้น
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {months.map((month) => {
                  const start = new Date(month.year, month.monthIndex, 1);
                  const daysInMonth = eachDayOfInterval({
                    start,
                    end: endOfMonth(start)
                  });
                  const firstDayEmptyCells = start.getDay();

                  return (
                    <div key={`${month.month}-${month.year}`} className="space-y-4">
                      <h3 className="font-bold text-slate-700 border-b pb-2 flex justify-between items-center">
                        <span className="capitalize">{month.month} {month.year}</span>
                        <span className="text-xs font-normal text-slate-400">{month.totalHolidays} วันหยุด</span>
                      </h3>
                      <div className="grid grid-cols-7 gap-1">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                          <div key={d} className="text-[10px] font-bold text-center text-slate-400 py-1">{d}</div>
                        ))}
                        {Array.from({ length: firstDayEmptyCells }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {daysInMonth.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');

                          // Use allHolidays for calculation to support cross-year substitution
                          const allHolidays = customHolidays.length > 0 ? customHolidays : [
                            ...DEFAULT_THAI_HOLIDAYS(month.year - 1),
                            ...DEFAULT_THAI_HOLIDAYS(month.year),
                            ...DEFAULT_THAI_HOLIDAYS(month.year + 1)
                          ];
                          const effectiveHolidays = getEffectiveHolidays(allHolidays);
                          const holiday = effectiveHolidays.find(h => h.date === dateStr);

                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => toggleHoliday(dateStr)}
                              className={cn(
                                "aspect-square p-1 sm:p-2 rounded-lg text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all relative group",
                                holiday
                                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                                  : isWeekend
                                    ? "bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500"
                                    : "hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300"
                              )}
                            >
                              {day.getDate()}
                              {holiday && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                                  {holiday.name}
                                </div>
                              )}
                              {holiday && <div className="w-1 h-1 bg-red-400 rounded-full mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800">รายการวันหยุดทั้งหมด</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getEffectiveHolidays(customHolidays.length > 0 ? customHolidays : [
                    ...DEFAULT_THAI_HOLIDAYS(parseInt(startDate.split('-')[0]) - 1),
                    ...DEFAULT_THAI_HOLIDAYS(parseInt(startDate.split('-')[0])),
                    ...DEFAULT_THAI_HOLIDAYS(parseInt(endDate.split('-')[0]) + 1)
                  ])
                    .filter(h => {
                      const d = new Date(h.date);
                      const start = parse(startDate, 'yyyy-MM', new Date());
                      const end = endOfMonth(parse(endDate, 'yyyy-MM', new Date()));
                      return d >= start && d <= end;
                    })
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(h => (
                      <div key={h.date} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 rounded-xl relative">
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                            {format(new Date(h.date), 'dd/MM/yyyy')}
                          </span>
                          <span className={cn("font-bold", h.name.startsWith('ชดเชย') ? "text-amber-600 dark:text-amber-500" : "text-slate-700 dark:text-slate-200")}>
                            {h.name}
                          </span>
                        </div>
                        {!h.name.startsWith('ชดเชย') && (
                          <button
                            onClick={() => toggleHoliday(h.date)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : activeTab === 'settings' ? (
          /* Settings Management Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Global Settings */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">ตั้งค่ามาตรฐาน</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ประกันสังคม (%)</label>
                    <input
                      type="number"
                      value={settings.socialSecurityRate}
                      disabled={!isAuthenticated}
                      onChange={(e) => setSettings({ ...settings, socialSecurityRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">บริหาร+กำไร (%)</label>
                    <input
                      type="number"
                      value={settings.managementFeeRate}
                      disabled={!isAuthenticated}
                      onChange={(e) => setSettings({ ...settings, managementFeeRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>คูณล่วงเวลาวันปกติ (เท่า)</span>
                      <span className="text-[10px] text-indigo-500 lowercase bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">Global</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={settings.otNormalRate}
                      disabled={!isAuthenticated}
                      onChange={(e) => setSettings({ ...settings, otNormalRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>คูณล่วงเวลาวันหยุด (เท่า)</span>
                      <span className="text-[10px] text-indigo-500 lowercase bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">Global</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.otHolidayRate}
                      disabled={!isAuthenticated}
                      onChange={(e) => setSettings({ ...settings, otHolidayRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      รูปแบบผลัด / โปรไฟล์การทำงาน
                    </h3>
                    <div className="flex items-center gap-4">
                      {isAuthenticated ? (
                        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <User className="w-3.5 h-3.5" />
                            Admin Mode
                          </div>
                          <button
                            onClick={handleLogout}
                            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          เข้าสู่ระบบเพื่อแก้ไข
                        </button>
                      )}
                      <button
                        onClick={addProfile}
                        className={cn(
                          "text-xs font-bold flex items-center gap-1 transition-colors",
                          isAuthenticated ? "text-indigo-600 dark:text-indigo-400 hover:underline" : "text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-3 h-3" /> เพิ่มโปรไฟล์ใหม่
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {profiles.map(p => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border border-slate-200 dark:border-slate-700/50 rounded-xl space-y-4 bg-slate-50/50 dark:bg-slate-800/30"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <input
                              type="text"
                              value={p.name}
                              disabled={!isAuthenticated}
                              onChange={(e) => updateProfile(p.id, { name: e.target.value })}
                              className="flex-1 font-bold text-sm bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                              placeholder="ชื่อรูปแบบผลัด"
                            />
                            <button
                              onClick={() => removeProfile(p.id)}
                              disabled={profiles.length <= 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-4 col-span-2 border-r border-slate-200 dark:border-slate-700/50 pr-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Sun className="w-3 h-3 text-amber-500" /> วันปกติ (Mon-Fri)
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">ปกติ (ชม.)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={p.normalHours}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { normalHours: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">โอที (ชม.)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.otHours}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { otHours: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">จน. คน/จุด</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.shiftsPerPointNormal}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { shiftsPerPointNormal: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 col-span-2">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-red-500" /> วันหยุด/ขัตฤกษ์
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">ปกติ (ชม.)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={p.holidayNormalHours}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { holidayNormalHours: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">โอที (ชม.)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.holidayOtHours}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { holidayOtHours: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">จน. คน/จุด</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.shiftsPerPointHoliday}
                                    disabled={!isAuthenticated}
                                    onChange={(e) => updateProfile(p.id, { shiftsPerPointHoliday: Number(e.target.value) })}
                                    className="w-full text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 italic flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-400" />
                            <p>
                              <strong className="text-slate-600 dark:text-slate-300 not-italic">วิธีคำนวณฐานค่าแรง:</strong> นำค่าแรงขั้นต่ำของจังหวัด ÷ 8 เพื่อหา "ค่าแรงต่อชั่วโมง"
                              <br />• ค่าจ้างปกติ = (ชม.ละ x {p.normalHours} ชม.)
                              {p.otHours > 0 && ` + (OT = ชม.ละ x ${settings.otNormalRate} x ${p.otHours} ชม.)`}
                              <br />• ค่าจ้างวันหยุด = {p.holidayOtHours > 0 ? `(ชม.ละ x 2 x ${p.holidayNormalHours} ชม.) + (OT = ชม.ละ x ${settings.otHolidayRate} x ${p.holidayOtHours} ชม.)` : `(ชม.ละ x ${p.holidayNormalHours} ชม.)`}
                              <br />• ใช้บุคลากร {p.shiftsPerPointNormal} คน สำหรับวันปกติ, และ {p.shiftsPerPointHoliday} คน สำหรับวันหยุด ต่อ 1 จุด/สถานที่
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : null}
      </main>

      {/* Holiday Modal */}
      <AnimatePresence>
        {holidayModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">กำหนดวันหยุด</h3>
                <button onClick={() => setHolidayModal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">วันที่</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {format(new Date(holidayModal.date), 'dd MMMM yyyy')}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ชื่อวันหยุด</label>
                  <input
                    type="text"
                    autoFocus
                    value={holidayModal.name}
                    onChange={(e) => setHolidayModal({ ...holidayModal, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && confirmAddHoliday()}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-slate-100"
                    placeholder="ระบุชื่อวันหยุด"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setHolidayModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmAddHoliday}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {importModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">นำเข้าข้อมูล</h3>
                <button onClick={() => setImportModal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  พบข้อมูลที่สามารถนำเข้าได้ คุณต้องการดำเนินการอย่างไร?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => applyImport('overwrite')}
                    className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all group text-slate-900 dark:text-slate-100"
                  >
                    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">ล้างข้อมูลเก่าและเขียนทับ</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ข้อมูลปัจจุบันทั้งหมดจะถูกแทนที่ด้วยข้อมูลจากไฟล์</p>
                  </button>
                  <button
                    onClick={() => applyImport('merge')}
                    className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all group text-slate-900 dark:text-slate-100"
                  >
                    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">เพิ่มเข้าไปรวมกับข้อมูลปัจจุบัน</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">เพิ่มสถานที่และวันหยุดจากไฟล์เข้าไปในรายการปัจจุบัน</p>
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setImportModal(null)}
                  className="w-full px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {exportModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">บันทึกและส่งออกข้อมูล</h3>
                <button onClick={() => setExportModal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ชื่อไฟล์</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={exportModal.filename}
                      onChange={(e) => setExportModal({ ...exportModal, filename: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && confirmExport()}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-slate-100"
                      placeholder="ระบุชื่อไฟล์"
                    />
                    <span className="text-slate-400 dark:text-slate-500 font-bold">.json</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ข้อมูลจะถูกบันทึกไว้ในเบราว์เซอร์และดาวน์โหลดเป็นไฟล์เพื่อนำไปใช้กับเครื่องอื่น
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setExportModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmExport}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                >
                  บันทึกและดาวน์โหลด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Report Section */}
      <div className="print-only p-8 bg-white text-black">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">รายงานสรุปงบประมาณค่าจ้างรักษาความปลอดภัย</h1>
          <p className="text-sm">ประจำช่วงเวลา {format(parse(startDate, 'yyyy-MM', new Date()), 'MMMM yyyy')} ถึง {format(parse(endDate, 'yyyy-MM', new Date()), 'MMMM yyyy')}</p>
        </div>

        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-slate-100">
              <th rowSpan={2} className="border border-black p-1 text-center">ลำดับ</th>
              <th rowSpan={2} className="border border-black p-1 text-center">สถานที่</th>
              <th rowSpan={2} className="border border-black p-1 text-center">รูปแบบผลัด<br />/ โปรไฟล์</th>
              <th rowSpan={2} className="border border-black p-1 text-center">ค่าแรง<br />ขั้นต่ำ</th>
              <th rowSpan={2} className="border border-black p-1 text-center">ปฏิบัติงาน<br />ปกติ (8 ชม.)</th>
              <th rowSpan={2} className="border border-black p-1 text-center">จำนวน<br />สถานที่<br />(จุด รปภ.)</th>
              <th rowSpan={2} className="border border-black p-1 text-center">จำนวน<br />คน</th>
              <th rowSpan={2} className="border border-black p-1 text-center">จำนวน<br />ผลัด</th>
              <th rowSpan={2} className="border border-black p-1 text-center">ค่าจ้างแรงงาน<br />{periodStats ? Math.floor(periodStats.totalDays / 30) : 0} เดือน</th>
              <th rowSpan={2} className="border border-black p-1 text-center">ค่าใช้จ่าย<br />บริหารจัดการ<br />{settings.managementFeeRate}%</th>
              <th rowSpan={2} className="border border-black p-1 text-center">เงินสมทบ<br />{settings.socialSecurityRate}%</th>
              <th rowSpan={2} className="border border-black p-1 text-center">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const b = calculateBudget(row);
              if (!b || !periodStats) return null;

              const profile = profiles.find(p => p.id === row.selectedProfileId) || profiles[0];
              const totalPeopleShift = (profile.shiftsPerPointNormal + profile.shiftsPerPointHoliday); // Just display combined 
              const dailyRatePerPerson = (profile.normalHours * (row.minWage / 8));

              return (
                <tr key={row.id}>
                  <td className="border border-black p-1 text-center">{index + 1}</td>
                  <td className="border border-black p-1">{row.location} {row.province !== 'กรุงเทพมหานคร' && `(${row.province})`}</td>
                  <td className="border border-black p-1 text-center">{profile.name}</td>
                  <td className="border border-black p-1 text-center">{row.minWage.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                  <td className="border border-black p-1 text-center">{dailyRatePerPerson.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                  <td className="border border-black p-1 text-center">{row.points}</td>
                  <td className="border border-black p-1 text-center">{row.points * Math.max(profile.shiftsPerPointNormal, profile.shiftsPerPointHoliday)}</td>
                  <td className="border border-black p-1 text-center">{b.totalShiftsCombined * row.points}</td>
                  <td className="border border-black p-1 text-right">{b.baseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1 text-right">{b.managementFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1 text-right">{b.socialSecurity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="border border-black p-1 text-right font-bold">{b.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 font-bold">
              <td colSpan={5} className="border border-black p-1 text-center">รวม</td>
              <td className="border border-black p-1 text-center">
                {rows.reduce((acc, r) => acc + r.points, 0)}
              </td>
              <td className="border border-black p-1 text-center">
                {rows.reduce((acc, r) => acc + (r.points * Math.max((profiles.find(p => p.id === r.selectedProfileId) || profiles[0]).shiftsPerPointNormal, (profiles.find(p => p.id === r.selectedProfileId) || profiles[0]).shiftsPerPointHoliday)), 0)}
              </td>
              <td className="border border-black p-1 text-center">
                {rows.reduce((acc, r) => acc + ((calculateBudget(r)?.totalShiftsCombined || 0) * r.points), 0)}
              </td>
              <td className="border border-black p-1 text-right">
                {rows.reduce((acc, r) => acc + (calculateBudget(r)?.baseTotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="border border-black p-1 text-right">
                {rows.reduce((acc, r) => acc + (calculateBudget(r)?.managementFee || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="border border-black p-1 text-right">
                {rows.reduce((acc, r) => acc + (calculateBudget(r)?.socialSecurity || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="border border-black p-1 text-right">
                {rows.reduce((acc, r) => acc + (calculateBudget(r)?.grandTotal || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-xs">
            <div className="flex justify-between border-b border-black pb-1">
              <span>ภาษีมูลค่าเพิ่ม 7%</span>
              <span>{(rows.reduce((acc, r) => acc + (calculateBudget(r)?.grandTotal || 0), 0) * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>วงเงินเสนอราคารวมภาษีมูลค่าเพิ่ม</span>
              <span>{(rows.reduce((acc, r) => acc + (calculateBudget(r)?.grandTotal || 0), 0) * 1.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <form onSubmit={handleLogin}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">ผู้ดูแลระบบ</h3>
                  </div>
                  <button type="button" onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg font-bold border border-red-100 dark:border-red-800/50">
                      {loginError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">ชื่อผู้ใช้</label>
                    <input
                      type="text"
                      autoFocus
                      disabled={isLoggingIn}
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">รหัสผ่าน</label>
                    <input
                      type="password"
                      disabled={isLoggingIn}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                      placeholder="Password"
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginForm.username || !loginForm.password}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      'เข้าสู่ระบบ'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Export Modal */}
      <AnimatePresence>
        {csvExportModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">ส่งออกข้อมูลค่าแรง (CSV)</h3>
                <button onClick={() => setCsvExportModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">ชื่อไฟล์</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={csvExportModal.filename}
                      onChange={(e) => setCsvExportModal({ ...csvExportModal, filename: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && confirmCSVExport()}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      placeholder="ระบุชื่อไฟล์"
                    />
                    <span className="text-slate-400 font-bold">.csv</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setCsvExportModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmCSVExport}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  ส่งออกไฟล์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{confirmModal.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{confirmModal.message}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      confirmModal.onResolve(false);
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-sans"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onResolve(true);
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 dark:bg-red-500 rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all shadow-lg shadow-red-100 dark:shadow-none"
                  >
                    ยืนยันการลบ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
