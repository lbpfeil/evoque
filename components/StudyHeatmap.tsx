import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewLog } from '../types';
import { Flame, TrendingUp } from 'lucide-react';

interface HeatmapDay {
  date: string;           // YYYY-MM-DD
  count: number;          // Number of reviews
  intensity: 0 | 1 | 2 | 3 | 4;  // Color intensity level
}

interface HeatmapWeek {
  days: HeatmapDay[];     // Always 7 days (Sun-Sat)
}

interface StudyHeatmapProps {
  reviewLogs: ReviewLog[];
}

// Aggregate reviews by date (using local timezone)
function aggregateReviewsByDate(reviewLogs: ReviewLog[]): Map<string, number> {
  const dateMap = new Map<string, number>();

  for (const log of reviewLogs) {
    // Convert to local date (JavaScript Date uses browser's timezone)
    const localDate = new Date(log.reviewedAt);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
  }

  return dateMap;
}

// Calculate intensity based on percentiles
function calculateIntensity(count: number, allCounts: number[]): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;

  const nonZeroCounts = allCounts.filter(c => c > 0).sort((a, b) => a - b);
  if (nonZeroCounts.length === 0) return 1;

  const p25 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.25)] || 1;
  const p50 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.50)] || 2;
  const p75 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.75)] || 5;

  if (count <= p25) return 1;
  if (count <= p50) return 2;
  if (count <= p75) return 3;
  return 4;
}

