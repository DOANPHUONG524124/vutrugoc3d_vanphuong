import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeParallelogramVertices,
  computeRhombusVertices,
  computeSafePxPerCm,
  distance2D,
  getOutwardEdgeLabelPos,
  getOutwardVertexLabelPos,
  normalizeRotationDeg,
  rotateQuadVertices,
  calculateParallelogramPerimeter,
  calculateRhombusPerimeter,
  calculateSideFromRhombusPerimeter,
  calculateOtherSideFromParallelogramPerimeter,
  SHAPES_LAB_MISSIONS,
  evaluateShapesLabMission,
  SHAPES_LEVEL1_QUESTIONS,
  SHAPES_LEVEL2_QUESTIONS,
  getShapesQuestionsByLevel,
} from './shapesMath';
import { areSegmentsParallel } from './parallelMath';

test('computeParallelogramVertices creates exact opposite parallel and equal edges', () => {
  const pxPerCm = 24;
  const v = computeParallelogramVertices(6, 4, 65, 280, 175, pxPerCm);

  // Equal opposite sides
  assert.ok(Math.abs(distance2D(v.A, v.B) - 6 * pxPerCm) < 1e-6);
  assert.ok(Math.abs(distance2D(v.D, v.C) - 6 * pxPerCm) < 1e-6);
  assert.ok(Math.abs(distance2D(v.A, v.D) - 4 * pxPerCm) < 1e-6);
  assert.ok(Math.abs(distance2D(v.B, v.C) - 4 * pxPerCm) < 1e-6);

  // Opposite sides strictly parallel
  assert.equal(areSegmentsParallel(v.A, v.B, v.D, v.C), true);
  assert.equal(areSegmentsParallel(v.A, v.D, v.B, v.C), true);
});

test('computeRhombusVertices creates 4 strictly equal edges and 2 parallel opposite pairs', () => {
  const pxPerCm = 24;
  const v = computeRhombusVertices(5, 62, 280, 175, pxPerCm);

  for (const [p1, p2] of [
    [v.A, v.B],
    [v.B, v.C],
    [v.C, v.D],
    [v.D, v.A],
  ] as const) {
    assert.ok(Math.abs(distance2D(p1, p2) - 5 * pxPerCm) < 1e-6);
  }

  assert.equal(areSegmentsParallel(v.A, v.B, v.D, v.C), true);
  assert.equal(areSegmentsParallel(v.A, v.D, v.B, v.C), true);
});

test('rotateQuadVertices preserves exact edge lengths, parallelism, and outward label bounds across 0..360°', () => {
  assert.equal(normalizeRotationDeg(-30), 330);
  assert.equal(normalizeRotationDeg(390), 30);

  const center = { x: 280, y: 170 };
  const testAngles = [0, 37, 90, 135, 180, 270, 315];

  for (const rot of testAngles) {
    // Parallelogram rotation invariance
    const pxP = computeSafePxPerCm('parallelogram', 10, 8, 50, 112, 24);
    const baseP = computeParallelogramVertices(10, 8, 50, center.x, center.y, pxP);
    const rotP = rotateQuadVertices(baseP, rot, center.x, center.y);

    assert.ok(Math.abs(distance2D(rotP.A, rotP.B) - 10 * pxP) < 1e-6);
    assert.ok(Math.abs(distance2D(rotP.D, rotP.C) - 10 * pxP) < 1e-6);
    assert.ok(Math.abs(distance2D(rotP.A, rotP.D) - 8 * pxP) < 1e-6);
    assert.ok(Math.abs(distance2D(rotP.B, rotP.C) - 8 * pxP) < 1e-6);
    assert.equal(areSegmentsParallel(rotP.A, rotP.B, rotP.D, rotP.C), true);
    assert.equal(areSegmentsParallel(rotP.A, rotP.D, rotP.B, rotP.C), true);

    // Every rotated vertex fits inside maxRadiusPx + tiny tolerance
    for (const pt of [rotP.A, rotP.B, rotP.C, rotP.D]) {
      assert.ok(distance2D(pt, center) <= 112.1);
    }

    // Outward edge and vertex label positions stay strictly further from center than edge/vertex
    const edgeLbl = getOutwardEdgeLabelPos(rotP.A, rotP.B, center, 24);
    const midAB = { x: (rotP.A.x + rotP.B.x) / 2, y: (rotP.A.y + rotP.B.y) / 2 };
    assert.ok(distance2D(edgeLbl, center) > distance2D(midAB, center));

    const vLbl = getOutwardVertexLabelPos(rotP.A, center, 20);
    assert.ok(distance2D(vLbl, center) > distance2D(rotP.A, center));

    // Rhombus rotation invariance
    const pxR = computeSafePxPerCm('rhombus', 8, 8, 60, 112, 24);
    const baseR = computeRhombusVertices(8, 60, center.x, center.y, pxR);
    const rotR = rotateQuadVertices(baseR, rot, center.x, center.y);
    for (const [p1, p2] of [
      [rotR.A, rotR.B],
      [rotR.B, rotR.C],
      [rotR.C, rotR.D],
      [rotR.D, rotR.A],
    ] as const) {
      assert.ok(Math.abs(distance2D(p1, p2) - 8 * pxR) < 1e-6);
    }
    assert.equal(areSegmentsParallel(rotR.A, rotR.B, rotR.D, rotR.C), true);
    assert.equal(areSegmentsParallel(rotR.A, rotR.D, rotR.B, rotR.C), true);
  }
});

