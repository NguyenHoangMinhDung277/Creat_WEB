// SM-2 Spaced Repetition System (SRS) Scheduler

export const DEFAULT_SRS_STATE = {
  repetitions: 0,
  interval: 1, // in days
  easeFactor: 2.5,
  lastReviewedDate: null,
  nextReviewDate: null,
  totalReviews: 0,
  successfulReviews: 0
};

/**
 * Calculates new SRS parameters following the SM-2 algorithm.
 * @param {object} currentState - Existing SRS metadata for the card
 * @param {boolean} knewIt - True if the user remembered the item, false otherwise
 * @returns {object} Updated SRS metadata
 */
export function calculateSM2(currentState = {}, knewIt = true) {
  const current = {
    ...DEFAULT_SRS_STATE,
    ...currentState
  };

  // Convert binary choice to SM-2 quality grade (0 to 5)
  // knewIt -> grade 4 (good); didn't know -> grade 1 (blackout)
  const quality = knewIt ? 4 : 1;

  let { repetitions, interval, easeFactor, totalReviews, successfulReviews } = current;
  totalReviews += 1;

  if (quality >= 3) {
    successfulReviews += 1;
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Calculate new Ease Factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = new Date();
  const nextDate = new Date();
  nextDate.setDate(now.getDate() + interval);

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    lastReviewedDate: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    totalReviews,
    successfulReviews
  };
}

/**
 * Checks if a card is currently due for review.
 */
export function isCardDue(card) {
  if (!card || !card.srs || !card.srs.nextReviewDate) return true;
  return new Date(card.srs.nextReviewDate) <= new Date();
}
