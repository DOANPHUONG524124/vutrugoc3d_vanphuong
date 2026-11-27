import { computeOverallProgressPercent, PlayerProgress } from './challengeGenerator';

export type JourneyTopicId = 'angles' | 'perpendicular' | 'parallel' | 'shapes';

export type MilestoneStageKey = 'explore' | 'lab' | 'challenge' | 'guide';

export interface TopicMilestone {
  key: MilestoneStageKey;
  labelVi: string;
  screenId: string;
  done: boolean;
}

export interface TopicJourneySummary {
  id: JourneyTopicId;
  number: 1 | 2 | 3 | 4;
  titleVi: string;
  shortTitleVi: string;
  icon: string;
  accentColor: string;
  badgeBorderClass: string;
  barGradientClass: string;
  stars: number;
  milestones: TopicMilestone[];
  completedCount: number;
  totalCount: number;
  percent: number;
  isCompleted: boolean;
  completedDateVi?: string;
}

export interface CertificateAwardInfo {
  id: JourneyTopicId | 'all';
  badgeTitleVi: string;
  topicHeadingVi: string;
  achievementLineVi: string;
  praiseNoteVi: string;
  accentHex: string;
  secondaryHex: string;
}

export function formatVietnameseDate(date: Date = new Date()): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `Ngày ${d} tháng ${m} năm ${y}`;
}

