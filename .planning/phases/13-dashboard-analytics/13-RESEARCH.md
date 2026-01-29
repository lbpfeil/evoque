# Phase 13: Dashboard & Analytics - Research

**Researched:** 2026-01-29
**Domain:** React dashboards, KPI visualization, time tracking, data analytics
**Confidence:** HIGH

## Summary

Phase 13 transforms the app's entry point from Study (deck selection) to a new Dashboard page with KPIs, study shortcuts, and analytics. This phase also adds time tracking to review sessions, storing `duration_ms` in the existing `review_logs` table.

The codebase already has **Recharts 3.5.1** installed but underutilized. The existing `StudyHeatmap` component provides a solid foundation for contribution visualization. The main work involves:
1. Creating Dashboard.tsx as the new home page
2. Adding time tracking (start/stop timestamps during review)
3. Calculating and displaying analytics metrics
4. Updating routing to make Dashboard the default after login

No new libraries required. The stack already includes Recharts for charts, Radix/Tailwind for UI components, and the design system provides StatCard patterns.

**Primary recommendation:** Build Dashboard using existing Recharts + design system StatCard pattern. Track time using `Date.now()` at card show/rating, calculate duration client-side, and add `duration_ms` column to `review_logs` via Supabase migration.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 3.5.1 | Data visualization | Already in package.json, React-native, declarative |
| React | 19 | UI framework | Codebase standard |
| Tailwind CSS | 3.4.17 | Styling with semantic tokens | Codebase standard |
| Supabase | 2.88.0 | Backend, database | Codebase standard |

### Supporting (Already in Use)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | Latest | Icons | KPI icons, action buttons |
| class-variance-authority | Latest | Component variants | StatCard styling |
| cn() utility | - | Class merging | Conditional styles |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Tremor | Tremor has better dashboard components but adds new dependency |
| Recharts | Nivo | More chart types but larger bundle, overkill for this use case |
| Custom heatmap | Recharts ScatterChart | Recharts doesn't have native heatmap; current custom component works well |

**Installation:** No new dependencies needed.

## Architecture Patterns

### Recommended Project Structure
```
pages/
  Dashboard.tsx          # NEW: Main dashboard page (home)
  Study.tsx              # EXISTING: Deck selection (secondary entry)
  StudySession.tsx       # MODIFIED: Add time tracking
components/
  StudyHeatmap.tsx       # EXISTING: Contribution heatmap
  StatCard.tsx           # NEW: Reusable KPI card component
  QuickStudyButton.tsx   # NEW: Prominent "Start Study" CTA
lib/
  supabaseHelpers.ts     # MODIFIED: Add duration_ms to review log helpers
types.ts                 # MODIFIED: Add durationMs to ReviewLog interface
```

### Pattern 1: StatCard Component
**What:** Reusable card for displaying KPI metrics with icon and trend indicator.
**When to use:** Dashboard metrics display.
**Source:** design-system-guide.md Section 5

```typescript
// From design-system-guide.md
const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card className="hover:border-primary/30 transition-colors duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
```

### Pattern 2: Time Tracking in StudySession
**What:** Track duration between card display and rating submission.
**When to use:** Every review in StudySession.

```typescript
// Track time per card
const [cardStartTime, setCardStartTime] = useState<number>(0);

// On card display
useEffect(() => {
  setCardStartTime(Date.now());
}, [currentCardIndex]);

// On rating submission
const handleRating = async (quality: number) => {
  const durationMs = Date.now() - cardStartTime;
  await submitReview(cardId, quality, previousCard, durationMs);
};
```

### Pattern 3: Dashboard Layout (Pattern A from design-system-guide)
**What:** Standard page with vertical spacing between sections.
**When to use:** Dashboard page layout.

