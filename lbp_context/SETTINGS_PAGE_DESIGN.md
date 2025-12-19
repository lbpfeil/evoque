# Settings Page - Design & Implementation Plan

> **Created:** 2025-12-19  
> **Status:** Awaiting Approval  
> **Purpose:** Consolidate Import + Library into Settings with compact design

---

## 📋 EXECUTIVE SUMMARY

### Objective
Create a unified **Settings** page that consolidates:
- 📥 **Import** functionality (MyClippings.txt upload)
- 📚 **Library** management (books list view)
- 👤 **Account** settings (user info, logout, delete)
- ⚙️ **Preferences** (SM-2 config, daily limits, UI preferences)

### Impact
- **Remove** `/import` route → Integrate as Settings tab
- **Remove** `/library` route → Integrate as Settings tab  
- **Update** Sidebar navigation (remove Import, Library items)
- **Keep** `/library/:bookId` route (BookDetails still accessible)
- **Add** `/settings` route with tabbed interface

---

## 🎨 VISUAL MOCKUP

### Layout Overview
```
┌─────────────────────────────────────────────────────────────┐
│ Settings                                    [User: u@e.com] │  ← Header (text-lg)
│ Manage your library, import highlights, and preferences.   │  ← Subtitle (text-xs text-zinc-500)
├─────────────────────────────────────────────────────────────┤
│  [Import] [Library] [Account] [Preferences]                │  ← Tabs (h-7, text-xs, compact)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tab Content Area - 85vh scrollable]                      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📑 TAB 1: IMPORT

### Design Mockup
```
┌─────────────────────────────────────────────────────────────┐
│ Import Highlights                                           │
│ Upload your 'My Clippings.txt' file from Kindle            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                                                       ║  │
│  ║         🔼 Drag & Drop File Here                     ║  │
│  ║         or click to browse                           ║  │
│  ║                                                       ║  │
│  ║         📄 My Clippings.txt                          ║  │
│  ║                                                       ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
│  ℹ️ Instructions                                            │
│  • Connect Kindle via USB                                  │
│  • Find documents/My Clippings.txt                         │
│  • Upload to sync new highlights                           │
│                                                             │
│  📊 Last Import: Dec 17, 2025 • 42 highlights added       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Compact Design Specs
**Section Spacing:**
- Header: `mb-2` (8px)
- Drop zone: `h-48` (192px) instead of current `p-20`
- Instructions: `mt-3 mb-2` (12px/8px)

**Typography:**
- Section title: `text-base font-semibold` (16px)
- Description: `text-xs text-zinc-500` (12px)
- Instructions: `text-xs text-zinc-600` (12px)
- Last import info: `text-[10px] text-zinc-400` (10px)

**Drop Zone:**
- Icon: `w-8 h-8` instead of `w-20 h-20`
- Title: `text-sm font-medium` instead of `text-xl`
- Description: `text-xs text-zinc-500` instead of `text-zinc-500`

**Success State:**
- Replace full-page success with **inline notification card**
- Show: ✅ "Imported 5 books, 42 highlights" with [View Library] button
- Auto-dismiss after 5 seconds

---

## 📑 TAB 2: LIBRARY

