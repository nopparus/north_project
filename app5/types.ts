
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
  serviceCenter: string;
  province: string;
  type: string;
  olt_count: number;
  images: string[];
  site_exists?: boolean;
  map_id?: string;
  custom_data?: Record<string, any>;
}

export interface MapLayer {
  id: string;
  name: string;
  schema: DynamicColumnSchema[];
  created_at: string;
}

export interface DynamicColumnSchema {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'date';
  options?: string[]; // for dropdowns
}

export interface ProjectFilterConfig {
  allowedTypes: string[]; // e.g. ['A', 'B', 'C', 'D', 'pending']
}

export type ProjectFieldType = 'text' | 'number' | 'dropdown' | 'checkbox' | 'photo';

export interface ProjectFieldSchema {
  id: string;     // unique key e.g. 'field_1'
  label: string;  // display label
  type: ProjectFieldType;
  options?: string[];   // for dropdown
  required?: boolean;
}

export interface ProjectSiteRecord {
  id?: number;
  projectId: string;
  siteId: number;
  customData: Record<string, any>;
  images: string[];
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  color: string;
  equipmentTypes: string[];
  workType: WorkType;
  filterConfig?: ProjectFilterConfig;
  fieldsSchema?: ProjectFieldSchema[]; // per-project data collection schema
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
