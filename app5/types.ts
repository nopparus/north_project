
export type EquipmentType = string;
export type WorkType = 'PM' | 'Survey';

export interface LocationInfo {
  id: string;
  province: string;
  siteName: string;
  numFacilities: number;
  numGenerators: number;
}

export interface NTLocation {
  id: number;
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  serviceCenter: string;
  province: string;
  image_url?: string;
  site_exists?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  color: string;
  equipmentTypes: string[];
  workType: WorkType; // เพิ่มเพื่อระบุหมวดงานหลักของโครงการ
}

export interface MaintenanceRecord {
  id: string;
  projectId: string;
  workType: WorkType;
  siteId: string;
  equipmentType: EquipmentType;
  date: string;
  inspector: string;
  coInspector?: string;
  status: 'Normal' | 'Abnormal' | 'Pending';
  data: any;
  notes?: string;
  conditionRating?: number; // สำหรับงาน Survey (1-5)
}

export interface ScheduleItem {
  id: string;
  projectId: string;
  equipmentType: EquipmentType;
  startMonth: number; // 1-12
  duration: number; // in months
  label: string;
}

export enum MaintenanceStatus {
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  UPCOMING = 'UPCOMING',
  NONE = 'NONE'
}
