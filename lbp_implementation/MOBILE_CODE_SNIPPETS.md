# EVOQUE Mobile - Ready-to-Use Code Snippets

> **Purpose:** Copy-paste code snippets for mobile implementation
> **Companion to:** MOBILE_PWA_IMPLEMENTATION_GUIDE.md

---

## 1. PACKAGE.JSON ADDITIONS

Add to `devDependencies`:
```json
"vite-plugin-pwa": "^0.17.4"
```

Install command:
```bash
npm install vite-plugin-pwa -D
```

---

## 2. VITE.CONFIG.TS (Complete Replacement)

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
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
                                    maxAgeSeconds: 3600
                                }
                            }
                        }
                    ]
                }
            })
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
```

---

## 3. INDEX.HTML (Complete Replacement)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="EVOQUE" />
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <title>EVOQUE - Kindle Highlights</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', sans-serif;
        background-color: #FAFAFA;
        color: #18181b;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }

      /* Prevent pull-to-refresh on mobile */
      html, body {
        overscroll-behavior-y: contain;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

## 4. INDEX.CSS ADDITIONS

Add at the end of the file:

```css
/* Safe area support for iPhone notch/home indicator */
.safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
}

.safe-area-inset-top {
    padding-top: env(safe-area-inset-top, 0);
}

/* Touch-friendly tap highlighting */
@media (hover: none) {
    button:active,
    a:active {
        opacity: 0.7;
    }
}

/* Smooth animations */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.2s ease-out;
}

/* Hide scrollbar on mobile while keeping functionality */
@media (max-width: 768px) {
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
}
```

---

## 5. BOTTOM NAVIGATION COMPONENT

**New File:** `components/BottomNav.tsx`

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
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center h-14 md:hidden z-50 safe-area-inset-bottom">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-0.5 px-4 py-2 min-w-[64px] min-h-[48px] transition-colors ${
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

---

## 6. APP.TSX (Complete Replacement)

```tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import BookDetails from './pages/BookDetails';
import Highlights from './pages/Highlights';
import Study from './pages/Study';
import Settings from './pages/Settings';
import StudySession from './pages/StudySession';
import Login from './pages/Login';
import { StoreProvider } from './components/StoreContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const AppLayout = ({ children }: React.PropsWithChildren) => {
    const location = useLocation();
    const isStudySession = location.pathname === '/study/session';

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row text-zinc-900 font-sans antialiased">
            {!isStudySession && <Sidebar />}
            <main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8 pb-20 md:pb-8' : ''} overflow-y-auto h-screen`}>
                {!isStudySession ? (
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </main>
            {!isStudySession && <BottomNav />}
        </div>
    );
};

const ProtectedApp = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-zinc-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <HashRouter>
            <StoreProvider>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/library/:bookId" element={<BookDetails />} />
                        <Route path="/highlights" element={<Highlights />} />
                        <Route path="/study" element={<Study />} />
                        <Route path="/study/session" element={<StudySession />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/import" element={<Navigate to="/settings" replace />} />
                        <Route path="/library" element={<Navigate to="/settings" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppLayout>
            </StoreProvider>
        </HashRouter>
    );
};

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ProtectedApp />
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
```

---

## 7. LOGIN.TSX MOBILE FIXES

**Changes to make (diff style):**

```diff
// Line 33-34: Outer container
- <div className="w-full max-w-md p-8">
+ <div className="w-full max-w-md px-4 py-6 sm:p-8">

// Line 36: Logo margin
- <div className="flex items-center justify-center gap-3 mb-8">
+ <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">

// Line 44: Card padding
- <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
+ <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-5 sm:p-8">

// Line 56: Form spacing
- <form onSubmit={handleSubmit} className="space-y-4">
+ <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

// Line 65: Input padding
- className="w-full px-3 py-2 border border-zinc-300 rounded-lg..."
+ className="w-full px-3 py-2.5 sm:py-2 border border-zinc-300 rounded-lg..."

// Line 79: Password input padding (same change)
- className="w-full px-3 py-2 border border-zinc-300 rounded-lg..."
+ className="w-full px-3 py-2.5 sm:py-2 border border-zinc-300 rounded-lg..."

// Line 89: Submit button
- className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg..."
+ className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 sm:py-2.5 min-h-[44px] rounded-lg..."
```

---

## 8. STUDY.TSX MOBILE FIXES

**Key changes:**

```diff
// Line 46: Page padding
- <div className="p-6">
+ <div className="p-4 sm:p-6">

// Line 67-102: Study All Books button - replace stats section
// Current (complex):
<div className="flex items-center gap-4 text-xs">
    <div className="flex items-center gap-3">
        <div className="text-center">...</div> {/* New */}
        <div className="text-center">...</div> {/* Learning */}
        <div className="text-center">...</div> {/* Review */}
    </div>
    <div className="text-right ml-4">...</div> {/* Total */}
