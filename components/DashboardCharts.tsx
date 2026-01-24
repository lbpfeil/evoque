import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Book } from '../types';

interface DashboardChartsProps {
  timelineData: Array<{ name: string; count: number }>;
  books: Book[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ timelineData, books }) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card p-8 rounded-md border border-border">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider mb-8">{t('charts.importActivity')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: 'none', borderRadius: '4px'}} itemStyle={{color: 'hsl(var(--popover-foreground))'}} cursor={{stroke: 'hsl(var(--border))'}} />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-8 rounded-md border border-border">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider mb-8">{t('charts.highlightsPerBook')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={books.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis dataKey="title" type="category" width={120} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
              <Tooltip contentStyle={{backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: 'none', borderRadius: '4px'}} cursor={{fill: 'hsl(var(--muted))'}} />
              <Bar dataKey="highlightCount" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
