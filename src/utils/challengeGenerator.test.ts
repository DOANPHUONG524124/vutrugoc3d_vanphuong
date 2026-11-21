import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStarReward,
  computeOverallProgressPercent,
  generateChallengeQuestions,
  INITIAL_PROGRESS,
} from './challengeGenerator';

test('generateChallengeQuestions returns 15 valid diverse questions per level', () => {
  for (const level of [1, 2, 3] as const) {
    const questions = generateChallengeQuestions(level);
    assert.equal(questions.length, 15);
    const ids = new Set(questions.map((q) => q.id));
    assert.equal(ids.size, 15);
    for (const q of questions) {
      assert.equal(q.level, level);
      assert.ok(q.angleDeg >= 0 && q.angleDeg <= 180);
      assert.ok(q.explanationVi.length > 5);
      assert.ok(q.visualSpec && q.visualSpec.category);
    }

    // Verify clock and polygon questions exist in every level
    const categories = new Set(questions.map((q) => q.visualSpec.category));
    assert.ok(categories.has('clock'), `Level ${level} should contain clock questions`);
    assert.ok(categories.has('polygon'), `Level ${level} should contain polygon questions`);
    if (level === 1 || level === 2) {
      assert.ok(
        categories.has('count_angles'),
        `Level ${level} should contain angle counting questions`
      );
    }
  }
});

test('generateChallengeQuestions supports filtering by exercise category', () => {
  const clockQuestions = generateChallengeQuestions(1, 'clock');
  assert.ok(clockQuestions.length >= 3);
  for (const q of clockQuestions) {
    assert.equal(q.visualSpec.category, 'clock');
  }
});

test('calculateStarReward awards 0..3 stars accurately', () => {
  assert.equal(calculateStarReward(15, 15), 3);
  assert.equal(calculateStarReward(13, 15), 3);
  assert.equal(calculateStarReward(11, 15), 2);
  assert.equal(calculateStarReward(7, 15), 1);
  assert.equal(calculateStarReward(4, 15), 0);
});

test('computeOverallProgressPercent tracks completed sections', () => {
  assert.equal(computeOverallProgressPercent(INITIAL_PROGRESS), 0);
  const full = {
    ...INITIAL_PROGRESS,
    completedSections: {
      explore: true,
      lab: true,
      tutorial: true,
      library: true,
      level1: true,
      level2: true,
      level3: true,
    },
  };
  assert.equal(computeOverallProgressPercent(full), 100);
});

test('Level 1 questions match updated prompts and visualSpec flags', () => {
  const l1 = generateChallengeQuestions(1, 'all');
  assert.equal(
    l1[0].promptVi,
    'Quan sát mặt đồng hồ lúc 3 giờ đúng, vậy góc tạo bởi kim giờ và kim phút là góc gì?'
  );
  assert.equal(l1[0].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[1].promptVi,
    'Quan sát hình tứ giác ABCD bên cạnh. Trong hình có bao nhiêu GÓC VUÔNG?'
  );
  assert.equal(l1[1].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[2].promptVi,
    'Trong hình tứ giác ABCD, góc đỉnh D; cạnh DA, DC có số đo 120° được gọi là góc nào?'
  );
  assert.equal(l1[2].visualSpec.hide90DegreeLabelsInShape, true);

  assert.equal(
    l1[4].promptVi,
    'Quan sát hình tam giác ABC, hình tam giác này có bao nhiêu GÓC NHỌN?'
  );
  assert.equal(l1[4].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[5].promptVi,
    'Khi đồng hồ chỉ 4 giờ đúng, góc tạo bởi kim giờ và kim phút là góc gì?'
  );
  assert.equal(l1[5].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[6].promptVi,
    'Quan sát hình tứ giác PQRS bên cạnh và cho biết trong hình này có bao nhiêu GÓC TÙ và bao nhiêu GÓC NHỌN?'
  );
  assert.equal(l1[6].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[7].promptVi,
    'Góc tạo bởi kim giờ và kim phút lúc 6 giờ đúng là góc gì?'
  );
  assert.equal(l1[7].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[8].promptVi,
    'Quan sát hình tam giác MNP. Góc đỉnh M; cạnh MN, MP là góc gì?'
  );
  assert.equal(l1[8].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[9].promptVi,
    'Quan sát hình và cho biết góc đỉnh O; cạnh OA, OB là góc gì?'
  );
  assert.equal(l1[9].visualSpec.hideAllDegreesInShape, true);

  assert.equal(l1[11].promptVi, 'Hãy đọc tên góc có trong hình?');
  assert.equal(l1[11].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[12].promptVi,
    'Quan sát hình ngôi nhà ABCDE, trong hình có mấy góc tù?'
  );
  assert.equal(l1[12].options?.[l1[12].correctOptionIndex ?? 0], '3 góc tù');
  assert.equal(l1[12].visualSpec.hideAllDegreesInShape, true);

  assert.equal(
    l1[13].promptVi,
    'Khi đồng hồ chỉ 9 giờ đúng, kim giờ và kim phút tạo thành góc gì?'
  );
  assert.equal(l1[13].visualSpec.hideAllDegreesInShape, true);
  assert.equal(l1[13].visualSpec.hideAngleSymbolInShape, true);

  assert.equal(
    l1[14].promptVi,
    'Cánh tay Robot Toán học tạo thành góc đỉnh O; cạnh OA, OB bằng 135° đây là góc gì?'
  );
});

test('Level 2 questions match updated prompts and visualSpec flags', () => {
  const l2 = generateChallengeQuestions(2, 'all');
  assert.equal(
    l2[0].promptVi,
    'Hãy sắp xếp các góc tù, góc bẹt, góc nhọn, góc vuông theo thứ tự từ lớn đến bé.'
  );
  assert.equal(l2[0].visualSpec.hideDiagram, true);

  assert.equal(l2[1].promptVi, 'Góc bẹt gấp mấy lần góc vuông?');
  assert.equal(l2[1].visualSpec.shapePreset, 'straight_vs_right_angles');

  assert.ok(!l2[5].promptVi.includes('tia'));
  assert.ok(l2[5].promptVi.includes('cạnh OC'));
  assert.ok(l2[5].promptVi.includes('cạnh OD'));

  assert.equal(
    l2[6].promptVi,
    'Vào lúc 11 giờ đúng, kim giờ và kim phút của đồng hồ chỉ tạo thành góc 60 độ, vậy vào lúc 10 giờ đúng thì góc của kim giờ và kim phút tạo với nhau góc bao nhiêu độ?'
  );

  assert.equal(l2[7].promptVi, 'Trong hình có bao nhiêu góc tù, bao nhiêu góc nhọn?');
  assert.equal(l2[7].visualSpec.hideAllDegreesInShape, true);

  assert.equal(l2[9].visualSpec.shapePreset, 'compare_two_angles_op');

  assert.equal(l2[10].promptVi, 'Đơn vị để đo góc là gì?');

  assert.equal(l2[11].visualSpec.shapePreset, 'adjacent_supplementary_110_70');

  assert.equal(l2[12].visualSpec.showProtractorOnStandard, true);

  assert.equal(l2[13].promptVi, 'Điền vào chỗ trống: Góc …. đỉnh …. cạnh … và …..');
  assert.equal(l2[13].visualSpec.showDegreeAlways, true);
  assert.ok(l2[13].fillBlanksSpec);

  assert.equal(l2[14].visualSpec.hideDiagram, true);
});


