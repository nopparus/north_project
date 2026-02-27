
import { GroupRule } from './types';

export const RD05_COLS = [
  "PEA", "Route_Name", "Tag", "Owner", "Concession",
  "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
  "Total_Distance", "Distance_in_Area", "Installation", "Compensation",
  "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
  "Data_Source", "Username", "Name_Lastname", "Date_Edit"
];

export const RD03_COLS = [
  "PEA", "Route_Name", "Tag", "Owner", "Concession",
  "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
  "Total_Distance", "Distance_in_Area", "Installation", "Notes",
  "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
  "Data_Source", "Username", "Name_Lastname"
];

export const COLUMN_NAMES_TH: Record<string, string> = {
  "PEA": "กฟฟ.",
  "Route_Name": "ชื่อเส้นทาง",
  "Tag": "เลขพาดสาย/Tag",
  "Owner": "เจ้าของ",
  "Concession": "ผู้รับสัมปทาน",
  "Line_Type": "ประเภทสาย",
  "Diameter": "ขนาด (mm)",
  "Cores": "จำนวนคอร์",
  "Total_Poles": "จำนวนเสาทั้งหมด",
  "Poles_in_Area": "จำนวนเสาในงาน",
  "Total_Distance": "ระยะทางรวม (กม.)",
  "Distance_in_Area": "ระยะทางในงาน (กม.)",
  "Installation": "รูปแบบติดตั้ง",
  "Compensation": "ค่าตอบแทน",
  "Notes": "หมายเหตุ",
  "Start_Coordinates": "พิกัดเริ่มต้น",
  "End_Coordinates": "พิกัดสิ้นสุด",
  "Tag_of_Poles_Pass": "รหัสเสาที่ผ่าน",
  "Data_Source": "แหล่งข้อมูล",
  "Username": "User ผู้บันทึก",
  "Name_Lastname": "ชื่อ-นามสกุล",
  "Date_Edit": "วันที่แก้ไข",
  "GroupConcession": "กลุ่มผู้รับสัมปทาน",
  "Group": "เลขกลุ่ม"
};

// เงื่อนไขเริ่มต้นของ RD03
export const DEFAULT_RD03_RULES: GroupRule[] = [];

export const DEFAULT_RD05_RULES: GroupRule[] = [];

