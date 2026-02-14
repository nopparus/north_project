const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";

const pinSvg = (color, short) => {
    const svg = `<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="${PIN_PATH}" fill="${color}" stroke="white" stroke-width="1"/>` +
        `<circle cx="12" cy="9" r="5" fill="white" fill-opacity="0.2"/>` +
        `<text x="12" y="11" text-anchor="middle" font-size="6" font-weight="bold" fill="white">${short}</text>` +
        `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const NODE_SYMBOL_MAP = {
    'EXCHANGE': { label: 'Telephone Exchange', short: 'EX', color: '#1e293b', svg: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="20" height="20" fill="white" stroke="#1e293b" stroke-width="2" /><path d="M6 6 L26 26 M6 26 L26 6" stroke="#1e293b" stroke-width="1" /><path d="M6 6 L16 16 L6 26 Z" fill="#1e293b" /><path d="M26 6 L16 16 L26 26 Z" fill="#1e293b" /></svg>' },
    'CABINET': { label: 'Cabinet (OFCCC)', short: 'CF', color: '#1e293b', svg: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M8 26 L8 12 A8 8 0 0 1 24 12 L24 26 Z" fill="white" stroke="#1e293b" stroke-width="2" /><line x1="8" y1="26" x2="24" y2="26" stroke="#1e293b" stroke-width="2" /></svg>' },
    'STRAIGHT_JOINT': { label: 'Straight Joint (SJ)', short: 'SJ', color: '#000000', svg: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="12" x2="24" y2="12" stroke="#000000" stroke-width="1.5" stroke-dasharray="4,2" /><circle cx="12" cy="12" r="4" fill="#000000" /></svg>' },
    'BRANCH_JOINT': { label: 'Branch Joint (BJ)', short: 'BJ', color: '#000000', svg: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="16" x2="24" y2="16" stroke="#000000" stroke-width="1.5" stroke-dasharray="4,2" /><line x1="12" y1="4" x2="12" y2="15" stroke="#000000" stroke-width="1.5" /><path d="M8 12 L12 16 L16 12" fill="none" stroke="#000000" stroke-width="1.5" /><text x="13" y="10" font-size="7" font-weight="bold" fill="#000000">BJ</text></svg>' },
    'ODP': { label: 'Proposed ODP', short: 'OD', color: '#1e293b', svg: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="16" x2="16" y2="16" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,2" /><path d="M12 8 A10 10 0 0 1 12 24" fill="none" stroke="#1e293b" stroke-width="1.5" /><path d="M20 8 A10 10 0 0 0 20 24" fill="none" stroke="#1e293b" stroke-width="1.5" /><line x1="10" y1="16" x2="22" y2="16" stroke="#1e293b" stroke-width="1" /><line x1="6" y1="16" x2="10" y2="16" stroke="#1e293b" stroke-width="2" /><path d="M6 14 L2 16 L6 18 Z" fill="#1e293b" /></svg>' },
    'SDP': { label: 'SDP', short: 'SD', color: '#0d9488' },
    'DP': { label: 'DP', short: 'DP', color: '#c2410c' },
    'TOT_POLE': { label: 'เสาทีโอที', short: 'TP', color: '#0ea5e9' },
    'MANHOLE': { label: 'บ่อพัก', short: 'MH', color: '#334155' },
    'PE': { label: 'PE', short: 'PE', color: '#84cc16' },
    'CAB': { label: 'CAB', short: 'CB', color: '#ef4444' },
    'RISER': { label: 'Riser', short: 'RS', color: '#0369a1' },
    'SAM': { label: 'SAM', short: 'SM', color: '#dc2626' },
    'SWITCH': { label: 'SWITCH', short: 'SW', color: '#eab308' },
    'MSAN': { label: 'MSAN', short: 'MS', color: '#1e3a8a' },
    'OFCCC': { label: 'OFCCC', short: 'FC', color: '#ea580c' },
    'G3': { label: '3G/4G', short: '3G', color: '#2563eb' },
    'WILINK': { label: 'WiLink', short: 'WL', color: '#7c3aed' },
    'AIS': { label: 'AIS', short: 'AS', color: '#65a30d' },
    'LPE': { label: 'LPE', short: 'LP', color: '#ca8a04' },
    'EXCHANGE_COPPER': { label: 'ชุมสาย (Copper)', short: 'CU', color: '#ec4899' },
};

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Migrating system icons to database...');

    const stmt = db.prepare(`
    INSERT OR REPLACE INTO custom_icons (id, name, description, dots, data_url, associated_category, is_system, icon_group, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let count = 0;
    for (const [id, data] of Object.entries(NODE_SYMBOL_MAP)) {
        const dataUrl = data.svg
            ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`
            : pinSvg(data.color, data.short);

        stmt.run(
            id,              // id
            data.label,      // name
            `System icon for ${data.label}`, // description
            '[]',            // dots
            dataUrl,         // data_url
            id,              // associated_category
            1,               // is_system
            'STANDARD GROUP',// icon_group
            count++          // sort_order
        );
    }

    stmt.finalize();
    console.log('Migration complete.');
});

db.close();
