
import { NodeType, CustomIcon } from './types';


export const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";

export const NODE_SYMBOL_MAP: Record<NodeType, { label: string; short: string; color: string; icon?: string }> = {
  [NodeType.CUSTOM]: { label: 'Custom Node', short: '??', color: '#3b82f6' },
} as any;

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
