/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Implements the standard BKT algorithm with tuned parameters
 * for per-question mastery updates in adaptive quizzes.
 * 
 * Parameters:
 *   P(L0) = 0.15  — Prior: slight initial knowledge
 *   P(T)  = 0.10  — Transit: 10% learning rate per opportunity
 *   P(G)  = 0.20  — Guess: 20% (4-option MCQ, slightly below random)
 *   P(S)  = 0.10  — Slip: 10% careless error rate
 */

const DEFAULTS = {
  pL0: 0.15,
  pT: 0.10,
  pG: 0.20,
  pS: 0.10,
  masteryThreshold: 0.90,
  minQuestions: 5
};

/**
 * Returns a copy of the default BKT parameters.
 */
function getDefaultParams() {
  return { ...DEFAULTS };
}

/**
 * Performs a single-step Bayesian update on the mastery probability.
 * 
 * @param {number} pL - Current mastery probability P(L) ∈ [0, 1]
 * @param {boolean} isCorrect - Whether the student answered correctly
 * @param {object} params - BKT parameters { pT, pG, pS }
 * @returns {number} Updated mastery probability
 */
function updateMastery(pL, isCorrect, params) {
  const { pT, pG, pS } = params;

  let posterior;
  if (isCorrect) {
    // P(L | correct) = P(correct | L) * P(L) / P(correct)
    const pCorrectGivenL = 1 - pS;
    const pCorrectGivenNotL = pG;
    const pCorrect = pCorrectGivenL * pL + pCorrectGivenNotL * (1 - pL);
    posterior = (pCorrectGivenL * pL) / pCorrect;
  } else {
    // P(L | incorrect) = P(incorrect | L) * P(L) / P(incorrect)
    const pIncorrectGivenL = pS;
    const pIncorrectGivenNotL = 1 - pG;
    const pIncorrect = pIncorrectGivenL * pL + pIncorrectGivenNotL * (1 - pL);
    posterior = (pIncorrectGivenL * pL) / pIncorrect;
  }

  // Learning transition: chance of learning from this opportunity
  const pLNew = posterior + (1 - posterior) * pT;

  // Clamp to [0, 1]
  return Math.min(Math.max(pLNew, 0), 1);
}

/**
 * Replays a full answer history and computes the final mastery state.
 * 
 * @param {Array<{correct: boolean}>} history - Ordered answer history
 * @param {object} params - BKT parameters including pL0
 * @returns {{ pL: number, totalOpportunities: number, correctCount: number }}
 */
function computeMasteryFromHistory(history, params) {
  let pL = params.pL0 || DEFAULTS.pL0;
  let correctCount = 0;

  for (const entry of history) {
    if (entry.correct) correctCount++;
    pL = updateMastery(pL, entry.correct, params);
  }

  return {
    pL,
    totalOpportunities: history.length,
    correctCount
  };
}

/**
 * Checks if the mastery probability exceeds the threshold.
 * 
 * @param {number} pL - Current mastery probability
 * @param {number} [threshold] - Mastery threshold (default 0.90)
 * @returns {boolean}
 */
function isMastered(pL, threshold) {
  return pL >= (threshold || DEFAULTS.masteryThreshold);
}

/**
 * Determines whether the adaptive quiz should stop.
 * Requires both minimum questions answered AND mastery threshold met.
 * 
 * @param {number} pL - Current mastery probability
 * @param {number} questionsAnswered - Number of questions answered so far
 * @param {object} params - Parameters with masteryThreshold and minQuestions
 * @returns {boolean}
 */
function shouldStopQuiz(pL, questionsAnswered, params) {
  const threshold = params.masteryThreshold || DEFAULTS.masteryThreshold;
  const minQ = params.minQuestions || DEFAULTS.minQuestions;
  return questionsAnswered >= minQ && pL >= threshold;
}

module.exports = {
  DEFAULTS,
  getDefaultParams,
  updateMastery,
  computeMasteryFromHistory,
  isMastered,
  shouldStopQuiz
};
