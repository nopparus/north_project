
import React from 'react';
import { ProjectState, Material } from '../types';
import { useTheme } from '../context/ThemeContext';

interface BOQSummaryProps {
  project: ProjectState;
  materials: Material[];
}

const BOQSummary: React.FC<BOQSummaryProps> = ({ project, materials }) => {
  const { isDark } = useTheme();

  const cls = isDark ? {
    page: 'bg-slate-950',
    card: 'bg-slate-900 border-slate-700',
    docTitle: 'text-white',
    docSubtitle: 'text-slate-400',
    docNote: 'text-slate-500',
    quotationBadge: 'bg-slate-700 text-white',
    dateText: 'text-slate-400',
    headerBorder: 'border-slate-700',
    projectBox: 'bg-slate-800 border-slate-700',
    projectLabel: 'text-slate-500',
    projectValue: 'text-white',
    tableBorder: 'border-slate-700',
    thead: 'bg-slate-800 text-white',
    divider: 'divide-slate-700',
    itemRow: 'hover:bg-slate-800',
    itemId: 'text-slate-500 border-slate-700',
    itemName: 'text-white',
    itemCode: 'text-slate-500',
    itemUnit: 'text-slate-400',
    itemQty: 'text-white',
    itemMat: 'text-slate-400',
    itemLabour: 'text-slate-400',
    itemAmount: 'text-white bg-slate-800/50',
    subtotalRow: 'border-slate-600 bg-slate-800',
    subtotalLabel: 'text-slate-400',
    subtotalValue: 'text-white',
    factorRow: 'bg-slate-900',
    factorLabel: 'text-slate-500',
    factorValue: 'text-white',
    totalRow: 'bg-slate-700 text-white',
    vatRow: 'bg-slate-900',
    vatLabel: 'text-slate-500',
    vatValue: 'text-white',
    signatureBorder: 'border-slate-700',
    signatureHint: 'text-slate-500',
    signatureName: 'text-white',
    signatureTitle: 'text-slate-400',
    footer: 'text-slate-600',
  } : {
    page: 'bg-slate-100',
    card: 'bg-white border-slate-200',
    docTitle: 'text-slate-900',
    docSubtitle: 'text-slate-600',
    docNote: 'text-slate-400',
    quotationBadge: 'bg-slate-200 text-slate-700',
    dateText: 'text-slate-500',
    headerBorder: 'border-slate-200',
    projectBox: 'bg-slate-50 border-slate-200',
    projectLabel: 'text-slate-400',
    projectValue: 'text-slate-900',
    tableBorder: 'border-slate-200',
    thead: 'bg-slate-100 text-slate-700',
    divider: 'divide-slate-200',
    itemRow: 'hover:bg-slate-50',
    itemId: 'text-slate-400 border-slate-200',
    itemName: 'text-slate-900',
    itemCode: 'text-slate-400',
    itemUnit: 'text-slate-500',
    itemQty: 'text-slate-900',
    itemMat: 'text-slate-500',
    itemLabour: 'text-slate-500',
    itemAmount: 'text-slate-900 bg-slate-50',
    subtotalRow: 'border-slate-300 bg-slate-100',
    subtotalLabel: 'text-slate-500',
    subtotalValue: 'text-slate-900',
    factorRow: 'bg-white',
    factorLabel: 'text-slate-400',
    factorValue: 'text-slate-900',
    totalRow: 'bg-slate-200 text-slate-900',
    vatRow: 'bg-white',
    vatLabel: 'text-slate-400',
    vatValue: 'text-slate-900',
    signatureBorder: 'border-slate-300',
    signatureHint: 'text-slate-400',
    signatureName: 'text-slate-900',
    signatureTitle: 'text-slate-500',
    footer: 'text-slate-400',
  };

  const boqData = React.useMemo(() => {
    const items: Record<number, { qty: number; distance?: number }> = {};

    project.nodes.forEach(node => {
      if (node.materialId) {
        // Use the custom node quantity (defaulting to 1 if not set)
        const nodeQty = node.quantity !== undefined ? node.quantity : 1;
        items[node.materialId] = { qty: (items[node.materialId]?.qty || 0) + nodeQty };
      }
    });

    project.edges.forEach(edge => {
      if (edge.materialId) {
        // Fiber cabling is priced per 100M segment/unit in the BOQ sample logic
        const current = items[edge.materialId] || { qty: 0, distance: 0 };
        items[edge.materialId] = {
          qty: current.qty + (edge.distance / 100),
          distance: (current.distance || 0) + edge.distance
        };
      }
    });

    return Object.entries(items).map(([id, data]) => {
      const material = materials.find(m => m.id === Number(id));
      if (!material) return null;

      const totalCost = material.unit_price * data.qty;

      return {
        ...material,
        qty: data.qty,
        totalCost,
        rawDistance: data.distance
      };
    }).filter(Boolean);
  }, [project, materials]);

  const subTotal = boqData.reduce((acc, curr) => acc + (curr?.totalCost || 0), 0);
  const factorOC = 1.2253;
  const totalWithFactor = subTotal * factorOC;
  const factorCost = totalWithFactor - subTotal;
  const vatRate = 0.07;
  const vatAmount = totalWithFactor * vatRate;
  const grandTotal = totalWithFactor + vatAmount;

  return (
    <div className={`min-h-screen p-8 print:p-0 print:bg-white overflow-y-auto ${cls.page}`}>
      <div className={`max-w-[1000px] mx-auto border p-16 shadow-2xl print:shadow-none print:border-none print:p-0 rounded-2xl print:rounded-none ${cls.card}`}>
        {/* Document Header */}
        <div className={`flex justify-between items-start mb-12 border-b-2 pb-8 ${cls.headerBorder}`}>
          <div className="text-left">
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${cls.docTitle}`}>Bill of Quantity</h1>
            <h2 className={`text-sm font-bold mt-1 ${cls.docSubtitle}`}>บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)</h2>
            <p className={`text-[10px] font-bold mt-2 ${cls.docNote}`}>National Telecom Public Company Limited</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-black px-3 py-1 inline-block mb-2 ${cls.quotationBadge}`}>QUOTATION: FO-2024-001</div>
            <p className={`text-xs font-bold ${cls.dateText}`}>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Project Details */}
        <div className={`mb-10 grid grid-cols-2 gap-8 text-xs font-medium p-6 rounded-xl border ${cls.projectBox}`}>
          <div className="space-y-3">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className={`font-bold uppercase tracking-widest text-[9px] ${cls.projectLabel}`}>Project</span>
              <span className={`font-bold ${cls.projectValue}`}>Fiber Optic Network Expansion</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className={`font-bold uppercase tracking-widest text-[9px] ${cls.projectLabel}`}>Location</span>
              <span className={`font-bold underline decoration-dotted ${cls.projectValue} ${isDark ? 'decoration-slate-600' : 'decoration-slate-300'}`}>Chonburi Province (Zone 3)</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className={`font-bold uppercase tracking-widest text-[9px] ${cls.projectLabel}`}>Client</span>
              <span className={`font-bold ${cls.projectValue}`}>NT Regional Office South</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className={`font-bold uppercase tracking-widest text-[9px] ${cls.projectLabel}`}>Design By</span>
              <span className={`font-bold ${cls.projectValue}`}>FiberFlow Auto-Planner</span>
            </div>
          </div>
        </div>

        {/* Main BOQ Table */}
        <div className={`mb-10 overflow-hidden rounded-lg border ${cls.tableBorder}`}>
          <table className="w-full border-collapse text-[10px]">
            <thead className={cls.thead}>
              <tr>
                <th className="px-3 py-3 w-10 text-center uppercase tracking-widest">ID</th>
                <th className="px-3 py-3 text-left uppercase tracking-widest">Item Description</th>
                <th className="px-3 py-3 w-16 text-center uppercase tracking-widest">Unit</th>
                <th className="px-3 py-3 w-16 text-center uppercase tracking-widest">Qty</th>
                <th className="px-3 py-3 w-20 text-right uppercase tracking-widest">Material</th>
                <th className="px-3 py-3 w-20 text-right uppercase tracking-widest">Labour</th>
                <th className="px-3 py-3 w-24 text-right uppercase tracking-widest">Amount (THB)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${cls.divider}`}>
              {boqData.map((item, idx) => {
                const labourCost = item?.unit_price * 0.35; // 35% labour overhead
                const itemTotal = (item?.totalCost || 0) + (labourCost * (item?.qty || 0));
                return (
                  <tr key={idx} className={`transition-colors ${cls.itemRow}`}>
                    <td className={`px-3 py-2.5 text-center font-bold border-r ${cls.itemId}`}>{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className={`font-bold ${cls.itemName}`}>{item?.material_name}</div>
                      <div className={`text-[9px] font-medium ${cls.itemCode}`}>Code: {item?.material_code}</div>
                    </td>
                    <td className={`px-3 py-2.5 text-center font-bold uppercase ${cls.itemUnit}`}>{item?.material_type === 'T02' ? '100M' : item?.unit}</td>
                    <td className={`px-3 py-2.5 text-center font-black ${cls.itemQty}`}>{item?.qty?.toFixed(2)}</td>
                    <td className={`px-3 py-2.5 text-right ${cls.itemMat}`}>{item?.unit_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`px-3 py-2.5 text-right ${cls.itemLabour}`}>{labourCost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`px-3 py-2.5 text-right font-black ${cls.itemAmount}`}>
                      {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}

              {/* Summary Section */}
              <tr className={`border-t-2 ${cls.subtotalRow}`}>
                <td colSpan={6} className={`px-4 py-3 text-right font-black uppercase tracking-wider ${cls.subtotalLabel}`}>Subtotal Construction Cost</td>
                <td className={`px-3 py-3 text-right font-black text-xs ${cls.subtotalValue}`}>{(subTotal * 1.35).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className={cls.factorRow}>
                <td colSpan={6} className={`px-4 py-2 text-right font-bold italic ${cls.factorLabel}`}>Factor OC (1.2253)</td>
                <td className={`px-3 py-2 text-right font-bold ${cls.factorValue}`}>{(subTotal * 1.35 * (factorOC - 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className={cls.totalRow}>
                <td colSpan={6} className="px-4 py-3 text-right font-black uppercase tracking-widest">Total Net Cost (Including Factor OC)</td>
                <td className="px-3 py-3 text-right font-black text-sm">{(subTotal * 1.35 * factorOC).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className={cls.vatRow}>
                <td colSpan={6} className={`px-4 py-2 text-right font-bold ${cls.vatLabel}`}>VAT (7.0%)</td>
                <td className={`px-3 py-2 text-right font-bold ${cls.vatValue}`}>{(subTotal * 1.35 * factorOC * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-blue-600 text-white border-t-4 border-blue-500">
                <td colSpan={6} className="px-4 py-4 text-right font-black text-lg uppercase tracking-tighter">Grand Total Amount</td>
                <td className="px-3 py-4 text-right font-black text-lg border-l-4 border-blue-500">
                  ฿ {(subTotal * 1.35 * factorOC * 1.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="mt-20 grid grid-cols-2 gap-32">
          <div className="text-center">
            <div className={`h-12 border-b-2 mb-4 flex items-end justify-center ${cls.signatureBorder}`}>
               <span className={`text-[10px] italic mb-1 ${cls.signatureHint}`}>Digitally Signed</span>
            </div>
            <p className={`text-xs font-black ${cls.signatureName}`}>Project Engineer</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${cls.signatureTitle}`}>Design &amp; Validation Unit</p>
          </div>
          <div className="text-center">
            <div className={`h-12 border-b-2 mb-4 flex items-end justify-center ${cls.signatureBorder}`}>
               <span className={`text-[10px] italic mb-1 ${cls.signatureHint}`}>Approval Required</span>
            </div>
            <p className={`text-xs font-black ${cls.signatureName}`}>Authorizing Officer</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${cls.signatureTitle}`}>Management Branch</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className={`text-[8px] font-bold uppercase tracking-[0.3em] ${cls.footer}`}>This document is generated automatically by FiberFlow Pro v2.5.0</p>
        </div>
      </div>
    </div>
  );
};

export default BOQSummary;
