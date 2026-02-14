const fs = require('fs');

const csv = fs.readFileSync('./mat.csv', 'utf8').replace(/^\uFEFF/, '');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l.length > 0);

function parseNum(s) {
  return parseFloat(s.replace(/[", ]/g, '').replace(/-$/, '0')) || 0;
}

const codeMap = {};
const items = [];

for (let i = 1; i < lines.length; i++) {
  // Split respecting quoted fields
  const cols = [];
  let inQuote = false, cur = '';
  for (const ch of lines[i]) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  cols.push(cur.trim());

  if (cols.length < 9) continue;

  const no = parseInt(cols[0]);
  const category = cols[1].trim();
  const type = cols[2].trim();
  const name = cols[3].trim();
  const unit = cols[4].trim();
  const volume = parseNum(cols[5]) || 1;
  const cableRaw = parseNum(cols[6]);
  const matRaw = parseNum(cols[7]);
  const labourRaw = parseNum(cols[8]);

  if (!category || !name) continue;

  // Determine category prefix for code
  let prefix = 'GEN';
  if (category === 'Optical Fiber Cable Work') prefix = 'OFC';
  else if (category.startsWith('Optical Dropwire')) prefix = 'DW';
  else if (category === 'Building Conduit Work') prefix = 'CON';

  codeMap[prefix] = (codeMap[prefix] || 0) + 1;
  const code = `${prefix}-${String(codeMap[prefix]).padStart(3, '0')}`;

  const matType = (unit === 'm' || unit === 'F') ? 'T02' : 'T01';
  const unitPrice = (cableRaw + matRaw) / volume;
  const cableUnitPrice = cableRaw / volume;
  const laborUnitPrice = labourRaw / volume;

  const round2 = v => Math.round(v * 100) / 100;

  items.push({
    id: no,
    material_type: matType,
    material_code: code,
    material_name: name,
    category,
    unit,
    unit_price: round2(unitPrice),
    cable_unit_price: round2(cableUnitPrice),
    labor_unit_price: round2(laborUnitPrice),
    action_type: 'ซื้อ',
    spec_brand: '',
    remark: type,
  });
}

let ts = `import { Material, SavedProject, NodeType } from './types';\n\nexport const ALL_MATERIALS: Material[] = [\n`;
for (const m of items) {
  ts += `  { id: ${m.id}, material_type: "${m.material_type}", material_code: "${m.material_code}", material_name: "${m.material_name}", category: "${m.category}", unit: "${m.unit}", unit_price: ${m.unit_price}, cable_unit_price: ${m.cable_unit_price}, labor_unit_price: ${m.labor_unit_price}, action_type: "${m.action_type}", spec_brand: "${m.spec_brand}", remark: "${m.remark}" },\n`;
}
ts += `];\n`;

// Read existing file to get SAMPLE_PROJECTS section
const existing = fs.readFileSync('./materials-db.ts', 'utf8');
const sampleIdx = existing.indexOf('export const SAMPLE_PROJECTS');
if (sampleIdx !== -1) {
  ts += '\n' + existing.slice(sampleIdx);
} else {
  ts += '\nexport const SAMPLE_PROJECTS: SavedProject[] = [];\n';
}

fs.writeFileSync('./materials-db.ts', ts);
console.log(`Generated ${items.length} items with cable_unit_price field.`);