### Design Mockup
```
┌─────────────────────────────────────────────────────────────┐
│ Book Library                                   🔍 [Search] │
│ 12 books in your collection                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📕] The Pragmatic Programmer                     [→]  │ │
│ │      Andrew Hunt, David Thomas • 124 highlights        │ │
│ │      Last: Dec 17, 2025 • Added: Nov 03, 2024         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📘] Clean Code                                   [→]  │ │
│ │      Robert C. Martin • 87 highlights                  │ │
│ │      Last: Dec 15, 2025 • Added: Oct 28, 2024         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📙] Atomic Habits                                [→]  │ │
│ │      James Clear • 56 highlights                       │ │
│ │      Last: Dec 12, 2025 • Added: Oct 15, 2024         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Compact Design Specs
**List Item Structure:**
- Height: `auto` with `py-2 px-3` (8px/12px)
- Gap between items: `gap-1` (4px)
- Border: `border border-zinc-200 rounded hover:bg-zinc-50`

**Book Card Content:**
```tsx
<div className="flex items-center gap-2 py-2 px-3 border border-zinc-200 rounded hover:bg-zinc-50 transition-colors cursor-pointer">
  {/* Cover thumbnail */}
  <div className="w-10 h-14 bg-zinc-100 rounded border border-zinc-200 shrink-0">
    <img src={coverUrl} className="w-full h-full object-cover" />
  </div>
  
  {/* Book info */}
  <div className="flex-1 min-w-0">
    <h3 className="text-sm font-semibold text-zinc-900 truncate">{title}</h3>
    <p className="text-xs text-zinc-500 truncate">{author} • {highlightCount} highlights</p>
    <p className="text-[10px] text-zinc-400 mt-0.5">
      Last: {formatDate(lastImported)} • Added: {formatDate(dateAdded)}
    </p>
  </div>
  
  {/* Arrow icon */}
  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
</div>
```

**Search Bar:**
- Height: `h-7` (28px)
- Input: `text-xs px-2` (12px, 8px)
- Icon: `w-3 h-3` (12px)
- Position: Top-right, width `w-48` (192px)

**Empty State:**
```
┌─────────────────────────────────────┐
│                                     │
│         📚                          │
│    No books in library              │
│    Import highlights to get started │
│    [Go to Import Tab]               │
│                                     │
└─────────────────────────────────────┘
```

---

## 📑 TAB 3: ACCOUNT

### Design Mockup
```
┌─────────────────────────────────────────────────────────────┐
│ Account Settings                                            │
│ Manage your account and profile                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Profile Information                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Email:     user@example.com          [Change Password] │ │
│ │ Plan:      Free                      [Upgrade to Pro]  │ │
│ │ Member:    Since Nov 2024                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Statistics                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Books: 12  •  Highlights: 427  •  Study Cards: 284    │ │
│ │ Reviews: 1,247  •  Streak: 8 days                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Danger Zone                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Export All Data]         Download JSON backup         │ │
│ │ [Delete Account]          Permanently delete everything│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Compact Design Specs
**Section Headers:**
- Typography: `text-sm font-semibold text-zinc-900 mb-1.5` (14px)
- Spacing: `mt-4 mb-1.5` (16px/6px)

**Info Card:**
- Padding: `p-3` (12px)
- Background: `bg-zinc-50 border border-zinc-200 rounded`
- Typography: `text-xs text-zinc-700` (12px)
- Labels: `font-medium text-zinc-900`
- Gap: `space-y-1` (4px)

**Action Buttons:**
- Size: `h-6 px-2 text-[10px]` (24px, 8px, 10px)
- Style: `bg-zinc-100 hover:bg-zinc-200 text-zinc-700`
- Destructive: `text-red-600 hover:bg-red-50`

**Statistics Grid:**
- Layout: Inline with `•` separator
- Typography: `text-xs text-zinc-600` (12px)
- Numbers: `font-semibold text-zinc-900`

---

## 📑 TAB 4: PREFERENCES

