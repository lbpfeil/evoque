# EVOQUE Mobile/PWA Implementation Guide

> **Purpose:** Comprehensive guide for AI implementing mobile (tablet/phone) support
> **Scope:** Login + Study features only (PWA)
> **Last Updated:** 2025-12-29

---

## 1. EXECUTIVE SUMMARY

### What Needs to Be Done
Transform EVOQUE into a Progressive Web App (PWA) optimized for mobile devices, focusing on:
1. **Login page** - Mobile-optimized authentication
2. **Study page** - Deck selection with mobile navigation
3. **StudySession page** - Card review interface optimized for touch

### Current State
- **PWA:** NOT implemented (no manifest, no service worker)
- **Mobile Navigation:** BROKEN (sidebar hidden, no alternative)
- **Responsive Design:** PARTIAL (some breakpoints, not mobile-first)
- **Touch Support:** NONE (no gestures, small tap targets)

### Priority Order
1. PWA Setup (manifest, service worker, icons)
2. Mobile Navigation (hamburger menu or bottom nav)
3. StudySession Mobile Optimization (touch-friendly buttons)
4. Login Mobile Polish (spacing, inputs)
5. Study Page Mobile Layout

---

## 2. PROJECT STRUCTURE

```
evoque/
├── App.tsx                    # Root: routing + layout logic
├── index.tsx                  # Entry point (React root)
├── index.html                 # HTML template (needs PWA tags)
├── index.css                  # Global styles + CSS variables
├── vite.config.ts             # Vite config (needs PWA plugin)
├── tailwind.config.js         # Tailwind config (default breakpoints)
├── package.json               # Dependencies (needs vite-plugin-pwa)
├── types.ts                   # TypeScript interfaces
├── components/
│   ├── AuthContext.tsx        # Auth state management
│   ├── StoreContext.tsx       # App data management (1280 lines)
│   ├── Sidebar.tsx            # Desktop navigation (HIDDEN on mobile!)
│   ├── DeckTable.tsx          # Book list for study selection
│   ├── DeleteCardPopover.tsx  # Confirm delete dialog
│   ├── EmptyDeckPopover.tsx   # No cards available dialog
│   └── ui/                    # Base UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── sheet.tsx          # Mobile-friendly sliding panel
├── pages/
│   ├── Login.tsx              # Authentication page
│   ├── Study.tsx              # Deck selection page
│   └── StudySession.tsx       # Card review interface (550 lines)
├── services/
│   └── sm2.ts                 # Spaced repetition algorithm
└── lib/
    ├── supabase.ts            # Supabase client
    └── utils.ts               # cn() utility for Tailwind
```

---

## 3. CURRENT IMPLEMENTATION ANALYSIS

### 3.1 Authentication (Login.tsx)

**File:** `pages/Login.tsx` (118 lines)

**Current Layout:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="w-full max-w-md p-8">
        {/* Logo section */}
        <div className="flex items-center justify-center gap-3 mb-8">...</div>

        {/* White card */}
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
            {/* Form elements */}
        </div>
    </div>
</div>
```

**Mobile Issues:**
- `p-8` padding is excessive on small screens (32px)
- `max-w-md` (448px) works but no smaller breakpoint handling
- Input fields have good `w-full` but fixed `py-2` may feel cramped
- Submit button `py-2.5` is adequate for touch

**Recommended Changes:**
```tsx
// Current
<div className="w-full max-w-md p-8">

// Mobile-optimized
<div className="w-full max-w-md px-4 py-6 sm:p-8">
```

**Dependencies:**
- `AuthContext.tsx` - Provides `signIn`, `signUp`, `signOut`
- `supabase.ts` - Supabase client for auth

**AuthContext Interface:**
```typescript
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}
```

---

### 3.2 Study Page (Study.tsx)

**File:** `pages/Study.tsx` (137 lines)

**Current Layout:**
```tsx
<div className="p-6">
    <header className="mb-3">...</header>

    {/* Settings button */}
    <div className="flex justify-end mb-3">...</div>

    {/* "Study All Books" button */}
    <button className="w-full mb-4 px-4 py-3 bg-black...">
        <div className="flex items-center gap-3">...</div>
        <div className="flex items-center gap-4 text-xs">
            {/* Stats: New, Learning, Review, Total */}
        </div>
    </button>

    {/* Book list */}
    <DeckTable ... />
