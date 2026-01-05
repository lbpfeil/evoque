import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Book } from '../types';

interface DashboardChartsProps {
  timelineData: Array<{ name: string; count: number }>;
  books: Book[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ timelineData, books }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-md border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-8">Import Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#18181b', color: '#fff', border: 'none', borderRadius: '4px'}} itemStyle={{color: '#fff'}} cursor={{stroke: '#e4e4e7'}} />
              <Area type="monotone" dataKey="count" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-md border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-8">Highlights per Book</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={books.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
              <XAxis type="number" hide />
              <YAxis dataKey="title" type="category" width={120} tick={{fontSize: 12, fill: '#71717a'}} />
              <Tooltip contentStyle={{backgroundColor: '#18181b', color: '#fff', border: 'none', borderRadius: '4px'}} cursor={{fill: '#f4f4f5'}} />
              <Bar dataKey="highlightCount" fill="#27272a" radius={[0, 2, 2, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
