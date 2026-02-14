
import React, { useState, useMemo } from 'react';
import { ProjectState, Material, SavedProject, CustomIcon, NetworkNode, NetworkEdge } from '../types';
import { NODE_SYMBOL_MAP } from '../constants';
import { X, Printer } from 'lucide-react';

interface PrintMeta {
  area: string;
  route: string;
  surveyDate: string;
  surveyor: string;
  remark: string;
}

const DEFAULT_PRINT_META: PrintMeta = {
  area: '',
  route: '',
  surveyDate: new Date().toLocaleDateString('th-TH'),
  surveyor: '',
  remark: '',
};

interface Props {
  project: ProjectState;
  materials: Material[];
  savedProject?: SavedProject;
  customIcons: CustomIcon[];
  onClose: () => void;
}

const PRINT_W = 900;
const PRINT_H = 540;
const PAD = 60;
const HEADER_H = 60;
const FOOTER_H = 28;
const TOTAL_H = PRINT_H + HEADER_H + FOOTER_H;

// ── Compute layout from project nodes/edges ────────────────────────────────
function computeLayout(project: ProjectState) {
  if (project.nodes.length === 0) {
    return { svgNodes: [], svgEdges: [] };
  }
  const xs = project.nodes.map(n => n.x);
  const ys = project.nodes.map(n => n.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const dataW = maxX - minX || 1;
  const dataH = maxY - minY || 1;
  const availW = PRINT_W - PAD * 2;
  const availH = PRINT_H - PAD * 2;
  const scale = Math.min(availW / dataW, availH / dataH, 1.5);
  const mapX = (x: number) => PAD + (x - minX) * scale;
  const mapY = (y: number) => PAD + (y - minY) * scale;
  const svgNodes = project.nodes.map(n => ({ ...n, sx: mapX(n.x), sy: mapY(n.y) }));
  const svgEdges = project.edges.map(e => {
    const s = svgNodes.find(n => n.id === e.source);
    const t = svgNodes.find(n => n.id === e.target);
    return s && t ? { ...e, x1: s.sx, y1: s.sy, x2: t.sx, y2: t.sy } : null;
  }).filter(Boolean) as (NetworkEdge & { x1: number; y1: number; x2: number; y2: number })[];
  return { svgNodes, svgEdges };
}

// ── Generate SVG as a plain string for popup-window printing ────────────────
function generateSVGString(
  svgNodes: (NetworkNode & { sx: number; sy: number })[],
  svgEdges: (NetworkEdge & { x1: number; y1: number; x2: number; y2: number })[],
  meta: PrintMeta,
  savedProject?: SavedProject,
  customIcons: CustomIcon[] = [],
): string {
  const headerInfo = [
    ['ที่ / หน่วยงาน', meta.area || savedProject?.area || '—'],
    ['จังหวัด', savedProject?.province || '—'],
    ['ปีงบประมาณ', savedProject?.budgetYear || '—'],
    ['วันที่สำรวจ', meta.surveyDate || '—'],
    ['ผู้สำรวจ', meta.surveyor || '—'],
  ];

  const headerInfoSVG = headerInfo.map(([label, value], i) => `
    <g transform="translate(${300 + i * 122}, 10)">
      <text x="0" y="14" font-size="7" fill="#64748b" font-family="sans-serif">${label}</text>
      <text x="0" y="26" font-size="8" font-weight="bold" fill="white" font-family="sans-serif">${value}</text>
    </g>`).join('');

  const edgesSVG = svgEdges.map(edge => {
    const mx = (edge.x1 + edge.x2) / 2;
    const my = (edge.y1 + edge.y2) / 2;
    return `
      <g>
        <line x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}"
          stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="7,4"/>
        <rect x="${mx - 20}" y="${my - 8}" width="40" height="16" rx="5"
          fill="white" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="8" font-weight="bold"
          fill="#475569" font-family="sans-serif">${edge.distance}M</text>
      </g>`;
  }).join('');

  const nodesSVG = svgNodes.map(node => {
    const r = 14;
    const x = node.sx;
    const y = node.sy;
    const config = NODE_SYMBOL_MAP[node.type];
    const label = node.label || '';

    // Custom icon (dataUrl image)
    const icon = node.iconId ? customIcons.find(i => i.id === node.iconId) : null;
    if (icon?.dataUrl) {
      return `<g>
        <image href="${icon.dataUrl}" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}"/>
        <text x="${x}" y="${y + r + 9}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
      </g>`;
    }

    switch (node.type) {
      case 'EXCHANGE':
        return `<g>
          <rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <line x1="${x - r}" y1="${y - r}" x2="${x + r}" y2="${y + r}" stroke="#1e293b" stroke-width="0.8"/>
          <line x1="${x - r}" y1="${y + r}" x2="${x + r}" y2="${y - r}" stroke="#1e293b" stroke-width="0.8"/>
          <polygon points="${x - r},${y - r} ${x},${y} ${x - r},${y + r}" fill="#1e293b"/>
          <polygon points="${x + r},${y - r} ${x},${y} ${x + r},${y + r}" fill="#1e293b"/>
          <text x="${x}" y="${y + r + 9}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
        </g>`;
      case 'CABINET':
        return `<g>
          <path d="M${x - r} ${y + r} L${x - r} ${y - 4} A${r} ${r} 0 0 1 ${x + r} ${y - 4} L${x + r} ${y + r} Z"
            fill="white" stroke="#1e293b" stroke-width="1.5"/>
          <line x1="${x - r}" y1="${y + r}" x2="${x + r}" y2="${y + r}" stroke="#1e293b" stroke-width="1.5"/>
          <text x="${x}" y="${y + r + 9}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
        </g>`;
      case 'STRAIGHT_JOINT':
      case 'BRANCH_JOINT':
        return `<g>
          <circle cx="${x}" cy="${y}" r="5" fill="#1e293b"/>
          <text x="${x}" y="${y + 14}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
        </g>`;
      case 'ODP':
        return `<g>
          <path d="M${x - 6} ${y - r} A${r} ${r} 0 0 1 ${x - 6} ${y + r}" fill="none" stroke="#1e293b" stroke-width="1.5"/>
          <path d="M${x + 6} ${y - r} A${r} ${r} 0 0 0 ${x + 6} ${y + r}" fill="none" stroke="#1e293b" stroke-width="1.5"/>
          <line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}" stroke="#1e293b" stroke-width="1"/>
          <text x="${x}" y="${y + r + 9}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
        </g>`;
      default:
        return `<g>
          <circle cx="${x}" cy="${y - 4}" r="${r * 0.6}" fill="${config.color}" stroke="white" stroke-width="1"/>
          <text x="${x}" y="${y - 1}" text-anchor="middle" font-size="6" font-weight="bold" fill="white" font-family="sans-serif">${config.short}</text>
          <text x="${x}" y="${y + r + 4}" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e293b" font-family="sans-serif">${label}</text>
        </g>`;
    }
  }).join('');

  const todayStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<svg width="${PRINT_W}" height="${TOTAL_H}" viewBox="0 0 ${PRINT_W} ${TOTAL_H}"
    xmlns="http://www.w3.org/2000/svg" style="background:white;display:block">
    <!-- Header -->
    <rect x="0" y="0" width="${PRINT_W}" height="${HEADER_H}" fill="#1e293b"/>
    <text x="16" y="22" font-size="13" font-weight="bold" fill="white" font-family="sans-serif">แผนผังข่ายสาย Network Design</text>
    <text x="16" y="38" font-size="9" fill="#94a3b8" font-family="sans-serif">${savedProject?.name || meta.route || '—'}</text>
    ${headerInfoSVG}
    <!-- Diagram area -->
    <rect x="0" y="${HEADER_H}" width="${PRINT_W}" height="${PRINT_H}" fill="white"/>
    <defs>
      <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="0.6" fill="#e2e8f0"/>
      </pattern>
    </defs>
    <rect x="0" y="${HEADER_H}" width="${PRINT_W}" height="${PRINT_H}" fill="url(#dotGrid)"/>
    <!-- Edges + Nodes -->
    <g transform="translate(0,${HEADER_H})">
      ${edgesSVG}
      ${nodesSVG}
    </g>
    <!-- Footer -->
    <rect x="0" y="${HEADER_H + PRINT_H}" width="${PRINT_W}" height="${FOOTER_H}" fill="#f8fafc"/>
    <line x1="0" y1="${HEADER_H + PRINT_H}" x2="${PRINT_W}" y2="${HEADER_H + PRINT_H}" stroke="#e2e8f0" stroke-width="1"/>
    ${meta.remark ? `<text x="16" y="${HEADER_H + PRINT_H + 18}" font-size="8" fill="#64748b" font-family="sans-serif">หมายเหตุ: ${meta.remark}</text>` : ''}
    <text x="${PRINT_W - 16}" y="${HEADER_H + PRINT_H + 18}" text-anchor="end" font-size="8" fill="#94a3b8" font-family="sans-serif">สร้างโดย FiberFlow BOQ Planner — ${todayStr}</text>
  </svg>`;
}

// ── React SVG preview (in-modal only) ──────────────────────────────────────
const NetworkSVGPreview: React.FC<{
  svgNodes: (NetworkNode & { sx: number; sy: number })[];
  svgEdges: (NetworkEdge & { x1: number; y1: number; x2: number; y2: number })[];
  meta: PrintMeta;
  savedProject?: SavedProject;
  customIcons: CustomIcon[];
}> = ({ svgNodes, svgEdges, meta, savedProject, customIcons }) => {
  const renderNodeSymbol = (node: NetworkNode & { sx: number; sy: number }) => {
    const r = 14;
    const x = node.sx;
    const y = node.sy;
    const config = NODE_SYMBOL_MAP[node.type];
    const icon = node.iconId ? customIcons.find(i => i.id === node.iconId) : null;
    if (icon?.dataUrl) {
      return (
        <g key={node.id}>
          <image href={icon.dataUrl} x={x - r} y={y - r} width={r * 2} height={r * 2} />
          <text x={x} y={y + r + 9} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
        </g>
      );
    }
    switch (node.type) {
      case 'EXCHANGE':
        return (
          <g key={node.id}>
            <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill="white" stroke="#1e293b" strokeWidth="1.5" />
            <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} stroke="#1e293b" strokeWidth="0.8" />
            <line x1={x - r} y1={y + r} x2={x + r} y2={y - r} stroke="#1e293b" strokeWidth="0.8" />
            <polygon points={`${x - r},${y - r} ${x},${y} ${x - r},${y + r}`} fill="#1e293b" />
            <polygon points={`${x + r},${y - r} ${x},${y} ${x + r},${y + r}`} fill="#1e293b" />
            <text x={x} y={y + r + 9} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
          </g>
        );
      case 'CABINET':
        return (
          <g key={node.id}>
            <path d={`M${x - r} ${y + r} L${x - r} ${y - 4} A${r} ${r} 0 0 1 ${x + r} ${y - 4} L${x + r} ${y + r} Z`}
              fill="white" stroke="#1e293b" strokeWidth="1.5" />
            <line x1={x - r} y1={y + r} x2={x + r} y2={y + r} stroke="#1e293b" strokeWidth="1.5" />
            <text x={x} y={y + r + 9} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
          </g>
        );
      case 'STRAIGHT_JOINT':
      case 'BRANCH_JOINT':
        return (
          <g key={node.id}>
            <circle cx={x} cy={y} r={5} fill="#1e293b" />
            <text x={x} y={y + 14} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
          </g>
        );
      case 'ODP':
        return (
          <g key={node.id}>
            <path d={`M${x - 6} ${y - r} A${r} ${r} 0 0 1 ${x - 6} ${y + r}`} fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d={`M${x + 6} ${y - r} A${r} ${r} 0 0 0 ${x + 6} ${y + r}`} fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#1e293b" strokeWidth="1" />
            <text x={x} y={y + r + 9} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
          </g>
        );
      default:
        return (
          <g key={node.id}>
            <circle cx={x} cy={y - 4} r={r * 0.6} fill={config.color} stroke="white" strokeWidth="1" />
            <text x={x} y={y - 1} textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" fontFamily="sans-serif">{config.short}</text>
            <text x={x} y={y + r + 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">{node.label}</text>
          </g>
        );
    }
  };

  const todayStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <svg width="100%" viewBox={`0 0 ${PRINT_W} ${TOTAL_H}`} xmlns="http://www.w3.org/2000/svg" style={{ background: 'white', display: 'block' }}>
      {/* Header */}
      <rect x="0" y="0" width={PRINT_W} height={HEADER_H} fill="#1e293b" />
      <text x="16" y="22" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">แผนผังข่ายสาย Network Design</text>
      <text x="16" y="38" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">{savedProject?.name || meta.route || '—'}</text>
      {[
        ['ที่ / หน่วยงาน', meta.area || savedProject?.area || '—'],
        ['จังหวัด', savedProject?.province || '—'],
        ['ปีงบประมาณ', savedProject?.budgetYear || '—'],
        ['วันที่สำรวจ', meta.surveyDate || '—'],
        ['ผู้สำรวจ', meta.surveyor || '—'],
      ].map(([label, value], i) => (
        <g key={label} transform={`translate(${300 + i * 122}, 10)`}>
          <text x="0" y="14" fontSize="7" fill="#64748b" fontFamily="sans-serif">{label}</text>
          <text x="0" y="26" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">{value}</text>
        </g>
      ))}
      {/* Diagram area */}
      <rect x="0" y={HEADER_H} width={PRINT_W} height={PRINT_H} fill="white" />
      <defs>
        <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.6" fill="#e2e8f0" />
        </pattern>
      </defs>
      <rect x="0" y={HEADER_H} width={PRINT_W} height={PRINT_H} fill="url(#dotGrid)" />
      <g transform={`translate(0,${HEADER_H})`}>
        {svgEdges.map(edge => {
          const mx = (edge.x1 + edge.x2) / 2;
          const my = (edge.y1 + edge.y2) / 2;
          return (
            <g key={edge.id}>
              <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="7,4" />
              <rect x={mx - 20} y={my - 8} width="40" height="16" rx="5" fill="white" stroke="#e2e8f0" strokeWidth="1" />
              <text x={mx} y={my + 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569" fontFamily="sans-serif">{edge.distance}M</text>
            </g>
          );
        })}
        {svgNodes.map(node => renderNodeSymbol(node))}
      </g>
      {/* Footer */}
      <rect x="0" y={HEADER_H + PRINT_H} width={PRINT_W} height={FOOTER_H} fill="#f8fafc" />
      <line x1="0" y1={HEADER_H + PRINT_H} x2={PRINT_W} y2={HEADER_H + PRINT_H} stroke="#e2e8f0" strokeWidth="1" />
      {meta.remark && (
        <text x="16" y={HEADER_H + PRINT_H + 18} fontSize="8" fill="#64748b" fontFamily="sans-serif">หมายเหตุ: {meta.remark}</text>
      )}
      <text x={PRINT_W - 16} y={HEADER_H + PRINT_H + 18} textAnchor="end" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">
        สร้างโดย FiberFlow BOQ Planner — {todayStr}
      </text>
    </svg>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const NetworkPrintModal: React.FC<Props> = ({ project, materials, savedProject, customIcons, onClose }) => {
  const [meta, setMeta] = useState<PrintMeta>(() => {
    const saved = localStorage.getItem('network_print_meta');
    const base = saved ? { ...DEFAULT_PRINT_META, ...JSON.parse(saved) } : { ...DEFAULT_PRINT_META };
    if (savedProject) {
      if (!base.area && savedProject.area) base.area = savedProject.area;
      if (!base.route && savedProject.name) base.route = savedProject.name;
    }
    return base;
  });

  const { svgNodes, svgEdges } = useMemo(() => computeLayout(project), [project]);

  const handlePrint = () => {
    // Save meta
    localStorage.setItem('network_print_meta', JSON.stringify(meta));

    // Generate SVG string and open popup window
    const svgStr = generateSVGString(svgNodes, svgEdges, meta, savedProject, customIcons);
    const popup = window.open('', '_blank', 'width=960,height=720,scrollbars=yes');
    if (!popup) {
      alert('กรุณาอนุญาต popup เพื่อพิมพ์');
      return;
    }
    popup.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>แผนผังข่ายสาย Network Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; }
    @media print {
      @page { margin: 0; size: landscape; }
      body { margin: 0; }
    }
  </style>
</head>
<body>${svgStr}</body>
</html>`);
    popup.document.close();
    popup.focus();
    setTimeout(() => {
      popup.print();
    }, 400);
  };

  const fieldCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header — always visible */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-900">พิมพ์แผน Network Design</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ระบุข้อมูลก่อนพิมพ์</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ชื่อโครงการ / สัญญา</label>
              <input className={fieldCls} value={meta.route}
                onChange={e => setMeta(m => ({ ...m, route: e.target.value }))} placeholder="ชื่อโครงการ..." />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ที่ / หน่วยงาน</label>
              <input className={fieldCls} value={meta.area}
                onChange={e => setMeta(m => ({ ...m, area: e.target.value }))} placeholder="หน่วยงาน..." />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">วันที่สำรวจ</label>
              <input className={fieldCls} value={meta.surveyDate}
                onChange={e => setMeta(m => ({ ...m, surveyDate: e.target.value }))} placeholder="วันที่..." />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ผู้สำรวจ / ผู้จัดทำ</label>
              <input className={fieldCls} value={meta.surveyor}
                onChange={e => setMeta(m => ({ ...m, surveyor: e.target.value }))} placeholder="ชื่อผู้สำรวจ..." />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">หมายเหตุ</label>
            <input className={fieldCls} value={meta.remark}
              onChange={e => setMeta(m => ({ ...m, remark: e.target.value }))} placeholder="หมายเหตุ (ถ้ามี)..." />
          </div>

          {/* Preview */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ตัวอย่าง (Preview)</div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <NetworkSVGPreview
                svgNodes={svgNodes} svgEdges={svgEdges}
                meta={meta} savedProject={savedProject}
                customIcons={customIcons}
              />
            </div>
          </div>
        </div>

        {/* Footer — always visible */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
          <button onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
            <X size={14} /> ยกเลิก
          </button>
          <button onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25">
            <Printer size={14} /> ยืนยันพิมพ์
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkPrintModal;