```tsx
<div className="space-y-12">
  <PageHeader title="Dashboard" description="Your study overview" size="compact" />

  {/* Quick Study CTA */}
  <QuickStudyButton stats={getDeckStats()} />

  {/* KPI Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <StatCard title="Cards Due" value={cardsDue} icon={Target} />
    <StatCard title="Streak" value={`${streak} days`} icon={Flame} />
    <StatCard title="Reviews Today" value={reviewsToday} icon={CheckCircle} />
    <StatCard title="Avg Time" value={`${avgTime}s`} icon={Clock} />
  </div>

  {/* Heatmap Section */}
  <section>
    <h2 className="text-heading font-bold text-foreground mb-md">Activity</h2>
    <StudyHeatmap reviewLogs={reviewLogs} />
  </section>

  {/* Most Reviewed Books */}
  <section>
    <h2 className="text-heading font-bold text-foreground mb-md">Top Books</h2>
    {/* BarChart or list */}
  </section>
</div>
```

### Anti-Patterns to Avoid
- **Polling for real-time updates:** Not needed; data changes only during active sessions
- **Complex state for analytics:** Derive metrics from existing `reviewLogs` array, don't create parallel state
- **Heavy computations on render:** Memoize analytics calculations with `useMemo`
- **Custom chart styling:** Use Recharts defaults with semantic color tokens

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Heatmap visualization | Grid of divs with manual positioning | Existing `StudyHeatmap` component | Already handles streak calculation, responsive sizing, tooltips |
| Bar charts | SVG rectangles manually | Recharts `BarChart` | Already installed, handles axes, tooltips, responsiveness |
| KPI cards | Custom divs | StatCard pattern from design guide | Consistent with design system |
| Date formatting | Manual string manipulation | Existing `formatLocalDate()` helper | Handles timezone correctly |
| Duration calculation | Server-side | Client-side `Date.now()` difference | Simpler, no clock sync issues |

**Key insight:** The analytics work is mostly computation over existing data (`reviewLogs`, `studyCards`). The UI uses existing patterns (StatCard, heatmap). Only new work is time tracking in `StudySession` and the Dashboard page layout.

## Common Pitfalls

### Pitfall 1: Timezone Issues in Date Grouping
**What goes wrong:** Analytics show wrong day's data due to UTC vs local time.
**Why it happens:** Using `toISOString()` which returns UTC, then grouping by date string.
**How to avoid:** Use `formatLocalDate()` helper (already exists in codebase) for all date grouping.
**Warning signs:** Heatmap shows reviews on wrong day, especially around midnight.

### Pitfall 2: Performance with Large ReviewLogs
**What goes wrong:** Dashboard becomes slow with thousands of review logs.
**Why it happens:** Recalculating all metrics on every render.
**How to avoid:** Use `useMemo` with dependency on `reviewLogs.length` or last log's timestamp.
**Warning signs:** Noticeable lag when navigating to Dashboard.

### Pitfall 3: Missing Duration Data
**What goes wrong:** Average time calculations break when `duration_ms` is null.
**Why it happens:** Old review logs don't have duration data (column added later).
**How to avoid:** Filter out logs with null duration before averaging. Show "N/A" if no data.
**Warning signs:** NaN or Infinity displayed in time metrics.

### Pitfall 4: Inaccurate Time Tracking
**What goes wrong:** Duration includes time user was away (tabbed out, etc.).
**Why it happens:** Using simple start/end timestamps without visibility detection.
**How to avoid:** For MVP, accept this limitation. Document that time is "wall clock time" not "active time". Future: use Page Visibility API.
**Warning signs:** Suspiciously long durations (e.g., 30+ minutes for single card).

### Pitfall 5: Breaking Existing Routing
**What goes wrong:** Old bookmarks to `/study` stop working, or redirect loops occur.
**Why it happens:** Changing default route without preserving old routes.
**How to avoid:** Keep `/study` as valid route; only change `Navigate` in `App.tsx` default route.
**Warning signs:** 404 errors, infinite redirects, broken back button.

## Code Examples

Verified patterns from the codebase and best practices:

### Database Migration: Add duration_ms Column
```sql
-- Supabase SQL Editor
ALTER TABLE review_logs
ADD COLUMN duration_ms INTEGER;

-- Optional: Add comment for documentation
COMMENT ON COLUMN review_logs.duration_ms IS 'Time taken to respond to card in milliseconds';
```

### Update ReviewLog Type (types.ts)
```typescript
// types.ts - Add durationMs field
export interface ReviewLog {
  id: string;
  cardId: string;
  quality: number;
  reviewedAt: string;
  interval: number;
  easeFactor: number;
  durationMs?: number;  // NEW: nullable for backward compatibility
}
```

