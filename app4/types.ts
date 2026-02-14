
export interface Material {
  id: number;
  material_type: string;    // T01 = stationary equipment, T02 = cable/per-meter
  material_code: string;
  material_name: string;
  category: string;
  unit: string;
  unit_price: number;        // (cable + material) cost per unit
  cable_unit_price: number;  // cable component per unit (0 for equipment)
  labor_unit_price: number;  // labor cost per unit
  action_type: string;
  spec_brand: string;
  remark: string;
  symbol_group?: string;   // icon-symbol grouping tag (e.g. "FDF","ODP","Pole")
}

export enum NodeType {
  EXCHANGE = 'EXCHANGE',
  CABINET = 'CABINET',
  STRAIGHT_JOINT = 'STRAIGHT_JOINT',
  BRANCH_JOINT = 'BRANCH_JOINT',
  CUSTOM = 'CUSTOM',
  SWITCH = 'SWITCH',
  MSAN = 'MSAN',
  OFCCC = 'OFCCC',
  G3 = 'G3',
  WILINK = 'WILINK',
  AIS = 'AIS',
  TOT_POLE = 'TOT_POLE',
  LPE = 'LPE',
  MANHOLE = 'MANHOLE',
  PE = 'PE',
  DP = 'DP',
  CAB = 'CAB',
  RISER = 'RISER',
  SDP = 'SDP',
  ODP = 'ODP',
  SAM = 'SAM',
  EXCHANGE_COPPER = 'EXCHANGE_COPPER'
}

export interface IconDot {
  x: number;
  y: number;
  color: string;
}

export interface CustomIcon {
  id: string;
  name: string;
  description: string;
  dots: IconDot[];
  dataUrl?: string;
  associatedCategory?: string; // Changed from associatedMaterialType
  isSystem?: boolean;          // true = built-in standard symbol, cannot be deleted/edited
  iconGroup?: string;          // Custom grouping for organizing icons
  sortOrder?: number;          // Manual sort order within group
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  iconId?: string;
  x: number;
  y: number;
  label: string;
  materialId?: number;
  quantity?: number;
  terMaterialIds?: (number | null)[]; // TER material per connected edge; index matches edge order
  metadata?: {
    lat?: string;
    lng?: string;
  }
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  materialId: number;
  distance: number;
}

export interface ProjectState {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  state: ProjectState;
  province?: string;
  budgetYear?: string;
  area?: string;
  workType?: 'ทดแทนของเดิม' | 'ขอพาดสายสื่อสารใหม่';
}