### Design Mockup
```
┌─────────────────────────────────────────────────────────────┐
│ Study Preferences                                           │
│ Customize spaced repetition and study behavior              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Spaced Repetition (SM-2)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Daily Review Limit    [10] cards per book per day      │ │
│ │ Initial Interval      [1]  day for new cards            │ │
│ │ Easy Interval Mult.   [6]  days after first review      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Display & Interface                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [ ] Show keyboard shortcuts hints                       │ │
│ │ [✓] Auto-reveal answer after 3 seconds                  │ │
│ │ [✓] Play sound on correct answer                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Data & Privacy                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Sync data across devices (Supabase)                │ │
│ │ [ ] Participate in anonymous usage analytics            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Save Preferences]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Compact Design Specs
**Input Groups:**
- Label: `text-xs font-medium text-zinc-700 mb-0.5` (12px)
- Input: `h-6 w-16 px-1.5 text-xs` (24px, 64px, 6px, 12px)
- Helper text: `text-[10px] text-zinc-400 ml-2` (10px)

**Checkboxes:**
- Size: `w-3.5 h-3.5` (14px)
- Label: `text-xs text-zinc-700` (12px)
- Gap: `gap-2` (8px)
- Spacing between items: `space-y-2` (8px)

**Save Button:**
- Size: `h-7 px-4 text-xs` (28px, 16px, 12px)
- Style: `bg-black hover:bg-zinc-800 text-white rounded`
- Position: Bottom of form, `mt-4`

---

## 🏗️ IMPLEMENTATION PLAN

### Phase 1: Create Settings Page Structure (30 min)
**Files to create:**
- `pages/Settings.tsx` - Main settings page with tabs

**Tasks:**
1. Create base Settings component
2. Implement tab navigation (4 tabs: Import, Library, Account, Preferences)
3. Add routing in `App.tsx`: `/settings`
4. Use compact design tokens from guidelines

**Tab Component Structure:**
```tsx
const [activeTab, setActiveTab] = useState<'import' | 'library' | 'account' | 'prefs'>('import');

<div className="flex gap-1 border-b border-zinc-200 mb-3">
  {tabs.map(tab => (
    <button
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-t transition-colors",
        activeTab === tab.id
          ? "bg-white text-zinc-900 border-t border-x border-zinc-200"
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
      )}
      onClick={() => setActiveTab(tab.id)}
    >
      <tab.icon className="w-3 h-3 inline mr-1.5" />
      {tab.name}
    </button>
  ))}
</div>
```

### Phase 2: Import Tab (45 min)
**Files to modify:**
- Extract logic from `pages/Import.tsx` into Settings
- Create compact version of drag-and-drop zone

**Key Changes:**
- Reduce drop zone padding: `p-8` → `p-6`
- Reduce icon size: `w-20 h-20` → `w-8 h-8`
- Replace full-page success with inline notification
- Add "Last Import" info section at bottom
- Typography: All text sizes reduced by one step

**Success Notification Component:**
```tsx
{importResult && (
  <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="text-xs text-green-800">
        Imported {importResult.newBooks} books, {importResult.newHighlights} highlights
      </span>
    </div>
    <button 
      onClick={() => setActiveTab('library')} 
      className="text-xs text-green-700 hover:underline"
    >
      View Library →
    </button>
  </div>
)}
```

### Phase 3: Library Tab (60 min)
**Files to modify:**
- Extract book list from `pages/Library.tsx`
- Convert grid layout to list layout
- Add compact book cards

**Key Changes:**
- Remove grid: `grid grid-cols-5` → `flex flex-col gap-1`
- Book card: Horizontal layout with thumbnail
- Thumbnail: `w-10 h-14` (40x56px)
- Typography: Reduce all text sizes
- Click card → Navigate to `/library/:bookId` (BookDetails)
- Search bar: Top-right, compact `h-7 w-48`

**Book Card Component:**
```tsx
<Link 
  to={`/library/${book.id}`}
  className="flex items-center gap-2 py-2 px-3 border border-zinc-200 rounded hover:bg-zinc-50 transition-colors"
>
  <div className="w-10 h-14 bg-zinc-100 rounded border border-zinc-200 shrink-0 overflow-hidden">
    <img src={book.coverUrl} className="w-full h-full object-cover" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="text-sm font-semibold text-zinc-900 truncate">{book.title}</h3>
    <p className="text-xs text-zinc-500 truncate">
      {book.author} • {book.highlightCount} highlights
    </p>
    <p className="text-[10px] text-zinc-400 mt-0.5">
      Last: {formatDate(book.lastImported)}
    </p>
  </div>
  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
</Link>
```

### Phase 4: Account Tab (30 min)
**Files to create:**
- New component within Settings.tsx

**Features:**
1. Display user email (from `useAuth()`)
2. Display stats (from `useStore()`)
3. Export data button → Download JSON
4. Delete account button → Confirmation modal → Delete all data + account

**Stats Display:**
```tsx
const stats = {
  books: books.length,
  highlights: highlights.length,
  studyCards: studyCards.length,
  totalReviews: reviewLogs.length,
  // Calculate streak from dailyProgress
};