### Update Supabase Helpers (lib/supabaseHelpers.ts)
```typescript
export const toSupabaseReviewLog = (log: any, userId: string) => ({
  id: log.id,
  user_id: userId,
  card_id: log.cardId,
  quality: log.quality,
  reviewed_at: log.reviewedAt,
  interval_days: log.interval,
  ease_factor: log.easeFactor,
  duration_ms: log.durationMs || null,  // NEW
});

export const fromSupabaseReviewLog = (row: any) => ({
  id: row.id,
  cardId: row.card_id,
  quality: row.quality,
  reviewedAt: row.reviewed_at,
  interval: row.interval_days,
  easeFactor: row.ease_factor,
  durationMs: row.duration_ms,  // NEW
});
```

### Time Tracking in StudySession
```typescript
// pages/StudySession.tsx - Add time tracking

const [cardShowTime, setCardShowTime] = useState<number>(Date.now());

// Reset timer when card changes
useEffect(() => {
  setCardShowTime(Date.now());
}, [currentCardIndex]);

// Calculate duration on rating
const handleRating = async (quality: number) => {
  const durationMs = Date.now() - cardShowTime;

  // Existing review submission logic
  const previousCard = currentCard;
  const updatedCard = calculateNextReview(currentCard, quality);
  await updateCard(updatedCard);
  await submitReview(currentCard.id, quality, previousCard, durationMs);

  // Move to next card
  // ...
};
```

### Update submitReview in StoreContext
```typescript
// StoreContext.tsx - Modify submitReview to accept duration

const submitReview = async (
  cardId: string,
  quality: number,
  previousCard: StudyCard,
  durationMs?: number  // NEW optional parameter
) => {
  if (!currentSession || !user) return;

  // ... existing session update logic ...

  // Create review log with duration
  const newLog = {
    id: generateUUID(),
    cardId,
    quality,
    reviewedAt: new Date().toISOString(),
    interval: previousCard.interval,
    easeFactor: previousCard.easeFactor,
    durationMs: durationMs || null,  // NEW
  };

  // ... existing Supabase sync ...
};
```

### Analytics Calculations with useMemo
```typescript
// Dashboard.tsx or custom hook

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
    .slice(0, 5)
    .map(([bookId, count]) => ({
      book: books.find(b => b.id === bookId),
      count
    }));

  return { reviewsToday, avgTimeSeconds, topBooks };
}, [reviewLogs, studyCards, highlights, books]);
```

### Recharts BarChart for Top Books
```typescript
// Simple horizontal bar chart for most reviewed books
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TopBooksChart = ({ data }: { data: Array<{ name: string; reviews: number }> }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} layout="vertical">
      <XAxis type="number" />
      <YAxis
        type="category"
        dataKey="name"
        width={150}
        tick={{ fontSize: 12 }}
      />
      <Tooltip />
      <Bar
        dataKey="reviews"
        fill="hsl(var(--primary))"  // Use CSS variable
        radius={[0, 4, 4, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);
```

### Update App.tsx Routing
```typescript
// App.tsx - Change default route from /study to /dashboard

// Add lazy import
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Update routes
<Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<Dashboard />} />  {/* NEW */}
  <Route path="/highlights" element={<Highlights />} />
  <Route path="/study" element={<Study />} />  {/* Keep existing */}
  <Route path="/study/session" element={<StudySession />} />
  <Route path="/settings" element={<Settings />} />
  {/* Redirects */}
  <Route path="/import" element={<Navigate to="/settings" replace />} />
  <Route path="/library" element={<Navigate to="/settings" replace />} />
  <Route path="*" element={<Navigate to="/dashboard" replace />} />  {/* Change from /study */}
</Routes>
```

