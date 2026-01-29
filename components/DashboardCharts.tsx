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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
      <div className="bg-card p-xl rounded-md border border-border">
        <h3 className="text-body font-semibold text-card-foreground uppercase tracking-wider mb-xl">{t('charts.importActivity')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', border: 'none', borderRadius: '4px'}} itemStyle={{color: 'var(--popover-foreground)'}} cursor={{stroke: 'var(--border)'}} />
              <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-xl rounded-md border border-border">
        <h3 className="text-body font-semibold text-card-foreground uppercase tracking-wider mb-xl">{t('charts.highlightsPerBook')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={books.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" hide />
              <YAxis dataKey="title" type="category" width={120} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
              <Tooltip contentStyle={{backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', border: 'none', borderRadius: '4px'}} cursor={{fill: 'var(--muted)'}} />
              <Bar dataKey="highlightCount" fill="var(--primary)" radius={[0, 2, 2, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
