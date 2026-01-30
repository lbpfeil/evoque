import { describe, it, expect } from 'vitest';
import { calculateNextReview, initializeCard } from './sm2';
import type { StudyCard } from '../types';

// Quality values as used in the SM-2 implementation
const Quality = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
} as const;

describe('SM-2 Algorithm', () => {
  const createTestCard = (overrides: Partial<StudyCard> = {}): StudyCard => ({
    id: 'test-card-id',
    highlightId: 'test-highlight-id',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    ...overrides,
  });

  it('should export calculateNextReview function', () => {
    expect(typeof calculateNextReview).toBe('function');
  });

  it('should calculate next review for a new card with Good rating', () => {
    const card = createTestCard();
    const result = calculateNextReview(card, Quality.GOOD);

    expect(result).toBeDefined();
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1); // First review is always 1 day
    expect(result.easeFactor).toBe(2.5); // Good doesn't change ease factor
  });

  it('should reset repetitions on Again rating', () => {
    const card = createTestCard({
      repetitions: 3,
      interval: 10,
    });
    const result = calculateNextReview(card, Quality.AGAIN);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should increase ease factor on Easy rating', () => {
    const card = createTestCard({ repetitions: 2, interval: 6 });
    const result = calculateNextReview(card, Quality.EASY);

    expect(result.easeFactor).toBe(2.5); // Already at max, stays at 2.5
  });

  it('should decrease ease factor on Hard rating', () => {
    const card = createTestCard({ repetitions: 2, interval: 6 });
    const result = calculateNextReview(card, Quality.HARD);

    expect(result.easeFactor).toBe(2.35); // 2.5 - 0.15
  });

  it('should initialize a new card correctly', () => {
    const highlightId = 'test-highlight-123';
    const card = initializeCard(highlightId);

    expect(card.highlightId).toBe(highlightId);
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.repetitions).toBe(0);
    expect(card.id).toBeDefined();
  });
});
