import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { StudyHeatmap } from '../components/StudyHeatmap';
import { PageHeader } from '../components/patterns/PageHeader';
import { Target, Clock, BookOpen, TrendingUp, Play, Import } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

// Format date to YYYY-MM-DD using local timezone
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, subtitle }: StatCardProps) => (
  <Card size="sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-overline font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-caption text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

interface QuickStudyButtonProps {
  cardsDue: number;
  onClick: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const QuickStudyButton = ({ cardsDue, onClick, t }: QuickStudyButtonProps) => (
  <Card className="bg-primary text-primary-foreground border-primary">
    <CardContent className="p-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body font-semibold">{t('quickStudy.title')}</p>
          <p className="text-caption opacity-80">
            {cardsDue > 0
              ? t('quickStudy.cardsDue', { count: cardsDue })
              : t('quickStudy.noCards')}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={onClick}
          disabled={cardsDue === 0}
          className="min-w-[100px] gap-xs"
        >
          <Play className="w-4 h-4" />
          {t('quickStudy.button')}
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface EmptyStateProps {
  onImport: () => void;
  t: (key: string) => string;
}

const EmptyState = ({ onImport, t }: EmptyStateProps) => (
  <Card className="text-center p-xl">
    <CardContent className="flex flex-col items-center gap-md">
      <BookOpen className="w-12 h-12 text-muted-foreground" />
      <div>
        <h2 className="text-heading font-semibold mb-xs">{t('empty.title')}</h2>
        <p className="text-body text-muted-foreground">{t('empty.message')}</p>
      </div>
      <Button onClick={onImport} className="gap-xs">
        <Import className="w-4 h-4" />
        {t('empty.importButton')}
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');
  const { books, highlights, studyCards, reviewLogs, getCardsDue, isLoaded } = useStore();

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const today = formatLocalDate(now);

    // Reviews today
    const reviewsToday = reviewLogs.filter(
      log => formatLocalDate(new Date(log.reviewedAt)) === today
    ).length;

    // Average time (only logs with duration data)
    const logsWithDuration = reviewLogs.filter(log => log.durationMs != null);
    const avgTimeMs = logsWithDuration.length > 0
      ? logsWithDuration.reduce((sum, log) => sum + log.durationMs!, 0) / logsWithDuration.length
      : null;
    const avgTimeSeconds = avgTimeMs ? Math.round(avgTimeMs / 1000) : null;

    // Most reviewed books
    const bookReviewCounts = new Map<string, number>();
    for (const log of reviewLogs) {
      const card = studyCards.find(c => c.id === log.cardId);
      if (!card) continue;
      const highlight = highlights.find(h => h.id === card.highlightId);
      if (!highlight) continue;
      bookReviewCounts.set(
        highlight.bookId,
        (bookReviewCounts.get(highlight.bookId) || 0) + 1
      );
    }

    const topBooks = Array.from(bookReviewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([bookId, count]) => {
        const book = books.find(b => b.id === bookId);
        return {
          id: bookId,
          title: book?.title || 'Unknown',
          coverUrl: book?.coverUrl,
          reviews: count
        };
      });

    // Calculate max reviews for percentage bars
    const maxReviews = topBooks.length > 0 ? topBooks[0].reviews : 0;

    return { reviewsToday, avgTimeSeconds, topBooks, maxReviews };
  }, [reviewLogs, studyCards, highlights, books]);

  // Cards due count
  const cardsDue = useMemo(() => getCardsDue().length, [getCardsDue]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t('loading', { ns: 'common' })}
      </div>
    );
  }

  // Show empty state if no books
  if (books.length === 0) {
    return (
      <div className="p-md sm:p-lg">
        <PageHeader title={t('title')} description={t('subtitle')} size="compact" />
        <EmptyState onImport={() => navigate('/settings')} t={t} />
      </div>
    );
  }

  return (
    <div className="p-md sm:p-lg">
      <PageHeader title={t('title')} description={t('subtitle')} size="compact" />

      <div className="space-y-lg max-w-4xl">
        {/* Quick Study CTA */}
        <QuickStudyButton
          cardsDue={cardsDue}
          onClick={() => navigate('/study')}
          t={t}
        />

        {/* KPI Grid - 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
          <StatCard
            title={t('kpi.cardsDue')}
            value={cardsDue}
            icon={Target}
          />
          <StatCard
            title={t('kpi.reviewsToday')}
            value={analytics.reviewsToday}
            icon={TrendingUp}
          />
          <StatCard
            title={t('kpi.avgTime')}
            value={analytics.avgTimeSeconds ? `${analytics.avgTimeSeconds}s` : '-'}
            icon={Clock}
            subtitle={analytics.avgTimeSeconds ? t('kpi.perCard') : t('kpi.noData')}
          />
          <StatCard
            title={t('kpi.totalBooks')}
            value={books.length}
            icon={BookOpen}
          />
        </div>

        {/* Heatmap Section */}
        {reviewLogs.length > 0 && (
          <section>
            <StudyHeatmap reviewLogs={reviewLogs} />
          </section>
        )}

        {/* Top Books Section */}
        {analytics.topBooks.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-md">
              <h2 className="text-body font-semibold text-foreground">{t('topBooks.title')}</h2>
              <span className="text-caption text-muted-foreground">{t('topBooks.period')}</span>
            </div>
            <Card size="sm">
              <CardContent className="p-md space-y-md">
                {analytics.topBooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-md">
                    {/* Book Cover */}
                    <div className="w-10 h-14 rounded bg-muted flex-shrink-0 overflow-hidden">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    {/* Title and Bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium text-foreground truncate mb-1">
                        {book.title}
                      </p>
                      <div className="flex items-center gap-sm">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(book.reviews / analytics.maxReviews) * 100}%` }}
                          />
                        </div>
                        <span className="text-caption text-muted-foreground w-8 text-right">
                          {book.reviews}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
