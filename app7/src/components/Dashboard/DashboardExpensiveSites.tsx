import React from "react";
import { AlertTriangle, MapPin, Receipt } from "lucide-react";

interface ExpensiveSite {
    id: number;
    request_id: string;
    location: string;
    province: string;
    district: string;
    survey_cost: number;
    labor_cost: number;
    wire_cost: number;
    consumer_unit_cost: number;
    ground_rod_cost: number;
}

export default function DashboardExpensiveSites({ sites, onSiteClick }: { sites: ExpensiveSite[], onSiteClick: (site: any) => void }) {
    if (!sites || sites.length === 0) return null;

    const formatCurrency = (value: number) => `฿${(value || 0).toLocaleString()}`;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-rose-500" size={20} />
                <h3 className="text-base font-bold text-slate-800">5 อันดับจุดที่มีงบประมาณพุ่งสูงผิดปกติ (Top 5 Most Expensive)</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">สถานที่ / รหัส</th>
                            <th className="px-4 py-3">พื้นที่</th>
                            <th className="px-4 py-3 text-right">ค่าแรง</th>
                            <th className="px-4 py-3 text-right">ค่าสายไฟ</th>
                            <th className="px-4 py-3 text-right">อุปกรณ์</th>
                            <th className="px-4 py-3 text-right text-rose-600 font-bold rounded-tr-lg">รวมทั้งสิ้น</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map((site) => {
                            const equipmentCost = (site.consumer_unit_cost || 0) + (site.ground_rod_cost || 0);
                            return (
                                <tr
                                    key={site.id}
                                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => onSiteClick(site)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800 line-clamp-1">{site.location}</div>
                                        <div className="text-xs text-slate-500">Req: {site.request_id}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} className="text-indigo-400" />
                                            {site.district}, {site.province}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(site.labor_cost)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(site.wire_cost)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(equipmentCost)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                                        <div className="flex items-center justify-end gap-1">
                                            <Receipt size={14} />
                                            {formatCurrency(site.survey_cost)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
