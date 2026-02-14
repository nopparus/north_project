
import { NodeType, CustomIcon } from './types';


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

// ---------- System (built-in) icons — SVG data URLs ----------
const svgUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const PIN_PATH_STR = PIN_PATH;

const pinSvg = (color: string, short: string) =>
  svgUrl(`<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="${PIN_PATH_STR}" fill="${color}" stroke="white" stroke-width="1"/>` +
    `<circle cx="12" cy="9" r="5" fill="white" fill-opacity="0.2"/>` +
    `<text x="12" y="11" text-anchor="middle" font-size="6" font-weight="bold" fill="white">${short}</text>` +
    `</svg>`);

export const SYSTEM_ICONS: CustomIcon[] = [];