</div>
```

**Mobile Issues:**
1. Stats section uses `flex gap-4` - may overflow on narrow screens
2. `p-6` padding reduces usable width
3. No mobile navigation access (sidebar hidden)
4. DeckTable uses fixed column widths that may not fit

**DeckTable Grid:**
```tsx
// Current (problematic on mobile)
grid grid-cols-[1fr_48px_64px_48px_48px] gap-2

// This is 1fr + 208px fixed = needs minimum ~320px width
// On 320px screen with p-6 (24px each side), only 272px available!
```

**Recommended Changes:**
1. Add mobile navigation (hamburger or bottom nav)
2. Simplify stats display on mobile (stack or hide)
3. Reduce padding on mobile: `p-4 sm:p-6`
4. Consider horizontal scroll for DeckTable or simplified mobile view

---

### 3.3 StudySession (StudySession.tsx)

**File:** `pages/StudySession.tsx` (550 lines)

**This is the MOST CRITICAL file for mobile optimization.**

**Current Structure:**
```tsx
<div className="h-screen flex flex-col bg-white">
    {/* Header: 40px approx */}
    <header className="px-4 py-2 border-b border-zinc-200">
        <div className="flex items-center justify-between">
            {/* Back button | Card counter | Stats */}
        </div>
        {/* Progress bar (3px) */}
    </header>

    {/* Main Content: Scrollable */}
    <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Book info + Tags + Highlight text + Note section */}
        </div>
    </div>

    {/* Footer Controls: Fixed */}
    <div className="border-t border-zinc-200 bg-white p-4">
        <div className="max-w-2xl mx-auto relative">
            {/* Delete button (absolute left) */}
            {/* Reveal Answer OR 4-button grid */}
        </div>
    </div>
</div>
```

**Mobile Issues:**

1. **Footer Buttons (CRITICAL):**
```tsx
// Current 4-button grid
<div className="grid grid-cols-4 gap-2">
    <button className="py-1.5 ...">Again (1)</button>
    <button className="py-1.5 ...">Hard (2)</button>
    <button className="py-1.5 ...">Good (3)</button>
    <button className="py-1.5 ...">Easy (4)</button>
</div>

// On 320px screen with p-4 (16px each) + ml-12 (48px):
// Available width = 320 - 32 - 48 = 240px
// Each button = (240 - 6px gaps) / 4 = ~58px wide
// This is BELOW Apple's 44x44px recommended tap target!
```

2. **Padding Issues:**
- `px-6` on main content = 48px total = 15% of 320px width lost
- Should be `px-4 sm:px-6`

3. **Text Sizing:**
- Highlight text: `text-lg md:text-xl` (good! already responsive)
- Keyboard hints `text-[10px]` - may be illegible on mobile
- Consider hiding keyboard hints on mobile (touch doesn't use them)

4. **Touch Interactions Missing:**
- No swipe gestures for card responses
- No pull-to-refresh
- No haptic feedback

**Recommended Changes:**

```tsx
// Footer buttons - larger on mobile
<div className="grid grid-cols-4 gap-1 sm:gap-2">
    <button className="py-2.5 sm:py-1.5 min-h-[44px] ...">
        <span>Again</span>
        <span className="hidden sm:block text-[10px] opacity-75">(1)</span>
    </button>
    ...
</div>

// Main content padding
<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">

