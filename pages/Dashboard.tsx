import React from 'react';
import { useStore } from '../components/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Book, Highlighter, Brain, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-md border border-zinc-200 flex flex-col justify-between h-32 hover:border-zinc-300 transition-colors">
    <div className="flex justify-between items-start">
      <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider text-xs">{title}</p>
      <Icon className="w-5 h-5 text-zinc-400" />
    </div>
    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</h3>
  </div>
);

const Dashboard = () => {
  const { books, highlights, getCardsDue } = useStore();
  const dueCards = getCardsDue().length;

  const mockTimelineData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 19 },
    { name: 'Wed', count: 3 },
    { name: 'Thu', count: 5 },
    { name: 'Fri', count: 2 },
    { name: 'Sat', count: 25 },
    { name: 'Sun', count: 10 },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-2 font-light">Overview of your reading and learning progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Books" 
          value={books.length} 
          icon={Book} 
        />
        <StatCard 
          title="Highlights" 
          value={highlights.length} 
          icon={Highlighter} 
        />
        <StatCard 
          title="To Review" 
          value={dueCards} 
          icon={Brain} 
        />
        <StatCard 
          title="Streak" 
          value="3 Days" 
          icon={Clock} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-md border border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-8">Import Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimelineData}>
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

        <div className="bg-white p-8 rounded-md border border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-8">Highlights per Book</h3>
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

      {/* Recent Books */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-zinc-900">Recent Books</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.slice(0, 3).map(book => (
            <div key={book.id} className="bg-white p-4 rounded-md border border-zinc-200 flex gap-5 hover:border-zinc-300 transition-colors">
               <div className="w-16 h-24 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-100">
                 <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all" />
               </div>
               <div className="flex flex-col justify-center py-1">
                 <h4 className="font-semibold text-zinc-900 line-clamp-2 leading-tight mb-1">{book.title}</h4>
                 <p className="text-sm text-zinc-500 mb-3">{book.author}</p>
                 <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-sm border border-zinc-200 w-fit font-medium">
                   {book.highlightCount} highlights
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;