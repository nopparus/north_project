
export interface Material {
  id: number;
  material_type: string;
  material_code: string;
  material_name: string;
  category: string; // New grouping column
  unit: string;
  unit_price: number;
  action_type: string;
  spec_brand: string;
  remark: string;
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