export function computeAllTopicsJourneySummary(
  progress: PlayerProgress
): TopicJourneySummary[] {
  const topicStars = progress.topicStars ?? {
    angles: progress.stars,
    perpendicular: 0,
    parallel: 0,
    shapes: 0,
  };

  const rawTopics: Array<{
    id: JourneyTopicId;
    number: 1 | 2 | 3 | 4;
    titleVi: string;
    shortTitleVi: string;
    icon: string;
    accentColor: string;
    badgeBorderClass: string;
    barGradientClass: string;
    stars: number;
    milestones: TopicMilestone[];
  }> = [
    {
      id: 'angles',
      number: 1,
      titleVi: 'Chủ đề 1: Góc và Đo Góc',
      shortTitleVi: 'Góc và Đo Góc',
      icon: '📐',
      accentColor: '#FACC15',
      badgeBorderClass: 'border-yellow-400/70',
      barGradientClass: 'from-yellow-400 to-amber-500',
      stars: topicStars.angles ?? 0,
      milestones: [
        {
          key: 'explore',
          labelVi: '1. Khám phá trực quan',
          screenId: 'explore',
          done: Boolean(progress.completedSections.explore),
        },
        {
          key: 'lab',
          labelVi: '2. Phòng thực hành',
          screenId: 'lab',
          done: Boolean(progress.completedSections.lab),
        },
        {
          key: 'challenge',
          labelVi: '3. Thử thách vận dụng',
          screenId: 'challenge',
          done: Boolean(
            progress.completedSections.level1 ||
              progress.completedSections.level2 ||
              progress.completedSections.level3
          ),
        },
        {
          key: 'guide',
          labelVi: '4. Cẩm nang kiến thức',
          screenId: 'library',
          done: Boolean(
            progress.completedSections.library || progress.completedSections.tutorial
          ),
        },
      ],
    },
    {
      id: 'perpendicular',
      number: 2,
      titleVi: 'Chủ đề 2: Hai Đường Thẳng Vuông Góc',
      shortTitleVi: 'Hai Đường Thẳng Vuông Góc',
      icon: '➕',
      accentColor: '#34D399',
      badgeBorderClass: 'border-emerald-400/70',
      barGradientClass: 'from-emerald-400 to-teal-500',
      stars: topicStars.perpendicular ?? 0,
      milestones: [
        {
          key: 'explore',
          labelVi: '1. Khám phá trực quan',
          screenId: 'perp-explore',
          done: Boolean(progress.perpendicularSections?.explore),
        },
        {
          key: 'lab',
          labelVi: '2. Phòng thực hành',
          screenId: 'perp-lab',
          done: Boolean(progress.perpendicularSections?.lab),
        },
        {
          key: 'challenge',
          labelVi: '3. Thử thách vận dụng',
          screenId: 'perp-challenge',
          done: Boolean(progress.perpendicularSections?.challenge),
        },
        {
          key: 'guide',
          labelVi: '4. Cẩm nang kiến thức',
          screenId: 'perp-guide',
          done: Boolean(progress.perpendicularSections?.guide),
        },
      ],
    },
    {
      id: 'parallel',
      number: 3,
      titleVi: 'Chủ đề 3: Hai Đường Thẳng Song Song',
      shortTitleVi: 'Hai Đường Thẳng Song Song',
      icon: '🛤️',
      accentColor: '#38BDF8',
      badgeBorderClass: 'border-sky-400/70',
      barGradientClass: 'from-sky-400 to-blue-500',
      stars: topicStars.parallel ?? 0,
      milestones: [
        {
          key: 'explore',
          labelVi: '1. Khám phá trực quan',
          screenId: 'par-explore',
          done: Boolean(progress.parallelSections?.explore),
        },
        {
          key: 'lab',
          labelVi: '2. Phòng thực hành',
          screenId: 'par-lab',
          done: Boolean(progress.parallelSections?.lab),
        },
        {
          key: 'challenge',
          labelVi: '3. Thử thách vận dụng',
          screenId: 'par-challenge',
          done: Boolean(progress.parallelSections?.challenge),
        },
        {
          key: 'guide',
          labelVi: '4. Cẩm nang kiến thức',
          screenId: 'par-guide',
          done: Boolean(progress.parallelSections?.guide),
        },
      ],
    },
    {
      id: 'shapes',
      number: 4,
      titleVi: 'Chủ đề 4: Hình Thoi, Hình Bình Hành',
      shortTitleVi: 'Hình Thoi, Hình Bình Hành',
      icon: '🔷',
      accentColor: '#E879F9',
      badgeBorderClass: 'border-fuchsia-400/70',
      barGradientClass: 'from-fuchsia-400 to-pink-500',
      stars: topicStars.shapes ?? 0,
      milestones: [
        {
          key: 'explore',
          labelVi: '1. Khám phá trực quan',
          screenId: 'shapes-explore',
          done: Boolean(progress.shapesSections?.explore),
        },
        {
          key: 'lab',
          labelVi: '2. Phòng thực hành',
          screenId: 'shapes-lab',
          done: Boolean(progress.shapesSections?.lab),
        },
        {
          key: 'challenge',
          labelVi: '3. Thử thách vận dụng',
          screenId: 'shapes-challenge',
          done: Boolean(progress.shapesSections?.challenge),
        },
        {
          key: 'guide',
          labelVi: '4. Cẩm nang kiến thức',
          screenId: 'shapes-guide',
          done: Boolean(progress.shapesSections?.guide),
        },
      ],
    },
  ];

  return rawTopics.map((topic) => {
    const completedCount = topic.milestones.filter((m) => m.done).length;
    const totalCount = topic.milestones.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    return {
      ...topic,
      completedCount,
      totalCount,
      percent,
      isCompleted: completedCount === totalCount,
      completedDateVi: progress.completedTopicDates?.[topic.id],
    };
  });
}

export function computeJourneyTotals(progress: PlayerProgress): {
  overallPercent: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  totalStars: number;
  allTopicsCompleted: boolean;
} {
  const summaries = computeAllTopicsJourneySummary(progress);
  const completedTopicsCount = summaries.filter((s) => s.isCompleted).length;
  const sumTopicStars = summaries.reduce((acc, s) => acc + s.stars, 0);
  return {
    overallPercent: computeOverallProgressPercent(progress),
    completedTopicsCount,
    totalTopicsCount: summaries.length,
    totalStars: Math.max(progress.stars, sumTopicStars),
    allTopicsCompleted: completedTopicsCount === summaries.length,
  };
}

