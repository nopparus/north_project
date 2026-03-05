import React from "react";
import { DollarSign, MapPin, CheckCircle, Wrench, Zap, Pickaxe } from "lucide-react";

export default function DashboardMetrics({ metrics }: { metrics: any }) {
    const percentComplete = metrics.totalSites > 0
        ? Math.round((metrics.surveyedSites / metrics.totalSites) * 100)
        : 0;

    const kpis = [
        {
            title: "จุดติดตั้งทั้งหมด",
            value: metrics.totalSites.toLocaleString(),
            subtitle: `${percentComplete}% สำรวจแล้ว (${metrics.surveyedSites.toLocaleString()} จุด)`,
            icon: <MapPin className="text-indigo-600 w-6 h-6" />,
            bg: "bg-indigo-100",
            border: "border-indigo-200"
        },
        {
            title: "งบประมาณรวมที่สำรวจแล้ว",
            value: `฿${metrics.totalBudget.toLocaleString()}`,
            subtitle: `เฉลี่ย ฿${metrics.surveyedSites > 0 ? Math.round(metrics.totalBudget / metrics.surveyedSites).toLocaleString() : 0} ต่อจุด`,
            icon: <DollarSign className="text-green-600 w-6 h-6" />,
            bg: "bg-green-100",
            border: "border-green-200"
        },
        {
            title: "ยอดรวมค่าอุปกรณ์ (Consumer + Ground)",
            value: `฿${(metrics.totalConsumerCost + metrics.totalGroundRodCost).toLocaleString()}`,
            subtitle: `จากผู้ใช้ ${metrics.surveyedSites.toLocaleString()} ราย`,
            icon: <Zap className="text-amber-600 w-6 h-6" />,
            bg: "bg-amber-100",
            border: "border-amber-200"
        },
        {
            title: "ยอดรวมค่าแรง และสายไฟ",
            value: `฿${(metrics.totalLaborCost + metrics.totalWireCost).toLocaleString()}`,
            subtitle: `ค่าแรง: ฿${metrics.totalLaborCost.toLocaleString()} | สายไฟ: ฿${metrics.totalWireCost.toLocaleString()}`,
            icon: <Wrench className="text-blue-600 w-6 h-6" />,
            bg: "bg-blue-100",
            border: "border-blue-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
                <div key={index} className={`bg-white rounded-xl shadow-sm border ${kpi.border} p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}>
                    <div className={`${kpi.bg} p-3 rounded-lg flex-shrink-0`}>
                        {kpi.icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">{kpi.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