// Consider: Delete button could be swipe action instead
```

---

### 3.4 App Layout (App.tsx)

**File:** `App.tsx` (87 lines)

**Current Layout Logic:**
```tsx
const AppLayout = ({ children }) => {
  const isStudySession = location.pathname === '/study/session';

  return (
    <div className="min-h-screen bg-zinc-50 flex text-zinc-900">
      {!isStudySession && <Sidebar />}
      <main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8' : ''} overflow-y-auto h-screen`}>
        {!isStudySession ? (
          <div className="max-w-6xl mx-auto">{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
```

**Key Points:**
- Sidebar is rendered ONLY on non-StudySession pages
- StudySession is full-screen (no sidebar offset)
- `md:ml-56` offsets main content on tablet+ (sidebar width)
- On mobile (`< md`), sidebar is hidden via `hidden md:flex`
- **PROBLEM:** No mobile navigation alternative exists!

**Sidebar.tsx Line 32:**
```tsx
<aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-zinc-200 text-zinc-900 hidden md:flex flex-col z-10">
```

---

## 4. PWA IMPLEMENTATION REQUIREMENTS

### 4.1 Package Installation

```bash
npm install vite-plugin-pwa workbox-precaching -D
```

### 4.2 Vite Configuration

**File:** `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
                manifest: {
                    name: 'EVOQUE - Kindle Highlights',
                    short_name: 'EVOQUE',
                    description: 'Study your Kindle highlights with spaced repetition',
                    theme_color: '#000000',
                    background_color: '#FAFAFA',
                    display: 'standalone',
                    orientation: 'portrait',
                    scope: '/',
                    start_url: '/',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'supabase-api',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 // 1 hour
                                }
                            }
                        }
                    ]
                }
            })
        ],
        // ... rest of config
    };
});
```

### 4.3 HTML Meta Tags

**File:** `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="EVOQUE" />

    <!-- PWA Icons -->
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />

    <title>EVOQUE - Kindle Highlights</title>
    <!-- ... existing styles ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

### 4.4 Required Assets

Create in `public/` folder:
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)
- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `mask-icon.svg` (monochrome SVG for Safari)

**Icon should be:** Black book icon on white background (matches current logo)

---

## 5. MOBILE NAVIGATION IMPLEMENTATION

### Option A: Bottom Navigation Bar (Recommended for Mobile)

**New Component:** `components/BottomNav.tsx`

```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Settings, Highlighter } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Highlights', icon: Highlighter, path: '/highlights' },
    { name: 'Study', icon: Target, path: '/study' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center h-14 md:hidden z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[64px] ${
              isActive ? 'text-black' : 'text-zinc-400'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
```

**Update App.tsx:**
```tsx
import BottomNav from './components/BottomNav';

const AppLayout = ({ children }) => {
  const isStudySession = location.pathname === '/study/session';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row text-zinc-900">
      {!isStudySession && <Sidebar />}
      <main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8 pb-16 md:pb-8' : ''} overflow-y-auto h-screen`}>
        {!isStudySession ? (
          <div className="max-w-6xl mx-auto">{children}</div>
        ) : (
          children
        )}
      </main>
      {!isStudySession && <BottomNav />}
    </div>
  );
};
```

**Note:** Add `pb-16 md:pb-8` to prevent content being hidden behind bottom nav.

### Option B: Hamburger Menu (Alternative)

Uses the existing `Sheet` component from `components/ui/sheet.tsx`.

---

## 6. COMPONENT-BY-COMPONENT MOBILE FIXES

### 6.1 Login.tsx Mobile Optimization

```tsx
// Changes needed:

// 1. Outer container - reduce padding on mobile
<div className="w-full max-w-md px-4 py-6 sm:p-8">

// 2. Card padding - reduce on mobile
<div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8">

// 3. Logo margin - reduce on mobile
<div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">

// 4. Form spacing - tighter on mobile
<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

// 5. Input padding - ensure touch-friendly
<input
    className="w-full px-3 py-2.5 sm:py-2 border border-zinc-300 rounded-lg ..."
    // py-2.5 = 10px = decent touch target
/>

// 6. Submit button - ensure min height
<button
    className="w-full bg-blue-600 ... py-3 sm:py-2.5 min-h-[44px] ..."
>
```

### 6.2 Study.tsx Mobile Optimization

```tsx
// 1. Page padding
<div className="p-4 sm:p-6">

