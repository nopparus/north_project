import { MapLayer, NTLocation, Project, ProjectSiteRecord, MaintenanceRecord, ScheduleItem, LocationInfo, WorkType } from '../types';

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
    filterConfig: r.filter_config ? (typeof r.filter_config === 'string' ? JSON.parse(r.filter_config) : r.filter_config) : undefined,
    fieldsSchema: r.fields_schema ? (typeof r.fields_schema === 'string' ? JSON.parse(r.fields_schema) : r.fields_schema) : [],
  };
}
function fromProject(p: Partial<Project> & { workType?: WorkType }) {
  return {
    name: p.name,
    status: p.status,
    color: p.color,
    equipment_types: p.equipmentTypes,
    work_type: p.workType,
    filter_config: p.filterConfig,
    fields_schema: p.fieldsSchema,
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

export const mapsApi = {
  list: async (): Promise<MapLayer[]> => {
    return await request('GET', '/maps');
  },
  create: async (data: Partial<MapLayer>): Promise<MapLayer> => {
    return await request('POST', '/maps', data);
  },
  update: async (id: string, data: Partial<MapLayer>): Promise<MapLayer> => {
    return await request('PUT', `/maps/${id}`, data);
  },
  delete: async (id: string): Promise<void> => {
    await request('DELETE', `/maps/${id}`);
  }
};

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

// ─── PROJECT SITES ───────────────────────────────────────────────────────────

export const projectSitesApi = {
  getSitesForProject: async (projectId: string): Promise<number[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/project-sites?projectId=${projectId}`);
    return rows;
  },

  addSiteToProject: async (projectId: string, siteId: number): Promise<void> => {
    await request('POST', '/project-sites', { projectId, siteId });
  },

  addSitesToProjectBulk: async (projectId: string, siteIds: number[]): Promise<void> => {
    if (siteIds.length === 0) return;
    await request('POST', '/project-sites/bulk', { projectId, siteIds });
  },

  removeSiteFromProject: async (projectId: string, siteId: number): Promise<void> => {
    await request('DELETE', '/project-sites', { projectId, siteId });
  },

  removeSitesFromProjectBulk: async (projectId: string, siteIds: number[]): Promise<void> => {
    if (siteIds.length === 0) return;
    await request('DELETE', '/project-sites/bulk', { projectId, siteIds });
  }
};

// ─── PROJECT SITE RECORDS ─────────────────────────────────────────────────────

export const projectRecordsApi = {
  getForProject: async (projectId: string): Promise<ProjectSiteRecord[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', `/project-records?projectId=${projectId}`);
    return rows.map(r => ({
      id: r.id,
      projectId: r.project_id,
      siteId: r.site_id,
      customData: typeof r.custom_data === 'string' ? JSON.parse(r.custom_data) : (r.custom_data || {}),
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
      updatedAt: r.updated_at,
    }));
  },

  upsert: async (record: Pick<ProjectSiteRecord, 'projectId' | 'siteId' | 'customData' | 'images'>): Promise<ProjectSiteRecord> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = await request('PUT', '/project-records', {
      projectId: record.projectId,
      siteId: record.siteId,
      customData: record.customData,
      images: record.images,
    });
    return {
      id: row.id,
      projectId: row.project_id,
      siteId: row.site_id,
      customData: typeof row.custom_data === 'string' ? JSON.parse(row.custom_data) : (row.custom_data || {}),
      images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
      updatedAt: row.updated_at,
    };
  },
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

  listNT: async (mapId?: string, bounds?: { minLat: number, maxLat: number, minLng: number, maxLng: number }, projectId?: string): Promise<NTLocation[]> => {
    const params = new URLSearchParams();
    if (mapId) params.append('mapId', mapId);
    if (projectId) params.append('projectId', projectId);
    if (bounds) {
      params.append('minLat', String(bounds.minLat));
      params.append('maxLat', String(bounds.maxLat));
      params.append('minLng', String(bounds.minLng));
      params.append('maxLng', String(bounds.maxLng));
    }
    const qs = params.toString();
    const url = qs ? `/nt-locations?${qs}` : '/nt-locations';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await request('GET', url);
    return rows.map((r: any) => ({
      id: r.id,
      locationId: String(r.id), // DB has no location_id, using id
      name: r.locationname || '',
      lat: parseFloat(r.latitude || '0'),
      lng: parseFloat(r.longitude || '0'),
      serviceCenter: r.servicecenter || '',
      province: r.province || '',
      type: r.type || '',
      images: r.images || [],
      olt_count: r.olt_count || 1,
      site_exists: r.site_exists,
      map_id: r.map_id,
      custom_data: r.custom_data,
    }));
  },

  updateNT: async (id: number, type: string): Promise<void> => {
    await request('PUT', `/nt-locations/${id}`, { type });
  },

  updateNTDetails: async (id: number, data: Partial<NTLocation>): Promise<NTLocation> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await request('PUT', `/nt-locations/${id}`, {
      type: data.type,
      locationname: data.name,
      province: data.province,
      servicecenter: data.serviceCenter,
      latitude: data.lat,
      longitude: data.lng,
      images: data.images,
      site_exists: data.site_exists,
      map_id: data.map_id,
      custom_data: data.custom_data,
    });
    return {
      id: res.id,
      locationId: String(res.id),
      name: res.site_name || res.locationname,
      lat: parseFloat(res.latitude),
      lng: parseFloat(res.longitude),
      serviceCenter: res.service_center || res.servicecenter,
      province: res.province,
      type: res.type,
      images: res.images || [],
      olt_count: res.olt_count || 1,
      site_exists: res.site_exists,
      map_id: res.map_id,
      custom_data: res.custom_data,
    };
  },

  createNT: async (data: Partial<NTLocation>): Promise<NTLocation> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await request('POST', '/nt-locations', {
      type: data.type,
      locationname: data.name,
      province: data.province,
      servicecenter: data.serviceCenter,
      latitude: data.lat,
      longitude: data.lng,
      images: data.images,
      site_exists: data.site_exists,
      map_id: data.map_id,
      custom_data: data.custom_data,
    });
    return {
      id: res.id,
      locationId: String(res.id),
      name: res.site_name || res.locationname,
      lat: parseFloat(res.latitude),
      lng: parseFloat(res.longitude),
      serviceCenter: res.service_center || res.servicecenter,
      province: res.province,
      type: res.type,
      images: res.images || [],
      olt_count: res.olt_count || 1,
      site_exists: res.site_exists,
      map_id: res.map_id,
      custom_data: res.custom_data,
    };
  },

  createNTBulk: async (data: Partial<NTLocation>[]): Promise<NTLocation[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data.map(d => ({
      type: d.type,
      locationname: d.name,
      province: d.province,
      servicecenter: d.serviceCenter,
      latitude: d.lat,
      longitude: d.lng,
      images: d.images,
      site_exists: d.site_exists,
      map_id: d.map_id,
      custom_data: d.custom_data,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any[] = await request('POST', '/nt-locations/bulk', payload);
    return res.map(r => ({
      id: r.id,
      locationId: String(r.id),
      name: r.site_name || r.locationname,
      lat: parseFloat(r.latitude),
      lng: parseFloat(r.longitude),
      serviceCenter: r.service_center || r.servicecenter,
      province: r.province,
      type: r.type,
      images: r.images || [],
      olt_count: r.olt_count || 1,
      site_exists: r.site_exists,
      map_id: r.map_id,
      custom_data: r.custom_data,
    }));
  },

  advancedBulkImport: async (payload: { 
    mode: 'append' | 'sync', 
    mapId: string | number, 
    locations: Partial<NTLocation>[], 
    deleteMissing?: boolean,
    preview?: boolean 
  }): Promise<{ 
    success: boolean, 
    message: string, 
    preview?: boolean,
    details?: string,
    results: { inserted: number, updated: number, deleted: number, skipped: number, toInsert?: number, toUpdate?: number, toSkip?: number, toDelete?: number } 
  }> => {
    const normalizeType = (t?: string) => {
      if (!t) return 'ทั่วไป';
      const s = String(t).trim();
      const lower = s.toLowerCase();
      if (lower.includes('type a') || s === 'A') return 'A';
      if (lower.includes('type b') || s === 'B') return 'B';
      if (lower.includes('type c') || s === 'C') return 'C';
      if (lower.includes('type d') || s === 'D') return 'D';
      return s;
    };

    // Use property names compatible with backend expectation if provided, 
    // otherwise fallback to NTLocation standard fields.
    const formattedLocations = payload.locations.map(d => ({
      id: d.id,
      system_id: d.id,
      type: normalizeType(d.type),
      locationname: d.locationname || d.name,
      province: d.province,
      servicecenter: d.servicecenter || d.serviceCenter,
      latitude: d.latitude || d.lat,
      longitude: d.longitude || d.lng,
      images: d.images,
      site_exists: d.site_exists,
      map_id: d.map_id,
      custom_data: d.custom_data,
    }));

    const res: any = await request('POST', '/nt-locations/advanced-bulk', {
      mode: payload.mode,
      mapId: payload.mapId,
      deleteMissing: payload.deleteMissing,
      preview: payload.preview,
      locations: formattedLocations
    });
    return res;
  },

  deleteNT: (id: number): Promise<{ success: boolean }> =>
    request('DELETE', `/nt-locations/${id}`),

  uploadImage: async (file: File, siteName?: string, siteId?: string | number): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const params = new URLSearchParams();
    if (siteName) params.append('siteName', siteName);
    if (siteId) params.append('siteId', String(siteId));

    const url = `${BASE}/upload${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  }
};

// ─── RECORDS ─────────────────────────────────────────────────────────────────

export const recordsApi = {
  list: async (filters?: { projectId?: string; workType?: WorkType }): Promise<MaintenanceRecord[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.workType) params.set('workType', filters.workType);
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
