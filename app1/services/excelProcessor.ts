
import * as XLSX from 'xlsx';
import { SummaryData, RDMode, GroupRule, Condition } from '../types';
import {
  RD03_COLS,
  RD05_COLS
} from '../constants';

const checkCondition = (rowValue: any, condition: Condition): boolean => {
  const val = String(rowValue || "").trim();
  const target = condition.value;

  switch (condition.operator) {
    case 'equals':
      return val === String(target).trim();
    case 'not_equals':
      return val !== String(target).trim();
    case 'contains':
      return val.toLowerCase().includes(String(target).toLowerCase().trim());
    case 'in_list':
      const list = Array.isArray(target)
        ? target
        : String(target).split(',').map(s => s.trim());
      return list.some(item => String(item).trim() === val);
    case 'not_in_list':
      const list2 = Array.isArray(target)
        ? target
        : String(target).split(',').map(s => s.trim());
      return !list2.some(item => String(item).trim() === val);
    case 'between':
      const num = parseFloat(val) || 0;
      const [min, max] = Array.isArray(target) ? target.map(v => parseFloat(v)) : [0, 0];
      return num >= min && num <= max;
    case 'gt':
      return (parseFloat(val) || 0) > parseFloat(String(target));
    case 'gte':
      return (parseFloat(val) || 0) >= parseFloat(String(target));
    case 'lt':
      return (parseFloat(val) || 0) < parseFloat(String(target));
    case 'lte':
      return (parseFloat(val) || 0) <= parseFloat(String(target));
    default:
      return false;
  }
};

const matchesRule = (row: any, rule: GroupRule): boolean => {
  if (!rule.conditions || rule.conditions.length === 0) return true; // Empty rule acts as "match all" for fallback
  return rule.conditions.every(cond => {
    const rowVal = row[cond.column];
    return checkCondition(rowVal, cond);
  });
};

export const processExcelFile = async (file: File, mode: RDMode, rules: GroupRule[]): Promise<{ rows: any[], summary: SummaryData }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Start from row 9 (index 8) to bypass header rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 8 });
        const colsToUse = mode === 'RD03' ? RD03_COLS : RD05_COLS;

        const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

        // Sets for Summary
        const uniqueLineTypes = new Set<string>();
        const uniqueCores = new Set<number>();
        const uniqueDiameters = new Set<number>();
        const uniqueConcessions = new Set<string>();

        const processedRows = rawRows
          .filter(row => row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== "")
          .map(row => {
            const obj: any = {};
            // Mapping raw excel columns to our named columns
            colsToUse.forEach((col, idx) => {
              // Offset by 1 because Python script used 1:22 range or dropped index 0
              const val = row[idx + 1] || (row[idx + 1] === 0 ? 0 : "");
              obj[col] = val;

              if (col === 'Line_Type') uniqueLineTypes.add(String(val));
              if (col === 'Cores') {
                const n = parseInt(String(val));
                if (!isNaN(n)) uniqueCores.add(n);
              }
              if (col === 'Diameter') {
                const n = parseFloat(String(val));
                if (!isNaN(n)) uniqueDiameters.add(n);
              }
              if (col === 'Concession') uniqueConcessions.add(String(val));
            });

            // Reset fields
            obj.GroupConcession = "ไม่พบกลุ่ม";
            obj.Group = mode === 'RD03' ? "ไม่พบกลุ่ม" : "3.0";

            // Process rules in priority order
            for (const rule of sortedRules) {
              // If "Only If Empty" is checked, skip this rule if the target field already has a non-default value
              if (rule.onlyIfEmpty) {
                const currentVal = rule.targetField === 'GroupConcession' ? obj.GroupConcession : obj.Group;
                const isEmpty = !currentVal || currentVal === "ไม่พบกลุ่ม" || currentVal === "3.0";
                if (!isEmpty) continue;
              }

              if (matchesRule(obj, rule)) {
                const finalValue = rule.resultValue || (rule.targetField === 'GroupConcession' ? (rule.name || rule.id) : rule.id);

                if (rule.targetField === 'GroupConcession') {
                  obj.GroupConcession = finalValue;
                } else {
                  obj.Group = finalValue;
                  break; // Stop evaluating for this row once Group is assigned
                }
              }
            }

            return obj;
          });

        const summary: SummaryData = {
          totalRows: processedRows.length,
          groups: {},
          concessions: {},
          lineTypes: {},
          uniqueValues: {
            Line_Type: Array.from(uniqueLineTypes).sort(),
            Cores: Array.from(uniqueCores).sort((a, b) => a - b),
            Diameter: Array.from(uniqueDiameters).sort((a, b) => a - b),
            Concession: Array.from(uniqueConcessions).sort()
          }
        };

        processedRows.forEach(row => {
          summary.groups[row.Group!] = (summary.groups[row.Group!] || 0) + 1;
          summary.concessions[row.GroupConcession!] = (summary.concessions[row.GroupConcession!] || 0) + 1;
          summary.lineTypes[row.Line_Type || "Unknown"] = (summary.lineTypes[row.Line_Type || "Unknown"] || 0) + 1;
        });

        resolve({ rows: processedRows, summary });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const exportProcessedExcel = async (rows: any[], fileName: string, mode: RDMode, summary: SummaryData) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Main Processed Data
  const wsData = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsData, "Processed_Data");

  // Unique Values Sheets
  const wsLineType = XLSX.utils.json_to_sheet(summary.uniqueValues.Line_Type.map(v => ({ Line_Type: v })));
  XLSX.utils.book_append_sheet(wb, wsLineType, "Line_Type");

  const wsCores = XLSX.utils.json_to_sheet(summary.uniqueValues.Cores.map(v => ({ Cores: v })));
  XLSX.utils.book_append_sheet(wb, wsCores, "Cores");

  const wsDiameter = XLSX.utils.json_to_sheet(summary.uniqueValues.Diameter.map(v => ({ Diameter: v })));
  XLSX.utils.book_append_sheet(wb, wsDiameter, "Diameter");

  const wsConcession = XLSX.utils.json_to_sheet(summary.uniqueValues.Concession.map(v => ({ Concession: v })));
  XLSX.utils.book_append_sheet(wb, wsConcession, "Concession");

  // 1. Immediate Download using XLSX.writeFile (Optimized for large datasets)
  console.log("[ExcelProcessor] Triggering optimized download via XLSX.writeFile.");
  XLSX.writeFile(wb, fileName);
};