// 2. "Study All Books" button - stack stats on mobile
<button className="w-full mb-4 px-3 sm:px-4 py-3 bg-black...">
    <div className="flex items-center justify-between w-full">
        {/* Left side: Icon + Text */}
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <BookIcon />
            </div>
            <div className="text-left">
                <div className="text-sm font-semibold">Study All</div>
                <div className="text-xs text-white/70 hidden sm:block">
                    Review cards from your entire library
                </div>
            </div>
        </div>

        {/* Right side: Stats - simplified on mobile */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
            {/* On mobile: show only total */}
            <div className="sm:hidden text-right">
                <div className="text-lg font-bold">{totalStats.total}</div>
                <div className="text-white/50 text-[10px]">Due</div>
            </div>

            {/* On desktop: show all stats */}
            <div className="hidden sm:flex items-center gap-3">
                <StatItem label="New" value={totalStats.new} color="blue" />
                <StatItem label="Learning" value={totalStats.learning} color="amber" />
                <StatItem label="Review" value={totalStats.review} color="green" />
            </div>
            <div className="hidden sm:block text-right ml-4">
                <div className="text-lg font-bold">{totalStats.total}</div>
                <div className="text-white/50 text-[10px]">Total</div>
            </div>
        </div>
    </div>
</button>

// 3. DeckTable - needs mobile-specific view
// Option A: Horizontal scroll
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
    <DeckTable ... />
</div>

// Option B: Simplified mobile view (recommended)
// Create DeckTableMobile component or add responsive logic
```

### 6.3 StudySession.tsx Mobile Optimization (CRITICAL)

```tsx
// 1. Header - keep compact but ensure touch targets
<header className="px-3 sm:px-4 py-2 border-b border-zinc-200">
    <div className="flex items-center justify-between">
        <button
            onClick={handleBack}
            className="flex items-center gap-1 hover:bg-zinc-100 px-2 py-1.5 sm:py-1 rounded min-h-[40px] sm:min-h-0"
        >
            <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="text-xs text-zinc-600 hidden sm:inline">Back to Decks</span>
        </button>
        {/* ... rest of header */}
    </div>
</header>

// 2. Main content - reduce padding
<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">

// 3. Highlight text - already responsive, good!
<blockquote className="text-lg md:text-xl font-serif ...">

// 4. Footer controls - CRITICAL CHANGES
<div className="border-t border-zinc-200 bg-white p-3 sm:p-4 safe-area-inset-bottom">
    <div className="max-w-2xl mx-auto relative">
        {/* Delete button - move to header on mobile or use swipe */}
        <button className="absolute left-0 ... hidden sm:block">
            {/* Only show on desktop */}
        </button>

        {/* Main controls */}
        <div className="sm:ml-12">
            {!showAnswer ? (
                <button className="w-full py-3.5 sm:py-3 min-h-[48px] bg-black ...">
                    Reveal Answer
                    <span className="hidden sm:inline text-xs text-zinc-400 ml-2">
                        (Space / Enter)
                    </span>
                </button>
            ) : (
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    <ResponseButton quality={1} label="Again" color="red" />
                    <ResponseButton quality={2} label="Hard" color="amber" />
                    <ResponseButton quality={3} label="Good" color="blue" />
                    <ResponseButton quality={4} label="Easy" color="green" />
                </div>
            )}
        </div>
    </div>
</div>

// Response button component (for cleaner code)
const ResponseButton = ({ quality, label, color }) => (
    <button
        onClick={() => handleResponse(quality)}
        disabled={isEditing}
        className={`py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-${color}-500 hover:bg-${color}-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center`}
    >
        <span>{label}</span>
        <span className="hidden sm:block text-[10px] opacity-75">({quality})</span>
    </button>
);
```

### 6.4 Safe Area Insets for iPhone

Add to `index.css`:
```css
/* Safe area support for iPhone notch/home indicator */
.safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
}

.safe-area-inset-top {
    padding-top: env(safe-area-inset-top, 0);
}
```

---

## 7. TAILWIND BREAKPOINTS REFERENCE

```css
/* Default Tailwind breakpoints */
sm: 640px   /* Small tablets, large phones landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */

/* Mobile-first approach: */
/* Base styles = mobile */
/* sm: = tablet+ */
/* md: = desktop+ */

/* Example: */
<div className="p-4 sm:p-6 md:p-8">
/* Mobile: 16px padding */
/* Tablet: 24px padding */
/* Desktop: 32px padding */
```

---

## 8. TOUCH INTERACTION GUIDELINES

### Tap Target Sizes
- **Minimum:** 44x44px (Apple HIG)
- **Recommended:** 48x48px
- **Current buttons:** ~58x36px (width OK, height too short)

### Swipe Gestures (Future Enhancement)
Consider adding swipe gestures for StudySession:
- **Swipe left:** Again (1)
- **Swipe up-left:** Hard (2)
- **Swipe up:** Good (3)
- **Swipe right:** Easy (4)

Library: `react-swipeable` or custom touch handlers

### Haptic Feedback (Future Enhancement)
```typescript
// Using Vibration API
const triggerHaptic = (duration = 10) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
};

