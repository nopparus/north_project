import { Project, MaintenanceRecord, ScheduleItem, LocationInfo, WorkType } from '../types';

const BASE = '/api/pms';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── MAPPERS: snake_case (DB) ↔ camelCase (Frontend) ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    status: r.status,
    color: r.color,
    equipmentTypes: Array.isArray(r.equipment_types) ? r.equipment_types : JSON.parse(r.equipment_types || '[]'),
    workType: r.work_type,
  };
}
function fromProject(p: Partial<Project> & { workType?: WorkType }) {
  return {
    name: p.name,
    status: p.status,
    color: p.color,
    equipment_types: p.equipmentTypes,
    work_type: p.workType,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLocation(r: any): LocationInfo {
  return {
    id: r.id,
    province: r.province,
    siteName: r.site_name,
    numFacilities: r.num_facilities,
    numGenerators: r.num_generators,
  };
}
function fromLocation(l: Partial<LocationInfo>) {
  return {
    province: l.province,
    site_name: l.siteName,
    num_facilities: l.numFacilities,
    num_generators: l.numGenerators,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(r: any): MaintenanceRecord {
  return {
    id: r.id,
    projectId: r.project_id,
    workType: r.work_type,
    siteId: r.site_id,
    equipmentType: r.equipment_type,
    date: r.date,
    inspector: r.inspector,
    coInspector: r.co_inspector ?? undefined,
    status: r.status,
    data: typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {}),
    notes: r.notes ?? undefined,
    conditionRating: r.condition_rating ?? undefined,
  };
}
function fromRecord(rec: Partial<MaintenanceRecord>) {
  return {
    project_id: rec.projectId,
    work_type: rec.workType,
    site_id: rec.siteId,
    equipment_type: rec.equipmentType,
    date: rec.date,
    inspector: rec.inspector,
    co_inspector: rec.coInspector,
    status: rec.status,
    data: rec.data,
    notes: rec.notes,
    condition_rating: rec.conditionRating,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toScheduleItem(r: any): ScheduleItem {
  return {
    id: r.id,
    projectId: r.project_id,
    equipmentType: r.equipment_type,
    startMonth: r.start_month,
    duration: r.duration,
    label: r.label,
  };
}
function fromScheduleItem(s: Partial<ScheduleItem>) {
  return {
    project_id: s.projectId,
    equipment_type: s.equipmentType,
    start_month: s.startMonth,
    duration: s.duration,
    label: s.label,
  };
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: async (workType?: WorkType): Promise<Project[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/projects${workType ? `?workType=${workType}` : ''}`);
    return rows.map(toProject);
  },

  create: async (data: Omit<Project, 'id'>): Promise<Project> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('POST', '/projects', fromProject(data));
    return toProject(row);
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('PUT', `/projects/${id}`, fromProject(data));
    return toProject(row);
  },

  delete: (id: string): Promise<{ success: boolean }> =>
    request('DELETE', `/projects/${id}`),
};

// ─── LOCATIONS ───────────────────────────────────────────────────────────────

export const locationsApi = {
  list: async (province?: string): Promise<LocationInfo[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/locations${province ? `?province=${encodeURIComponent(province)}` : ''}`);
    return rows.map(toLocation);
  },

  create: async (data: Omit<LocationInfo, 'id'>): Promise<LocationInfo> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('POST', '/locations', fromLocation(data));
    return toLocation(row);
  },

  update: async (id: string, data: Partial<LocationInfo>): Promise<LocationInfo> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('PUT', `/locations/${id}`, fromLocation(data));
    return toLocation(row);
  },

  delete: (id: string): Promise<{ success: boolean }> =>
    request('DELETE', `/locations/${id}`),
};

// ─── RECORDS ─────────────────────────────────────────────────────────────────

export const recordsApi = {
  list: async (filters?: { projectId?: string; workType?: WorkType }): Promise<MaintenanceRecord[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.workType)  params.set('workType', filters.workType);
    const qs = params.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/records${qs ? `?${qs}` : ''}`);
    return rows.map(toRecord);
  },

  create: async (data: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('POST', '/records', fromRecord(data));
    return toRecord(row);
  },

  update: async (id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('PUT', `/records/${id}`, fromRecord(data));
    return toRecord(row);
  },

  delete: (id: string): Promise<{ success: boolean }> =>
    request('DELETE', `/records/${id}`),
};

// ─── SCHEDULE ────────────────────────────────────────────────────────────────

export const scheduleApi = {
  list: async (projectId?: string): Promise<ScheduleItem[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/schedule${projectId ? `?projectId=${projectId}` : ''}`);
    return rows.map(toScheduleItem);
  },

  create: async (data: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('POST', '/schedule', fromScheduleItem(data));
    return toScheduleItem(row);
  },

  update: async (id: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('PUT', `/schedule/${id}`, fromScheduleItem(data));
    return toScheduleItem(row);
  },

  delete: (id: string): Promise<{ success: boolean }> =>
    request('DELETE', `/schedule/${id}`),
};
