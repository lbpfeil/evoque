import { describe, it, expect } from 'vitest';
import {
  getDailyLimit,
  getEaseFactor,
  getRemainingReviews,
  isDailyLimitReached
} from './settingsLogic';
import { DEFAULT_DAILY_LIMIT, DEFAULT_EASE_FACTOR } from './constants';
import type { Book, UserSettings, DailyProgress } from '../types';

describe('Settings Cascade Logic', () => {
  const defaultSettings: UserSettings = {
    maxReviewsPerDay: 15,
    newCardsPerDay: 10,
    defaultInitialEaseFactor: 2.3
  };

  const bookWithSettings: Book = {
    id: 'book-1',
    title: 'Test Book',
    author: 'Test Author',
    highlightCount: 10,
    lastImported: '2026-01-30',
    settings: {
      dailyReviewLimit: 5,
      initialEaseFactor: 2.0
    }
  };

  const bookWithoutSettings: Book = {
    id: 'book-2',
    title: 'Another Book',
    author: 'Another Author',
    highlightCount: 5,
    lastImported: '2026-01-30'
  };

  describe('getDailyLimit', () => {
    it('returns book setting when present', () => {
      expect(getDailyLimit(bookWithSettings, defaultSettings)).toBe(5);
    });

    it('returns global setting when book has no override', () => {
      expect(getDailyLimit(bookWithoutSettings, defaultSettings)).toBe(15);
    });

    it('returns default when book is null and global not set', () => {
      const emptySettings: UserSettings = { maxReviewsPerDay: 0, newCardsPerDay: 10 };
      expect(getDailyLimit(null, emptySettings)).toBe(DEFAULT_DAILY_LIMIT);
    });

    it('returns default when book is undefined', () => {
      const emptySettings: UserSettings = { maxReviewsPerDay: 0, newCardsPerDay: 10 };
      expect(getDailyLimit(undefined, emptySettings)).toBe(DEFAULT_DAILY_LIMIT);
    });
  });

  describe('getEaseFactor', () => {
    it('returns book setting when present', () => {
      expect(getEaseFactor(bookWithSettings, defaultSettings)).toBe(2.0);
    });

    it('returns global setting when book has no override', () => {
      expect(getEaseFactor(bookWithoutSettings, defaultSettings)).toBe(2.3);
    });

    it('returns default when both book and global not set', () => {
      const emptySettings: UserSettings = { maxReviewsPerDay: 10, newCardsPerDay: 10 };
      expect(getEaseFactor(null, emptySettings)).toBe(DEFAULT_EASE_FACTOR);
    });
  });

  describe('getRemainingReviews', () => {
    const dailyProgress: DailyProgress = {
      date: '2026-01-30',
      bookReviews: {
        'book-1': 3,
        'book-2': 10
      }
    };

    it('calculates remaining based on book limit', () => {
      // Book limit is 5, done 3, remaining is 2
      expect(getRemainingReviews('book-1', bookWithSettings, defaultSettings, dailyProgress)).toBe(2);
    });

    it('calculates remaining based on global limit when no book setting', () => {
      // Global limit is 15, done 10, remaining is 5
      expect(getRemainingReviews('book-2', bookWithoutSettings, defaultSettings, dailyProgress)).toBe(5);
    });

    it('returns 0 when limit exceeded (not negative)', () => {
      const progressOverLimit: DailyProgress = {
        date: '2026-01-30',
        bookReviews: { 'book-1': 10 }
      };
      // Book limit is 5, done 10, remaining is 0 (not -5)
      expect(getRemainingReviews('book-1', bookWithSettings, defaultSettings, progressOverLimit)).toBe(0);
    });

    it('returns full limit when no progress for book', () => {
      const emptyProgress: DailyProgress = { date: '2026-01-30', bookReviews: {} };
      expect(getRemainingReviews('book-1', bookWithSettings, defaultSettings, emptyProgress)).toBe(5);
    });
  });

  describe('isDailyLimitReached', () => {
    it('returns true when limit exactly reached', () => {
      const progress: DailyProgress = {
        date: '2026-01-30',
        bookReviews: { 'book-1': 5 }
      };
      expect(isDailyLimitReached('book-1', bookWithSettings, defaultSettings, progress)).toBe(true);
    });

    it('returns true when limit exceeded', () => {
      const progress: DailyProgress = {
        date: '2026-01-30',
        bookReviews: { 'book-1': 10 }
      };
      expect(isDailyLimitReached('book-1', bookWithSettings, defaultSettings, progress)).toBe(true);
    });

    it('returns false when under limit', () => {
      const progress: DailyProgress = {
        date: '2026-01-30',
        bookReviews: { 'book-1': 3 }
      };
      expect(isDailyLimitReached('book-1', bookWithSettings, defaultSettings, progress)).toBe(false);
    });

    it('returns false when no reviews done', () => {
      const progress: DailyProgress = { date: '2026-01-30', bookReviews: {} };
      expect(isDailyLimitReached('book-1', bookWithSettings, defaultSettings, progress)).toBe(false);
    });
  });
});