### Update Sidebar Navigation
```typescript
// Sidebar.tsx - Add Dashboard to nav items

const navItems = [
  { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },  // NEW
  { name: t('nav.study'), icon: Target, path: '/study' },
  { name: t('nav.highlights'), icon: Highlighter, path: '/highlights' },
  { name: t('nav.settings'), icon: Settings, path: '/settings' },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 | Recharts v3 | 2024 | Better React 18/19 support, cleaner API |
| Dashboard libraries (Tremor, etc.) | Custom with Recharts | - | More control, smaller bundle |
| Server-side analytics | Client-side computation | - | Simpler, no additional API endpoints |
| Complex time tracking (visibility API) | Simple wall-clock time | - | Good enough for MVP |

**Deprecated/outdated:**
- react-vis: Unmaintained, use Recharts instead
- Victory: More complex API than needed for simple charts
- D3.js direct: Recharts abstracts D3 with React-friendly API

## Open Questions

Things that couldn't be fully resolved:

1. **Time tracking accuracy**
   - What we know: Simple start/end timestamps capture wall-clock time
   - What's unclear: Should we exclude time when tab is inactive?
   - Recommendation: Start with simple approach; add Page Visibility API later if users request

2. **KPI selection**
   - What we know: Streak, reviews today, average time are standard
   - What's unclear: What other metrics provide actionable insights?
   - Recommendation: Start with 4 KPIs, add more based on user feedback

3. **Heatmap enhancements**
   - What we know: Current heatmap works well, shows streak
   - What's unclear: Should it show more data (time per day, quality distribution)?
   - Recommendation: Keep current heatmap, add average time as separate metric

4. **Dashboard as mobile home**
   - What we know: Dashboard works on mobile with responsive layout
   - What's unclear: Is it the right home for mobile users who want to jump into study?
   - Recommendation: Include prominent "Start Study" button at top of Dashboard

## Sources

### Primary (HIGH confidence)
- `package.json` - Recharts 3.5.1 already installed
- `components/StudyHeatmap.tsx` - Existing heatmap implementation
- `components/StoreContext.tsx` - reviewLogs structure, submitReview pattern
- `lib/supabaseHelpers.ts` - toSupabaseReviewLog/fromSupabaseReviewLog
- `lbp_diretrizes/design-system-guide.md` - StatCard pattern, Layout Pattern A
- `lbp_context/spaced-repetition-system.md` - review_logs table schema

### Secondary (MEDIUM confidence)
- [Recharts GitHub](https://github.com/recharts/recharts) - v3.0 migration guide
- [Anki Database Structure](https://github.com/ankidroid/Anki-Android/wiki/Database-Structure) - time field in revlog (capped at 60s, milliseconds)
- [Tremor.so](https://www.tremor.so/) - Dashboard component patterns (not used but referenced)

### Tertiary (LOW confidence)
- WebSearch for React dashboard best practices 2025

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts already installed, no new dependencies
- Architecture patterns: HIGH - Design system guide provides clear patterns
- Time tracking: HIGH - Simple client-side implementation, Anki precedent
- Analytics calculations: MEDIUM - Standard aggregations over existing data
- Pitfalls: MEDIUM - Common React performance and date handling issues

**Research date:** 2026-01-29
**Valid until:** 60 days (stable patterns, no library dependencies)

---

## Implementation Checklist for Planner

The planner should create tasks that:

### Database/Backend
1. **Add duration_ms column** to `review_logs` table via Supabase SQL Editor
2. **Update types.ts** to add `durationMs?: number` to ReviewLog interface
3. **Update supabaseHelpers.ts** to include `duration_ms` in to/from converters

### Time Tracking
4. **Modify StudySession.tsx** to track card show time and calculate duration
5. **Modify StoreContext.tsx** submitReview to accept and save durationMs

### Dashboard Page
6. **Create Dashboard.tsx** using Pattern A layout from design guide
7. **Create StatCard component** (or inline if simple enough)
8. **Create QuickStudyButton** - prominent CTA to start study session
9. **Add analytics calculations** using useMemo for KPIs
10. **Add Recharts BarChart** for top books section

### Routing/Navigation
11. **Update App.tsx** - add Dashboard route, change default redirect
12. **Update Sidebar.tsx** - add Dashboard nav item with LayoutDashboard icon
13. **Update BottomNav.tsx** - add Dashboard to mobile navigation

### i18n
14. **Add translations** for Dashboard strings (title, KPI labels, etc.)

All changes are localized to existing files plus one new page. No new library installations.
