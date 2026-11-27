import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeOverallProgressPercent,
  INITIAL_PROGRESS,
  PlayerProgress,
} from './challengeGenerator';
import {
  buildCertificateFilename,
  computeAllTopicsJourneySummary,
  computeJourneyTotals,
  detectNewlyCompletedTopics,
  getCertificateAwardCopy,
  resetTopicProgress,
} from './journeyProgress';

test('computeAllTopicsJourneySummary tracks all 4 topics independently with 4 stages each', () => {
  const initialSummaries = computeAllTopicsJourneySummary(INITIAL_PROGRESS);
  assert.equal(initialSummaries.length, 4);
  for (const s of initialSummaries) {
    assert.equal(s.completedCount, 0);
    assert.equal(s.totalCount, 4);
    assert.equal(s.percent, 0);
    assert.equal(s.isCompleted, false);
  }

  const partial: PlayerProgress = {
    ...INITIAL_PROGRESS,
    stars: 9,
    topicStars: { angles: 4, perpendicular: 2, parallel: 3, shapes: 0 },
    completedSections: {
      ...INITIAL_PROGRESS.completedSections,
      explore: true,
      lab: true,
      level1: true,
      library: true,
    },
    perpendicularSections: {
      explore: true,
      lab: true,
      challenge: false,
      guide: false,
    },
    parallelSections: {
      explore: true,
      lab: false,
      challenge: false,
      guide: false,
    },
    shapesSections: {
      explore: false,
      lab: false,
      challenge: false,
      guide: false,
    },
  };

  const summaries = computeAllTopicsJourneySummary(partial);
  assert.equal(summaries[0].percent, 100);
  assert.equal(summaries[0].isCompleted, true);
  assert.equal(summaries[0].stars, 4);

  assert.equal(summaries[1].percent, 50);
  assert.equal(summaries[1].isCompleted, false);
  assert.equal(summaries[1].stars, 2);

  assert.equal(summaries[2].percent, 25);
  assert.equal(summaries[2].stars, 3);

  assert.equal(summaries[3].percent, 0);
  assert.equal(summaries[3].stars, 0);

  // 7 / 16 = 43.75 -> 44%
  assert.equal(computeOverallProgressPercent(partial), 44);
  const totals = computeJourneyTotals(partial);
  assert.equal(totals.completedTopicsCount, 1);
  assert.equal(totals.totalTopicsCount, 4);
  assert.equal(totals.totalStars, 9);
  assert.equal(totals.allTopicsCompleted, false);
});

test('detectNewlyCompletedTopics fires only when a topic transitions from incomplete to 100%', () => {
  const before: PlayerProgress = {
    ...INITIAL_PROGRESS,
    shapesSections: {
      explore: true,
      lab: true,
      challenge: true,
      guide: false,
    },
  };
  const after: PlayerProgress = {
    ...before,
    shapesSections: {
      explore: true,
      lab: true,
      challenge: true,
      guide: true,
    },
  };

  assert.deepEqual(detectNewlyCompletedTopics(before, after), ['shapes']);
  // Already completed -> should not re-trigger
  assert.deepEqual(detectNewlyCompletedTopics(after, after), []);
});

test('buildCertificateFilename sanitizes Vietnamese names cleanly into PDF filenames', () => {
  assert.equal(
    buildCertificateFilename('angles', 'Nguyễn Minh Ánh'),
    'Thong_Bao_Khen_Thuong_Chu_De_1_Goc_va_Do_Goc_Nguyen_Minh_Anh.pdf'
  );
  assert.equal(
    buildCertificateFilename('shapes', ''),
    'Thong_Bao_Khen_Thuong_Chu_De_4_Hinh_Thoi_Hinh_Binh_Hanh.pdf'
  );
  assert.equal(
    buildCertificateFilename('all', 'Trần Đức Đạt'),
    'Thong_Bao_Khen_Thuong_Toan_Bo_4_Chu_De_Hinh_Hoc_Lop_4_Tran_Duc_Dat.pdf'
  );
});

test('getCertificateAwardCopy provides clean Grade 4 copy with zero forbidden symbols', () => {
  for (const id of ['angles', 'perpendicular', 'parallel', 'shapes', 'all'] as const) {
    const info = getCertificateAwardCopy(id);
    assert.ok(info.badgeTitleVi.length > 5);
    assert.ok(info.topicHeadingVi.length > 5);
    assert.ok(!info.achievementLineVi.includes('//'));
    assert.ok(!info.achievementLineVi.includes('⊥'));
    assert.ok(!info.achievementLineVi.includes('diện tích'));
  }
});

test('resetTopicProgress resets only the targeted topic and preserves all other topics and student info', () => {
  const full: PlayerProgress = {
    ...INITIAL_PROGRESS,
    stars: 16,
    topicStars: { angles: 5, perpendicular: 4, parallel: 3, shapes: 4 },
    studentName: 'Nguyễn Minh Anh',
    studentClass: '4A',
    completedTopicDates: {
      angles: 'Ngày 27 tháng 11 năm 2026',
      shapes: 'Ngày 27 tháng 11 năm 2026',
    },
    completedSections: {
      explore: true,
      lab: true,
      tutorial: true,
      library: true,
      level1: true,
      level2: true,
      level3: true,
    },
    measuredAnglesCount: 5,
    perpendicularSections: { explore: true, lab: true, challenge: true, guide: true },
    parallelSections: { explore: true, lab: true, challenge: true, guide: true },
    shapesSections: { explore: true, lab: true, challenge: true, guide: true },
  };

  const afterResetShapes = resetTopicProgress(full, 'shapes');
  const summaries = computeAllTopicsJourneySummary(afterResetShapes);
  assert.equal(summaries[0].isCompleted, true);
  assert.equal(summaries[1].isCompleted, true);
  assert.equal(summaries[2].isCompleted, true);
  assert.equal(summaries[3].isCompleted, false);
  assert.equal(summaries[3].percent, 0);
  assert.equal(summaries[3].stars, 0);
  assert.equal(afterResetShapes.stars, 12);
  assert.equal(afterResetShapes.studentName, 'Nguyễn Minh Anh');
  assert.equal(afterResetShapes.studentClass, '4A');
  assert.equal(afterResetShapes.completedTopicDates?.shapes, undefined);
  assert.equal(afterResetShapes.completedTopicDates?.angles, 'Ngày 27 tháng 11 năm 2026');
  assert.equal(afterResetShapes.topicQuizSeeds?.shapes, 2);
  assert.equal(afterResetShapes.topicQuizSeeds?.angles, 1);

  const afterResetAngles = resetTopicProgress(afterResetShapes, 'angles');
  const summaries2 = computeAllTopicsJourneySummary(afterResetAngles);
  assert.equal(summaries2[0].percent, 0);
  assert.equal(summaries2[0].stars, 0);
  assert.equal(afterResetAngles.measuredAnglesCount, 0);
  assert.equal(afterResetAngles.stars, 7);
  assert.equal(afterResetAngles.topicQuizSeeds?.angles, 2);
  assert.equal(afterResetAngles.topicQuizSeeds?.shapes, 2);
  assert.equal(summaries2[1].isCompleted, true);
  assert.equal(summaries2[2].isCompleted, true);
});

