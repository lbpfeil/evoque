import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../components/StoreContext';
import { StudyHeatmap, aggregateReviewsByDate, calculateStreaks } from '../components/StudyHeatmap';
import { PageHeader } from '../components/patterns/PageHeader';
import { Target, Clock, BookOpen, TrendingUp, Play, Import, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

// Format date to YYYY-MM-DD using local timezone
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get month boundaries (start/end dates)
function getMonthBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Check if date is within range
function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
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

    // Month boundaries
    const thisMonth = getMonthBounds(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = getMonthBounds(lastMonthDate);

    // Helper to count reviews per book for a given period
    const countBookReviews = (start: Date, end: Date) => {
      const counts = new Map<string, number>();
      for (const log of reviewLogs) {
        const logDate = new Date(log.reviewedAt);
        if (!isInRange(logDate, start, end)) continue;
        const card = studyCards.find(c => c.id === log.cardId);
        if (!card) continue;
        const highlight = highlights.find(h => h.id === card.highlightId);
        if (!highlight) continue;
        counts.set(highlight.bookId, (counts.get(highlight.bookId) || 0) + 1);
      }
      return counts;
    };

    // Top books this month
    const thisMonthCounts = countBookReviews(thisMonth.start, thisMonth.end);
    const totalReviewsThisMonth = Array.from(thisMonthCounts.values()).reduce((a, b) => a + b, 0);
    const booksStudiedThisMonth = thisMonthCounts.size;
    const topBooksThisMonth = Array.from(thisMonthCounts.entries())
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
    const maxReviewsThisMonth = topBooksThisMonth.length > 0 ? topBooksThisMonth[0].reviews : 0;

    // Top book last month
    const lastMonthCounts = countBookReviews(lastMonth.start, lastMonth.end);
    const topBookLastMonth = Array.from(lastMonthCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(([bookId, count]) => {
        const book = books.find(b => b.id === bookId);
        return {
          id: bookId,
          title: book?.title || 'Unknown',
          author: book?.author,
          coverUrl: book?.coverUrl,
          reviews: count
        };
      })[0] || null;

    // Streak calculation
    const dateCountMap = aggregateReviewsByDate(reviewLogs);
    const streaks = calculateStreaks(dateCountMap);

    return {
      reviewsToday,
      avgTimeSeconds,
      topBooksThisMonth,
      maxReviewsThisMonth,
      topBookLastMonth,
      currentStreak: streaks.current,
      totalReviewsThisMonth,
      booksStudiedThisMonth
    };
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

  // Streak display component for header
  const streakDisplay = (
    <div className="flex items-center gap-sm bg-primary/10 rounded-lg px-md py-sm">
      <Flame className="w-6 h-6 text-primary" />
      <div className="text-right">
        <p className="text-heading font-bold text-primary leading-none">{analytics.currentStreak}</p>
        <p className="text-caption text-muted-foreground">{t('streak.days')}</p>
      </div>
    </div>
  );

  return (
    <div className="p-md sm:p-lg">
      <PageHeader title={t('title')} description={t('subtitle')} size="compact" actions={streakDisplay} />

      <div className="space-y-lg">
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

        {/* Top Books Section - This Month + Last Month Featured + Monthly Stats */}
        {(analytics.topBooksThisMonth.length > 0 || analytics.topBookLastMonth) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* This Month - wider on large screens */}
            {analytics.topBooksThisMonth.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex items-baseline justify-between mb-md">
                  <h2 className="text-body font-semibold text-foreground">{t('topBooks.title')}</h2>
                  <span className="text-caption text-muted-foreground">{t('topBooks.thisMonth')}</span>
                </div>
                <Card size="sm" className="h-full">
                  <CardContent className="p-md">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                      {analytics.topBooksThisMonth.map((book) => (
                        <div key={book.id} className="flex flex-col items-center text-center">
                          <div className="w-16 h-24 rounded bg-muted overflow-hidden shadow-sm mb-sm">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <p className="text-caption font-medium text-foreground line-clamp-2 mb-1">
                            {book.title}
                          </p>
                          <p className="text-caption text-primary font-semibold">
                            {book.reviews} {t('topBooks.reviews')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Last Month Featured */}
            {analytics.topBookLastMonth && (
              <div>
                <div className="flex items-baseline justify-between mb-md">
                  <h2 className="text-body font-semibold text-foreground">{t('topBooks.lastMonthTitle')}</h2>
                  <span className="text-caption text-muted-foreground">{t('topBooks.lastMonth')}</span>
                </div>
                <Card size="sm" className="h-full">
                  <CardContent className="p-md flex flex-col items-center text-center">
                    <div className="w-20 h-28 rounded bg-muted overflow-hidden shadow-md mb-sm">
                      {analytics.topBookLastMonth.coverUrl ? (
                        <img
                          src={analytics.topBookLastMonth.coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <p className="text-body font-semibold text-foreground line-clamp-2">
                      {analytics.topBookLastMonth.title}
                    </p>
                    {analytics.topBookLastMonth.author && (
                      <p className="text-caption text-muted-foreground truncate mt-1 max-w-full">
                        {analytics.topBookLastMonth.author}
                      </p>
                    )}
                    <p className="text-caption text-primary font-medium mt-2">
                      {t('topBooks.reviewCount', { count: analytics.topBookLastMonth.reviews })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
