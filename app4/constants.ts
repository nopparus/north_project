
import { Material, NodeType } from './types';

export const INITIAL_MATERIALS: Material[] = [
  { id: 1, material_type: "T01", material_code: "1A10001561", material_name: "ADHESIVE POLYVINYL TAPE 0.18x19MM.x20M.", category: "Accessories", unit: "RO", unit_price: 20.00, action_type: "ซื้อ", spec_brand: "OES-001-056-01", remark: "10 RO/PACK" },
  { id: 11, material_type: "T01", material_code: "1A10064102", material_name: "DROP ACCESS TERMINAL W SPLITTER BOX 1:8", category: "Terminal Box", unit: "ST", unit_price: 1300.00, action_type: "เบิก", spec_brand: "-", remark: "1 ST/BX" },
  { id: 17, material_type: "T01", material_code: "1A10062490", material_name: "FIBER OPTIC SPLITTER TYPE A2(1:4)SC/APC", category: "Splitter", unit: "PC", unit_price: 260.00, action_type: "เบิก", spec_brand: "OES-001-076-04", remark: "-" },
  { id: 51, material_type: "T01", material_code: "1A10065734", material_name: "MINI STRAIGHT JOINT AERIAL CLOSURE 4-12", category: "Closure", unit: "ST", unit_price: 600.00, action_type: "เบิก", spec_brand: "OES-001-085-03", remark: "1 ST/BX (SNAP LOCK)" },
  { id: 64, material_type: "T01", material_code: "1A10065661", material_name: "SDP FTTx(A) WITH SPLITTER BOX 1:8", category: "SDP", unit: "ST", unit_price: 2700.00, action_type: "เบิก", spec_brand: "OES-002-049-03", remark: "1 ST/BX" },
  { id: 66, material_type: "T01", material_code: "1A10062327", material_name: "SDP FTTX(A)IN-LINE CLOSURE 12F 8DROP", category: "SDP", unit: "ST", unit_price: 2600.00, action_type: "ซื้อ", spec_brand: "OES-001-080-02", remark: "-" },
  { id: 86, material_type: "T01", material_code: "1A10063528", material_name: "STRAIGHT JOINT AERIAL CLOSURE 120F", category: "Closure", unit: "ST", unit_price: 4350.00, action_type: "เบิก", spec_brand: "OES-001-084-02", remark: "1 ST/BX (SNAP LOCK)" },
  { id: 125, material_type: "T02", material_code: "2A10065461", material_name: "S.M OPT.FIBER CABLE 120F.(ADSS FR)", category: "Cabling", unit: "M", unit_price: 60.00, action_type: "เบิก", spec_brand: "OES-004-065-01", remark: "4000M/REEL" },
  { id: 129, material_type: "T02", material_code: "2A10065452", material_name: "S.M OPT.FIBER CABLE 12F.(ADSS FR)", category: "Cabling", unit: "M", unit_price: 20.00, action_type: "เบิก", spec_brand: "OES-004-065-01", remark: "4000M/REEL" },
  { id: 141, material_type: "T02", material_code: "2A10063791", material_name: "S.M OPT.FIBER CABLE 24F.(ARSS)", category: "Cabling", unit: "M", unit_price: 25.00, action_type: "เบิก", spec_brand: "OES-004-054-02", remark: "4000M/REEL" },
  { id: 146, material_type: "T02", material_code: "2A10065453", material_name: "S.M OPT.FIBER CABLE 24F.(ADSS FR)", category: "Cabling", unit: "M", unit_price: 22.00, action_type: "เบิก", spec_brand: "OES-004-065-01", remark: "4000M/REEL" },
  { id: 147, material_type: "T02", material_code: "2A10065721", material_name: "S.M OPT.FIBER CABLE 48F.(ADSS FRP FR)", category: "Cabling", unit: "M", unit_price: 35.00, action_type: "เบิก", spec_brand: "OES-004-069-01", remark: "4000M/REEL" },
];

export const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";

export const NODE_SYMBOL_MAP: Record<NodeType, { label: string; short: string; color: string; icon?: string }> = {
  [NodeType.EXCHANGE]: { label: 'Telephone Exchange', short: 'EX', color: '#1e293b' },
  [NodeType.CABINET]: { label: 'Cabinet (OFCCC)', short: 'CF', color: '#1e293b' },
  [NodeType.STRAIGHT_JOINT]: { label: 'Straight Joint (SJ)', short: 'SJ', color: '#000000' },
  [NodeType.BRANCH_JOINT]: { label: 'Branch Joint (BJ)', short: 'BJ', color: '#000000' },
  [NodeType.ODP]: { label: 'Proposed ODP', short: 'OD', color: '#1e293b' },
  [NodeType.SDP]: { label: 'SDP', short: 'SD', color: '#0d9488' },
  [NodeType.DP]: { label: 'DP', short: 'DP', color: '#c2410c' },
  [NodeType.TOT_POLE]: { label: 'เสาทีโอที', short: 'TP', color: '#0ea5e9' },
  [NodeType.MANHOLE]: { label: 'บ่อพัก', short: 'MH', color: '#334155' },
  [NodeType.PE]: { label: 'PE', short: 'PE', color: '#84cc16' },
  [NodeType.CAB]: { label: 'CAB', short: 'CB', color: '#ef4444' },
  [NodeType.RISER]: { label: 'Riser', short: 'RS', color: '#0369a1' },
  [NodeType.SAM]: { label: 'SAM', short: 'SM', color: '#dc2626' },
  [NodeType.SWITCH]: { label: 'SWITCH', short: 'SW', color: '#eab308' },
  [NodeType.MSAN]: { label: 'MSAN', short: 'MS', color: '#1e3a8a' },
  [NodeType.OFCCC]: { label: 'OFCCC', short: 'FC', color: '#ea580c' },
  [NodeType.G3]: { label: '3G/4G', short: '3G', color: '#2563eb' },
  [NodeType.WILINK]: { label: 'WiLink', short: 'WL', color: '#7c3aed' },
  [NodeType.AIS]: { label: 'AIS', short: 'AS', color: '#65a30d' },
  [NodeType.LPE]: { label: 'LPE', short: 'LP', color: '#ca8a04' },
  [NodeType.CUSTOM]: { label: 'Custom Node', short: '??', color: '#3b82f6' },
  [NodeType.EXCHANGE_COPPER]: { label: 'ชุมสาย (Copper)', short: 'CU', color: '#ec4899' },
};
