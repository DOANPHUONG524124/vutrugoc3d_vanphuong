import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAngle,
  clampAngle,
  evaluateProtractorAlignment,
  polarToSvgCartesian,
  svgCartesianToMathDeg,
} from './angleMath';

test('classifyAngle accurately identifies acute, right, obtuse, straight, reflex, and full angles', () => {
  assert.equal(classifyAngle(30).id, 'acute');
  assert.equal(classifyAngle(45).nameVi, 'Góc nhọn');
  assert.equal(classifyAngle(90).id, 'right');
  assert.equal(classifyAngle(90).nameVi, 'Góc vuông');
  assert.equal(classifyAngle(120).id, 'obtuse');
  assert.equal(classifyAngle(135).nameVi, 'Góc tù');
  assert.equal(classifyAngle(180).id, 'straight');
  assert.equal(classifyAngle(180).nameVi, 'Góc bẹt');
  assert.equal(classifyAngle(240).id, 'reflex');
  assert.equal(classifyAngle(240).isCoreCurriculum, false);
  assert.equal(classifyAngle(360).id, 'full');
});

test('clampAngle restricts values to 0..180° range for semicircular protractor', () => {
  assert.equal(clampAngle(-25), 0);
  assert.equal(clampAngle(45.4), 45);
  assert.equal(clampAngle(180), 180);
  assert.equal(clampAngle(220), 180);
});

test('polarToSvgCartesian and svgCartesianToMathDeg are exact inverses for standard angles', () => {
  const stdAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  for (const deg of stdAngles) {
    const pt = polarToSvgCartesian(300, 250, 150, deg);
    const recovered = Math.round(svgCartesianToMathDeg(300, 250, pt.x, pt.y));
    assert.equal(recovered, deg);
  }
});

test('evaluateProtractorAlignment verifies center, baseline, and inner/outer scale readings', () => {
  const angle = {
    vertexX: 400,
    vertexY: 320,
    baseRayAngleDeg: 0,
    measureDeg: 60,
  };

  // Unaligned center
  const unaligned = evaluateProtractorAlignment(
    { x: 250, y: 200, rotationDeg: 0 },
    angle
  );
  assert.equal(unaligned.isCenterAligned, false);
  assert.equal(unaligned.isFullyAligned, false);

  // Aligned center and baseline at 0 deg -> inner scale reads 60, outer scale reads 120
  const alignedInner = evaluateProtractorAlignment(
    { x: 400, y: 320, rotationDeg: 0 },
    angle
  );
  assert.equal(alignedInner.isCenterAligned, true);
  assert.equal(alignedInner.isBaselineAligned, true);
  assert.equal(alignedInner.recommendedScale, 'inner');
  assert.equal(alignedInner.innerScaleReading, 60);
  assert.equal(alignedInner.outerScaleReading, 120);
  assert.equal(alignedInner.isFullyAligned, true);

  // Rotated protractor so left 0° mark (outer scale) aligns with Ray 2 at 60° (rotation = 60 - 180 = -120 => +60? Wait: left baseline is local 180°. If rotation = -120, local 180° is global 60°, and Ray 1 at 0° is local 120° on arc!)
  const alignedOuter = evaluateProtractorAlignment(
    { x: 400, y: 320, rotationDeg: -120 },
    angle
  );
  assert.equal(alignedOuter.isCenterAligned, true);
  assert.equal(alignedOuter.isBaselineAligned, true);
  assert.equal(alignedOuter.recommendedScale, 'outer');
  assert.equal(alignedOuter.outerScaleReading, 60);
  assert.equal(alignedOuter.isFullyAligned, true);
});