</div>

// Replace with responsive version:
+ <div className="flex items-center gap-2 sm:gap-4 text-xs">
+     {/* Mobile: Only show total */}
+     <div className="sm:hidden text-right">
+         <div className="text-lg font-bold">{totalStats.total}</div>
+         <div className="text-white/50 text-[10px]">Due</div>
+     </div>
+
+     {/* Desktop: Show all stats */}
+     <div className="hidden sm:flex items-center gap-3">
+         <div className="text-center">
+             <div className="text-blue-300 font-semibold">{totalStats.new}</div>
+             <div className="text-white/50 text-[10px]">New</div>
+         </div>
+         <div className="text-center">
+             <div className="text-amber-300 font-semibold">{totalStats.learning}</div>
+             <div className="text-white/50 text-[10px]">Learning</div>
+         </div>
+         <div className="text-center">
+             <div className="text-green-300 font-semibold">{totalStats.review}</div>
+             <div className="text-white/50 text-[10px]">Review</div>
+         </div>
+     </div>
+     <div className="hidden sm:block text-right ml-4">
+         <div className="text-lg font-bold">{totalStats.total}</div>
+         <div className="text-white/50 text-[10px]">Total</div>
+     </div>
+ </div>
```

---

## 9. STUDYSESSION.TSX MOBILE FIXES

**Critical footer changes (lines 472-531):**

```tsx
{/* Fixed Footer - Controls */}
<div className="border-t border-zinc-200 bg-white p-3 sm:p-4 safe-area-inset-bottom">
    <div className="max-w-2xl mx-auto relative">
        {/* Delete button - hidden on mobile */}
        <button
            onClick={() => setShowDeletePopover(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-md transition-colors hidden sm:block"
            title="Delete Card"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Main controls */}
        <div className="sm:ml-12">
            {!showAnswer ? (
                <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-3.5 sm:py-3 min-h-[48px] bg-black hover:bg-zinc-800 text-white rounded-md font-medium text-sm transition-all active:scale-[0.99]"
                >
                    Reveal Answer
                    <span className="hidden sm:inline text-xs text-zinc-400 ml-2">(Space / Enter)</span>
                </button>
            ) : (
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    <button
                        onClick={() => handleResponse(1)}
                        disabled={isEditing}
                        className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Again</span>
                        <span className="hidden sm:block text-[10px] opacity-75">(1)</span>
                    </button>
                    <button
                        onClick={() => handleResponse(2)}
                        disabled={isEditing}
                        className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Hard</span>
                        <span className="hidden sm:block text-[10px] opacity-75">(2)</span>
                    </button>
                    <button
                        onClick={() => handleResponse(3)}
                        disabled={isEditing}
                        className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Good</span>
                        <span className="hidden sm:block text-[10px] opacity-75">(3)</span>
                    </button>
                    <button
                        onClick={() => handleResponse(4)}
                        disabled={isEditing}
                        className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium text-sm flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Easy</span>
                        <span className="hidden sm:block text-[10px] opacity-75">(4)</span>
                    </button>
                </div>
            )}
        </div>
    </div>
</div>
```

**Header padding fix (line 280):**

```diff
- <header className="px-4 py-2 border-b border-zinc-200">
+ <header className="px-3 sm:px-4 py-2 border-b border-zinc-200 safe-area-inset-top">
```

**Main content padding fix (line 316):**

```diff
- <div className="flex-1 overflow-y-auto px-6 py-8">
+ <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
```

---

## 10. PUBLIC FOLDER ASSETS

Create `public/` folder with these files:

### favicon.ico
- Size: 32x32 or 16x16
- Content: Black book icon on white/transparent background

### apple-touch-icon.png
- Size: 180x180
- Content: Black book icon centered on white background
- Format: PNG with no transparency

### pwa-192x192.png
- Size: 192x192
- Content: Black book icon centered on white background

### pwa-512x512.png
- Size: 512x512
- Content: Same as above, larger
- Purpose: Used as maskable icon (needs padding around edges)

**Quick generation using CSS/SVG:**
The icon should match the existing logo in Sidebar.tsx:
```tsx
<div className="p-1.5 bg-black text-white rounded-md">
    <BookOpen className="w-4 h-4" />
</div>
```

---

## 11. TESTING COMMANDS

After implementation, test with:

```bash
# Build the app
npm run build

# Preview production build
npm run preview

# Or serve with a local server
npx serve dist
```

Open Chrome DevTools > Application > Manifest to verify PWA setup.

Use Device Toolbar (Ctrl+Shift+M) to test different screen sizes.

---

**END OF CODE SNIPPETS**
