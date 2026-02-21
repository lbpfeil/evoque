/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

// Take control immediately on install/activate
self.skipWaiting()
clientsClaim()

// Clean up old precache entries from previous versions
cleanupOutdatedCaches()

// Precache all app shell assets (manifest injected by vite-plugin-pwa at build time)
precacheAndRoute(self.__WB_MANIFEST)

// Runtime cache: Supabase API — NetworkFirst with 1 hour expiration
// Mirrors the existing generateSW runtimeCaching config
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
  })
)

// Offline review queue: intercept Supabase POST requests for review_logs and study_cards
// When offline, requests are stored in IndexedDB and replayed when back online
const reviewSyncPlugin = new BackgroundSyncPlugin('review-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
})

// Queue review_logs POST requests when offline
registerRoute(
  ({ url, request }) =>
    url.hostname.includes('supabase.co') &&
    url.pathname.includes('review_logs') &&
    request.method === 'POST',
  new NetworkOnly({ plugins: [reviewSyncPlugin] }),
  'POST'
)

// Queue study_cards PATCH requests when offline (card state updates during study)
const cardSyncPlugin = new BackgroundSyncPlugin('card-update-queue', {
  maxRetentionTime: 24 * 60,
})

registerRoute(
  ({ url, request }) =>
    url.hostname.includes('supabase.co') &&
    url.pathname.includes('study_cards') &&
    request.method === 'PATCH',
  new NetworkOnly({ plugins: [cardSyncPlugin] }),
  'PATCH'
)

// Push notification handler placeholder (Phase 18 will implement)
self.addEventListener('push', (_event) => {
  // Phase 18: Parse push data and show notification
})

// Notification click handler placeholder (Phase 18 will implement)
self.addEventListener('notificationclick', (_event) => {
  // Phase 18: Handle notification click (open app, navigate to study)
})
