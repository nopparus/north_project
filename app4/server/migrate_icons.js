const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const svgUrl = (svg) =>
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const PIN_PATH_STR = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";

const pinSvg = (color, short) =>
    svgUrl(`<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="${PIN_PATH_STR}" fill="${color}" stroke="white" stroke-width="1"/>` +
        `<circle cx="12" cy="9" r="5" fill="white" fill-opacity="0.2"/>` +
        `<text x="12" y="11" text-anchor="middle" font-size="6" font-weight="bold" fill="white">${short}</text>` +
        `</svg>`);

const SYSTEM_ICONS = [
    // ── Professional Symbols (technical SVG) ──────────────────────────────────
    {
        id: 'sys-exchange', name: 'Telephone Exchange', description: 'EX — ชุมสายโทรศัพท์',
        category: 'Professional Symbols',
        dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
            `<rect x="6" y="6" width="20" height="20" fill="white" stroke="#1e293b" stroke-width="2"/>` +
            `<path d="M6 6 L26 26 M6 26 L26 6" stroke="#1e293b" stroke-width="1"/>` +
            `<path d="M6 6 L16 16 L6 26 Z" fill="#1e293b"/>` +
            `<path d="M26 6 L16 16 L26 26 Z" fill="#1e293b"/>` +
            `</svg>`),
    },
    {
        id: 'sys-cabinet', name: 'Cabinet (OFCCC)', description: 'CF — ตู้ Cross-Connect',
        category: 'Professional Symbols',
        dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
            `<path d="M8 26 L8 12 A8 8 0 0 1 24 12 L24 26 Z" fill="white" stroke="#1e293b" stroke-width="2"/>` +
            `<line x1="8" y1="26" x2="24" y2="26" stroke="#1e293b" stroke-width="2"/>` +
            `</svg>`),
    },
    {
        id: 'sys-straight-joint', name: 'Straight Joint (SJ)', description: 'SJ — กล่องต่อสาย',
        category: 'Professional Symbols',
        dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
            `<line x1="2" y1="16" x2="30" y2="16" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2"/>` +
            `<circle cx="16" cy="16" r="5" fill="#1e293b"/>` +
            `</svg>`),
    },
    {
        id: 'sys-branch-joint', name: 'Branch Joint (BJ)', description: 'BJ — จุดแยกสาย',
        category: 'Professional Symbols',
        dataUrl: svgUrl(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">` +
            `<line x1="2" y1="20" x2="30" y2="20" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2"/>` +
            `<line x1="16" y1="6" x2="16" y2="20" stroke="#1e293b" stroke-width="1.5"/>` +
            `<path d="M11 16 L16 20 L21 16" fill="none" stroke="#1e293b" stroke-width="1.5"/>` +
            `</svg>`),
    },
    {
        id: 'sys-odp', name: 'Proposed ODP', description: 'OD — จุดกระจายสายออปติก',
        category: 'Professional Symbols',
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
    { id: 'sys-sdp', name: 'SDP', description: 'SD — Service Delivery Point', category: 'Classic Markers', dataUrl: pinSvg('#0d9488', 'SD') },
    { id: 'sys-dp', name: 'DP', description: 'DP — Distribution Point', category: 'Classic Markers', dataUrl: pinSvg('#c2410c', 'DP') },
    { id: 'sys-pole', name: 'เสาทีโอที', description: 'TP — TOT Pole', category: 'Classic Markers', dataUrl: pinSvg('#0ea5e9', 'TP') },
    { id: 'sys-mh', name: 'บ่อพัก (Manhole)', description: 'MH — Underground Vault', category: 'Classic Markers', dataUrl: pinSvg('#334155', 'MH') },
    { id: 'sys-pe', name: 'PE', description: 'PE — Pillar Equipment', category: 'Classic Markers', dataUrl: pinSvg('#84cc16', 'PE') },
    { id: 'sys-cab', name: 'CAB', description: 'CB — Cabinet', category: 'Classic Markers', dataUrl: pinSvg('#ef4444', 'CB') },
    { id: 'sys-riser', name: 'Riser', description: 'RS — Riser', category: 'Classic Markers', dataUrl: pinSvg('#0369a1', 'RS') },
    { id: 'sys-sam', name: 'SAM', description: 'SM — SAM Node', category: 'Classic Markers', dataUrl: pinSvg('#dc2626', 'SM') },
    { id: 'sys-switch', name: 'SWITCH', description: 'SW — Network Switch', category: 'Classic Markers', dataUrl: pinSvg('#eab308', 'SW') },
    { id: 'sys-msan', name: 'MSAN', description: 'MS — Multi-Service Access Node', category: 'Classic Markers', dataUrl: pinSvg('#1e3a8a', 'MS') },
    { id: 'sys-ofccc', name: 'OFCCC', description: 'FC — Fiber Cabinet', category: 'Classic Markers', dataUrl: pinSvg('#ea580c', 'FC') },
    { id: 'sys-g3', name: '3G/4G', description: '3G — Mobile Base Station', category: 'Classic Markers', dataUrl: pinSvg('#2563eb', '3G') },
    { id: 'sys-wilink', name: 'WiLink', description: 'WL — Wireless Link', category: 'Classic Markers', dataUrl: pinSvg('#7c3aed', 'WL') },
    { id: 'sys-ais', name: 'AIS', description: 'AS — AIS Node', category: 'Classic Markers', dataUrl: pinSvg('#65a30d', 'AS') },
    { id: 'sys-lpe', name: 'LPE', description: 'LP — LPE Node', category: 'Classic Markers', dataUrl: pinSvg('#ca8a04', 'LP') },
    { id: 'sys-excu', name: 'ชุมสาย (Copper)', description: 'CU — Exchange Copper', category: 'Classic Markers', dataUrl: pinSvg('#ec4899', 'CU') },
    { id: 'sys-custom', name: 'Custom Node', description: '?? — Custom', category: 'Other Icons', dataUrl: pinSvg('#3b82f6', '??') },
];

db.serialize(() => {
    const stmt = db.prepare("INSERT OR REPLACE INTO custom_icons (id, name, description, dots, data_url, associated_category, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)");

    SYSTEM_ICONS.forEach(icon => {
        stmt.run(icon.id, icon.name, icon.description, '[]', icon.dataUrl, icon.category, 1);
    });

    stmt.finalize();

    console.log("Migration complete: System icons inserted into DB.");
});

db.close();
