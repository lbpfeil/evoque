import { StudyCard } from '../types';

/**
 * Calculates the next review schedule based on the SM-2 algorithm.
 * @param card Current state of the card
 * @param quality Response quality (1-4):
 *   - 1: Again (Fail) - Reset card
 *   - 2: Hard - Pass but difficult
 *   - 3: Good - Pass normally
 *   - 4: Easy - Pass easily
 */
export const calculateNextReview = (
  card: StudyCard,
  quality: number
): StudyCard => {
  let { interval, repetitions, easeFactor } = card;

  if (quality >= 3) {
    // Correct response (Good or Easy)
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;

    // Adjust ease factor based on quality
    if (quality === 4) {
      // Easy - increase ease factor
      easeFactor += 0.15;
    } else if (quality === 2) {
      // Hard - decrease ease factor (handled below for quality < 3)
      easeFactor -= 0.15;
    }
    // Quality 3 (Good) - no change to ease factor
  } else {
    // Incorrect response (Again or Hard with quality < 3)
    repetitions = 0;
    interval = 1;

    if (quality === 2) {
      // Hard - decrease ease factor but don't reset repetitions completely
      easeFactor -= 0.15;
    }
  }

  // Ensure ease factor stays within bounds
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 2.5) easeFactor = 2.5;

  // Calculate next date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
    lastReviewedAt: new Date().toISOString(),
  };
};

export const initializeCard = (highlightId: string): StudyCard => {
  return {
    id: crypto.randomUUID(),
    highlightId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(), // Ready immediately
  };
};