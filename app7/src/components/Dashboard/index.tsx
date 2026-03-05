import React, { useState, useEffect } from "react";
import DashboardMetrics from "./DashboardMetrics";
import DashboardCharts from "./DashboardCharts";
import DashboardExpensiveSites from "./DashboardExpensiveSites";
import { Filter } from "lucide-react";

interface DashboardProps {
    onSiteClick: (site: any) => void;
    filterOptions: { provinces: { province: string }[], districts: { province: string; district: string }[] };
    selectedProvince: string;
    selectedDistrict: string;
    selectedStatus: string;
}

export default function Dashboard({ onSiteClick, filterOptions, selectedProvince, selectedDistrict, selectedStatus }: DashboardProps) {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedProvince, selectedDistrict, selectedStatus]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedProvince) params.append("province", selectedProvince);
            if (selectedDistrict) params.append("district", selectedDistrict);
            if (selectedStatus) params.append("status", selectedStatus);

            const res = await fetch(`/app7/api/dashboard/summary?${params.toString()}`);
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Dashboard data fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-auto bg-slate-50 p-6">

            {loading && !dashboardData ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
            ) : dashboardData ? (
                <div className="flex flex-col gap-6 w-full">
                    <DashboardMetrics metrics={dashboardData.metrics} />
                    <DashboardCharts
                        metrics={dashboardData.metrics}
                        groupedData={dashboardData.groupedData}
                        timeSeriesData={dashboardData.timeSeriesData}
                        isDistrictView={!!selectedProvince}
                    />
                    <DashboardExpensiveSites
                        sites={dashboardData.expensiveSites}
                        onSiteClick={onSiteClick}
                    />
                </div>
            ) : (
                <div className="text-center text-slate-500 py-12">ไม่พบข้อมูล</div>
            )}
        </div>
    );
}
