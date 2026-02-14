
import React, { useState } from 'react';
import { ProjectState, Material, SavedProject } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Edit2, Check, X, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface BOQSummaryProps {
  project: ProjectState;
  materials: Material[];
  savedProject?: SavedProject;
}

interface BOQMeta {
  area: string;
  contractName: string;
  route: string;
  workType: string;
  budgetYear: string;
  factorOC: number;
}

const DEFAULT_META: BOQMeta = {
  area: 'ส่วนขายและบริการลูกค้า',
  contractName: '',
  route: '',
  workType: 'ODN/OFC',
  budgetYear: new Date().getFullYear() + 543 + 1 + '',
  factorOC: 1.2561,
};

const fmt = (v: number, d = 2) =>
  v === 0 ? '-' : v.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtVal = (v: number, d = 2) =>
  v.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });

const BOQSummary: React.FC<BOQSummaryProps> = ({ project, materials, savedProject }) => {
  const { isDark } = useTheme();

  const [meta, setMeta] = useState<BOQMeta>(() => {
    const saved = localStorage.getItem('boq_meta');
    const m = saved ? { ...DEFAULT_META, ...JSON.parse(saved) } : { ...DEFAULT_META };
    // Auto-fill from savedProject on first load
    if (savedProject) {
      if (!m.contractName && savedProject.name) m.contractName = savedProject.name;
      if (!m.area && savedProject.area) m.area = savedProject.area;
      if (savedProject.budgetYear) m.budgetYear = savedProject.budgetYear;
    }
    return m;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BOQMeta>(meta);
  const [factorLoading, setFactorLoading] = useState(false);
  const [factorError, setFactorError] = useState('');
  const [procureMethod, setProcureMethod] = useState('AGREEMENT');

  React.useEffect(() => {
    if (!savedProject) return;
    setMeta(m => ({
      ...m,
      contractName: m.contractName || savedProject.name || '',
      area: m.area || savedProject.area || '',
      budgetYear: savedProject.budgetYear || m.budgetYear,
    }));
  }, [savedProject?.id]);

  const saveMeta = () => {
    setMeta(draft);
    localStorage.setItem('boq_meta', JSON.stringify(draft));
    setEditing(false);
  };

  // ─── Factor OC API ─────────────────────────────────────────────────────────
  const fetchFactorOC = async (amount: number, targetMethod?: string) => {
    const province = savedProject?.province;
    if (!province) {
      setFactorError('ไม่พบข้อมูลจังหวัด — กรุณาระบุจังหวัดในโครงการก่อน');
      return;
    }
    if (amount <= 0) {
      setFactorError('วงเงินต้องมากกว่า 0 — กรุณาเพิ่มรายการก่อนคำนวณ');
      return;
    }
    setFactorLoading(true);
    setFactorError('');
    try {
      const params = new URLSearchParams({
        amount: Math.round(amount).toString(),
        province,
        method: targetMethod ?? procureMethod,
      });
      const res = await fetch(`https://nt.porjai.uk/FactorOC/api/calculate?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const factor = data?.results?.factorValue;
      if (!factor) throw new Error('ไม่พบค่า factorValue ในผลลัพธ์จาก API');
      setDraft(d => ({ ...d, factorOC: factor }));
      setMeta(m => ({ ...m, factorOC: factor }));
    } catch (err: any) {
      setFactorError(err.message || 'เกิดข้อผิดพลาดในการเรียก API');
    } finally {
      setFactorLoading(false);
    }
  };

  // ─── Compute BOQ items ─────────────────────────────────────────────────────
  const boqItems = React.useMemo(() => {
    const map: Record<number, { qty: number; totalDist?: number }> = {};

    project.nodes.forEach(node => {
      if (node.materialId) {
        const q = node.quantity ?? 1;
        map[node.materialId] = { qty: (map[node.materialId]?.qty ?? 0) + q };
      }
      // TER materials: each non-null entry counts as 1 unit
      if (node.terMaterialIds) {
        node.terMaterialIds.forEach(terId => {
          if (terId != null) {
            map[terId] = { qty: (map[terId]?.qty ?? 0) + 1 };
          }
        });
      }
    });

    project.edges.forEach(edge => {
      if (edge.materialId) {
        const cur = map[edge.materialId] ?? { qty: 0, totalDist: 0 };
        const vol = (() => {
          const m = materials.find(x => x.id === edge.materialId);
          return m && (m.unit === 'm' || m.unit === 'F') ? 100 : 1;
        })();
        map[edge.materialId] = {
          qty: cur.qty + edge.distance / vol,
          totalDist: (cur.totalDist ?? 0) + edge.distance,
        };
      }
    });

    return Object.entries(map)
      .map(([id, data]) => {
        const mat = materials.find(m => m.id === Number(id));
        if (!mat) return null;
        const vol = mat.unit === 'm' || mat.unit === 'F' ? 100 : 1;
        const boqUnit = mat.unit === 'm' ? '100 ม.' : mat.unit === 'F' ? '100 F' : mat.unit;
        const cablePerUnit = mat.cable_unit_price * vol;
        const matPerUnit = (mat.unit_price - mat.cable_unit_price) * vol;
        const laborPerUnit = mat.labor_unit_price * vol;
        const totalPerUnit = cablePerUnit + matPerUnit + laborPerUnit;
        const qty = data.qty;
        return {
          mat,
          qty,
          boqUnit,
          vol,
          cablePerUnit,
          matPerUnit,
          laborPerUnit,
          totalPerUnit,
          cableTotal: cablePerUnit * qty,
          matTotal: matPerUnit * qty,
          laborTotal: laborPerUnit * qty,
          rowTotal: totalPerUnit * qty,
        };
      })
      .filter(Boolean) as NonNullable<ReturnType<typeof Object.entries>[0]>[];
  }, [project, materials]);

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subTotal = boqItems.reduce((s, r: any) => s + r.rowTotal, 0);
  const factorAmount = subTotal * (meta.factorOC - 1);
  const totalWithFactor = subTotal + factorAmount;
  const vatAmount = totalWithFactor * 0.07;
  const grandTotal = totalWithFactor + vatAmount;

  // ─── Styles ────────────────────────────────────────────────────────────────
  const c = isDark ? {
    page: 'bg-slate-950 text-slate-100',
    card: 'bg-white text-slate-900',          // always white for print fidelity
    headerBg: 'bg-slate-800',
    editBtn: 'text-blue-400 hover:text-blue-300',
    printHide: 'print:hidden',
  } : {
    page: 'bg-slate-100 text-slate-900',
    card: 'bg-white text-slate-900',
    headerBg: 'bg-slate-100',
    editBtn: 'text-blue-600 hover:text-blue-500',
    printHide: 'print:hidden',
  };

  const thBase = 'border border-gray-400 px-1 py-1 text-center text-[10px] font-bold';
  const tdBase = 'border border-gray-300 px-1 py-0.5 text-[10px]';

  return (
    <div className={`min-h-screen overflow-y-auto ${c.page} print:bg-white`}>
      {/* ── Edit meta panel (screen only) ───────────────────────────── */}
      {editing && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${c.printHide}`}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-black text-slate-900">แก้ไขข้อมูลหัวรายงาน</h3>
            {([
              ['area', 'ที่ที่ (หน่วยงาน)'],
              ['contractName', 'ชื่อสัญญา / ชื่อโครงการ'],
              ['route', 'เส้นทาง'],
              ['workType', 'ประเภทงาน'],
              ['budgetYear', 'งปประมาณ (ปี พ.ศ.)'],
            ] as [keyof BOQMeta, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={String(draft[key])}
                  onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
            {/* Factor OC section */}
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
              <div className="text-xs font-black text-blue-700 uppercase tracking-widest">Factor OC — คำนวณอัตโนมัติ</div>

              {/* Province info */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold">จังหวัด:</span>
                <span className={savedProject?.province ? 'text-slate-900 font-semibold' : 'text-red-500'}>
                  {savedProject?.province || '⚠ ยังไม่ระบุ — ตั้งค่าในข้อมูลโครงการ'}
                </span>
              </div>

              {/* Method selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วิธีการจัดหา (Method)</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={procureMethod}
                  onChange={e => setProcureMethod(e.target.value)}
                >
                  <option value="AGREEMENT">เชิญชวนเฉพาะ (AGREEMENT)</option>
                  <option value="E-BIDDING">ประกวดราคา e-Bidding (E-BIDDING)</option>
                  <option value="PRICE_COMPARISON">สอบราคา (PRICE_COMPARISON)</option>
                </select>
              </div>

              {/* Factor OC input + Calculate button */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Factor OC</label>
                <div className="flex gap-2">
                  <input
                    type="number" step="0.0001"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={draft.factorOC}
                    onChange={e => setDraft(d => ({ ...d, factorOC: parseFloat(e.target.value) || 1 }))}
                  />
                  <button
                    type="button"
                    disabled={factorLoading || !savedProject?.province}
                    onClick={() => fetchFactorOC(subTotal, procureMethod)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    title={!savedProject?.province ? 'กรุณาระบุจังหวัดในโครงการก่อน' : `คำนวณจากวงเงิน ${subTotal.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท`}
                  >
                    {factorLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <RefreshCw size={14} />
                    }
                    คำนวณ
                  </button>
                </div>
                <div className="text-[9px] text-slate-400 mt-1">วงเงินที่ใช้คำนวณ: {subTotal.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท</div>
              </div>

              {/* Error / result feedback */}
              {factorError && (
                <div className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  {factorError}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-1"><X size={14} />ยกเลิก</button>
              <button onClick={saveMeta} className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 flex items-center justify-center gap-1"><Check size={14} />บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document wrapper ────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto my-6 print:my-0 print:max-w-none">

        {/* Edit button (screen only) */}
        <div className={`flex justify-end mb-2 ${c.printHide}`}>
          <button
            onClick={() => { setDraft(meta); setEditing(true); }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border ${isDark ? 'border-slate-700 text-blue-400 hover:bg-slate-800' : 'border-slate-300 text-blue-600 hover:bg-slate-50'}`}
          >
            <Edit2 size={12} /> แก้ไขข้อมูลโครงการ
          </button>
        </div>

        {/* ── Main document card ────────────────────────────────────── */}
        <div className="bg-white text-slate-900 shadow-2xl print:shadow-none rounded-lg print:rounded-none p-6 print:p-4">

          {/* Title */}
          <div className="text-center mb-3">
            <p className="text-[11px] font-bold">แบบแสดงรายการ ปริมาณงานและราคา งานสร้างข่ายสายเคเบิลใยแก้วนำแสงทดแทนของเดิม / สร้างใหม่เพิ่มเติม</p>
            <p className="text-[11px] font-bold">งปประมาณประจำปี {meta.budgetYear}</p>
          </div>

          {/* Project info */}
          <div className="grid grid-cols-2 gap-x-4 text-[10px] mb-3">
            <div>
              <span className="font-bold">ที่ที่ : </span>
              <span>{meta.area}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">หน่วย (บาท)</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold">ชื่อสัญญา : </span>
              <span>{meta.contractName}</span>
              {meta.route && <span>  เส้นทาง {meta.route}</span>}
            </div>
            <div>
              <span className="font-bold">ประเภทงาน : </span>
              <span>{meta.workType}</span>
            </div>
          </div>

          {/* ── Main BOQ Table ───────────────────────────────────────── */}
          <table className="w-full border-collapse mb-4 text-[10px]" style={{ borderColor: '#888' }}>
            <thead>
              {/* Row 1: Column groups */}
              <tr>
                <th rowSpan={3} className={thBase} style={{ width: '28px' }}>ลำดับที่</th>
                <th rowSpan={3} className={thBase} style={{ minWidth: '140px' }}>รายการ</th>
                <th rowSpan={3} className={thBase} style={{ width: '42px' }}>หน่วยนับ</th>
                <th rowSpan={3} className={thBase} style={{ width: '40px' }}>ปริมาณ<br/>(1)</th>
                <th colSpan={2} className={thBase}>ค่าเคเบิล</th>
                <th colSpan={2} className={thBase}>ค่าวัสดุ</th>
                <th colSpan={2} className={thBase}>ค่าแรงงาน</th>
                <th colSpan={2} className={thBase}>จำนวนเงินรวม</th>
                <th rowSpan={3} className={thBase} style={{ width: '80px' }}>หมายเหตุ</th>
              </tr>
              <tr>
                <th className={thBase} style={{ width: '62px' }}>ราคาต่อหน่วย<br/>(2)</th>
                <th className={thBase} style={{ width: '72px' }}>ราคาต่อปริมาณ<br/>(3)=(1)×(2)</th>
                <th className={thBase} style={{ width: '62px' }}>ราคาต่อหน่วย<br/>(4)</th>
                <th className={thBase} style={{ width: '72px' }}>ราคาต่อปริมาณ<br/>(5)=(1)×(4)</th>
                <th className={thBase} style={{ width: '62px' }}>ราคาต่อหน่วย<br/>(6)</th>
                <th className={thBase} style={{ width: '72px' }}>ราคาต่อปริมาณ<br/>(7)=(1)×(6)</th>
                <th className={thBase} style={{ width: '62px' }}>ราคาต่อหน่วย<br/>(8)=(2)+(4)+(6)</th>
                <th className={thBase} style={{ width: '80px' }}>ราคาต่อปริมาณ<br/>(9)=(3)+(5)+(7)</th>
              </tr>
            </thead>
            <tbody>
              {boqItems.length === 0 && (
                <tr>
                  <td colSpan={13} className={`${tdBase} text-center py-4 text-slate-400`}>
                    ยังไม่มีรายการ — กลับไปออกแบบ Network แล้วกำหนด Material ให้กับ Node/Edge
                  </td>
                </tr>
              )}
              {(boqItems as any[]).map((row, idx) => (
                <tr key={row.mat.id} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                  <td className={`${tdBase} text-center`}>{idx + 1}</td>
                  <td className={`${tdBase}`}>
                    <div className="font-semibold">{row.mat.material_name}</div>
                    <div className="text-[8px] text-slate-400">{row.mat.material_code}</div>
                  </td>
                  <td className={`${tdBase} text-center`}>{row.boqUnit}</td>
                  <td className={`${tdBase} text-right`}>{row.qty.toFixed(2)}</td>
                  {/* ค่าเคเบิล */}
                  <td className={`${tdBase} text-right`}>{fmt(row.cablePerUnit)}</td>
                  <td className={`${tdBase} text-right`}>{fmt(row.cableTotal)}</td>
                  {/* ค่าวัสดุ */}
                  <td className={`${tdBase} text-right`}>{fmt(row.matPerUnit)}</td>
                  <td className={`${tdBase} text-right`}>{fmt(row.matTotal)}</td>
                  {/* ค่าแรงงาน */}
                  <td className={`${tdBase} text-right`}>{fmt(row.laborPerUnit)}</td>
                  <td className={`${tdBase} text-right`}>{fmt(row.laborTotal)}</td>
                  {/* รวม */}
                  <td className={`${tdBase} text-right font-semibold`}>{fmt(row.totalPerUnit)}</td>
                  <td className={`${tdBase} text-right font-bold`}>{fmt(row.rowTotal)}</td>
                  <td className={`${tdBase} text-[9px] text-slate-500`}>{row.mat.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Summary section (bottom-right aligned like image) ─────── */}
          <div className="flex justify-end mt-2">
            <table className="border-collapse text-[10px]" style={{ minWidth: '420px' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold bg-slate-50" style={{ width: '30px' }}>1</td>
                  <td className="border border-gray-400 px-2 py-1">รวมต้นทุนรายการที่ 1 - {boqItems.length}</td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-bold" style={{ width: '120px' }}>{fmtVal(subTotal)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold bg-slate-50">2</td>
                  <td className="border border-gray-400 px-2 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        Factor OC ({meta.factorOC.toFixed(4)})
                        <span className="text-[9px] text-slate-400 ml-1">คิดราคาที่ยิ่งสูง</span>
                      </span>
                      <button
                        onClick={() => fetchFactorOC(subTotal)}
                        disabled={factorLoading || !savedProject?.province}
                        className={`print:hidden flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                          savedProject?.province
                            ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                            : 'border-slate-200 text-slate-300 cursor-not-allowed'
                        }`}
                        title={savedProject?.province
                          ? `คำนวณ Factor OC จาก API (${savedProject.province}, ${procureMethod})`
                          : 'ระบุจังหวัดในโครงการก่อน'}
                      >
                        {factorLoading
                          ? <Loader2 size={10} className="animate-spin" />
                          : <RefreshCw size={10} />
                        }
                        คำนวณ
                      </button>
                    </div>
                    {factorError && (
                      <div className="print:hidden text-[8px] text-red-500 mt-0.5 flex items-center gap-0.5">
                        <AlertCircle size={8} />{factorError}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-bold">{fmtVal(factorAmount)}</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border border-gray-400 px-2 py-1 font-bold">3</td>
                  <td className="border border-gray-400 px-2 py-1 font-bold">รวม ต้นทุน และ Factor-OC <span className="text-slate-400 font-normal">(1+2)</span></td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-black">{fmtVal(totalWithFactor)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold bg-slate-50">4</td>
                  <td className="border border-gray-400 px-2 py-1">รวมต้นทุน <span className="text-[9px] text-slate-400">(3)</span></td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-bold">{fmtVal(totalWithFactor)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold bg-slate-50">5</td>
                  <td className="border border-gray-400 px-2 py-1">Vat 7%</td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-bold">{fmtVal(vatAmount)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-400 px-2 py-1 font-black">6</td>
                  <td className="border border-gray-400 px-2 py-1 font-black">รวมต้นทุนทั้งสิ้น <span className="text-[9px] font-normal text-slate-400">(4+5)</span></td>
                  <td className="border border-gray-400 px-2 py-1 text-right font-black text-blue-700">{fmtVal(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 text-[9px] text-slate-400 text-center print:mt-4">
            สร้างโดยระบบ FiberFlow Auto-Planner — วันที่พิมพ์ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQSummary;