<div className="bg-zinc-50 border border-zinc-200 rounded p-3">
  <p className="text-xs text-zinc-600">
    <span className="font-semibold text-zinc-900">{stats.books}</span> Books •{' '}
    <span className="font-semibold text-zinc-900">{stats.highlights}</span> Highlights •{' '}
    <span className="font-semibold text-zinc-900">{stats.studyCards}</span> Study Cards
  </p>
</div>
```

### Phase 5: Preferences Tab (45 min)
**Files to modify:**
- `components/StoreContext.tsx` - Add settings state/methods

**Settings to Add:**
```tsx
interface UserSettings {
  maxReviewsPerDay: number;      // Default: 10
  newCardsPerDay: number;         // Default: 10 (not used yet)
  initialInterval: number;        // Default: 1 (SM-2)
  easyIntervalMultiplier: number; // Default: 6 (SM-2)
  showKeyboardHints: boolean;     // Default: true
  autoRevealAnswer: boolean;      // Default: false
  playSound: boolean;             // Default: false
  syncEnabled: boolean;           // Default: true
  analyticsEnabled: boolean;      // Default: false
}
```

**Save to Supabase:**
- Store in `user_settings` table (already exists)
- Sync on change via StoreContext

### Phase 6: Update Navigation (15 min)
**Files to modify:**
- `components/Sidebar.tsx` - Update navItems
- `App.tsx` - Update routes

**Changes:**
```tsx
// Sidebar.tsx - Remove Import & Library, keep Settings
const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Highlights', icon: Highlighter, path: '/highlights' },
  { name: 'Study', icon: Target, path: '/study' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

// App.tsx - Update routes
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/library/:bookId" element={<BookDetails />} /> {/* Keep this */}
  <Route path="/highlights" element={<Highlights />} />
  <Route path="/study" element={<Study />} />
  <Route path="/study/session" element={<StudySession />} />
  <Route path="/settings" element={<Settings />} /> {/* New */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Phase 7: Cleanup (10 min)
**Files to remove/archive:**
- ~~`pages/Import.tsx`~~ (delete)
- ~~`pages/Library.tsx`~~ (delete)

**Redirect old routes:**
- `/import` → `/settings?tab=import`
- `/library` → `/settings?tab=library`

---

## 📐 COMPACT DESIGN COMPLIANCE

### ✅ Spacing Checklist
- [x] Tab headers: `mb-2` (not `mb-6`)
- [x] Section spacing: `mt-4 mb-1.5` (not `mt-8 mb-4`)
- [x] Item gaps: `gap-1` (not `gap-3`)
- [x] Card padding: `py-2 px-3` (not `py-4 px-6`)

### ✅ Typography Checklist
- [x] Page title: `text-lg font-bold` (18px, not 24px)
- [x] Section headers: `text-sm font-semibold` (14px, not 16px)
- [x] Body text: `text-xs` (12px, not 14px)
- [x] Secondary text: `text-[10px]` (10px, not 12px)

### ✅ Components Checklist
- [x] Inputs: `h-6` or `h-7` (24-28px, not 40px)
- [x] Buttons: `h-7` (28px, not 40px)
- [x] Icons: `w-3 h-3` or `w-4 h-4` (12-16px, not 20px)
- [x] Tabs: `h-7 px-3 text-xs` (compact tab buttons)

### ✅ Visual Checklist
- [x] Border radius: `rounded` (4px, not 6-8px)
- [x] Borders: `border-zinc-200` (standard)
- [x] Hover: `hover:bg-zinc-50` (subtle)
- [x] Transitions: `transition-colors` (150ms)

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- [ ] All Import functionality works (drag-and-drop, success notification)
- [ ] Library shows all books in compact list view
- [ ] Clicking book card navigates to BookDetails page
- [ ] Account tab displays correct user info and stats
- [ ] Preferences save to Supabase and persist
- [ ] Old routes redirect to new Settings tabs
- [ ] Sidebar navigation updated (4 items instead of 6)

### Design Requirements
- [ ] Page follows compact UI guidelines 100%
- [ ] All spacing uses approved scale (0.5, 1, 1.5, 2, 3)
- [ ] All text uses approved sizes (text-xs, text-sm, text-base)
- [ ] All components use compact heights (h-6, h-7, h-8)
- [ ] Tabs are visually clear and easy to navigate
- [ ] Mobile responsive (test at 640px, 768px, 1024px)

### Performance Requirements
- [ ] Page loads in < 200ms
- [ ] Tab switching is instant (no re-renders)
- [ ] Import processing shows progress feedback
- [ ] No layout shift when switching tabs

---

## 📊 ESTIMATED EFFORT

| Phase | Duration | Complexity |
|-------|----------|------------|
| 1. Structure | 30 min | Low |
| 2. Import Tab | 45 min | Medium |
| 3. Library Tab | 60 min | Medium |
| 4. Account Tab | 30 min | Low |
| 5. Preferences Tab | 45 min | Medium |
| 6. Navigation | 15 min | Low |
| 7. Cleanup | 10 min | Low |
| **Total** | **3h 45min** | **Medium** |

---

## 🚀 NEXT STEPS

1. **Review & Approve** this design mockup
2. **Implement** Phase 1-7 sequentially
3. **Test** each tab thoroughly
4. **Deploy** to production

---

## 📸 VISUAL REFERENCE (ASCII Mockup)

### Complete Settings Page - Import Tab Active
```
╔═══════════════════════════════════════════════════════════════════╗
║ Settings                                          user@email.com  ║
║ Manage your library, import highlights, and preferences.         ║
╠═══════════════════════════════════════════════════════════════════╣
║ [Import▼] [Library] [Account] [Preferences]                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ Import Highlights                                                 ║
║ Upload your 'My Clippings.txt' file from Kindle                  ║
║                                                                   ║
║ ┌───────────────────────────────────────────────────────────────┐ ║
║ │                                                               │ ║
║ │                     ⬆️  Upload                                │ ║
║ │                                                               │ ║
║ │           Drag & drop your file here                          │ ║
║ │           or click to browse                                  │ ║
║ │                                                               │ ║
║ │           📄 My Clippings.txt                                │ ║
║ │                                                               │ ║
║ └───────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║ ℹ️ Instructions                                                   ║
║ • Connect your Kindle to computer via USB                        ║
║ • Find documents/My Clippings.txt                                ║
║ • Upload file to sync new highlights                             ║
║                                                                   ║
║ 📊 Last Import: Dec 17, 2025 at 10:32 AM • 42 highlights added  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Library Tab Active
```
╔═══════════════════════════════════════════════════════════════════╗
║ Settings                                          user@email.com  ║
║ Manage your library, import highlights, and preferences.         ║
╠═══════════════════════════════════════════════════════════════════╣
║ [Import] [Library▼] [Account] [Preferences]                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ Book Library                                    🔍 [Search...]   ║
║ 12 books in your collection                                      ║
║                                                                   ║
║ ┌───────────────────────────────────────────────────────────────┐ ║
║ │ 📕 The Pragmatic Programmer                              →   │ ║
║ │    Hunt, Thomas • 124 highlights                              │ ║
║ │    Last: Dec 17 • Added: Nov 03                               │ ║
║ └───────────────────────────────────────────────────────────────┘ ║
║ ┌───────────────────────────────────────────────────────────────┐ ║
║ │ 📘 Clean Code                                            →   │ ║
║ │    Robert Martin • 87 highlights                              │ ║
║ │    Last: Dec 15 • Added: Oct 28                               │ ║
║ └───────────────────────────────────────────────────────────────┘ ║
║ ┌───────────────────────────────────────────────────────────────┐ ║
║ │ 📙 Atomic Habits                                         →   │ ║
║ │    James Clear • 56 highlights                                │ ║
║ │    Last: Dec 12 • Added: Oct 15                               │ ║
║ └───────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

**END OF DESIGN DOCUMENT**

