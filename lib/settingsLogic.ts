import { DEFAULT_DAILY_LIMIT, DEFAULT_EASE_FACTOR } from './constants';
import type { Book, UserSettings, DailyProgress } from '../types';

/**
 * Get the daily review limit for a specific book.
 * Priority: book setting > global setting > default
 */
export function getDailyLimit(
  book: Book | null | undefined,
  settings: UserSettings
): number {
  return book?.settings?.dailyReviewLimit
    || settings.maxReviewsPerDay
    || DEFAULT_DAILY_LIMIT;
}

/**
 * Get the initial ease factor for a specific book.
 * Priority: book setting > global setting > default
 */
export function getEaseFactor(
  book: Book | null | undefined,
  settings: UserSettings
): number {
  return book?.settings?.initialEaseFactor
    || settings.defaultInitialEaseFactor
    || DEFAULT_EASE_FACTOR;
}

/**
 * Get remaining reviews for a book today.
 */
export function getRemainingReviews(
  bookId: string,
  book: Book | null | undefined,
  settings: UserSettings,
  dailyProgress: DailyProgress
): number {
  const dailyLimit = getDailyLimit(book, settings);
  const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
  return Math.max(0, dailyLimit - reviewsToday);
}

/**
 * Check if daily limit is reached for a book.
 */
export function isDailyLimitReached(
  bookId: string,
  book: Book | null | undefined,
  settings: UserSettings,
  dailyProgress: DailyProgress
): boolean {
  return getRemainingReviews(bookId, book, settings, dailyProgress) === 0;
}
