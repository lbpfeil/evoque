import React, { Suspense, lazy } from 'react';
import { useStore } from '../components/StoreContext';
import { Book, Highlighter, Brain, Clock, Loader2 } from 'lucide-react';

// Lazy load charts to reduce initial bundle size
const DashboardCharts = lazy(() => import('../components/DashboardCharts'));

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

      {/* Charts Section with lazy loading */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      }>
        <DashboardCharts timelineData={mockTimelineData} books={books} />
      </Suspense>

      {/* Recent Books */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-zinc-900">Recent Books</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.slice(0, 3).map(book => (
            <div key={book.id} className="bg-white p-4 rounded-md border border-zinc-200 flex gap-5 hover:border-zinc-300 transition-colors">
               <div className="w-16 h-24 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-100">
                 <img src={book.coverUrl} alt={book.title} loading="lazy" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all" />
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