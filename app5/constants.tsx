
import React from 'react';
import { 
  Wind, 
  Battery, 
  Zap, 
  Settings, 
  Box, 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  History 
} from 'lucide-react';
import { EquipmentType, LocationInfo, ScheduleItem, MaintenanceRecord, Project } from './types';

export const PROVINCES = [
  "แม่ฮ่องสอน", "เชียงใหม่", "เชียงราย", "ลำปาง", "พะเยา", 
  "ลำพูน", "น่าน", "แพร่", "อุตรดิตถ์", "พิษณุโลก", 
  "สุโขทัย", "ตาก", "กำแพงเพชร", "เพชรบูรณ์", "พิจิตร", 
  "นครสวรรค์", "อุทัยธานี"
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'โครงการบำรุงรักษา ประจำปี 2568 (ภาคเหนือ)', 
    status: 'active', 
    color: 'bg-blue-600',
    equipmentTypes: ['AC', 'Battery', 'Rectifier', 'Generator', 'Transformer'],
    workType: 'PM'
  },
  { 
    id: 'p2', 
    name: 'โครงการติดตั้งอุปกรณ์ใหม่ 2568', 
    status: 'active', 
    color: 'bg-indigo-600',
    equipmentTypes: ['AC', 'Battery', 'Generator'],
    workType: 'PM'
  },
  { 
    id: 's1', 
    name: 'สำรวจสภาพชุมสาย ภาคเหนือ 2568', 
    status: 'active', 
    color: 'bg-emerald-600',
    equipmentTypes: ['Infrastructure', 'Security', 'Environment'],
    workType: 'Survey'
  },
  { 
    id: 's2', 
    name: 'โครงการ Audit พลังงานรายไตรมาส', 
    status: 'active', 
    color: 'bg-teal-600',
    equipmentTypes: ['Power System', 'Cooling System'],
    workType: 'Survey'
  }
];

export const EQUIPMENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  AC: { label: 'ระบบเครื่องปรับอากาศ', icon: <Wind size={20} />, color: 'bg-blue-500' },
  Battery: { label: 'ระบบแบตเตอรี่', icon: <Battery size={20} />, color: 'bg-green-500' },
  Rectifier: { label: 'ระบบ Rectifier', icon: <Zap size={20} />, color: 'bg-yellow-500' },
  Generator: { label: 'เครื่องกำเนิดไฟฟ้า', icon: <Settings size={20} />, color: 'bg-purple-500' },
  Transformer: { label: 'หม้อแปลงไฟฟ้า', icon: <Box size={20} />, color: 'bg-red-500' },
  Infrastructure: { label: 'โครงสร้างพื้นฐาน', icon: <Box size={20} />, color: 'bg-slate-500' },
  Security: { label: 'ความปลอดภัย/CCTV', icon: <Settings size={20} />, color: 'bg-orange-500' },
  Environment: { label: 'สิ่งแวดล้อมหน้างาน', icon: <Wind size={20} />, color: 'bg-cyan-500' },
  'Power System': { label: 'ระบบพลังงาน', icon: <Zap size={20} />, color: 'bg-amber-500' },
  'Cooling System': { label: 'ระบบระบายความร้อน', icon: <Wind size={20} />, color: 'bg-sky-500' }
};

export const TASK_PRESETS: Record<string, string[]> = {
  // PM Presets
  AC: ['PM1 (ล้างคอยล์)', 'PM2 (ตรวจเช็คใหญ่)', 'เปลี่ยน Filter', 'ตรวจสอบน้ำยา'],
  Battery: ['PM1 (Capacity Test)', 'PM2 (Cell Check)', 'ทำความสะอาดขั้ว', 'ตรวจสอบแรงดัน'],
  Rectifier: ['PM1 (Load Test)', 'PM2 (System Check)', 'ตรวจสอบ Module', 'Audit ประสิทธิภาพ'],
  Generator: ['PM (Annual Service)', 'Monthly No-Load Test', 'เปลี่ยนถ่ายน้ำมันเครื่อง', 'ตรวจสอบ ATS'],
  Transformer: ['PM (Oil Analysis)', 'ตรวจสอบจุดเชื่อมต่อ', 'Visual Inspection', 'วัดค่า Grounding'],
  
  // Survey Presets
  Infrastructure: ['Site Audit (โครงสร้าง)', 'ตรวจสอบรอยร้าว/ทรุด', 'ตรวจสอบความสะอาด'],
  Security: ['Audit CCTV', 'ตรวจสอบระบบ Access Control', 'เช็คระบบ Fire Alarm'],
  Environment: ['วัดระดับเสียง', 'ตรวจวัดความชื้น', 'เช็คระบบระบายอากาศ'],
  'Power System': ['Energy Audit', 'เช็คจุดความร้อน (Thermo)', 'ตรวจสอบ Load Balance'],
  'Cooling System': ['Efficiency Test', 'Air Flow Check', 'Control Unit Audit']
};

export const NAVIGATION = [
  { name: 'แดชบอร์ด', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
  { name: 'ตารางแผนงาน', icon: <Calendar size={20} />, id: 'schedule' },
  { name: 'จัดการพื้นที่/ชุมสาย', icon: <MapPin size={20} />, id: 'locations' },
  { name: 'ประวัติการทำงาน', icon: <History size={20} />, id: 'history' }
];

export const ANNUAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', projectId: 'p1', equipmentType: 'AC', startMonth: 3, duration: 1, label: 'PM1' },
  { id: '2', projectId: 'p1', equipmentType: 'AC', startMonth: 9, duration: 1, label: 'PM2' },
  { id: '3', projectId: 'p1', equipmentType: 'Battery', startMonth: 4, duration: 1, label: 'PM1' },
  { id: 's1_plan1', projectId: 's1', equipmentType: 'Infrastructure', startMonth: 2, duration: 1, label: 'Site Audit Q1' },
];

export const MOCK_LOCATIONS: LocationInfo[] = [
  { id: 'site-1', province: 'เชียงใหม่', siteName: 'ศูนย์เชียงใหม่ 1', numFacilities: 54, numGenerators: 50 },
  { id: 'site-2', province: 'เชียงราย', siteName: 'ศูนย์เชียงราย 1', numFacilities: 14, numGenerators: 14 },
  { id: 'site-3', province: 'แม่ฮ่องสอน', siteName: 'ชุมสายแม่ฮ่องสอน', numFacilities: 13, numGenerators: 13 },
  { id: 'site-4', province: 'ลำปาง', siteName: 'ศูนย์ลำปาง 1', numFacilities: 22, numGenerators: 18 },
  { id: 'site-5', province: 'พะเยา', siteName: 'ชุมสายพะเยาหลัก', numFacilities: 8, numGenerators: 8 },
  { id: 'site-6', province: 'น่าน', siteName: 'ชุมสายดอยเสมอดาว', numFacilities: 5, numGenerators: 5 },
];

export const MOCK_RECORDS: MaintenanceRecord[] = [
  { id: 'r1', projectId: 'p1', workType: 'PM', siteId: 'ศูนย์เชียงใหม่ 1', equipmentType: 'AC', date: '2025-03-01', inspector: 'สมชาย มั่นใจ', status: 'Normal', data: {} },
  { id: 's_r1', projectId: 's1', workType: 'Survey', siteId: 'ศูนย์เชียงใหม่ 1', equipmentType: 'Infrastructure', date: '2025-02-10', inspector: 'เก่งกาจ สำรวจดี', status: 'Normal', data: {}, conditionRating: 4 },
];