// Generate heatmap data for specified number of weeks
function generateHeatmapData(dateCountMap: Map<string, number>, numWeeks: number): HeatmapWeek[] {
  const weeks: HeatmapWeek[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all counts for percentile calculation
  const allCounts = Array.from(dateCountMap.values());

  // Find the Saturday of current week (end of grid)
  const endDate = new Date(today);
  const dayOfWeek = endDate.getDay();
  endDate.setDate(endDate.getDate() + (6 - dayOfWeek)); // Move to Saturday

  // Go back numWeeks weeks (start from Sunday)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (numWeeks * 7 - 1));

  // Generate each week
  const currentDate = new Date(startDate);
  for (let w = 0; w < numWeeks; w++) {
    const week: HeatmapWeek = { days: [] };

    for (let d = 0; d < 7; d++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const count = dateCountMap.get(dateKey) || 0;
      const isFuture = currentDate > today;

      week.days.push({
        date: dateKey,
        count: isFuture ? 0 : count,
        intensity: isFuture ? 0 : calculateIntensity(count, allCounts)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
}

// Calculate current and longest streaks
function calculateStreaks(dateCountMap: Map<string, number>): { current: number; longest: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today and yesterday keys
  const todayKey = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(today);

  // Start from today if reviewed, otherwise check yesterday (grace period)
  if (dateCountMap.get(todayKey)) {
    // Start counting from today
  } else if (dateCountMap.get(yesterdayKey)) {
    // Grace period: didn't study today yet, but studied yesterday
    checkDate = yesterday;
  } else {
    // Streak broken - no reviews today or yesterday
    currentStreak = 0;
  }

  // Count consecutive days backwards (only if we have a starting point)
  if (dateCountMap.get(todayKey) || dateCountMap.get(yesterdayKey)) {
    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (dateCountMap.get(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(dateCountMap.keys())
    .filter(d => dateCountMap.get(d)! > 0)
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { current: currentStreak, longest: longestStreak };
}

// Generate month labels
function generateMonthLabels(weeks: HeatmapWeek[], monthNames: string[]): Array<{ name: string; span: number }> {
  const labels: Array<{ name: string; span: number }> = [];
  const months = monthNames;

  let currentMonth = -1;
  let currentSpan = 0;

  for (const week of weeks) {
    const weekMonth = new Date(week.days[0].date).getMonth();

    if (weekMonth !== currentMonth) {
      if (currentSpan > 0) {
        labels.push({ name: months[currentMonth], span: currentSpan });
      }
      currentMonth = weekMonth;
      currentSpan = 1;
    } else {
      currentSpan++;
    }
  }

  // Push final month
  if (currentSpan > 0) {
    labels.push({ name: months[currentMonth], span: currentSpan });
  }

  return labels;
}

// Get Tailwind class for intensity
function getIntensityClass(intensity: number, date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cellDate = new Date(date);
  const isFuture = cellDate > today;

  if (isFuture) {
    return 'bg-muted/50 cursor-default';
  }

  /* data-viz: intentional raw color - heatmap gradient specific to data visualization */
  const classes: Record<number, string> = {
    0: 'bg-muted hover:bg-muted/80',
    1: 'bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800',
    2: 'bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600',
    3: 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500',
    4: 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400',
  };

  return classes[intensity] || classes[0];
}

// Format date for tooltip
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Calculate number of weeks based on container width
function calculateNumWeeks(containerWidth: number): number {
  // Cell size (10px) + gap (2px) = 12px per week column
  // Day labels take ~14px, padding ~24px
  const availableWidth = containerWidth - 38; // 14px labels + 24px padding
  const weekWidth = 12; // 10px cell + 2px gap
  const maxWeeks = Math.floor(availableWidth / weekWidth);

  // Clamp between 14 and 52 weeks (3-12 months)
  return Math.max(14, Math.min(52, maxWeeks));
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ reviewLogs }) => {
  const { t } = useTranslation('study');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);
  const [numWeeks, setNumWeeks] = useState(26); // Default to 6 months
  const containerRef = useRef<HTMLDivElement>(null);

  // Get translated month and day names
  const monthNames = [
    t('heatmap.months.jan'), t('heatmap.months.feb'), t('heatmap.months.mar'),
    t('heatmap.months.apr'), t('heatmap.months.may'), t('heatmap.months.jun'),
    t('heatmap.months.jul'), t('heatmap.months.aug'), t('heatmap.months.sep'),
    t('heatmap.months.oct'), t('heatmap.months.nov'), t('heatmap.months.dec')
  ];

  const dayLabels = [
    t('heatmap.days.sun'), t('heatmap.days.mon'), t('heatmap.days.tue'),
    t('heatmap.days.wed'), t('heatmap.days.thu'), t('heatmap.days.fri'),
    t('heatmap.days.sat')
  ];

  // Responsive: adjust weeks based on container width
  useEffect(() => {
    const updateWeeks = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setNumWeeks(calculateNumWeeks(width));
      }
    };

    updateWeeks();
    window.addEventListener('resize', updateWeeks);
    return () => window.removeEventListener('resize', updateWeeks);
  }, []);

  // Memoized calculations
  const { weeks, stats, monthLabels } = useMemo(() => {
    const dateCountMap = aggregateReviewsByDate(reviewLogs);
    const weeks = generateHeatmapData(dateCountMap, numWeeks);
    const streaks = calculateStreaks(dateCountMap);
    const totalReviews = Array.from(dateCountMap.values()).reduce((a, b) => a + b, 0);

    return {
      weeks,
      stats: {
        totalReviews,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
      },
      monthLabels: generateMonthLabels(weeks, monthNames)
    };
  }, [reviewLogs, numWeeks, monthNames]);

  // Handle hover
  const handleCellHover = (event: React.MouseEvent, day: HeatmapDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(day.date);
    if (cellDate > today) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      date: day.date,
      count: day.count
    });
  };

  return (
    <div ref={containerRef} className="bg-card rounded border border-border p-sm mb-sm">
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-sm">
        <h3 className="text-caption font-semibold text-muted-foreground">{t('heatmap.title')}</h3>
        <div className="flex items-center gap-sm text-caption">
          {/* data-viz: intentional raw color - streak indicator accent */}
          <div className="flex items-center gap-xs text-orange-500" title={t('heatmap.currentStreak')}>
            <Flame className="w-3 h-3" />
            <span>{stats.currentStreak}</span>
          </div>
          <div className="flex items-center gap-xs text-muted-foreground" title={t('heatmap.longestStreak')}>
            <TrendingUp className="w-3 h-3" />
            <span>{stats.longestStreak}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid - Centered */}
      <div className="flex justify-center overflow-x-auto">
        <div>
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 pr-1">
              {dayLabels.map((day, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 text-[8px] text-muted-foreground flex items-center justify-center"
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-colors ${getIntensityClass(day.intensity, day.date)}`}
                    onMouseEnter={(e) => handleCellHover(e, day)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Month labels */}
          <div className="flex mt-xs pl-md">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-[8px] text-muted-foreground"
                style={{ width: `${label.span * 12}px` }}
              >
                {label.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        /* data-viz: intentional raw color - inverted tooltip for heatmap */
        <div
          className="fixed z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-caption px-sm py-xs rounded shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">{formatDate(tooltip.date)}</div>
          {/* data-viz: intentional raw color - tooltip subtext */}
          <div className="text-zinc-300 dark:text-zinc-600">
            {t('heatmap.reviews', { count: tooltip.count })}
          </div>
        </div>
      )}
    </div>
  );
};
