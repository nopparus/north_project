import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ComposedChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface ChartProps {
    metrics: any;
    groupedData: any[];
    timeSeriesData: any[];
    isDistrictView: boolean;
}

export default function DashboardCharts({ metrics, groupedData, timeSeriesData, isDistrictView }: ChartProps) {

    const budgetBreakdown = [
        { name: 'ค่าตู้ Consumer Unit', value: metrics.totalConsumerCost },
        { name: 'ค่า Ground Rod', value: metrics.totalGroundRodCost },
        { name: 'ค่าสายไฟเมน', value: metrics.totalWireCost },
        { name: 'ค่าจ้างแรงช่าง', value: metrics.totalLaborCost }
    ].filter(item => item.value > 0);

    // Format data for charts
    const chartData = groupedData.map(d => ({
        name: d.name,
        งบประมาณรวม: d.totalCost || 0,
        จำนวนจุดสำรวจ: d.surveyed || 0,
        จำนวนจุดทั้งหมด: d.count || 0,
        ค่าเฉลี่ยต่องบ: d.avgCost ? Math.round(d.avgCost) : 0
    }));

    // Top 10 by total cost for overview
    const topCostData = [...chartData].sort((a, b) => b.งบประมาณรวม - a.งบประมาณรวม).slice(0, 10);

    // Top 10 by average cost
    const topAvgData = [...chartData].filter(d => d.ค่าเฉลี่ยต่องบ > 0).sort((a, b) => b.ค่าเฉลี่ยต่องบ - a.ค่าเฉลี่ยต่องบ).slice(0, 10);

    // Completion Rate Data (Progress)
    const completionData = [...chartData]
        .map(d => ({
            name: d.name,
            เปอร์เซ็นต์ความสำเร็จ: d.จำนวนจุดทั้งหมด > 0 ? Math.round((d.จำนวนจุดสำรวจ / d.จำนวนจุดทั้งหมด) * 100) : 0,
            จำนวนจุดสำรวจ: d.จำนวนจุดสำรวจ,
            จำนวนจุดทั้งหมด: d.จำนวนจุดทั้งหมด
        }))
        .filter(d => d.เปอร์เซ็นต์ความสำเร็จ > 0)
        .sort((a, b) => b.เปอร์เซ็นต์ความสำเร็จ - a.เปอร์เซ็นต์ความสำเร็จ)
        .slice(0, 10);

    // Format Time Series Data
    const formattedTimeSeries = (timeSeriesData || []).map(t => {
        const dateObj = new Date(t.date);
        return {
            date: t.date,
            displayDate: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
            จำนวนการสำรวจ: t.count,
            งบประมาณรายวัน: t.cost
        };
    });

    const formatCurrency = (value: number) => `฿${value.toLocaleString()}`;
    const dynamicLabel = isDistrictView ? "อำเภอ" : "จังหวัด";

    return (
        <div className="flex flex-col gap-6 w-full">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Composed Chart - Sites vs Budget */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-96">
                    <h3 className="text-base font-bold text-slate-800 mb-4">งบประมาณรวมและจำนวนจุด (Top 10 {dynamicLabel})</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <ComposedChart data={topCostData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis yAxisId="left" tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`} width={60} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                formatter={(value: number, name: string) => name === 'งบประมาณรวม' ? formatCurrency(value) : value}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar yAxisId="left" dataKey="งบประมาณรวม" fill="#4f46e5" radius={[4, 4, 0, 0]} name="งบประมาณรวม (บาท)" />
                            <Line yAxisId="right" type="monotone" dataKey="จำนวนจุดสำรวจ" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="จำนวนจุดสำรวจ" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Horizontal Bar Chart - Completion Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-96">
                    <h3 className="text-base font-bold text-slate-800 mb-4">ความคืบหน้าการสำรวจ (Top 10 {dynamicLabel})</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart layout="vertical" data={completionData} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                            <RechartsTooltip
                                formatter={(value: number, name: string, props: any) => {
                                    if (name === 'เปอร์เซ็นต์ความสำเร็จ') return [`${value}% (${props.payload.จำนวนจุดสำรวจ}/${props.payload.จำนวนจุดทั้งหมด})`, 'เปอร์เซ็นต์เสร็จสิ้น'];
                                    return value;
                                }}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="เปอร์เซ็นต์ความสำเร็จ" fill="#06b6d4" radius={[0, 4, 4, 0]} name="เปอร์เซ็นต์เสร็จสิ้น (%)" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Area Chart - Time Series Velocity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-96">
                    <h3 className="text-base font-bold text-slate-800 mb-4">อัตราการสำรวจ (Survey Velocity)</h3>
                    {formattedTimeSeries.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={formattedTimeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`} width={60} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    labelFormatter={(label, props) => props.length > 0 ? props[0].payload.date : label}
                                    formatter={(value: number, name: string) => name === 'งบประมาณรายวัน' ? formatCurrency(value) : value}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Area yAxisId="left" type="monotone" dataKey="จำนวนการสำรวจ" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" name="จุดที่สำรวจเสร็จ" />
                                <Line yAxisId="right" type="monotone" dataKey="งบประมาณรายวัน" stroke="#ec4899" strokeWidth={2} dot={false} name="งบประมาณรายวัน" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">ยังไม่มีข้อมูลการสำรวจรายวัน</div>
                    )}
                </div>

                {/* Bar Chart - Average Cost */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-96">
                    <h3 className="text-base font-bold text-slate-800 mb-4">ค่าเฉลี่ยงบประมาณต่อจุด (Top 10 {dynamicLabel}งบสูง)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={topAvgData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis tickFormatter={(val) => `฿${val.toLocaleString()}`} width={70} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                formatter={(value: number) => formatCurrency(value)}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="ค่าเฉลี่ยต่องบ" fill="#10b981" radius={[4, 4, 0, 0]} name="ค่าเฉลี่ย (บาท/จุด)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart - Budget Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-80 w-full lg:w-1/2 mx-auto mt-2">
                <h3 className="text-base font-bold text-slate-800 mb-4 text-center">สัดส่วนตามประเภทงบประมาณ</h3>
                {budgetBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={budgetBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {budgetBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        ยังไม่มีข้อมูลค่าใช้จ่าย
                    </div>
                )}
            </div>

        </div>
    );
}
