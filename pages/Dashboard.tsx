import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { Book, Highlighter, Brain, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PageHeader } from '../components/patterns/PageHeader';

// Lazy load charts to reduce initial bundle size
const DashboardCharts = lazy(() => import('../components/DashboardCharts'));

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card className="hover:border-primary/30 transition-colors duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-xs">
      <CardTitle className="text-overline font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-title font-bold tracking-tight">{value}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
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
    <div className="space-y-2xl">
      <PageHeader title={t('title')} description={t('subtitle')} size="compact" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard
          title={t('stats.books')}
          value={books.length}
          icon={Book}
        />
        <StatCard
          title={t('stats.highlights')}
          value={highlights.length}
          icon={Highlighter}
        />
        <StatCard
          title={t('stats.toReview')}
          value={dueCards}
          icon={Brain}
        />
        <StatCard
          title={t('stats.streak')}
          value={t('stats.streakValue', { count: 3 })}
          icon={Clock}
        />
      </div>

      {/* Charts Section with lazy loading */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      }>
        <DashboardCharts timelineData={mockTimelineData} books={books} />
      </Suspense>

      {/* Recent Books */}
      <div>
        <div className="flex justify-between items-center mb-lg">
          <h3 className="text-heading font-bold text-foreground">{t('recentBooks.title')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {books.slice(0, 3).map(book => (
            <div key={book.id} className="bg-card p-md rounded-md border border-border flex gap-lg hover:border-primary/30 transition-colors duration-200">
               <div className="w-16 h-24 bg-muted rounded-sm overflow-hidden flex-shrink-0 border border-border">
                 <img src={book.coverUrl} alt={book.title} loading="lazy" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all" />
               </div>
               <div className="flex flex-col justify-center py-xxs">
                 <h4 className="font-semibold text-card-foreground line-clamp-2 leading-tight mb-xxs">{book.title}</h4>
                 <p className="text-body text-muted-foreground mb-sm">{book.author}</p>
                 <span className="text-caption bg-muted text-muted-foreground px-xs py-xxs rounded-sm border border-border w-fit font-medium">
                   {t('recentBooks.highlightsCount', { count: book.highlightCount })}
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