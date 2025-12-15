import { StudyCard } from '../types';

/**
 * Calculates the next review schedule based on the SM-2 algorithm.
 * @param card Current state of the card
 * @param quality Response quality (1-4):
 *   - 1: Again (Fail) - Reset card
 *   - 2: Hard - Pass but difficult (reduced interval)
 *   - 3: Good - Pass normally
 *   - 4: Easy - Pass easily (increased interval)
 */
export const calculateNextReview = (
  card: StudyCard,
  quality: number
): StudyCard => {
  let { interval, repetitions, easeFactor } = card;

  if (quality >= 2) {
    // Correct response (Hard, Good, or Easy)
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      // Hard gets shorter interval than Good
      interval = quality === 2 ? 3 : 6;
    } else {
      interval = Math.round(interval * easeFactor);
      // Hard gets 1.2x multiplier instead of easeFactor
      if (quality === 2) {
        interval = Math.max(1, Math.round(interval * 1.2 / easeFactor));
      }
    }
    repetitions += 1;

    // Adjust ease factor based on quality
    if (quality === 4) {
      // Easy - increase ease factor
      easeFactor += 0.15;
    } else if (quality === 2) {
      // Hard - decrease ease factor
      easeFactor -= 0.15;
    }
    // Quality 3 (Good) - no change to ease factor
  } else {
    // Incorrect response (Again)
    repetitions = 0;
    interval = 1;
    // easeFactor stays the same for Again
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