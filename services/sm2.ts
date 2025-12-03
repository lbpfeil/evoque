import { StudyCard } from '../types';

/**
 * Calculates the next review schedule based on the SM-2 algorithm.
 * @param card Current state of the card
 * @param quality Response quality (0-5). We simplify to: 
 *   - "Repeat" (Fail) -> Quality < 3
 *   - "Next" (Pass) -> Quality >= 4
 */
export const calculateNextReview = (
  card: StudyCard,
  quality: number
): StudyCard => {
  let { interval, repetitions, easeFactor } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

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