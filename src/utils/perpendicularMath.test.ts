import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePerpendicularLineEndpoints,
  computeSnapSetSquareState,
  distancePointToInfiniteLine,
  evaluateSetSquareAlignment,
  getLineMathAngleDeg,
  getPerpendicularQuestionsByLevel,
  PERPENDICULAR_CHALLENGES,
  PERPENDICULAR_CHECK_TASKS,
  PERPENDICULAR_DRAW_TASKS,
  PERPENDICULAR_LEVEL1_QUESTIONS,
  PERPENDICULAR_LEVEL2_QUESTIONS,
  PERPENDICULAR_LEVEL3_TASKS,
  projectPointOntoLine,
} from './perpendicularMath';

test('getLineMathAngleDeg returns accurate angles for horizontal, vertical, and slanted lines', () => {
  assert.equal(getLineMathAngleDeg({ p1: { x: 0, y: 100 }, p2: { x: 200, y: 100 } }), 0);
  assert.equal(getLineMathAngleDeg({ p1: { x: 100, y: 0 }, p2: { x: 100, y: 200 } }), 270);
  assert.equal(getLineMathAngleDeg({ p1: { x: 100, y: 200 }, p2: { x: 100, y: 0 } }), 90);
  const diag = getLineMathAngleDeg({ p1: { x: 0, y: 100 }, p2: { x: 100, y: 0 } });
  assert.ok(Math.abs(diag - 45) < 0.01);
});

test('distancePointToInfiniteLine and projectPointOntoLine work accurately', () => {
  const p1 = { x: 100, y: 200 };
  const p2 = { x: 500, y: 200 };
  const pt = { x: 320, y: 120 };
  assert.equal(distancePointToInfiniteLine(pt, p1, p2), 80);
  const foot = projectPointOntoLine(pt, p1, p2);
  assert.deepEqual(foot, { x: 320, y: 200 });
});

test('computeSnapSetSquareState produces fully aligned states for all 6 drawing tasks (Lab & Level 3)', () => {
  assert.equal(PERPENDICULAR_DRAW_TASKS.length, 5);
  assert.equal(PERPENDICULAR_LEVEL3_TASKS.length, 6);

  for (const task of PERPENDICULAR_LEVEL3_TASKS) {
    const snapped = computeSnapSetSquareState(task.line, task.targetPoint);
    const alignment = evaluateSetSquareAlignment(snapped, task.line, task.targetPoint);
    assert.equal(
      alignment.isLegOnLine,
      true,
      `Task ${task.id} leg should lie on base line (dist=${alignment.lineDistancePx}, err=${alignment.angleErrorDeg})`
    );
    assert.equal(
      alignment.isOtherLegAtPoint,
      true,
      `Task ${task.id} second leg should meet target point (err=${alignment.pointDistancePx})`
    );
    assert.equal(alignment.isFullyAligned, true, `Task ${task.id} should be fully aligned`);

    // Initial state should NOT already be aligned so students have to practice
    const initAlign = evaluateSetSquareAlignment(
      task.initialSetSquare,
      task.line,
      task.targetPoint
    );
    assert.equal(initAlign.isFullyAligned, false, `Task ${task.id} initial state should require movement`);
  }
});

test('computePerpendicularLineEndpoints creates a line orthogonal to the base line through targetPoint', () => {
  for (const task of PERPENDICULAR_LEVEL3_TASKS) {
    const { start, end, foot } = computePerpendicularLineEndpoints(task.line, task.targetPoint);
    const baseDx = task.line.p2.x - task.line.p1.x;
    const baseDy = task.line.p2.y - task.line.p1.y;
    const perpDx = end.x - start.x;
    const perpDy = end.y - start.y;
    const dot = baseDx * perpDx + baseDy * perpDy;
    assert.ok(Math.abs(dot) < 1e-4, `Perpendicular line for ${task.id} must be orthogonal (dot=${dot})`);
    assert.ok(
      distancePointToInfiniteLine(task.targetPoint, start, end) < 0.01,
      `Drawn line for ${task.id} must pass through targetPoint`
    );
    assert.ok(
      distancePointToInfiniteLine(foot, task.line.p1, task.line.p2) < 0.01,
      `Foot for ${task.id} must lie on base line`
    );
  }
});

test('3-level challenge banks and check tasks are complete and contain zero textbook source citations', () => {
  assert.equal(PERPENDICULAR_CHECK_TASKS.length, 3);
  assert.equal(PERPENDICULAR_LEVEL1_QUESTIONS.length, 10);
  assert.equal(PERPENDICULAR_LEVEL2_QUESTIONS.length, 10);
  assert.equal(getPerpendicularQuestionsByLevel(1).length, 10);
  assert.equal(getPerpendicularQuestionsByLevel(2).length, 10);
  assert.equal(PERPENDICULAR_CHALLENGES.length, 20);

  const forbidden = /(Bài 27|Bài 28|SGK|Sách giáo khoa|Hoạt động [0-9]|Luyện tập [0-9])/i;

  for (const task of PERPENDICULAR_LEVEL3_TASKS) {
    assert.ok(!forbidden.test(task.badgeVi), `Unexpected citation in ${task.badgeVi}`);
    assert.ok(!forbidden.test(task.titleVi), `Unexpected citation in ${task.titleVi}`);
    assert.ok(!forbidden.test(task.instructionVi), `Unexpected citation in ${task.instructionVi}`);
  }

  for (const shape of PERPENDICULAR_CHECK_TASKS) {
    assert.ok(!forbidden.test(shape.badgeVi), `Unexpected citation in ${shape.badgeVi}`);
    assert.ok(!forbidden.test(shape.titleVi), `Unexpected citation in ${shape.titleVi}`);
  }

  for (const q of PERPENDICULAR_CHALLENGES) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctOptionIndex >= 0 && q.correctOptionIndex < 4);
    assert.ok(q.explanationVi.length > 10);
    assert.ok(!forbidden.test(q.categoryLabelVi), `Unexpected citation in ${q.categoryLabelVi}`);
    assert.ok(!forbidden.test(q.promptVi), `Unexpected citation in ${q.promptVi}`);
    assert.ok(!forbidden.test(q.explanationVi), `Unexpected citation in ${q.explanationVi}`);
  }
});
