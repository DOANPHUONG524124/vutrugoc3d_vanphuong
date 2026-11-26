import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areSegmentsParallel,
  computeParallelGeometry,
  evaluateParallelStepAlignment,
  PARALLEL_DRAW_TASKS,
  PARALLEL_CHECK_SHAPES,
  PARALLEL_LEVEL1_QUESTIONS,
  PARALLEL_LEVEL2_QUESTIONS,
  getParallelQuestionsByLevel,
} from './parallelMath';

test('areSegmentsParallel accurately distinguishes parallel vs intersecting segments', () => {
  assert.equal(
    areSegmentsParallel({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 20, y: 50 }, { x: 180, y: 50 }),
    true
  );
  assert.equal(
    areSegmentsParallel({ x: 10, y: 10 }, { x: 110, y: 60 }, { x: 30, y: 90 }, { x: 130, y: 140 }),
    true
  );
  assert.equal(
    areSegmentsParallel({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 100 }),
    false
  );
  assert.equal(
    areSegmentsParallel({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 40 }, { x: 100, y: 60 }),
    false
  );
});

test('computeParallelGeometry yields true parallel lines and aligned snap states for all 5 drawing missions', () => {
  assert.equal(PARALLEL_DRAW_TASKS.length, 5);
  for (const task of PARALLEL_DRAW_TASKS) {
    const geom = computeParallelGeometry(task);

    // Drawn CD line must be strictly parallel to base line AB
    assert.equal(
      areSegmentsParallel(task.baseLine.p1, task.baseLine.p2, geom.parStart, geom.parEnd, 0.5),
      true,
      `Expected CD // AB for task ${task.id}`
    );

    // Step 1 snap aligns ê ke onto baseLine through targetPoint H
    const step1Check = evaluateParallelStepAlignment(geom.step1Snap, task, 1);
    assert.equal(step1Check.isFullyAligned, true, `Step 1 snap failed for ${task.id}`);

    // Step 2 snap aligns ê ke onto auxiliary perpendicular line MN through targetPoint H
    const step2Check = evaluateParallelStepAlignment(geom.step2Snap, task, 2);
    assert.equal(step2Check.isFullyAligned, true, `Step 2 snap failed for ${task.id}`);
  }
});

test('Multi-parallel check shapes include 1-to-2 and 1-to-3 parallel edge exercises', () => {
  assert.ok(PARALLEL_CHECK_SHAPES.length >= 4);
  const splitRect = PARALLEL_CHECK_SHAPES.find((s) => s.id === 'split_rect_amnd_mbcn');
  assert.ok(splitRect);
  assert.deepEqual(splitRect.expectedParallelEdgeIds, ['AD', 'BC']);

  const threePanes = PARALLEL_CHECK_SHAPES.find((s) => s.id === 'window_3_panes');
  assert.ok(threePanes);
  assert.equal(threePanes.expectedParallelEdgeIds.length, 3);
  assert.deepEqual(threePanes.expectedParallelEdgeIds, ['MN', 'PQ', 'BC']);
});

test('Topic 3 challenge banks have 12 questions per quiz level, diverse real-world & geometric shapes, and zero // or ⊥ symbols or textbook citations', () => {
  assert.equal(PARALLEL_LEVEL1_QUESTIONS.length, 12);
  assert.equal(PARALLEL_LEVEL2_QUESTIONS.length, 12);
  assert.equal(getParallelQuestionsByLevel(1).length, 12);
  assert.equal(getParallelQuestionsByLevel(2).length, 12);

  // Verify multiple Level 2 questions specifically teach 1-edge-parallel-to-many-edges
  const multiParallelQs = PARALLEL_LEVEL2_QUESTIONS.filter(
    (q) =>
      q.categoryLabelVi.includes('Mở Rộng') ||
      q.categoryLabelVi.includes('Nhiều Cạnh') ||
      q.categoryLabelVi.includes('3 Cạnh') ||
      q.promptVi.includes('những cạnh nào') ||
      q.promptVi.includes('bao nhiêu cạnh khác')
  );
  assert.ok(multiParallelQs.length >= 5, 'Expected at least 5 multi-parallel questions in Level 2');

  // Verify required shapes (parallelogram, trapezoid, rhombus) and real-world objects exist
  const allPresets = new Set(
    [...PARALLEL_LEVEL1_QUESTIONS, ...PARALLEL_LEVEL2_QUESTIONS].map((q) => q.diagramPreset)
  );
  for (const requiredPreset of [
    'parallelogram_abcd_q',
    'trapezoid_mnpq_q',
    'rhombus_abcd_q',
    'guitar_strings_real',
    'zebra_crossing_real',
    'bookshelf_real',
  ] as const) {
    assert.ok(allPresets.has(requiredPreset), `Missing required diagram preset: ${requiredPreset}`);
  }

  const forbidden = /(Bài 29|Bài 30|Bài 27|Bài 28|SGK|Sách giáo khoa|Hoạt động [0-9]|Luyện tập [0-9]|\/\/|⊥)/i;
  for (const q of [...PARALLEL_LEVEL1_QUESTIONS, ...PARALLEL_LEVEL2_QUESTIONS]) {
    assert.ok(q.options.length === 4);
    assert.ok(q.correctOptionIndex >= 0 && q.correctOptionIndex < 4);
    const joined = `${q.categoryLabelVi} ${q.badgeTitleVi} ${q.promptVi} ${q.explanationVi} ${q.options.join(' ')}`;
    assert.equal(forbidden.test(joined), false, `Found forbidden citation or symbol in ${q.id}`);
  }
  for (const task of PARALLEL_DRAW_TASKS) {
    const joined = `${task.badgeVi} ${task.titleVi} ${task.instructionStep1Vi} ${task.instructionStep2Vi}`;
    assert.equal(forbidden.test(joined), false, `Found forbidden citation or symbol in ${task.id}`);
  }
  for (const shape of PARALLEL_CHECK_SHAPES) {
    const joined = `${shape.badgeVi} ${shape.titleVi} ${shape.promptVi} ${shape.readingSummaryVi}`;
    assert.equal(forbidden.test(joined), false, `Found forbidden citation or symbol in ${shape.id}`);
  }
});
