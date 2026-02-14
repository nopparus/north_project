
import { NodeType, CustomIcon } from './types';
import { ALL_MATERIALS } from './materials-db';

export const INITIAL_MATERIALS = ALL_MATERIALS;

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

export const SYSTEM_ICONS: CustomIcon[] = [
  // ── Professional Symbols (technical SVG) ──────────────────────────────────
  {
    id: 'sys-exchange', isSystem: true, dots: [],
    name: 'Telephone Exchange', description: 'EX — ชุมสายโทรศัพท์',
    dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="6" y="6" width="20" height="20" fill="white" stroke="#1e293b" stroke-width="2"/>` +
      `<path d="M6 6 L26 26 M6 26 L26 6" stroke="#1e293b" stroke-width="1"/>` +
      `<path d="M6 6 L16 16 L6 26 Z" fill="#1e293b"/>` +
      `<path d="M26 6 L16 16 L26 26 Z" fill="#1e293b"/>` +
      `</svg>`),
  },
  {
    id: 'sys-cabinet', isSystem: true, dots: [],
    name: 'Cabinet (OFCCC)', description: 'CF — ตู้ Cross-Connect',
    dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M8 26 L8 12 A8 8 0 0 1 24 12 L24 26 Z" fill="white" stroke="#1e293b" stroke-width="2"/>` +
      `<line x1="8" y1="26" x2="24" y2="26" stroke="#1e293b" stroke-width="2"/>` +
      `</svg>`),
  },
  {
    id: 'sys-straight-joint', isSystem: true, dots: [],
    name: 'Straight Joint (SJ)', description: 'SJ — กล่องต่อสาย',
    dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
      `<line x1="2" y1="16" x2="30" y2="16" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2"/>` +
      `<circle cx="16" cy="16" r="5" fill="#1e293b"/>` +
      `</svg>`),
  },
  {
    id: 'sys-branch-joint', isSystem: true, dots: [],
    name: 'Branch Joint (BJ)', description: 'BJ — จุดแยกสาย',
    dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
      `<line x1="2" y1="20" x2="30" y2="20" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2"/>` +
      `<line x1="16" y1="6" x2="16" y2="20" stroke="#1e293b" stroke-width="1.5"/>` +
      `<path d="M11 16 L16 20 L21 16" fill="none" stroke="#1e293b" stroke-width="1.5"/>` +
      `</svg>`),
  },
  {
    id: 'sys-odp', isSystem: true, dots: [],
    name: 'Proposed ODP', description: 'OD — จุดกระจายสายออปติก',
    dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
      `<line x1="0" y1="16" x2="14" y2="16" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2"/>` +
      `<path d="M12 8 A10 10 0 0 1 12 24" fill="none" stroke="#1e293b" stroke-width="1.5"/>` +
      `<path d="M20 8 A10 10 0 0 0 20 24" fill="none" stroke="#1e293b" stroke-width="1.5"/>` +
      `<line x1="10" y1="16" x2="22" y2="16" stroke="#1e293b" stroke-width="1"/>` +
      `<line x1="6" y1="16" x2="10" y2="16" stroke="#1e293b" stroke-width="2"/>` +
      `<path d="M6 14 L2 16 L6 18 Z" fill="#1e293b"/>` +
      `</svg>`),
  },
  // ── Classic Markers (PIN style) ───────────────────────────────────────────
  { id: 'sys-sdp',    isSystem: true, dots: [], name: 'SDP',            description: 'SD — Service Delivery Point', dataUrl: pinSvg('#0d9488', 'SD') },
  { id: 'sys-dp',     isSystem: true, dots: [], name: 'DP',             description: 'DP — Distribution Point',      dataUrl: pinSvg('#c2410c', 'DP') },
  { id: 'sys-pole',   isSystem: true, dots: [], name: 'เสาทีโอที',       description: 'TP — TOT Pole',               dataUrl: pinSvg('#0ea5e9', 'TP') },
  { id: 'sys-mh',     isSystem: true, dots: [], name: 'บ่อพัก (Manhole)',description: 'MH — Underground Vault',      dataUrl: pinSvg('#334155', 'MH') },
  { id: 'sys-pe',     isSystem: true, dots: [], name: 'PE',             description: 'PE — Pillar Equipment',        dataUrl: pinSvg('#84cc16', 'PE') },
  { id: 'sys-cab',    isSystem: true, dots: [], name: 'CAB',            description: 'CB — Cabinet',                 dataUrl: pinSvg('#ef4444', 'CB') },
  { id: 'sys-riser',  isSystem: true, dots: [], name: 'Riser',          description: 'RS — Riser',                   dataUrl: pinSvg('#0369a1', 'RS') },
  { id: 'sys-sam',    isSystem: true, dots: [], name: 'SAM',            description: 'SM — SAM Node',               dataUrl: pinSvg('#dc2626', 'SM') },
  { id: 'sys-switch', isSystem: true, dots: [], name: 'SWITCH',         description: 'SW — Network Switch',          dataUrl: pinSvg('#eab308', 'SW') },
  { id: 'sys-msan',   isSystem: true, dots: [], name: 'MSAN',           description: 'MS — Multi-Service Access Node', dataUrl: pinSvg('#1e3a8a', 'MS') },
  { id: 'sys-ofccc',  isSystem: true, dots: [], name: 'OFCCC',          description: 'FC — Fiber Cabinet',           dataUrl: pinSvg('#ea580c', 'FC') },
  { id: 'sys-g3',     isSystem: true, dots: [], name: '3G/4G',          description: '3G — Mobile Base Station',     dataUrl: pinSvg('#2563eb', '3G') },
  { id: 'sys-wilink', isSystem: true, dots: [], name: 'WiLink',         description: 'WL — Wireless Link',           dataUrl: pinSvg('#7c3aed', 'WL') },
  { id: 'sys-ais',    isSystem: true, dots: [], name: 'AIS',            description: 'AS — AIS Node',               dataUrl: pinSvg('#65a30d', 'AS') },
  { id: 'sys-lpe',    isSystem: true, dots: [], name: 'LPE',            description: 'LP — LPE Node',               dataUrl: pinSvg('#ca8a04', 'LP') },
  { id: 'sys-excu',   isSystem: true, dots: [], name: 'ชุมสาย (Copper)', description: 'CU — Exchange Copper',        dataUrl: pinSvg('#ec4899', 'CU') },
  { id: 'sys-custom', isSystem: true, dots: [], name: 'Custom Node',    description: '?? — Custom',                 dataUrl: pinSvg('#3b82f6', '??') },
];
