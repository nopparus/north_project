
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Activity, ShoppingBag } from 'lucide-react';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1100 },
];

const StatsCard = ({ title, value, change, icon: Icon, isUp }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
        <Icon size={20} className="text-zinc-400" />
      </div>
      <div className={`flex items-center text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs text-zinc-500 font-medium">{title}</div>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">Analytics Overview</h2>
        <p className="text-zinc-500">Live metrics and performance indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Users" value="24,512" change="+12.5%" icon={Users} isUp={true} />
        <StatsCard title="Active Sessions" value="1,203" change="+2.4%" icon={Activity} isUp={true} />
        <StatsCard title="Monthly Conversions" value="482" change="-4.1%" icon={ShoppingBag} isUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl h-[400px]">
          <h3 className="text-lg font-semibold mb-8">System Traffic</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl h-[400px]">
          <h3 className="text-lg font-semibold mb-8">Regional Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
