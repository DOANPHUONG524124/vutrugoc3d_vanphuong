import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChallengeQuestions } from './challengeGenerator';
import { getPerpendicularQuestionsByLevel } from './perpendicularMath';
import { getParallelQuestionsByLevel } from './parallelMath';
import { getShapesQuestionsByLevel } from './shapesMath';
import { computeQuizSeed, shuffleArray, shuffleQuizQuestions } from './quizShuffle';

test('shuffleQuizQuestions preserves exact answer text and remaps correctOptionIndex & alsoAcceptOptionIndex', () => {
  const sample = [
    {
      id: 'q1',
      options: ['Đúng 1', 'Sai 1A', 'Sai 1B', 'Sai 1C'],
      correctOptionIndex: 0,
    },
    {
      id: 'q2',
      options: ['Đúng 2A', 'Đúng 2B', 'Sai 2A', 'Sai 2B'],
      correctOptionIndex: 0,
      alsoAcceptOptionIndex: 1,
    },
    {
      id: 'q3',
      options: ['Sai 3A', 'Đúng 3', 'Sai 3B', 'Sai 3C'],
      correctOptionIndex: 1,
    },
    {
      id: 'q4',
      options: ['Đúng 4', 'Sai 4A', 'Sai 4B', 'Sai 4C'],
      correctOptionIndex: 0,
    },
  ];

  const shuffled = shuffleQuizQuestions(sample, 42);
  assert.equal(shuffled.length, sample.length);

  for (const orig of sample) {
    const match = shuffled.find((q) => q.id === orig.id);
    assert.ok(match, `Missing question ${orig.id}`);
    assert.deepEqual([...(match.options ?? [])].sort(), [...orig.options].sort());
    assert.equal(
      match.options?.[match.correctOptionIndex ?? -1],
      orig.options[orig.correctOptionIndex]
    );
    if (orig.alsoAcceptOptionIndex !== undefined) {
      assert.equal(
        match.options?.[match.alsoAcceptOptionIndex ?? -1],
        orig.options[orig.alsoAcceptOptionIndex]
      );
    }
  }
});

test('Topics 2, 3, and 4 MCQ banks produce varied A/B/C/D correct answers after shuffling (never all A)', () => {
  const banks: Array<{
    name: string;
    qs: ReadonlyArray<{ id: string; options: string[]; correctOptionIndex: number }>;
    salt: number;
  }> = [
    { name: 'Topic 2 L1', qs: getPerpendicularQuestionsByLevel(1), salt: 201 },
    { name: 'Topic 2 L2', qs: getPerpendicularQuestionsByLevel(2), salt: 202 },
    { name: 'Topic 3 L1', qs: getParallelQuestionsByLevel(1), salt: 301 },
    { name: 'Topic 3 L2', qs: getParallelQuestionsByLevel(2), salt: 302 },
    { name: 'Topic 4 L1', qs: getShapesQuestionsByLevel(1), salt: 401 },
    { name: 'Topic 4 L2', qs: getShapesQuestionsByLevel(2), salt: 402 },
  ];

  for (const bank of banks) {
    const seed = computeQuizSeed(1, 1, 0, bank.salt);
    const shuffled = shuffleQuizQuestions(bank.qs, seed);
    assert.equal(shuffled.length, bank.qs.length, `${bank.name} count mismatch`);

    const correctPositions = new Set(shuffled.map((q) => q.correctOptionIndex));
    assert.ok(
      correctPositions.size >= 3,
      `${bank.name} should distribute correct answers across >= 3 choices, got ${[...correctPositions].join(',')}`
    );

    const aCount = shuffled.filter((q) => q.correctOptionIndex === 0).length;
    assert.ok(
      aCount < shuffled.length * 0.6,
      `${bank.name} still has too many A answers (${aCount}/${shuffled.length})`
    );

    // Every single question's correct option text must still equal the original correct answer text
    for (const orig of bank.qs) {
      const found = shuffled.find((q) => q.id === orig.id);
      assert.ok(found, `${bank.name} missing ${orig.id}`);
      assert.equal(
        found.options[found.correctOptionIndex],
        orig.options[orig.correctOptionIndex],
        `${bank.name} remapped wrong answer for ${orig.id}`
      );
    }
  }
});

test('Topic 1 questions including fill-blanks and Level 3 measurement shuffle safely', () => {
  for (const level of [1, 2, 3] as const) {
    const raw = generateChallengeQuestions(level, 'all');
    const seed = computeQuizSeed(1, level, 0, 101);
    const shuffled = shuffleQuizQuestions(raw, seed);
    assert.equal(shuffled.length, raw.length);

    for (const orig of raw) {
      const found = shuffled.find((q) => q.id === orig.id);
      assert.ok(found);
      if (orig.options && orig.correctOptionIndex !== undefined) {
        assert.equal(
          found.options?.[found.correctOptionIndex ?? -1],
          orig.options[orig.correctOptionIndex]
        );
      }
      if (orig.options && orig.alsoAcceptOptionIndex !== undefined) {
        assert.equal(
          found.options?.[found.alsoAcceptOptionIndex ?? -1],
          orig.options[orig.alsoAcceptOptionIndex]
        );
      }
    }
  }
});

test('Incrementing topic quiz seed on restart reshuffles both question order and option positions', () => {
  const raw = getShapesQuestionsByLevel(1);
  const run1 = shuffleQuizQuestions(raw, computeQuizSeed(1, 1, 0, 401));
  const run2 = shuffleQuizQuestions(raw, computeQuizSeed(2, 1, 0, 401));
  const run3 = shuffleQuizQuestions(raw, computeQuizSeed(3, 1, 0, 401));

  const order1 = run1.map((q) => q.id).join(',');
  const order2 = run2.map((q) => q.id).join(',');
  const order3 = run3.map((q) => q.id).join(',');

  assert.notEqual(order1, order2, 'Restart 1->2 should produce a new question order');
  assert.notEqual(order2, order3, 'Restart 2->3 should produce a new question order');

  // Verify at least several questions also got different option orders between run1 and run2
  let changedOptionOrders = 0;
  for (const q1 of run1) {
    const q2 = run2.find((q) => q.id === q1.id)!;
    if (q1.options.join('|') !== q2.options.join('|')) {
      changedOptionOrders++;
    }
  }
  assert.ok(
    changedOptionOrders >= 5,
    `Expected >= 5 questions to change option ordering on restart, got ${changedOptionOrders}`
  );
});

test('shuffleArray does not mutate original array and changes order across seeds', () => {
  const base = ['t1', 't2', 't3', 't4', 't5', 't6'];
  const s1 = shuffleArray(base, 11);
  const s2 = shuffleArray(base, 22);
  assert.deepEqual(base, ['t1', 't2', 't3', 't4', 't5', 't6']);
  assert.deepEqual([...s1].sort(), [...base].sort());
  assert.notEqual(s1.join(','), s2.join(','));
});
