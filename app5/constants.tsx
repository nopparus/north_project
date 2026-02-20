
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
  Map,
  History
} from 'lucide-react';

export const PROVINCES = [
  "แม่ฮ่องสอน", "เชียงใหม่", "เชียงราย", "ลำปาง", "พะเยา",
  "ลำพูน", "น่าน", "แพร่", "อุตรดิตถ์", "พิษณุโลก",
  "สุโขทัย", "ตาก", "กำแพงเพชร", "เพชรบูรณ์", "พิจิตร",
  "นครสวรรค์", "อุทัยธานี"
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
  'Cooling System': { label: 'ระบบระบายความร้อน', icon: <Wind size={20} />, color: 'bg-sky-500' },
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
  'Cooling System': ['Efficiency Test', 'Air Flow Check', 'Control Unit Audit'],
};

export const NAVIGATION = [
  { name: 'แดชบอร์ด', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
  { name: 'ตารางแผนงาน', icon: <Calendar size={20} />, id: 'schedule' },
  { name: 'จัดการพื้นที่/ชุมสาย', icon: <MapPin size={20} />, id: 'locations' },
  { name: 'แผนที่จุดติดตั้ง (Map)', icon: <Map size={20} />, id: 'nt-map' },
  { name: 'ประวัติการทำงาน', icon: <History size={20} />, id: 'history' },
];
