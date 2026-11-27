export interface ShufflableQuizQuestion {
  id?: string;
  options?: string[];
  correctOptionIndex?: number;
  alsoAcceptOptionIndex?: number;
}

/**
 * Deterministic Mulberry32 PRNG returning values in [0, 1).
 */
export function createSeededRng(seed: number): () => number {
  let state = (Math.imul(Math.floor(seed) ^ 0x9e3779b9, 0x85ebca6b) >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pure Fisher-Yates shuffle that never mutates the input array.
 */
export function shuffleArray<T>(
  items: readonly T[],
  seedOrRng: number | (() => number)
): T[] {
  const rng = typeof seedOrRng === 'number' ? createSeededRng(seedOrRng) : seedOrRng;
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Shuffles a single question's answer options and accurately remaps
 * `correctOptionIndex` and `alsoAcceptOptionIndex` to their new positions.
 */
export function shuffleQuestionOptions<Q extends ShufflableQuizQuestion>(
  question: Q,
  rng: () => number
): Q {
  if (!question.options || question.options.length < 2) {
    return { ...question };
  }

  const indexed = question.options.map((text, origIdx) => ({ text, origIdx }));
  const shuffled = shuffleArray(indexed, rng);
  const nextOptions = shuffled.map((entry) => entry.text);

  const nextCorrectIndex =
    question.correctOptionIndex !== undefined
      ? shuffled.findIndex((entry) => entry.origIdx === question.correctOptionIndex)
      : undefined;

  const nextAlsoAcceptIndex =
    question.alsoAcceptOptionIndex !== undefined
      ? shuffled.findIndex((entry) => entry.origIdx === question.alsoAcceptOptionIndex)
      : undefined;

  return {
    ...question,
    options: nextOptions,
    correctOptionIndex:
      nextCorrectIndex !== undefined && nextCorrectIndex >= 0
        ? nextCorrectIndex
        : question.correctOptionIndex,
    ...(question.alsoAcceptOptionIndex !== undefined
      ? {
          alsoAcceptOptionIndex:
            nextAlsoAcceptIndex !== undefined && nextAlsoAcceptIndex >= 0
              ? nextAlsoAcceptIndex
              : question.alsoAcceptOptionIndex,
        }
      : {}),
  };
}

/**
 * Computes a well-separated integer seed from topic restart seed, level, replay count, and topic salt.
 */
export function computeQuizSeed(
  topicSeed: number,
  level: number,
  attemptNonce: number,
  topicSalt: number
): number {
  const s1 = Math.imul((topicSeed || 1) + 17, 2654435761);
  const s2 = Math.imul(level + 3, 2246822519);
  const s3 = Math.imul(attemptNonce + 5, 3266489917);
  const s4 = Math.imul(topicSalt + 11, 668265263);
  return ((s1 ^ s2 ^ s3 ^ s4) >>> 0) + 1;
}

/**
 * Shuffles both the order of questions AND each question's answer choices (A/B/C/D),
 * ensuring balanced distribution of correct answer positions across A/B/C/D.
 */
export function shuffleQuizQuestions<Q extends ShufflableQuizQuestion>(
  questions: readonly Q[],
  seed: number
): Q[] {
  if (questions.length === 0) return [];

  const originalIds = questions.map((q, idx) => q.id ?? String(idx));

  for (let attempt = 0; attempt < 8; attempt++) {
    const rng = createSeededRng(seed + attempt * 7919);
    const ordered = shuffleArray(questions, rng);
    const result = ordered.map((q) => shuffleQuestionOptions(q, rng));

    // If there are multiple questions, ensure the question order actually changed on retry
    const orderUnchanged =
      questions.length >= 2 &&
      result.every((q, idx) => (q.id ?? String(idx)) === originalIds[idx]);
    if (orderUnchanged && attempt < 7) {
      continue;
    }

    // For MCQ batches with >= 4 questions, ensure answers are well-spread across A/B/C/D
    const mcqQuestions = result.filter(
      (q) => q.options && q.options.length >= 3 && q.correctOptionIndex !== undefined
    );
    if (mcqQuestions.length >= 4) {
      const uniqueCorrectPositions = new Set(mcqQuestions.map((q) => q.correctOptionIndex));
      const indexZeroCount = mcqQuestions.filter((q) => q.correctOptionIndex === 0).length;
      if (
        (uniqueCorrectPositions.size < 3 || indexZeroCount > Math.ceil(mcqQuestions.length * 0.45)) &&
        attempt < 7
      ) {
        continue;
      }
    }

    return result;
  }

  // Fallback (unreachable unless degenerate)
  const rng = createSeededRng(seed + 99991);
  return shuffleArray(questions, rng).map((q) => shuffleQuestionOptions(q, rng));
}