export function detectNewlyCompletedTopics(
  prev: PlayerProgress,
  next: PlayerProgress
): JourneyTopicId[] {
  const prevSummaries = computeAllTopicsJourneySummary(prev);
  const nextSummaries = computeAllTopicsJourneySummary(next);
  const newlyCompleted: JourneyTopicId[] = [];
  for (let i = 0; i < nextSummaries.length; i++) {
    if (!prevSummaries[i].isCompleted && nextSummaries[i].isCompleted) {
      newlyCompleted.push(nextSummaries[i].id);
    }
  }
  return newlyCompleted;
}

export function resetTopicProgress(
  progress: PlayerProgress,
  topicId: JourneyTopicId
): PlayerProgress {
  const baseTopicStars = progress.topicStars ?? {
    angles: progress.stars,
    perpendicular: 0,
    parallel: 0,
    shapes: 0,
  };
  const removedStars = baseTopicStars[topicId] ?? 0;
  const nextTopicStars = {
    ...baseTopicStars,
    [topicId]: 0,
  };
  const baseQuizSeeds = progress.topicQuizSeeds ?? {
    angles: 1,
    perpendicular: 1,
    parallel: 1,
    shapes: 1,
  };
  const nextTopicQuizSeeds = {
    ...baseQuizSeeds,
    [topicId]: (baseQuizSeeds[topicId] ?? 1) + 1,
  };
  const nextTotalStars = Math.max(0, progress.stars - removedStars);
  const nextDates = { ...(progress.completedTopicDates || {}) };
  delete nextDates[topicId];

  if (topicId === 'angles') {
    return {
      ...progress,
      stars: nextTotalStars,
      topicStars: nextTopicStars,
      topicQuizSeeds: nextTopicQuizSeeds,
      completedTopicDates: nextDates,
      measuredAnglesCount: 0,
      completedSections: {
        explore: false,
        lab: false,
        tutorial: false,
        library: false,
        level1: false,
        level2: false,
        level3: false,
      },
      highScores: {
        level1: 0,
        level2: 0,
        level3: 0,
      },
    };
  }

  if (topicId === 'perpendicular') {
    return {
      ...progress,
      stars: nextTotalStars,
      topicStars: nextTopicStars,
      topicQuizSeeds: nextTopicQuizSeeds,
      completedTopicDates: nextDates,
      perpendicularSections: {
        explore: false,
        lab: false,
        challenge: false,
        guide: false,
      },
    };
  }

  if (topicId === 'parallel') {
    return {
      ...progress,
      stars: nextTotalStars,
      topicStars: nextTopicStars,
      topicQuizSeeds: nextTopicQuizSeeds,
      completedTopicDates: nextDates,
      parallelSections: {
        explore: false,
        lab: false,
        challenge: false,
        guide: false,
      },
    };
  }

  return {
    ...progress,
    stars: nextTotalStars,
    topicStars: nextTopicStars,
    topicQuizSeeds: nextTopicQuizSeeds,
    completedTopicDates: nextDates,
    shapesSections: {
      explore: false,
      lab: false,
      challenge: false,
      guide: false,
    },
  };
}

