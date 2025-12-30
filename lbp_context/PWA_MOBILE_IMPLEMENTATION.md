# PWA & Mobile Implementation Guide

> **Created:** 2025-12-30
> **Version:** 1.0.0
> **Status:** Production Ready
> **Purpose:** Complete guide for AI agents to understand and maintain the PWA/mobile implementation

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [PWA Configuration](#pwa-configuration)
4. [Mobile Navigation](#mobile-navigation)
5. [Responsive Components](#responsive-components)
6. [Critical Fixes](#critical-fixes)
7. [Files Modified](#files-modified)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## 1. EXECUTIVE SUMMARY

### What Was Implemented

EVOQUE is now a fully functional Progressive Web App (PWA) optimized for mobile devices (phones and tablets). The implementation focuses on:

1. **PWA Infrastructure:** Service worker, manifest, offline support
2. **Mobile Navigation:** Bottom navigation bar for small screens
3. **Touch-Optimized UI:** Buttons ≥ 48px, proper spacing, simplified layouts
4. **Responsive Design:** Mobile-first approach with tablet/desktop enhancements
5. **Browser Compatibility:** Fixed crypto.randomUUID() for Safari mobile

### Key Features

- ✅ Installable as native app on iOS/Android
- ✅ Offline-capable (20 files pre-cached, 1.47 MB)
- ✅ Touch-friendly buttons (minimum 48px height)
- ✅ Simplified mobile interface (2-column tables vs 5-column desktop)
- ✅ Bottom navigation (Home + Study only)
- ✅ Safe-area support for iPhone notch/home indicator

---

## 2. ARCHITECTURE OVERVIEW

### Responsive Breakpoints (Tailwind CSS)

```css
/* Mobile-first approach */
Base (no prefix)  = Mobile      (< 640px)  - iPhone, small phones
sm:               = Tablet      (≥ 640px)  - iPad Mini, large phones landscape
md:               = Desktop     (≥ 768px)  - iPad landscape, laptops
lg:               = Large       (≥ 1024px) - Desktops
xl:               = Extra Large (≥ 1280px) - Large monitors
```

### Navigation Strategy

**Mobile (< 768px):**
- Sidebar: HIDDEN
- BottomNav: VISIBLE (fixed at bottom, 80px height)
- Pages: Home, Study only

**Desktop (≥ 768px):**
- Sidebar: VISIBLE (fixed at left, 224px width)
- BottomNav: HIDDEN
- Pages: All pages accessible

**StudySession (all screens):**
- Sidebar: HIDDEN
- BottomNav: HIDDEN
- Full-screen immersive experience

### Layout Structure

```
App.tsx (root)
├── AuthContext (authentication state)
└── StoreContext (app data)
    ├── Sidebar (desktop only, md:flex)
    ├── Main Content
    │   └── Routes (Dashboard, Study, StudySession, etc.)
    └── BottomNav (mobile only, md:hidden)
```

---

## 3. PWA CONFIGURATION

### 3.1 Vite Plugin (vite.config.ts)

**Plugin:** `vite-plugin-pwa`

```typescript
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
    start_url: '/',
    icons: [...]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        cacheName: 'supabase-api',
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
      }
    ]
  }
})
```

**Key Decisions:**
- `registerType: 'autoUpdate'` - Automatic updates without user prompt
- `NetworkFirst` for Supabase - Prefers fresh data, falls back to cache
- Pre-caches 20 files (1.47 MB) for offline use

### 3.2 HTML Meta Tags (index.html)

```html
<!-- Viewport optimized for mobile -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

<!-- PWA Meta Tags -->
<meta name="theme-color" content="#000000" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="EVOQUE" />

<!-- PWA Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

**Important:**
- `user-scalable=no` prevents accidental zooming during touch interactions
- `black-translucent` status bar style for iOS full-screen experience

### 3.3 Icons Generated

All icons created using `pwa-asset-generator`:

```bash
npx pwa-asset-generator public/icon.svg public/ --background "#ffffff" --icon-only --favicon
```

**Assets in /public:**
- `pwa-192x192.png` (192x192) - Android home screen
- `pwa-512x512.png` (512x512) - Splash screen, maskable icon
- `apple-touch-icon.png` (180x180) - iOS home screen
- `favicon.ico` (32x32) - Browser favicon
- `mask-icon.svg` - Safari pinned tab icon

**Design:** Black book icon with bookmark on white background

---

## 4. MOBILE NAVIGATION

### 4.1 BottomNav Component

**File:** `components/BottomNav.tsx`

**Purpose:** Fixed bottom navigation bar for mobile/tablet devices

**Visibility:**
- Mobile/Tablet: VISIBLE (< 768px)
- Desktop: HIDDEN (≥ 768px)
- StudySession: Always HIDDEN

**Specifications:**
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200
     flex justify-around items-center h-20 py-2 md:hidden z-50 safe-area-inset-bottom">
```

- **Height:** 80px (h-20)
- **Padding:** Vertical 8px (py-2)
- **Safe Area:** Respects iPhone notch/home indicator
- **Z-Index:** 50 (above most content, below modals)

**Navigation Items:**
```typescript
const navItems = [
  { name: 'Home', icon: LayoutDashboard, path: '/' },
  { name: 'Study', icon: Target, path: '/study' },
];
```

**Why only 2 items?**
- Mobile users primarily need Home (Dashboard) and Study
- Highlights and Settings accessible via Sidebar on desktop
- Larger touch targets (each button ≥ 64px wide)
- Cleaner, more focused interface

### 4.2 Safe Area CSS (index.css)

```css
/* Safe area support for iPhone notch/home indicator */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.safe-area-inset-top {
  padding-top: env(safe-area-inset-top, 0);
}
```

**Usage:** Applied to BottomNav and StudySession footer to prevent overlap with iPhone UI elements.

### 4.3 App Layout Adjustments (App.tsx)

**Main content padding-bottom:**
```tsx
<main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8 pb-20 md:pb-8' : ''} ...`}>
```

- Mobile: `pb-20` (80px) - Prevents content hiding behind BottomNav
- Desktop: `pb-8` (32px) - Normal padding (no BottomNav)

**Flex direction:**
```tsx
<div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row ...">
```

- Mobile: Column layout (Sidebar hidden, BottomNav at bottom)
- Desktop: Row layout (Sidebar at left, no BottomNav)

---

## 5. RESPONSIVE COMPONENTS

### 5.1 StudySession.tsx (Most Critical)

**File:** `pages/StudySession.tsx` (550 lines)

**Mobile Optimizations:**

#### Header
```tsx
<header className="px-3 sm:px-4 py-2 border-b border-zinc-200">
  <button className="... px-2 py-1.5 sm:py-1 min-h-[40px] sm:min-h-0">
    <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
    <span className="text-xs text-zinc-600 hidden sm:inline">Back to Decks</span>
  </button>
</header>
```

- Mobile: Icon only, larger tap target (40px)
- Desktop: Icon + "Back to Decks" text

#### Main Content
```tsx
<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
```

- Mobile: 16px padding (maximizes content width)
- Desktop: 24px padding (more breathing room)

#### Footer Buttons (CRITICAL)
```tsx
<div className="border-t border-zinc-200 bg-white p-3 sm:p-4 safe-area-inset-bottom">
  {/* Delete button - hidden on mobile */}
  <button className="hidden sm:block absolute left-0 ...">
    Delete Card
  </button>

  {/* Reveal Answer */}
  <button className="w-full py-3.5 sm:py-3 min-h-[48px] bg-black ...">
    Reveal Answer
    <span className="hidden sm:inline text-xs text-zinc-400 ml-2">(Space / Enter)</span>
  </button>

  {/* Response Buttons */}
  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
    <button className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-red-500 ...">
      <span>Again</span>
      <span className="hidden sm:block text-[10px] opacity-75">(1)</span>
    </button>
    {/* Hard, Good, Easy... */}
  </div>
</div>
```

**Key Points:**
- Mobile button height: 48px (Apple HIG recommendation)
- Desktop button height: Auto (keyboard-optimized ~36px)
- Keyboard hints: Hidden on mobile (touch users don't need them)
- Delete button: Hidden on mobile (prevents accidental taps)
- Gap reduced: 6px mobile vs 8px desktop (more space for buttons)

### 5.2 Login.tsx

**File:** `pages/Login.tsx`

**Mobile Optimizations:**

```tsx
{/* Outer container */}
<div className="w-full max-w-md px-4 py-6 sm:p-8">

  {/* Logo */}
  <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">

  {/* Card */}
  <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8">

    {/* Form */}
    <form className="space-y-3 sm:space-y-4">

      {/* Inputs */}
      <input className="w-full px-3 py-2.5 sm:py-2 ..." />

      {/* Submit */}
      <button className="w-full ... py-3 sm:py-2.5 min-h-[44px] ..." />
    </form>
  </div>
</div>
```

**Changes:**
- Padding: 16px mobile → 32px desktop
- Input height: 10px mobile → 8px desktop (py-2.5 → py-2)
- Button height: Minimum 44px for touch
- Form spacing: 12px mobile → 16px desktop

### 5.3 Study.tsx

**File:** `pages/Study.tsx`

**Mobile Optimizations:**

#### Page Padding
```tsx
<div className="p-4 sm:p-6">
```

#### "Study All Books" Button Stats
```tsx
{/* Mobile: only show total */}
<div className="sm:hidden text-right">
  <div className="text-lg font-bold">{totalStats.total}</div>
  <div className="text-white/50 text-[10px]">Due</div>
</div>

{/* Desktop: show all stats */}
<div className="hidden sm:flex items-center gap-4 text-xs">
  <div className="text-center">
    <div className="text-blue-300 font-semibold">{totalStats.new}</div>
    <div className="text-white/50 text-[10px]">New</div>
  </div>
  {/* Learning, Review, Total... */}
</div>
```

**Rationale:** Mobile screen too narrow for 4 stats. Show only total count.

#### Reload Button (NEW)
```tsx
<div className="flex justify-end gap-2 mb-3">
  <button
    onClick={handleReload}
    disabled={isReloading}
    className="p-1 hover:bg-zinc-100 rounded transition-colors disabled:opacity-50"
    title="Reload data"
  >
    <RefreshCw className={`w-3.5 h-3.5 text-zinc-600 ${isReloading ? 'animate-spin' : ''}`} />
  </button>
  {/* Settings button... */}
</div>
```

**Purpose:** Allows mobile users to reload data from Supabase without closing the PWA (useful when adding cards on desktop)

**Implementation:**
```typescript
const { reloadAllData } = useStore();

const handleReload = async () => {
  setIsReloading(true);
  await reloadAllData(); // Calls loadData() from StoreContext
  setTimeout(() => setIsReloading(false), 500);
};
```

### 5.4 DeckTable.tsx

**File:** `components/DeckTable.tsx`

**Mobile Simplification:**

**Before (Desktop):** 5 columns (Deck, New, Learning, Review, Total)
**After (Mobile):** 2 columns (Deck, Total)

```tsx
{/* Header */}
<div className="... grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] ...">
  <div className="text-xs font-semibold text-zinc-600">Deck</div>
  <div className="hidden sm:block ...">New</div>
  <div className="hidden sm:block ...">Learning</div>
  <div className="hidden sm:block ...">Review</div>
  <div className="text-xs font-semibold text-zinc-600 text-right">Total</div>
</div>

{/* Rows */}
<button className="... grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] ...">
  {/* Deck Name */}
  <div className="min-w-0">
    <div className="text-sm sm:text-xs ...">{deck.title}</div>
    <div className="text-xs sm:text-[10px] ...">{deck.author}</div>
  </div>

  {/* Stats - hidden on mobile */}
  <div className="hidden sm:block ...">{deck.stats.new}</div>
  <div className="hidden sm:block ...">{deck.stats.learning}</div>
  <div className="hidden sm:block ...">{deck.stats.review}</div>

  {/* Total - always visible */}
  <div className="text-sm sm:text-xs ...">{deck.stats.total}</div>
</button>
```

**Benefits:**
- More space for book titles (no truncation)
- Larger, more readable text (text-sm vs text-xs)
- Cleaner interface focused on essentials
- Desktop users still get full stats

---

## 6. CRITICAL FIXES

### 6.1 crypto.randomUUID() Safari Mobile Bug

**Problem:** Safari mobile doesn't support `crypto.randomUUID()` natively, causing crash when creating study cards.

**Error Message:**
```
TypeError: crypto.randomUUID is not a function
(In 'crypto.randomUUID()' 'crypto.randomUUID' is undefined)
```

**Root Cause:** Direct usage of `crypto.randomUUID()` in:
- `services/sm2.ts` (1 occurrence)
- `components/StoreContext.tsx` (7 occurrences)

**Solution:** Use polyfill from `services/idUtils.ts`

**Polyfill Implementation:**
```typescript
// services/idUtils.ts
export const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID(); // Use native if available
    }
    // Fallback for Safari mobile and older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
```

**Files Modified:**
1. `services/sm2.ts`:
   ```typescript
   import { generateUUID } from './idUtils';

   export const initializeCard = (highlightId: string): StudyCard => {
     return {
       id: generateUUID(), // Changed from crypto.randomUUID()
       // ...
     };
   };
   ```

2. `components/StoreContext.tsx`:
   ```typescript
   import { generateUUID } from '../services/idUtils';

   // All 7 occurrences replaced:
   const newCard: StudyCard = {
     id: generateUUID(), // Changed from crypto.randomUUID()
     // ...
   };
   ```

**Testing:** Confirmed working on iPhone Safari, Android Chrome, and desktop browsers.

### 6.2 loadData Scope Error

**Problem:** `ReferenceError: can't find variable: loadData`

**Root Cause:** `loadData` function was defined inside `useEffect`, making it inaccessible to the Provider's value object.

**Before (BROKEN):**
```typescript
useEffect(() => {
  const loadData = async () => {
    // ... load all data from Supabase
  };
  loadData();
}, [user]);

// ❌ loadData doesn't exist here!
<StoreContext.Provider value={{ reloadAllData: loadData }}>
```

**After (FIXED):**
```typescript
// Move loadData outside useEffect
const loadData = async () => {
  if (!user) {
    setIsLoaded(true);
    return;
  }
  // ... load all data from Supabase
};

// useEffect just calls the function
useEffect(() => {
  loadData();
}, [user]);

// ✅ Now accessible!
<StoreContext.Provider value={{ reloadAllData: loadData }}>
```

**File Modified:** `components/StoreContext.tsx`

**Interface Update:**
```typescript
interface StoreContextType {
  // ... existing fields
  reloadAllData: () => Promise<void>; // Added
}
```

---

## 7. FILES MODIFIED

### 7.1 New Files Created

```
public/
├── pwa-192x192.png              # Android home screen icon
├── pwa-512x512.png              # Splash screen / maskable icon
├── apple-touch-icon.png         # iOS home screen icon
├── favicon.ico                  # Browser favicon
├── mask-icon.svg                # Safari pinned tab icon
├── icon.svg                     # Source SVG for icon generation
└── manifest.webmanifest         # Auto-generated by vite-plugin-pwa

components/
└── BottomNav.tsx                # Mobile navigation component (34 lines)

lbp_context/
└── PWA_MOBILE_IMPLEMENTATION.md # This file
```

### 7.2 Files Modified

```
Configuration Files:
├── vite.config.ts               # Added VitePWA plugin, manifest config
├── index.html                   # Added PWA meta tags, viewport settings
└── index.css                    # Added safe-area CSS utilities

Core Application:
├── App.tsx                      # Added BottomNav, adjusted layout padding
└── package.json                 # Added vite-plugin-pwa dependency

Components:
└── components/
    ├── StoreContext.tsx         # Fixed loadData scope, added reloadAllData
    └── DeckTable.tsx            # Responsive columns (2 mobile, 5 desktop)

Pages:
└── pages/
    ├── Login.tsx                # Mobile padding/spacing adjustments
    ├── Study.tsx                # Added reload button, simplified stats
    └── StudySession.tsx         # Touch-friendly buttons, responsive layout

Services:
└── services/
    └── sm2.ts                   # Replaced crypto.randomUUID with generateUUID
```

### 7.3 Dependencies Added

```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^1.2.0",
    "workbox-precaching": "latest"
  }
}
```

---

## 8. TESTING GUIDE

### 8.1 Local Testing

**Development Mode:**
```bash
npm run dev
# PWA features NOT available in dev mode (service worker disabled)
```

**Production Build:**
```bash
npm run build
npm run preview
# PWA features ENABLED, service worker active
```

**Access from Mobile:**
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Mobile device must be on same WiFi network
3. Access: `http://192.168.x.x:4173` (or port 3000 for dev)

### 8.2 PWA Installation Testing

**iOS (Safari):**
1. Open site in Safari
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add" in top right
5. Icon appears on home screen
6. Tap icon to launch in standalone mode (no browser UI)

**Android (Chrome):**
1. Open site in Chrome
2. Look for "Add to Home Screen" banner
3. Or: Menu → "Add to Home Screen"
4. Tap "Add"
5. Icon appears on home screen
6. Tap icon to launch in standalone mode

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar (⊕)
2. Click to install
3. App opens in standalone window
4. Can launch from OS app menu

### 8.3 Checklist

**PWA Functionality:**
- [ ] Manifest.webmanifest generated in /dist
- [ ] Service worker (sw.js) active in DevTools → Application
- [ ] Icons load correctly (check DevTools → Application → Manifest)
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Launches in standalone mode (no browser UI)
- [ ] Offline mode works (disconnect network, reload app)

**Mobile Navigation:**
- [ ] Bottom nav visible on mobile (< 768px)
- [ ] Bottom nav hidden on desktop (≥ 768px)
- [ ] Bottom nav hidden on StudySession
- [ ] Home and Study buttons work
- [ ] Active state highlights current page
- [ ] Safe area respected (iPhone notch/home indicator)

**Responsive Layout:**
- [ ] Login: Form fits on small screens, inputs touch-friendly
- [ ] Study: Stats simplified on mobile (only total visible)
- [ ] Study: Reload button works (spins and updates data)
- [ ] StudySession: Buttons ≥ 48px height on mobile
- [ ] StudySession: Keyboard hints hidden on mobile
- [ ] StudySession: Delete button hidden on mobile
- [ ] DeckTable: Shows 2 columns on mobile, 5 on desktop

**Critical Fixes:**
- [ ] Study cards create successfully (no crypto.randomUUID error)
- [ ] Reload button works without errors
- [ ] All features work on iPhone Safari
- [ ] All features work on Android Chrome

### 8.4 Device Testing Matrix

**Minimum Test Coverage:**

| Device | Screen Size | Browser | Priority |
|--------|-------------|---------|----------|
| iPhone SE | 320px | Safari | HIGH |
| iPhone 12/13/14 | 390px | Safari | HIGH |
| Android Phone | 360-400px | Chrome | MEDIUM |
| iPad Mini | 768px portrait | Safari | MEDIUM |
| iPad | 1024px landscape | Safari | LOW |
| Desktop | 1280px+ | Chrome | LOW |

---

## 9. TROUBLESHOOTING

### 9.1 Common Issues

**Issue: "crypto.randomUUID is not a function"**
- **Cause:** Fallback polyfill not being used
- **Check:** Ensure `generateUUID` from `idUtils.ts` is imported
- **Fix:** Replace all `crypto.randomUUID()` with `generateUUID()`

**Issue: "can't find variable: loadData"**
- **Cause:** `loadData` defined inside useEffect
- **Check:** Verify `loadData` is outside useEffect in StoreContext.tsx
- **Fix:** Move function definition to component scope

**Issue: Bottom nav covers content**
- **Cause:** Insufficient padding-bottom on main content
- **Check:** App.tsx main element should have `pb-20` on mobile
- **Fix:** Add/update `pb-20 md:pb-8` classes

**Issue: Install prompt doesn't appear**
- **Cause:** PWA criteria not met
- **Check:**
  - HTTPS required (localhost OK for dev)
  - manifest.webmanifest exists and valid
  - Service worker registered
  - User hasn't dismissed prompt before
- **Fix:** Check DevTools → Application → Manifest for errors

**Issue: Service worker not updating**
- **Cause:** Browser caching old service worker
- **Check:** DevTools → Application → Service Workers
- **Fix:**
  - Click "Update" or "Unregister"
  - Hard reload (Ctrl+Shift+R)
  - Clear site data and reload

**Issue: Icons not loading**
- **Cause:** Incorrect paths in manifest
- **Check:** All icon files exist in /public
- **Fix:** Rebuild with `npm run build` to regenerate manifest

### 9.2 Debug Commands

**Check manifest validity:**
```bash
# After build, check:
cat dist/manifest.webmanifest
```

**Verify service worker:**
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

**Test offline mode:**
```javascript
// DevTools → Application → Service Workers → Offline checkbox
// Or DevTools → Network → Offline
```

**Clear PWA data:**
```javascript
// Browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### 9.3 Known Limitations

**Current Warnings (Non-Critical):**
1. **Large chunks (1.45 MB):** PDF worker is large, consider code-splitting in future
2. **Duplicate keys in ankiParser.ts:** Portuguese encoding issue, doesn't affect functionality

**Browser Support:**
- ✅ Chrome/Edge (desktop + mobile): Full support
- ✅ Safari (iOS 11.3+): Full support
- ✅ Firefox (desktop + mobile): Full support
- ⚠️ Safari (macOS): Install support limited
- ❌ IE11: Not supported (uses modern JS/CSS)

**Missing Features (Future Enhancements):**
- [ ] Swipe gestures for study responses
- [ ] Haptic feedback on button press
- [ ] Push notifications for daily reminders
- [ ] Offline sync queue (currently NetworkFirst only)

---

## 10. MAINTENANCE GUIDE

### 10.1 Adding New Mobile-Responsive Pages

**Template:**
```tsx
import React from 'react';

const NewPage = () => {
  return (
    <div className="p-4 sm:p-6">
      {/* Mobile: 16px, Desktop: 24px padding */}

      <h1 className="text-lg sm:text-xl">
        {/* Mobile: 18px, Desktop: 20px font */}
        Page Title
      </h1>

      <button className="py-2.5 sm:py-2 min-h-[44px]">
        {/* Mobile: touch-friendly 44px min height */}
        Action Button
      </button>

      {/* Mobile-specific content */}
      <div className="block sm:hidden">
        Mobile Only
      </div>

      {/* Desktop-specific content */}
      <div className="hidden sm:block">
        Desktop Only
      </div>
    </div>
  );
};

export default NewPage;
```

### 10.2 Updating PWA Configuration

**Changing app name/colors:**
```typescript
// vite.config.ts
manifest: {
  name: 'New Name',           // Full name (45 chars max)
  short_name: 'Short',        // Icon label (12 chars max)
  theme_color: '#FF0000',     // Browser UI color
  background_color: '#FFFFFF' // Splash screen background
}
```

**After changes:**
```bash
npm run build
# Users will auto-update on next app launch
```

### 10.3 Updating Icons

**Generate new icons:**
```bash
# 1. Update public/icon.svg with new design
# 2. Regenerate icons:
npx pwa-asset-generator public/icon.svg public/ --background "#ffffff" --icon-only --favicon

# 3. Rebuild:
npm run build
```

---

## 11. DEPLOYMENT CHECKLIST

**Before deploying PWA:**
- [ ] Test on real mobile devices (iOS + Android)
- [ ] Verify HTTPS is enabled (required for PWA)
- [ ] Check all icons load correctly
- [ ] Test install flow on iOS and Android
- [ ] Verify offline mode works
- [ ] Test reload button functionality
- [ ] Confirm all responsive breakpoints work
- [ ] Check safe-area on iPhone with notch
- [ ] Verify no console errors on mobile

**Post-deployment:**
- [ ] Test installation from production URL
- [ ] Monitor error logs for mobile-specific issues
- [ ] Track PWA install rate (Analytics)
- [ ] Gather user feedback on mobile UX

---

**END OF PWA IMPLEMENTATION GUIDE**

*This document should be updated whenever significant changes are made to the PWA/mobile implementation.*
