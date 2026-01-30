import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { calculateNextReview, initializeCard } from './sm2';
import type { StudyCard } from '../types';

describe('SM-2 Algorithm', () => {
  let baseCard: StudyCard;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00'));

    baseCard = {
      id: 'test-card',
      highlightId: 'test-highlight',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('quality 1 (Again)', () => {
    it('resets repetitions to 0', () => {
      const card = { ...baseCard, repetitions: 3 };
      const result = calculateNextReview(card, 1);
      expect(result.repetitions).toBe(0);
    });

    it('sets interval to 1 day', () => {
      const result = calculateNextReview(baseCard, 1);
      expect(result.interval).toBe(1);
    });

    it('preserves ease factor', () => {
      const card = { ...baseCard, easeFactor: 2.0 };
      const result = calculateNextReview(card, 1);
      expect(result.easeFactor).toBe(2.0);
    });
  });

  describe('quality 2 (Hard)', () => {
    it('increments repetitions', () => {
      const result = calculateNextReview(baseCard, 2);
      expect(result.repetitions).toBe(1);
    });

    it('sets interval to 1 on first review', () => {
      const result = calculateNextReview(baseCard, 2);
      expect(result.interval).toBe(1);
    });

    it('sets interval to 3 on second review (shorter than Good)', () => {
      const card = { ...baseCard, repetitions: 1, interval: 1 };
      const result = calculateNextReview(card, 2);
      expect(result.interval).toBe(3);
    });

    it('decreases ease factor by 0.15', () => {
      const result = calculateNextReview(baseCard, 2);
      expect(result.easeFactor).toBe(2.35);
    });
  });

  describe('quality 3 (Good)', () => {
    it('increments repetitions', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.repetitions).toBe(1);
    });

    it('sets interval to 1 on first review', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.interval).toBe(1);
    });

    it('sets interval to 6 on second review', () => {
      const card = { ...baseCard, repetitions: 1, interval: 1 };
      const result = calculateNextReview(card, 3);
      expect(result.interval).toBe(6);
    });

    it('keeps ease factor unchanged', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.easeFactor).toBe(2.5);
    });
  });

  describe('quality 4 (Easy)', () => {
    it('increments repetitions', () => {
      const result = calculateNextReview(baseCard, 4);
      expect(result.repetitions).toBe(1);
    });

    it('increases ease factor by 0.15 (capped at 2.5)', () => {
      const card = { ...baseCard, easeFactor: 2.3 };
      const result = calculateNextReview(card, 4);
      expect(result.easeFactor).toBeCloseTo(2.45, 10);
    });
  });

  describe('ease factor bounds', () => {
    it('does not go below 1.3', () => {
      const card = { ...baseCard, easeFactor: 1.4 };
      const result = calculateNextReview(card, 2);
      expect(result.easeFactor).toBe(1.3);
    });

    it('does not exceed 2.5', () => {
      const card = { ...baseCard, easeFactor: 2.45 };
      const result = calculateNextReview(card, 4);
      expect(result.easeFactor).toBe(2.5);
    });
  });

  describe('next review date', () => {
    it('sets next review date to current date + interval days', () => {
      const card = { ...baseCard, repetitions: 1, interval: 1 };
      const result = calculateNextReview(card, 3);
      // interval becomes 6, so next review is 6 days from now
      const expectedDate = new Date('2026-02-05T12:00:00');
      expect(new Date(result.nextReviewDate).toDateString()).toBe(expectedDate.toDateString());
    });
  });

  describe('lastReviewedAt', () => {
    it('sets lastReviewedAt to current time', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.lastReviewedAt).toBe(new Date('2026-01-30T12:00:00').toISOString());
    });
  });
});

describe('initializeCard', () => {
  it('creates card with correct highlightId', () => {
    const card = initializeCard('highlight-123');
    expect(card.highlightId).toBe('highlight-123');
  });

  it('creates card with default ease factor of 2.5', () => {
    const card = initializeCard('highlight-123');
    expect(card.easeFactor).toBe(2.5);
  });

  it('creates card with 0 repetitions and interval', () => {
    const card = initializeCard('highlight-123');
    expect(card.repetitions).toBe(0);
    expect(card.interval).toBe(0);
  });

  it('generates unique ID', () => {
    const card = initializeCard('highlight-123');
    expect(card.id).toBeTruthy();
    expect(typeof card.id).toBe('string');
  });

  it('sets nextReviewDate to now (ready immediately)', () => {
    const now = new Date();
    const card = initializeCard('highlight-123');
    // Should be within a few ms of now
    const cardDate = new Date(card.nextReviewDate);
    expect(Math.abs(cardDate.getTime() - now.getTime())).toBeLessThan(100);
  });
});