test('Grade 4 perimeter and inverse perimeter formulas are exact', () => {
  assert.equal(calculateParallelogramPerimeter(6, 4), 20);
  assert.equal(calculateParallelogramPerimeter(20, 15), 70);
  assert.equal(calculateRhombusPerimeter(7), 28);
  assert.equal(calculateRhombusPerimeter(15), 60);
  assert.equal(calculateSideFromRhombusPerimeter(32), 8);
  assert.equal(calculateOtherSideFromParallelogramPerimeter(30, 10), 5);
});

test('All 6 interactive slider missions match accurately when set to target dimensions', () => {
  assert.equal(SHAPES_LAB_MISSIONS.length, 6);
  for (const m of SHAPES_LAB_MISSIONS) {
    const okRes = evaluateShapesLabMission(m, m.targetSideA, m.targetSideB ?? m.targetSideA);
    assert.equal(okRes.isMatched, true, `Mission ${m.id} should match target values`);
    assert.equal(okRes.currentPerimeter, m.targetPerimeter);

    const wrongRes = evaluateShapesLabMission(m, m.targetSideA + 2, (m.targetSideB ?? m.targetSideA) + 1);
    assert.equal(wrongRes.isMatched, false, `Mission ${m.id} should reject mismatched values`);
  }
});

test('Topic 4 challenge banks have 10 questions per quiz level, zero forbidden symbols/citations, and no area questions', () => {
  assert.equal(SHAPES_LEVEL1_QUESTIONS.length, 10);
  assert.equal(SHAPES_LEVEL2_QUESTIONS.length, 10);
  assert.equal(getShapesQuestionsByLevel(1).length, 10);
  assert.equal(getShapesQuestionsByLevel(2).length, 10);

  const forbidden = /(Bài 31|Bài 29|Bài 30|SGK|Sách giáo khoa|Hoạt động [0-9]|Luyện tập [0-9]|\/\/|⊥|diện tích| & )/i;
  for (const q of [...SHAPES_LEVEL1_QUESTIONS, ...SHAPES_LEVEL2_QUESTIONS]) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctOptionIndex >= 0 && q.correctOptionIndex < 4);
    const joined = `${q.categoryLabelVi} ${q.badgeTitleVi} ${q.promptVi} ${q.explanationVi} ${q.options.join(' ')}`;
    assert.equal(forbidden.test(joined), false, `Found forbidden text/symbol in ${q.id}`);
  }
  for (const m of SHAPES_LAB_MISSIONS) {
    const joined = `${m.badgeVi} ${m.titleVi} ${m.promptVi} ${m.hintVi}`;
    assert.equal(forbidden.test(joined), false, `Found forbidden text/symbol in ${m.id}`);
  }
});