export function getCertificateAwardCopy(
  target: JourneyTopicId | 'all'
): CertificateAwardInfo {
  switch (target) {
    case 'angles':
      return {
        id: 'angles',
        badgeTitleVi: 'NHÀ THÁM HIỂM GÓC XUẤT SẮC',
        topicHeadingVi: 'Chủ đề 1: Góc và Đo Góc',
        achievementLineVi:
          'Đã hoàn thành xuất sắc 4/4 nội dung khám phá, thực hành thước đo góc, thử thách vận dụng và cẩm nang kiến thức về Góc và Đo Góc.',
        praiseNoteVi:
          'Em đã biết nhận diện góc nhọn, góc vuông, góc tù, góc bẹt và sử dụng thành thạo thước đo góc!',
        accentHex: '#F59E0B',
        secondaryHex: '#2563EB',
      };
    case 'perpendicular':
      return {
        id: 'perpendicular',
        badgeTitleVi: 'KIẾN TRÚC SƯ VUÔNG GÓC TÀI BA',
        topicHeadingVi: 'Chủ đề 2: Hai Đường Thẳng Vuông Góc',
        achievementLineVi:
          'Đã hoàn thành xuất sắc 4/4 nội dung khám phá, thực hành kiểm tra và vẽ bằng thước Ê Ke, thử thách vận dụng và cẩm nang kiến thức.',
        praiseNoteVi:
          'Em đã nắm vững cách nhận biết, đọc tên và vẽ chuẩn xác hai đường thẳng vuông góc bằng thước Ê Ke!',
        accentHex: '#10B981',
        secondaryHex: '#0F766E',
      };
    case 'parallel':
      return {
        id: 'parallel',
        badgeTitleVi: 'KĨ SƯ ĐƯỜNG SONG SONG XUẤT SẮC',
        topicHeadingVi: 'Chủ đề 3: Hai Đường Thẳng Song Song',
        achievementLineVi:
          'Đã hoàn thành xuất sắc 4/4 nội dung khám phá, thực hành vẽ song song 2 bước bằng Ê Ke, thử thách vận dụng và cẩm nang kiến thức.',
        praiseNoteVi:
          'Em đã biết nhận diện nhiều cạnh song song trong thực tế, đọc tên chuẩn và vẽ hai đường thẳng song song bằng Ê Ke!',
        accentHex: '#0284C7',
        secondaryHex: '#4F46E5',
      };
    case 'shapes':
      return {
        id: 'shapes',
        badgeTitleVi: 'CHUYÊN GIA HÌNH THOI VÀ HÌNH BÌNH HÀNH',
        topicHeadingVi: 'Chủ đề 4: Hình Thoi, Hình Bình Hành',
        achievementLineVi:
          'Đã hoàn thành xuất sắc 4/4 nội dung khám phá, thực hành kéo cạnh và xoay hình 360°, thử thách vận dụng và cẩm nang Chu vi Lớp 4.',
        praiseNoteVi:
          'Em đã phân biệt chuẩn xác Hình bình hành, Hình thoi ở mọi hướng xoay và làm chủ công thức tính Chu vi Lớp 4!',
        accentHex: '#C026D3',
        secondaryHex: '#7C3AED',
      };
    case 'all':
      return {
        id: 'all',
        badgeTitleVi: 'CHINH PHỤC TOÀN BỘ VŨ TRỤ HÌNH HỌC LỚP 4',
        topicHeadingVi: 'Hoàn Thành Xuất Sắc Cả 4 Chủ Đề Hình Học Lớp 4',
        achievementLineVi:
          'Đã hoàn thành trọn vẹn 100% hành trình chinh phục cả 4 chủ đề: Góc và Đo Góc, Hai Đường Thẳng Vuông Góc, Hai Đường Thẳng Song Song, và Hình Thoi, Hình Bình Hành.',
        praiseNoteVi:
          'Chúc mừng Nhà Toán Học Nhí xuất sắc! Hãy tiếp tục giữ vững niềm yêu thích khám phá Toán học nhé!',
        accentHex: '#D97706',
        secondaryHex: '#4338CA',
      };
  }
}

export function stripVietnameseDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function buildCertificateFilename(
  target: JourneyTopicId | 'all',
  studentName?: string
): string {
  const topicSlugMap: Record<JourneyTopicId | 'all', string> = {
    angles: 'Chu_De_1_Goc_va_Do_Goc',
    perpendicular: 'Chu_De_2_Hai_Duong_Thang_Vuong_Goc',
    parallel: 'Chu_De_3_Hai_Duong_Thang_Song_Song',
    shapes: 'Chu_De_4_Hinh_Thoi_Hinh_Binh_Hanh',
    all: 'Toan_Bo_4_Chu_De_Hinh_Hoc_Lop_4',
  };
  const cleanName = studentName ? stripVietnameseDiacritics(studentName) : '';
  const suffix = cleanName ? `_${cleanName}` : '';
  return `Thong_Bao_Khen_Thuong_${topicSlugMap[target]}${suffix}.pdf`;
}