// Usage on button press
<button onClick={() => { triggerHaptic(); handleResponse(quality); }}>
```

---

## 9. TESTING CHECKLIST

### Devices to Test
- [ ] iPhone SE (320px width) - smallest common phone
- [ ] iPhone 12/13/14 (390px width) - most common
- [ ] iPad Mini (768px width) - tablet portrait
- [ ] iPad (1024px width) - tablet landscape

### Test Scenarios
- [ ] Login on mobile (form fits, inputs usable)
- [ ] Navigate between pages (bottom nav works)
- [ ] Start study session (button accessible)
- [ ] Review cards (all 4 buttons tappable)
- [ ] Edit note (keyboard doesn't cover content)
- [ ] Delete card (confirmation dialog visible)
- [ ] Complete session (stats screen readable)
- [ ] PWA install prompt appears
- [ ] App works offline (cached data)

---

## 10. FILES TO MODIFY (SUMMARY)

### New Files to Create
1. `public/manifest.webmanifest` (auto-generated by vite-plugin-pwa)
2. `public/pwa-192x192.png`
3. `public/pwa-512x512.png`
4. `public/apple-touch-icon.png`
5. `components/BottomNav.tsx`

### Files to Modify
1. `vite.config.ts` - Add PWA plugin
2. `index.html` - Add PWA meta tags
3. `App.tsx` - Add BottomNav, adjust layout
4. `pages/Login.tsx` - Mobile padding/spacing
5. `pages/Study.tsx` - Mobile-friendly stats, padding
6. `pages/StudySession.tsx` - Touch-friendly buttons, safe areas
7. `components/Sidebar.tsx` - No changes (stays hidden on mobile)
8. `index.css` - Add safe-area CSS
9. `package.json` - Add vite-plugin-pwa

### Files That DON'T Need Changes
- `components/AuthContext.tsx` - Logic is device-agnostic
- `components/StoreContext.tsx` - Logic is device-agnostic
- `services/sm2.ts` - Algorithm is device-agnostic
- `types.ts` - No mobile-specific types needed
- `lib/supabase.ts` - API is device-agnostic

---

## 11. IMPLEMENTATION ORDER

### Phase 1: PWA Foundation (30 min)
1. Install vite-plugin-pwa
2. Configure vite.config.ts
3. Add PWA meta tags to index.html
4. Create/add PWA icons
5. Test: Build and verify manifest generation

### Phase 2: Mobile Navigation (45 min)
1. Create BottomNav.tsx component
2. Update App.tsx to include BottomNav
3. Add safe-area CSS to index.css
4. Test: Navigate on mobile simulator

### Phase 3: StudySession Optimization (1 hour)
1. Update footer button sizes (min-h-[48px])
2. Hide keyboard hints on mobile
3. Adjust padding for mobile
4. Add safe-area-inset-bottom
5. Test: Complete a study session on mobile

### Phase 4: Other Pages (45 min)
1. Login.tsx - Mobile padding adjustments
2. Study.tsx - Simplify stats on mobile
3. DeckTable - Add horizontal scroll or mobile view
4. Test: Full flow from login to study

### Phase 5: Polish & Testing (30 min)
1. Test on multiple device sizes
2. Verify PWA installation works
3. Check offline functionality
4. Fix any remaining issues

---

## 12. CRITICAL WARNINGS

### DO NOT:
- Remove existing keyboard shortcuts (desktop still uses them)
- Change the SM-2 algorithm logic
- Modify StoreContext data structures
- Change Supabase queries or RLS policies
- Remove the desktop Sidebar (just hide on mobile)

### BE CAREFUL WITH:
- The `currentSession` state management in StudySession
- The `progress` calculation for the progress bar
- The `handleResponse` async flow (order matters)
- The `handleUndo` history management

### MUST PRESERVE:
- All existing functionality on desktop
- The optimistic UI update pattern
- Error handling and rollback logic
- User authentication flow

---

**END OF MOBILE IMPLEMENTATION GUIDE**
