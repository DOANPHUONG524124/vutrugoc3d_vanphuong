import React, { useEffect, useState } from 'react';
import {
  classifyAngle,
  evaluateProtractorAlignment,
  polarToSvgCartesian,
  ProtractorState,
} from '../utils/angleMath';
import {
  calculateStarReward,
  ChallengeExerciseCategory,
  ChallengeLevel,
  ChallengeQuestion,
  generateChallengeQuestions,
} from '../utils/challengeGenerator';
import { computeQuizSeed, shuffleQuizQuestions } from '../utils/quizShuffle';
import { soundFX } from '../utils/soundEffects';
import { SemicircleProtractorSVG } from './SemicircleProtractorSVG';

interface ChallengeGameViewProps {
  quizSeed?: number;
  onFinishChallengeLevel: (level: ChallengeLevel, score: number, starsEarned: number) => void;
  onAngleChangeFor3D: (deg: number) => void;
  onBackHome: () => void;
}

const CATEGORY_FILTERS: Array<{
  id: ChallengeExerciseCategory;
  labelVi: string;
}> = [
  { id: 'all', labelVi: '🌟 Tất cả dạng bài (15 câu/cấp)' },
  { id: 'clock', labelVi: '🕒 Góc kim đồng hồ' },
  { id: 'polygon', labelVi: '📐 Góc tam giác và tứ giác' },
  { id: 'count_angles', labelVi: '🔢 Đếm số lượng góc trong hình' },
  { id: 'standard', labelVi: '🧭 Góc hai tia cơ bản' },
];

export const ChallengeGameView: React.FC<ChallengeGameViewProps> = ({
  quizSeed = 1,
  onFinishChallengeLevel,
  onAngleChangeFor3D,
  onBackHome,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>(1);
  const [categoryFilter, setCategoryFilter] = useState<ChallengeExerciseCategory>('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(240);
  const [attemptNonce, setAttemptNonce] = useState<number>(0);

  const [questions, setQuestions] = useState<ChallengeQuestion[]>(() =>
    shuffleQuizQuestions(
      generateChallengeQuestions(1, 'all'),
      computeQuizSeed(quizSeed, 1, 0, 101)
    )
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredState, setAnsweredState] = useState<{
    isCorrect: boolean;
    selectedIdx?: number;
    submittedDeg?: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Level 3 interactive protractor state
  const [lvl3Protractor, setLvl3Protractor] = useState<ProtractorState>({
    x: 280,
    y: 230,
    rotationDeg: -10,
  });
  const [lvl3InputDeg, setLvl3InputDeg] = useState<string>('');
  const [fillBlanksInput, setFillBlanksInput] = useState<{
    angleType: string;
    vertex: string;
    side1: string;
    side2: string;
  }>({ angleType: '', vertex: '', side1: '', side2: '' });

  const currentQuestion = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (isPlaying && currentQuestion) {
      onAngleChangeFor3D(currentQuestion.angleDeg);
    }
  }, [isPlaying, currentQuestion, onAngleChangeFor3D]);

  // Optional countdown timer
  useEffect(() => {
    if (!isPlaying || !useTimer || isGameOver) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, useTimer, isGameOver]);

  const startLevel = (
    lvl: ChallengeLevel,
    cat: ChallengeExerciseCategory = categoryFilter
  ) => {
    soundFX.playClick(1.15);
    const nextAttempt = attemptNonce + 1;
    setAttemptNonce(nextAttempt);
    const qList = shuffleQuizQuestions(
      generateChallengeQuestions(lvl, cat),
      computeQuizSeed(quizSeed, lvl, nextAttempt, 101)
    );
    setSelectedLevel(lvl);
    setCategoryFilter(cat);
    setQuestions(qList);
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setAnsweredState(null);
    setIsGameOver(false);
    setSecondsLeft(240);
    setLvl3Protractor({ x: 260, y: 220, rotationDeg: -10 });
    setLvl3InputDeg('');
    setFillBlanksInput({ angleType: '', vertex: '', side1: '', side2: '' });
    setIsPlaying(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (answeredState) return;
    const isCorrect =
      optionIndex === currentQuestion.correctOptionIndex ||
      (currentQuestion.alsoAcceptOptionIndex !== undefined &&
        optionIndex === currentQuestion.alsoAcceptOptionIndex);
    if (currentQuestion.fillBlanksSpec) {
      if (isCorrect) {
        setFillBlanksInput({
          angleType: currentQuestion.fillBlanksSpec.angleTypeAnswer,
          vertex: currentQuestion.fillBlanksSpec.vertexAnswer,
          side1: currentQuestion.fillBlanksSpec.side1Answer,
          side2: currentQuestion.fillBlanksSpec.side2Answer,
        });
      }
    }
    if (isCorrect) {
      soundFX.playSuccess();
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    } else {
      soundFX.playWrong();
    }
    setAnsweredState({ isCorrect, selectedIdx: optionIndex });
  };

  const handleSubmitFillBlanks = () => {
    if (answeredState || !currentQuestion.fillBlanksSpec) return;
    const spec = currentQuestion.fillBlanksSpec;
    const normType = fillBlanksInput.angleType.trim().toLowerCase().replace(/^góc\s+/i, '');
    const normVertex = fillBlanksInput.vertex.trim().toUpperCase();
    const normS1 = fillBlanksInput.side1.trim().toUpperCase();
    const normS2 = fillBlanksInput.side2.trim().toUpperCase();

    const typeOk = normType === spec.angleTypeAnswer.toLowerCase() || normType === 'tu';
    const vertexOk = normVertex === spec.vertexAnswer.toUpperCase();
    const sidesOk =
      (normS1 === spec.side1Answer.toUpperCase() && normS2 === spec.side2Answer.toUpperCase()) ||
      (normS1 === spec.side2Answer.toUpperCase() && normS2 === spec.side1Answer.toUpperCase());

    const isCorrect = typeOk && vertexOk && sidesOk;
    if (isCorrect) {
      soundFX.playSuccess();
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    } else {
      soundFX.playWrong();
    }
    setAnsweredState({
      isCorrect,
      selectedIdx: isCorrect ? (currentQuestion.correctOptionIndex ?? 0) : -1,
    });
  };

  const handleSubmitLevel3Measurement = () => {
    if (answeredState) return;
    const target = currentQuestion.targetMeasureDeg ?? currentQuestion.angleDeg;
    const val = Number(lvl3InputDeg.trim());
    if (!lvl3InputDeg.trim() || Number.isNaN(val)) {
      soundFX.playWrong();
      return;
    }
    const isCorrect = Math.abs(val - target) <= 1;
    if (isCorrect) {
      soundFX.playSuccess();
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    } else {
      soundFX.playWrong();
    }
    setAnsweredState({ isCorrect, submittedDeg: val });
  };

  const handleNextQuestion = () => {
    soundFX.playClick();
    if (currentIdx + 1 >= questions.length) {
      const finalStars = calculateStarReward(correctCount, questions.length);
      onFinishChallengeLevel(selectedLevel, score, finalStars);
      setIsGameOver(true);
      soundFX.playSuccess();
    } else {
      setCurrentIdx((idx) => idx + 1);
      setAnsweredState(null);
      setLvl3InputDeg('');
      setFillBlanksInput({ angleType: '', vertex: '', side1: '', side2: '' });
      setLvl3Protractor({ x: 250, y: 215, rotationDeg: 0 });
    }
  };

  const handleJumpToQuestion = (index: number) => {
    soundFX.playClick();
    setCurrentIdx(index);
    setAnsweredState(null);
    setLvl3InputDeg('');
    setFillBlanksInput({ angleType: '', vertex: '', side1: '', side2: '' });
    setLvl3Protractor({ x: 250, y: 215, rotationDeg: 0 });
  };

  // Level Selection Hub
  if (!isPlaying) {
    const levelCards: Array<{
      lvl: ChallengeLevel;
      planetVi: string;
      titleVi: string;
      descVi: string;
      colorClass: string;
      badgeText: string;
      highlightsVi: string[];
    }> = [
      {
        lvl: 1,
        planetVi: 'HÀNH TINH 1 · TRẠM SAO THỦY',
        titleVi: 'CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ',
        descVi:
          'Nhận diện Góc nhọn, Góc vuông, Góc tù, Góc bẹt trên mặt đồng hồ, trong hình tam giác, tứ giác và đếm số lượng các loại góc.',
        colorClass: 'border-yellow-400',
        badgeText: '15 câu hỏi đa dạng',
        highlightsVi: [
          '🕒 Nhận biết góc tạo bởi kim giờ và kim phút',
          '📐 Phân loại góc trong hình tam giác, tứ giác',
          '🔢 Đếm số góc vuông, góc nhọn, góc tù, góc bẹt',
        ],
      },
      {
        lvl: 2,
        planetVi: 'HÀNH TINH 2 · VÀNH ĐAI SAO MỘC',
        titleVi: 'CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ',
        descVi:
          'Tính số đo góc giữa hai kim đồng hồ, tìm số đo góc trong hình tam giác và tứ giác, tổng hợp số lượng góc trong hình phức hợp.',
        colorClass: 'border-pink-500',
        badgeText: '15 câu hỏi tư duy số đo',
        highlightsVi: [
          '🕒 Tính số đo độ (°) của góc kim đồng hồ',
          '📐 Tìm số đo góc của hình tam giác, hình tứ giác',
          '🔢 Xác định số lượng các loại góc trong 1 hình',
        ],
      },
      {
        lvl: 3,
        planetVi: 'HÀNH TINH 3 · TINH VÂN THƯỚC ĐO 180°',
        titleVi: 'CẤP ĐỘ 3 – BẬC THẦY ĐO GÓC',
        descVi:
          'Trực tiếp kéo thước đo góc để đo góc giữa kim giờ và kim phút, đo góc của hình tam giác và hình tứ giác!',
        colorClass: 'border-emerald-400',
        badgeText: '15 thử thách đo thực tế',
        highlightsVi: [
          '🕒 Đặt thước đo trực tiếp góc trên mặt đồng hồ',
          '📐 Đo góc tại các đỉnh của hình tam giác, tứ giác',
          '🧭 Căn chỉnh tâm thước và xoay vạch 0° chuẩn xác',
        ],
      },
    ];

    return (
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              THỬ THÁCH NHÀ TOÁN HỌC VŨ TRỤ
            </h1>
            <p className="text-sm text-indigo-200">
              Ngân hàng 45 bài tập tương tác đa dạng (15 câu/cấp): Góc kim đồng hồ, Góc tam giác và tứ giác, Đếm số lượng góc trong hình!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-yellow-300 bg-indigo-950/90 px-3.5 py-2 rounded-xl border border-indigo-500/40 cursor-pointer">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="accent-pink-500 w-4 h-4"
              />
              <span>⏱️ Bật đồng hồ đếm ngược (4 phút)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onBackHome();
              }}
              className="btn-3d-cobalt px-4 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
            >
              ← Trang chủ
            </button>
          </div>
        </div>

        {/* Exercise Topic Filter Strip */}
        <div className="card-3d-cosmic rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-yellow-300">
            🎯 Chọn chủ đề bài tập muốn rèn luyện:
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCategoryFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                  categoryFilter === f.id
                    ? 'btn-3d-pink text-white'
                    : 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-900/70'
                }`}
              >
                {f.labelVi}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levelCards.map((c) => (
            <div
              key={c.lvl}
              className={`card-3d-cosmic rounded-2xl p-5 flex flex-col justify-between gap-4 border-2 ${c.colorClass}`}
            >
              <div className="space-y-2.5">
                <div className="text-xs font-extrabold text-indigo-300">{c.planetVi}</div>
                <h2 className="text-xl font-extrabold text-white">{c.titleVi}</h2>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">{c.descVi}</p>
                <ul className="space-y-1.5 pt-1">
                  {c.highlightsVi.map((item) => (
                    <li
                      key={item}
                      className="text-xs font-semibold text-indigo-200 bg-indigo-950/70 px-2.5 py-1.5 rounded-lg border border-indigo-500/20"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-yellow-300">
                  ⭐ Phần thưởng tối đa: 3 Sao Vàng · {c.badgeText}
                </div>
                <button
                  type="button"
                  onClick={() => startLevel(c.lvl, categoryFilter)}
                  className="btn-3d-pink w-full py-3 rounded-xl font-extrabold text-sm text-white cursor-pointer"
                >
                  🚀 Bắt đầu Cấp độ {c.lvl}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Summary Modal when all questions are completed
  if (isGameOver) {
    const starsEarned = calculateStarReward(correctCount, questions.length);
    const maxScore = questions.length * 10;
    return (
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="card-3d-cosmic rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-5 border-2 border-yellow-400">
          <div className="text-xs font-extrabold text-indigo-300">
            BẢNG TỔNG KẾT HÀNH TRÌNH · CẤP ĐỘ {selectedLevel}
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            {starsEarned >= 2 ? '🎉 CHÚC MỪNG NHÀ TOÁN HỌC NHÍ!' : '💪 CỐ GẮNG LÊN NHÉ!'}
          </h2>

          {/* 3D Star Display */}
          <div className="flex items-center justify-center gap-3 text-5xl py-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={s <= starsEarned ? 'text-yellow-400 drop-shadow-lg' : 'text-slate-700'}
              >
                ★
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">ĐIỂM SỐ</div>
              <div className="text-2xl font-extrabold font-mono-num text-yellow-300">
                {score} / {maxScore}
              </div>
            </div>
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">SỐ CÂU ĐÚNG</div>
              <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                {correctCount} / {questions.length}
              </div>
            </div>
            <div className="bg-indigo-950/90 rounded-2xl p-3.5 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 font-bold">SAO THƯỞNG</div>
              <div className="text-2xl font-extrabold font-mono-num text-pink-400">
                +{starsEarned} ★
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
            <button
              type="button"
              onClick={() => startLevel(selectedLevel, categoryFilter)}
              className="btn-3d-pink flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white cursor-pointer"
            >
              ⟲ Chơi lại Cấp độ {selectedLevel}
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="btn-3d-gold flex-1 py-3 px-5 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🪐 Chọn Cấp độ khác
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-cobalt py-3 px-5 rounded-xl font-bold text-sm text-white cursor-pointer"
            >
              ← Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showDegreeInDiagram =
    selectedLevel === 1 ||
    Boolean(answeredState) ||
    Boolean(currentQuestion.visualSpec.showDegreeAlways) ||
    (!currentQuestion.visualSpec.hideTargetDegreeInShape &&
      currentQuestion.questionType !== 'estimate_measure');

  const lvl3AngleModel = {
    vertexX: 430,
    vertexY: 360,
    baseRayAngleDeg: currentQuestion.baseRayAngleDeg,
    measureDeg: currentQuestion.angleDeg,
  };
  const lvl3Alignment = evaluateProtractorAlignment(lvl3Protractor, lvl3AngleModel);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3.5">
      {/* Top Status HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-extrabold text-yellow-300 text-sm sm:text-base">
            {currentQuestion.planetNameVi}
          </span>
          <span className="text-indigo-300">·</span>
          <span className="font-mono-num text-sm font-bold text-white">
            Câu {currentIdx + 1} / {questions.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900/90 border border-indigo-400/40 text-xs font-extrabold text-cyan-300">
            {currentQuestion.visualSpec.categoryLabelVi}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {useTimer && (
            <span className="font-mono-num text-sm font-extrabold text-pink-300">
              ⏱️ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          )}
          <span className="font-mono-num text-sm font-extrabold text-emerald-300">
            Điểm: {score} / {questions.length * 10}
          </span>
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="btn-3d-cobalt px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            Đổi cấp độ / Chủ đề
          </button>
        </div>
      </div>

      {/* Quick Question Number Strip (1..15) so students can see and explore all 15 varied exercises */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/75 border border-indigo-500/30">
        <span className="text-xs font-bold text-indigo-300 mr-1">Danh sách câu hỏi:</span>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            onClick={() => handleJumpToQuestion(idx)}
            className={`w-7 h-7 rounded-lg font-mono-num text-xs font-extrabold cursor-pointer transition-all ${
              idx === currentIdx
                ? 'bg-pink-500 text-white border border-white scale-105'
                : 'bg-indigo-900/70 text-indigo-200 hover:bg-indigo-800 border border-indigo-500/30'
            }`}
            title={`${idx + 1}. ${q.visualSpec.badgeTitleVi}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Content */}
      {selectedLevel === 3 ? (
        /* LEVEL 3: Interactive 180° Protractor Measurement (Clock, Triangle, Quadrilateral, Two-Ray) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8">
            <SemicircleProtractorSVG
              angleState={lvl3AngleModel}
              protractorState={lvl3Protractor}
              alignment={lvl3Alignment}
              showMeasureValue={Boolean(answeredState)}
              allowDragRay={false}
              allowDragProtractor={true}
              visualContext={currentQuestion.visualSpec}
              onChangeProtractor={setLvl3Protractor}
            />
          </div>

          <div className="lg:col-span-4 card-3d-cosmic rounded-2xl p-4 flex flex-col gap-3.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-yellow-300">
              <span>{currentQuestion.visualSpec.categoryLabelVi}</span>
              <span>·</span>
              <span>{currentQuestion.visualSpec.badgeTitleVi}</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
              {currentQuestion.promptVi}
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setLvl3Protractor({
                    x: lvl3AngleModel.vertexX,
                    y: lvl3AngleModel.vertexY,
                    rotationDeg: lvl3AngleModel.baseRayAngleDeg,
                  });
                }}
                className="btn-3d-gold flex-1 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                🎯 Đặt tâm thước và Khớp vạch 0°
              </button>
              <button
                type="button"
                onClick={() =>
                  setLvl3Protractor((p) => ({ ...p, rotationDeg: p.rotationDeg + 5 }))
                }
                className="btn-3d-cobalt px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                ↺ +5°
              </button>
              <button
                type="button"
                onClick={() =>
                  setLvl3Protractor((p) => ({ ...p, rotationDeg: p.rotationDeg - 5 }))
                }
                className="btn-3d-cobalt px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                ↻ -5°
              </button>
            </div>

            <div className="bg-[#090621] p-3.5 rounded-xl border border-indigo-500/40 flex flex-col gap-2">
              <label htmlFor="lvl3-answer-input" className="text-xs font-bold text-indigo-200">
                Nhập số đo góc em đo được bằng thước 180° (°):
              </label>
              <div className="flex gap-2">
                <input
                  id="lvl3-answer-input"
                  type="number"
                  min={0}
                  max={180}
                  disabled={Boolean(answeredState)}
                  value={lvl3InputDeg}
                  onChange={(e) => setLvl3InputDeg(e.target.value)}
                  placeholder="Nhập số độ..."
                  className="w-full rounded-lg bg-slate-900 border border-indigo-400/50 px-3 py-2 text-sm font-mono-num text-white"
                />
                {!answeredState && (
                  <button
                    type="button"
                    onClick={handleSubmitLevel3Measurement}
                    className="btn-3d-emerald px-4 py-2 rounded-lg text-xs font-extrabold text-white cursor-pointer whitespace-nowrap"
                  >
                    Chốt đáp án
                  </button>
                )}
              </div>
            </div>

            {answeredState && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  answeredState.isCorrect
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-rose-950/90 border-rose-400 text-rose-100'
                }`}
              >
                <div className="font-extrabold text-sm">
                  {answeredState.isCorrect
                    ? '🎆 CHÍNH XÁC! Pháo hoa chúc mừng bạn!'
                    : `❌ Chưa chính xác (Bạn nhập ${answeredState.submittedDeg}°)`}
                </div>
                <p>{currentQuestion.explanationVi}</p>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-3d-pink w-full py-2.5 rounded-xl font-extrabold text-xs text-white cursor-pointer mt-2"
                >
                  {currentIdx + 1 >= questions.length ? 'Xem Bảng Tổng Kết →' : 'Câu tiếp theo →'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LEVEL 1 & LEVEL 2: Visual Diagram (Clock / Polygon / Count Angles / Standard) + Multiple Choice */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center card-3d-cosmic rounded-2xl p-5">
          {/* Left Visual Diagram (hidden when visualSpec.hideDiagram is true) */}
          {!currentQuestion.visualSpec.hideDiagram && (
            <div className="md:col-span-5 bg-[#090621] rounded-2xl border border-indigo-500/40 p-3">
              <ChallengeQuestionDiagramSVG
                question={currentQuestion}
                showDegreeInDiagram={showDegreeInDiagram}
              />
            </div>
          )}

          {/* Right Prompt & Options */}
          <div
            className={`${
              currentQuestion.visualSpec.hideDiagram ? 'md:col-span-12' : 'md:col-span-7'
            } flex flex-col gap-4`}
          >
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-yellow-300">
              <span>{currentQuestion.visualSpec.categoryLabelVi}</span>
              <span>·</span>
              <span>{currentQuestion.visualSpec.badgeTitleVi}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {currentQuestion.promptVi}
            </h2>

            {currentQuestion.fillBlanksSpec && (
              <div className="bg-[#090621] p-4 rounded-xl border border-indigo-400/50 flex flex-col gap-3">
                <div className="text-xs font-bold text-cyan-300">
                  ✍️ Nhập trực tiếp vào chỗ trống hoặc chọn nhanh đáp án bên dưới:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-extrabold text-white">
                  <span>Góc</span>
                  <input
                    type="text"
                    disabled={Boolean(answeredState)}
                    value={fillBlanksInput.angleType}
                    onChange={(e) =>
                      setFillBlanksInput((prev) => ({ ...prev, angleType: e.target.value }))
                    }
                    placeholder="tù / nhọn..."
                    aria-label="Loại góc"
                    className="w-24 rounded-lg bg-slate-900 border border-yellow-400/70 px-2.5 py-1.5 text-center text-yellow-300 font-extrabold text-sm"
                  />
                  <span>đỉnh</span>
                  <input
                    type="text"
                    disabled={Boolean(answeredState)}
                    value={fillBlanksInput.vertex}
                    onChange={(e) =>
                      setFillBlanksInput((prev) => ({ ...prev, vertex: e.target.value }))
                    }
                    placeholder="O"
                    aria-label="Tên đỉnh"
                    className="w-16 rounded-lg bg-slate-900 border border-yellow-400/70 px-2.5 py-1.5 text-center text-yellow-300 font-extrabold text-sm"
                  />
                  <span>cạnh</span>
                  <input
                    type="text"
                    disabled={Boolean(answeredState)}
                    value={fillBlanksInput.side1}
                    onChange={(e) =>
                      setFillBlanksInput((prev) => ({ ...prev, side1: e.target.value }))
                    }
                    placeholder="OA"
                    aria-label="Cạnh thứ nhất"
                    className="w-20 rounded-lg bg-slate-900 border border-yellow-400/70 px-2.5 py-1.5 text-center text-yellow-300 font-extrabold text-sm"
                  />
                  <span>và</span>
                  <input
                    type="text"
                    disabled={Boolean(answeredState)}
                    value={fillBlanksInput.side2}
                    onChange={(e) =>
                      setFillBlanksInput((prev) => ({ ...prev, side2: e.target.value }))
                    }
                    placeholder="OB"
                    aria-label="Cạnh thứ hai"
                    className="w-20 rounded-lg bg-slate-900 border border-yellow-400/70 px-2.5 py-1.5 text-center text-yellow-300 font-extrabold text-sm"
                  />
                  {!answeredState && (
                    <button
                      type="button"
                      onClick={handleSubmitFillBlanks}
                      className="btn-3d-emerald px-4 py-1.5 rounded-lg text-xs font-extrabold text-white cursor-pointer"
                    >
                      Kiểm tra
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = answeredState?.selectedIdx === idx;
                const isRightOption =
                  idx === currentQuestion.correctOptionIndex ||
                  (currentQuestion.alsoAcceptOptionIndex !== undefined &&
                    idx === currentQuestion.alsoAcceptOptionIndex &&
                    isSelected);

                let btnStyle =
                  'bg-[#171142] hover:bg-indigo-900/90 border-indigo-500/40 text-white';
                if (answeredState) {
                  if (isRightOption) {
                    btnStyle = 'bg-emerald-600 border-emerald-300 text-white';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-600 border-rose-300 text-white';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={Boolean(answeredState)}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 rounded-xl font-extrabold text-sm text-left border-2 transition-transform cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answeredState && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  answeredState.isCorrect
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-rose-950/90 border-rose-400 text-rose-100'
                }`}
              >
                <div>
                  <div className="font-extrabold mb-1">
                    {answeredState.isCorrect
                      ? '🎆 CHÍNH XÁC! +10 Điểm và Pháo Hoa Vũ Trụ!'
                      : '💡 Giải thích kiến thức:'}
                  </div>
                  <p>{currentQuestion.explanationVi}</p>
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-3d-pink px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  {currentIdx + 1 >= questions.length ? 'Xem Tổng Kết →' : 'Câu tiếp theo →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChallengeQuestionDiagramSVGProps {
  question: ChallengeQuestion;
  showDegreeInDiagram: boolean;
}

const ChallengeQuestionDiagramSVG: React.FC<ChallengeQuestionDiagramSVGProps> = ({
  question,
  showDegreeInDiagram,
}) => {
  const { visualSpec, angleDeg, baseRayAngleDeg } = question;
  const cls = classifyAngle(angleDeg);

  // 1. ANALOG CLOCK FACE DIAGRAM
  if (visualSpec.kind === 'clock') {
    const cx = 190;
    const cy = 128;
    const clockR = 84;
    const hourHandLen = 52;
    const minuteHandLen = 70;

    const rayHour = polarToSvgCartesian(cx, cy, hourHandLen, baseRayAngleDeg);
    const rayMinute = polarToSvgCartesian(cx, cy, minuteHandLen, baseRayAngleDeg + angleDeg);
    const arcR = 32;
    const arcStart = polarToSvgCartesian(cx, cy, arcR, baseRayAngleDeg);
    const arcEnd = polarToSvgCartesian(cx, cy, arcR, baseRayAngleDeg + angleDeg);
    const clkSqSize = 20;
    const clkSq1 = polarToSvgCartesian(cx, cy, clkSqSize, baseRayAngleDeg);
    const clkSq2 = polarToSvgCartesian(clkSq1.x, clkSq1.y, clkSqSize, baseRayAngleDeg + 90);
    const clkSq3 = polarToSvgCartesian(cx, cy, clkSqSize, baseRayAngleDeg + 90);
    const labelPos = polarToSvgCartesian(cx, cy, 42, baseRayAngleDeg + angleDeg / 2);

    return (
      <svg viewBox="0 0 380 235" className="w-full h-60 select-none">
        <rect x="0" y="0" width="380" height="235" fill="#090621" />
        {/* Top Badge */}
        <g transform="translate(10, 8)">
          <rect
            x="0"
            y="0"
            width="230"
            height="24"
            rx="7"
            fill="rgba(15, 23, 42, 0.95)"
            stroke="rgba(250, 204, 21, 0.6)"
            strokeWidth="1.2"
          />
          <text
            x="115"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FEF08A"
            fontSize="11"
            fontWeight="800"
          >
            {visualSpec.badgeTitleVi}
          </text>
        </g>

        {/* Clock Dial Outer Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={clockR + 6}
          fill="#1E1B4B"
          stroke="#FACC15"
          strokeWidth="3.5"
        />
        <circle cx={cx} cy={cy} r={clockR} fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />

        {/* Angle Symbol between Hands: Crisp Square for 90°, Sector Arc for non-90° */}
        {!visualSpec.hideAngleSymbolInShape &&
          (angleDeg === 90 ? (
            <path
              d={`M ${cx} ${cy} L ${clkSq1.x} ${clkSq1.y} L ${clkSq2.x} ${clkSq2.y} L ${clkSq3.x} ${clkSq3.y} Z`}
              fill="rgba(34, 197, 94, 0.34)"
              stroke="#22C55E"
              strokeWidth={2.2}
              strokeLinejoin="miter"
            />
          ) : (
            <path
              d={`M ${cx} ${cy} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y} Z`}
              fill={cls.colorHex}
              fillOpacity={0.32}
              stroke={cls.colorHex}
              strokeWidth={2}
            />
          ))}

        {/* Clock Numbers 1..12 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
          const deg = 90 - num * 30;
          const pt = polarToSvgCartesian(cx, cy, clockR - 14, deg);
          const t1 = polarToSvgCartesian(cx, cy, clockR - 2, deg);
          const t2 = polarToSvgCartesian(cx, cy, clockR - 6, deg);
          return (
            <g key={`clk-${num}`}>
              <line
                x1={t1.x}
                y1={t1.y}
                x2={t2.x}
                y2={t2.y}
                stroke="#94A3B8"
                strokeWidth={num % 3 === 0 ? 2 : 1}
              />
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={num % 3 === 0 ? '#FEF08A' : '#E2E8F0'}
                fontSize={num % 3 === 0 ? '12' : '10'}
                fontWeight="800"
                className="font-mono-num"
              >
                {num}
              </text>
            </g>
          );
        })}

        {/* Hour Hand */}
        <line
          x1={cx}
          y1={cy}
          x2={rayHour.x}
          y2={rayHour.y}
          stroke="#FACC15"
          strokeWidth={5.5}
          strokeLinecap="round"
        />
        {/* Minute Hand */}
        <line
          x1={cx}
          y1={cy}
          x2={rayMinute.x}
          y2={rayMinute.y}
          stroke="#38BDF8"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5.5} fill="#FF2E93" stroke="#FFFFFF" strokeWidth={1.5} />

        {/* Degree Measure Inside Corner Near Center (omitted when hideAllDegreesInShape is true) */}
        {!visualSpec.hideAllDegreesInShape && (
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            stroke="#090621"
            strokeWidth="4"
            paintOrder="stroke"
            fontSize="13"
            fontWeight="800"
            className="font-mono-num"
          >
            {showDegreeInDiagram ? `${angleDeg}°` : '?°'}
          </text>
        )}

        {/* Legend at bottom */}
        <text x="190" y="226" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="700">
          Kim ngắn (Vàng): Kim giờ · Kim dài (Xanh): Kim phút
        </text>
      </svg>
    );
  }

  // 2. POLYGON OR MULTI-ANGLE SHAPE DIAGRAM
  if (visualSpec.kind === 'polygon_measure' || visualSpec.kind === 'count_shape') {
    const preset = visualSpec.shapePreset || 'quad_abcd_textbook';

    return (
      <svg viewBox="0 0 380 235" className="w-full h-60 select-none">
        <rect x="0" y="0" width="380" height="235" fill="#090621" />
        {/* Top Badge */}
        <g transform="translate(10, 8)">
          <rect
            x="0"
            y="0"
            width="265"
            height="24"
            rx="7"
            fill="rgba(15, 23, 42, 0.95)"
            stroke="rgba(250, 204, 21, 0.6)"
            strokeWidth="1.2"
          />
          <text
            x="132"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FEF08A"
            fontSize="11"
            fontWeight="800"
          >
            {visualSpec.badgeTitleVi}
          </text>
        </g>

        {/* PRESET A: Quad ABCD Textbook (A=90°, B=60°, C=90°, D=120°) */}
        {preset === 'quad_abcd_textbook' && (
          <g>
            <polygon
              points="105,195 105,55 243.6,135 209,195"
              fill="rgba(56, 189, 248, 0.12)"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Right angle square at A (90°) */}
            <rect
              x="105"
              y="175"
              width="20"
              height="20"
              fill="rgba(34, 197, 94, 0.32)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            {/* Right angle rotated square at C (90°) */}
            <polygon
              points="243.6,135 226.3,125 216.3,142.3 233.6,152.3"
              fill="rgba(34, 197, 94, 0.32)"
              stroke="#22C55E"
              strokeWidth="2"
              strokeLinejoin="miter"
            />
            {/* Vertex labels */}
            <text x="84" y="205" fill="#FACC15" fontSize="15" fontWeight="800">
              A
            </text>
            <text x="84" y="55" fill="#FACC15" fontSize="15" fontWeight="800">
              B
            </text>
            <text x="255" y="139" fill="#FACC15" fontSize="15" fontWeight="800">
              C
            </text>
            <text x="216" y="212" fill="#FACC15" fontSize="15" fontWeight="800">
              D
            </text>
            {/* Interior angle measures in textbook corner positions */}
            {!visualSpec.hideAllDegreesInShape && (
              <>
                {!visualSpec.hide90DegreeLabelsInShape && (
                  <text x="136" y="182" fill="#4ADE80" fontSize="13" fontWeight="800" className="font-mono-num">
                    90°
                  </text>
                )}
                <text x="128" y="86" fill="#FACC15" fontSize="13" fontWeight="800" className="font-mono-num">
                  {visualSpec.targetVertexLabel === 'B' && !showDegreeInDiagram ? '?°' : '60°'}
                </text>
                {!visualSpec.hide90DegreeLabelsInShape && (
                  <text x="196" y="140" fill="#4ADE80" fontSize="13" fontWeight="800" className="font-mono-num">
                    90°
                  </text>
                )}
                <text x="182" y="182" fill="#FF77B7" fontSize="13" fontWeight="800" className="font-mono-num">
                  {visualSpec.targetVertexLabel === 'D' && !showDegreeInDiagram ? '?°' : '120°'}
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET B: Right Trapezoid ABCD (A=90°, B=90°, C=60°, D=120°) */}
        {preset === 'right_trapezoid_abcd' && (
          <g>
            <polygon
              points="95,195 95,68 215,68 285,195"
              fill="rgba(34, 197, 94, 0.12)"
              stroke="#22C55E"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Right angle squares at A and B */}
            <rect
              x="95"
              y="177"
              width="18"
              height="18"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            <rect
              x="95"
              y="68"
              width="18"
              height="18"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            <text x="75" y="202" fill="#FACC15" fontSize="15" fontWeight="800">
              A
            </text>
            <text x="75" y="68" fill="#FACC15" fontSize="15" fontWeight="800">
              B
            </text>
            <text x="222" y="64" fill="#FACC15" fontSize="15" fontWeight="800">
              D
            </text>
            <text x="295" y="202" fill="#FACC15" fontSize="15" fontWeight="800">
              C
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="122" y="184" fill="#4ADE80" fontSize="12" fontWeight="800" className="font-mono-num">
                  90°
                </text>
                <text x="122" y="88" fill="#4ADE80" fontSize="12" fontWeight="800" className="font-mono-num">
                  90°
                </text>
                <text x="192" y="88" fill="#FF77B7" fontSize="12" fontWeight="800" className="font-mono-num">
                  120°
                </text>
                <text x="252" y="184" fill="#FACC15" fontSize="12" fontWeight="800" className="font-mono-num">
                  60°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET C: Right Triangle ABC (A=90°, B=60°, C=30°) */}
        {preset === 'right_triangle_abc' && (
          <g>
            <polygon
              points="95,195 95,65 295,195"
              fill="rgba(250, 204, 21, 0.12)"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <rect
              x="95"
              y="175"
              width="20"
              height="20"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            <text x="75" y="202" fill="#FACC15" fontSize="15" fontWeight="800">
              A
            </text>
            <text x="75" y="64" fill="#FACC15" fontSize="15" fontWeight="800">
              B
            </text>
            <text x="305" y="202" fill="#FACC15" fontSize="15" fontWeight="800">
              C
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="124" y="182" fill="#4ADE80" fontSize="12" fontWeight="800" className="font-mono-num">
                  90°
                </text>
                <text x="115" y="102" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  60°
                </text>
                <text x="242" y="184" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  30°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET D: Obtuse Triangle MNP (M=110°, N=40°, P=30°) */}
        {preset === 'obtuse_triangle_mnp' && (
          <g>
            <polygon
              points="135,192 75,72 305,192"
              fill="rgba(255, 46, 147, 0.14)"
              stroke="#FF2E93"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="125" y="214" fill="#FACC15" fontSize="15" fontWeight="800">
              M
            </text>
            <text x="54" y="72" fill="#FACC15" fontSize="15" fontWeight="800">
              N
            </text>
            <text x="314" y="200" fill="#FACC15" fontSize="15" fontWeight="800">
              P
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="152" y="176" fill="#FF77B7" fontSize="13" fontWeight="800" className="font-mono-num">
                  110°
                </text>
                <text x="95" y="104" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  40°
                </text>
                <text x="252" y="182" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  30°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET E: Parallelogram PQRS (P=60°, Q=120°, R=60°, S=120°) */}
        {preset === 'parallelogram_pqrs' && (
          <g>
            <polygon
              points="75,195 135,72 305,72 245,195"
              fill="rgba(168, 85, 247, 0.15)"
              stroke="#C084FC"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="55" y="202" fill="#FACC15" fontSize="15" fontWeight="800">
              P
            </text>
            <text x="115" y="65" fill="#FACC15" fontSize="15" fontWeight="800">
              Q
            </text>
            <text x="314" y="68" fill="#FACC15" fontSize="15" fontWeight="800">
              R
            </text>
            <text x="255" y="205" fill="#FACC15" fontSize="15" fontWeight="800">
              S
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="102" y="182" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  60°
                </text>
                <text x="148" y="92" fill="#FF77B7" fontSize="12" fontWeight="800" className="font-mono-num">
                  120°
                </text>
                <text x="272" y="92" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  60°
                </text>
                <text x="218" y="182" fill="#FF77B7" fontSize="12" fontWeight="800" className="font-mono-num">
                  120°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET F: Equilateral Triangle ABC (60°, 60°, 60°) */}
        {preset === 'equilateral_triangle_abc' && (
          <g>
            <polygon
              points="105,195 190,52 275,195"
              fill="rgba(56, 189, 248, 0.14)"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="85" y="204" fill="#FACC15" fontSize="15" fontWeight="800">
              A
            </text>
            <text x="185" y="44" fill="#FACC15" fontSize="15" fontWeight="800">
              B
            </text>
            <text x="285" y="204" fill="#FACC15" fontSize="15" fontWeight="800">
              C
            </text>
            <text x="132" y="182" fill="#FEF08A" fontSize="13" fontWeight="800" className="font-mono-num">
              60°
            </text>
            <text x="190" y="86" textAnchor="middle" fill="#FEF08A" fontSize="13" fontWeight="800" className="font-mono-num">
              60°
            </text>
            <text x="246" y="182" fill="#FF77B7" fontSize="13" fontWeight="800" className="font-mono-num">
              {showDegreeInDiagram ? '60°' : '?°'}
            </text>
          </g>
        )}

        {/* PRESET G: Isosceles Trapezoid MNPQ (M=70°, N=110°, P=110°, Q=70°) */}
        {preset === 'isosceles_trapezoid_mnpq' && (
          <g>
            <polygon
              points="75,195 120,72 260,72 305,195"
              fill="rgba(56, 189, 248, 0.14)"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="55" y="204" fill="#FACC15" fontSize="15" fontWeight="800">
              M
            </text>
            <text x="100" y="66" fill="#FACC15" fontSize="15" fontWeight="800">
              N
            </text>
            <text x="268" y="66" fill="#FACC15" fontSize="15" fontWeight="800">
              P
            </text>
            <text x="312" y="204" fill="#FACC15" fontSize="15" fontWeight="800">
              Q
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="102" y="182" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  70°
                </text>
                <text x="135" y="92" fill="#FF77B7" fontSize="12" fontWeight="800" className="font-mono-num">
                  110°
                </text>
                <text x="235" y="92" fill="#FF77B7" fontSize="13" fontWeight="800" className="font-mono-num">
                  {showDegreeInDiagram ? '110°' : '?°'}
                </text>
                <text x="276" y="182" fill="#FEF08A" fontSize="12" fontWeight="800" className="font-mono-num">
                  70°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET H: House Pentagon ABCDE */}
        {preset === 'house_pentagon_abcde' && (
          <g>
            <polygon
              points="110,198 110,112 190,48 270,112 270,198"
              fill="rgba(250, 204, 21, 0.12)"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Two right angle squares at base A and E */}
            <rect
              x="110"
              y="180"
              width="18"
              height="18"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            <rect
              x="252"
              y="180"
              width="18"
              height="18"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="2"
            />
            <text x="90" y="204" fill="#FACC15" fontSize="14" fontWeight="800">
              A
            </text>
            <text x="88" y="114" fill="#FACC15" fontSize="14" fontWeight="800">
              B
            </text>
            <text x="190" y="40" textAnchor="middle" fill="#FACC15" fontSize="14" fontWeight="800">
              C
            </text>
            <text x="280" y="114" fill="#FACC15" fontSize="14" fontWeight="800">
              D
            </text>
            <text x="280" y="204" fill="#FACC15" fontSize="14" fontWeight="800">
              E
            </text>
            {!visualSpec.hideAllDegreesInShape && (
              <>
                <text x="138" y="185" fill="#4ADE80" fontSize="11" fontWeight="800" className="font-mono-num">
                  90°
                </text>
                <text x="235" y="185" fill="#4ADE80" fontSize="11" fontWeight="800" className="font-mono-num">
                  90°
                </text>
                <text x="130" y="122" fill="#FF77B7" fontSize="11" fontWeight="800" className="font-mono-num">
                  130°
                </text>
                <text x="190" y="74" textAnchor="middle" fill="#FF77B7" fontSize="11" fontWeight="800" className="font-mono-num">
                  100°
                </text>
                <text x="242" y="122" fill="#FF77B7" fontSize="11" fontWeight="800" className="font-mono-num">
                  130°
                </text>
              </>
            )}
          </g>
        )}

        {/* PRESET I: Straight Beam AOB with Perpendicular Ray OC and Acute Ray OD */}
        {preset === 'straight_beam_oab' && (
          <g>
            {/* Straight Line AB */}
            <line
              x1="45"
              y1="185"
              x2="335"
              y2="185"
              stroke="#38BDF8"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Perpendicular Ray OC (90°) */}
            <line
              x1="190"
              y1="185"
              x2="190"
              y2="55"
              stroke="#22C55E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Acute Ray OD (45°) */}
            <line
              x1="190"
              y1="185"
              x2="282"
              y2="93"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right angle square */}
            {!visualSpec.hideAllDegreesInShape && (
              <rect
                x="172"
                y="167"
                width="18"
                height="18"
                fill="rgba(34, 197, 94, 0.35)"
                stroke="#22C55E"
                strokeWidth="2"
              />
            )}
            <circle cx="45" cy="185" r="5" fill="#38BDF8" />
            <circle cx="335" cy="185" r="5" fill="#38BDF8" />
            <circle cx="190" cy="55" r="5" fill="#22C55E" />
            <circle cx="282" cy="93" r="5" fill="#FACC15" />
            <circle cx="190" cy="185" r="6" fill="#FF2E93" />
            <text x="40" y="208" fill="#38BDF8" fontSize="14" fontWeight="800">
              A
            </text>
            <text x="184" y="212" fill="#FF2E93" fontSize="14" fontWeight="800">
              O
            </text>
            <text x="330" y="208" fill="#38BDF8" fontSize="14" fontWeight="800">
              B
            </text>
            <text x="172" y="48" fill="#22C55E" fontSize="14" fontWeight="800">
              {visualSpec.hideAllDegreesInShape ? 'C' : 'C (90°)'}
            </text>
            <text x="290" y="92" fill="#FACC15" fontSize="13" fontWeight="800">
              {visualSpec.hideAllDegreesInShape ? 'D' : 'D (45°)'}
            </text>
          </g>
        )}

        {/* PRESET J: Rectangle ABCD with Diagonal AC */}
        {preset === 'rect_diagonal_abcd' && (
          <g>
            <rect
              x="75"
              y="62"
              width="230"
              height="130"
              fill="rgba(56, 189, 248, 0.1)"
              stroke="#38BDF8"
              strokeWidth="3.5"
            />
            {/* Diagonal AC */}
            <line
              x1="75"
              y1="192"
              x2="305"
              y2="62"
              stroke="#FF2E93"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            {/* Right angle squares at B and D */}
            <rect
              x="75"
              y="62"
              width="16"
              height="16"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="1.8"
            />
            <rect
              x="289"
              y="176"
              width="16"
              height="16"
              fill="rgba(34, 197, 94, 0.35)"
              stroke="#22C55E"
              strokeWidth="1.8"
            />
            <text x="55" y="202" fill="#FACC15" fontSize="14" fontWeight="800">
              A
            </text>
            <text x="55" y="64" fill="#FACC15" fontSize="14" fontWeight="800">
              B
            </text>
            <text x="312" y="64" fill="#FACC15" fontSize="14" fontWeight="800">
              C
            </text>
            <text x="312" y="202" fill="#FACC15" fontSize="14" fontWeight="800">
              D
            </text>
            <text x="92" y="156" fill="#FEF08A" fontSize="11" fontWeight="800" className="font-mono-num">
              60°
            </text>
            <text x="122" y="184" fill="#FEF08A" fontSize="11" fontWeight="800" className="font-mono-num">
              30°
            </text>
            <text x="255" y="78" fill="#FEF08A" fontSize="11" fontWeight="800" className="font-mono-num">
              30°
            </text>
            <text x="282" y="104" fill="#FEF08A" fontSize="11" fontWeight="800" className="font-mono-num">
              60°
            </text>
          </g>
        )}

        {/* PRESET K: Straight Angle vs Right Angle (Level 2 Question 2) */}
        {preset === 'straight_vs_right_angles' && (
          <g>
            {/* Left Box: Góc bẹt */}
            <rect
              x="12"
              y="42"
              width="172"
              height="180"
              rx="12"
              fill="rgba(30, 27, 75, 0.7)"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1.5"
            />
            <text x="98" y="64" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="800">
              Góc bẹt (180°)
            </text>
            {/* Semicircle 180° arc */}
            <path
              d="M 56 168 A 42 42 0 0 1 140 168 Z"
              fill="rgba(56, 189, 248, 0.22)"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            {/* Dashed vertical divider showing 2 right angles */}
            <line
              x1="98"
              y1="168"
              x2="98"
              y2="112"
              stroke="#FACC15"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <line
              x1="32"
              y1="168"
              x2="164"
              y2="168"
              stroke="#38BDF8"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="168" r="4.5" fill="#38BDF8" />
            <circle cx="164" cy="168" r="4.5" fill="#38BDF8" />
            <circle cx="98" cy="168" r="5.5" fill="#FACC15" />
            <text x="30" y="190" textAnchor="middle" fill="#38BDF8" fontSize="13" fontWeight="800">
              A
            </text>
            <text x="98" y="192" textAnchor="middle" fill="#FACC15" fontSize="13" fontWeight="800">
              O
            </text>
            <text x="164" y="190" textAnchor="middle" fill="#38BDF8" fontSize="13" fontWeight="800">
              B
            </text>
            <text x="98" y="148" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800" className="font-mono-num">
              180°
            </text>
            <text x="98" y="211" textAnchor="middle" fill="#CBD5E1" fontSize="10.5" fontWeight="700">
              Góc đỉnh O; cạnh OA, OB
            </text>

            {/* Right Box: Góc vuông */}
            <rect
              x="196"
              y="42"
              width="172"
              height="180"
              rx="12"
              fill="rgba(30, 27, 75, 0.7)"
              stroke="rgba(34, 197, 94, 0.45)"
              strokeWidth="1.5"
            />
            <text x="282" y="64" textAnchor="middle" fill="#4ADE80" fontSize="12" fontWeight="800">
              Góc vuông (90°)
            </text>
            {/* Crisp right angle square */}
            <rect
              x="246"
              y="146"
              width="22"
              height="22"
              fill="rgba(34, 197, 94, 0.32)"
              stroke="#22C55E"
              strokeWidth="2.2"
            />
            {/* Rays PM (vertical) and PN (horizontal) */}
            <line
              x1="246"
              y1="168"
              x2="246"
              y2="84"
              stroke="#22C55E"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="246"
              y1="168"
              x2="336"
              y2="168"
              stroke="#38BDF8"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="246" cy="84" r="4.5" fill="#22C55E" />
            <circle cx="336" cy="168" r="4.5" fill="#38BDF8" />
            <circle cx="246" cy="168" r="5.5" fill="#FACC15" />
            <text x="232" y="88" fill="#4ADE80" fontSize="13" fontWeight="800">
              M
            </text>
            <text x="234" y="188" fill="#FACC15" fontSize="13" fontWeight="800">
              P
            </text>
            <text x="344" y="172" fill="#38BDF8" fontSize="13" fontWeight="800">
              N
            </text>
            <text x="282" y="156" fill="#FFFFFF" fontSize="12" fontWeight="800" className="font-mono-num">
              90°
            </text>
            <text x="282" y="211" textAnchor="middle" fill="#CBD5E1" fontSize="10.5" fontWeight="700">
              Góc đỉnh P; cạnh PM, PN
            </text>
          </g>
        )}

        {/* PRESET L: Compare Two Angles O (50°) and P (65°) (Level 2 Question 10) */}
        {preset === 'compare_two_angles_op' &&
          (() => {
            const oCx = 54;
            const oCy = 180;
            const oRayB = polarToSvgCartesian(oCx, oCy, 102, 0);
            const oRayA = polarToSvgCartesian(oCx, oCy, 102, 50);
            const oArcB = polarToSvgCartesian(oCx, oCy, 42, 0);
            const oArcA = polarToSvgCartesian(oCx, oCy, 42, 50);
            const oLbl = polarToSvgCartesian(oCx, oCy, 56, 25);

            const pCx = 232;
            const pCy = 180;
            const pRayN = polarToSvgCartesian(pCx, pCy, 102, 0);
            const pRayM = polarToSvgCartesian(pCx, pCy, 102, 65);
            const pArcN = polarToSvgCartesian(pCx, pCy, 42, 0);
            const pArcM = polarToSvgCartesian(pCx, pCy, 42, 65);
            const pLbl = polarToSvgCartesian(pCx, pCy, 56, 32.5);

            return (
              <g>
                {/* Left Box: Góc đỉnh O; cạnh OA, OB = 50° */}
                <rect
                  x="12"
                  y="40"
                  width="172"
                  height="182"
                  rx="12"
                  fill="rgba(30, 27, 75, 0.7)"
                  stroke="rgba(250, 204, 21, 0.45)"
                  strokeWidth="1.5"
                />
                <text x="98" y="60" textAnchor="middle" fill="#FEF08A" fontSize="11.5" fontWeight="800">
                  Góc đỉnh O; cạnh OA, OB
                </text>
                <path
                  d={`M ${oCx} ${oCy} L ${oArcB.x} ${oArcB.y} A 42 42 0 0 0 ${oArcA.x} ${oArcA.y} Z`}
                  fill="rgba(250, 204, 21, 0.25)"
                  stroke="#FACC15"
                  strokeWidth="2"
                />
                <line
                  x1={oCx}
                  y1={oCy}
                  x2={oRayB.x}
                  y2={oRayB.y}
                  stroke="#38BDF8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <line
                  x1={oCx}
                  y1={oCy}
                  x2={oRayA.x}
                  y2={oRayA.y}
                  stroke="#FACC15"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx={oRayB.x} cy={oRayB.y} r="4.5" fill="#38BDF8" />
                <circle cx={oRayA.x} cy={oRayA.y} r="4.5" fill="#FACC15" />
                <circle cx={oCx} cy={oCy} r="5.5" fill="#FF2E93" />
                <text x={oCx - 12} y={oCy + 18} fill="#FACC15" fontSize="13" fontWeight="800">
                  O
                </text>
                <text x={oRayA.x + 6} y={oRayA.y - 2} fill="#FACC15" fontSize="13" fontWeight="800">
                  A
                </text>
                <text x={oRayB.x + 6} y={oRayB.y + 5} fill="#38BDF8" fontSize="13" fontWeight="800">
                  B
                </text>
                <text
                  x={oLbl.x}
                  y={oLbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="800"
                  className="font-mono-num"
                >
                  50°
                </text>

                {/* Right Box: Góc đỉnh P; cạnh PM, PN = 65° */}
                <rect
                  x="196"
                  y="40"
                  width="172"
                  height="182"
                  rx="12"
                  fill="rgba(30, 27, 75, 0.7)"
                  stroke="rgba(56, 189, 248, 0.45)"
                  strokeWidth="1.5"
                />
                <text x="282" y="60" textAnchor="middle" fill="#38BDF8" fontSize="11.5" fontWeight="800">
                  Góc đỉnh P; cạnh PM, PN
                </text>
                <path
                  d={`M ${pCx} ${pCy} L ${pArcN.x} ${pArcN.y} A 42 42 0 0 0 ${pArcM.x} ${pArcM.y} Z`}
                  fill="rgba(56, 189, 248, 0.25)"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />
                <line
                  x1={pCx}
                  y1={pCy}
                  x2={pRayN.x}
                  y2={pRayN.y}
                  stroke="#38BDF8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <line
                  x1={pCx}
                  y1={pCy}
                  x2={pRayM.x}
                  y2={pRayM.y}
                  stroke="#22C55E"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx={pRayN.x} cy={pRayN.y} r="4.5" fill="#38BDF8" />
                <circle cx={pRayM.x} cy={pRayM.y} r="4.5" fill="#22C55E" />
                <circle cx={pCx} cy={pCy} r="5.5" fill="#FF2E93" />
                <text x={pCx - 12} y={pCy + 18} fill="#FACC15" fontSize="13" fontWeight="800">
                  P
                </text>
                <text x={pRayM.x + 6} y={pRayM.y - 2} fill="#4ADE80" fontSize="13" fontWeight="800">
                  M
                </text>
                <text x={pRayN.x + 6} y={pRayN.y + 5} fill="#38BDF8" fontSize="13" fontWeight="800">
                  N
                </text>
                <text
                  x={pLbl.x}
                  y={pLbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="800"
                  className="font-mono-num"
                >
                  65°
                </text>
              </g>
            );
          })()}

        {/* PRESET M: Two Adjacent Angles (110° and ?° / 70°) Forming a Straight Angle (180°) (Level 2 Question 12) */}
        {preset === 'adjacent_supplementary_110_70' &&
          (() => {
            const oX = 190;
            const oY = 176;
            const rayLen = 122;
            const ptA = polarToSvgCartesian(oX, oY, rayLen, 180);
            const ptB = polarToSvgCartesian(oX, oY, rayLen, 0);
            const ptC = polarToSvgCartesian(oX, oY, 112, 70);

            const arc1R = 52;
            const arc1Start = polarToSvgCartesian(oX, oY, arc1R, 70);
            const arc1End = polarToSvgCartesian(oX, oY, arc1R, 180);
            const lbl1 = polarToSvgCartesian(oX, oY, 70, 125);

            const arc2R = 44;
            const arc2Start = polarToSvgCartesian(oX, oY, arc2R, 0);
            const arc2End = polarToSvgCartesian(oX, oY, arc2R, 70);
            const lbl2 = polarToSvgCartesian(oX, oY, 64, 35);

            return (
              <g>
                {/* Left obtuse angle 110° sector (AOC) */}
                <path
                  d={`M ${oX} ${oY} L ${arc1Start.x} ${arc1Start.y} A ${arc1R} ${arc1R} 0 0 0 ${arc1End.x} ${arc1End.y} Z`}
                  fill="rgba(255, 46, 147, 0.25)"
                  stroke="#FF2E93"
                  strokeWidth="2.2"
                />
                {/* Right acute angle ?° / 70° sector (COB) */}
                <path
                  d={`M ${oX} ${oY} L ${arc2Start.x} ${arc2Start.y} A ${arc2R} ${arc2R} 0 0 0 ${arc2End.x} ${arc2End.y} Z`}
                  fill="rgba(250, 204, 21, 0.28)"
                  stroke="#FACC15"
                  strokeWidth="2.2"
                />
                {/* Straight line AOB */}
                <line
                  x1={ptA.x}
                  y1={ptA.y}
                  x2={ptB.x}
                  y2={ptB.y}
                  stroke="#38BDF8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Dividing ray OC */}
                <line
                  x1={oX}
                  y1={oY}
                  x2={ptC.x}
                  y2={ptC.y}
                  stroke="#FACC15"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx={ptA.x} cy={ptA.y} r="5" fill="#38BDF8" />
                <circle cx={ptB.x} cy={ptB.y} r="5" fill="#38BDF8" />
                <circle cx={ptC.x} cy={ptC.y} r="5" fill="#FACC15" />
                <circle cx={oX} cy={oY} r="6" fill="#FF2E93" />
                <text x={ptA.x - 14} y={ptA.y + 5} fill="#38BDF8" fontSize="14" fontWeight="800">
                  A
                </text>
                <text x={ptB.x + 8} y={ptB.y + 5} fill="#38BDF8" fontSize="14" fontWeight="800">
                  B
                </text>
                <text x={ptC.x + 8} y={ptC.y - 4} fill="#FACC15" fontSize="14" fontWeight="800">
                  C
                </text>
                <text x={oX} y={oY + 20} textAnchor="middle" fill="#FF2E93" fontSize="14" fontWeight="800">
                  O
                </text>
                {/* 110° label on left angle */}
                <text
                  x={lbl1.x}
                  y={lbl1.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FF77B7"
                  fontSize="14"
                  fontWeight="800"
                  className="font-mono-num"
                >
                  110°
                </text>
                {/* ?° or 70° label on right angle */}
                <text
                  x={lbl2.x}
                  y={lbl2.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FEF08A"
                  fontSize="14"
                  fontWeight="800"
                  className="font-mono-num"
                >
                  {showDegreeInDiagram ? '70°' : '?°'}
                </text>
                <text x="190" y="222" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="700">
                  Hai góc ghép lại tạo thành góc bẹt AOB = 180°
                </text>
              </g>
            );
          })()}
      </svg>
    );
  }

  // 3. STANDARD TWO-RAY ANGLE DIAGRAM (Góc đỉnh O; cạnh OA, OB)
  const cx = 185;
  const cy = 165;
  const r = 115;
  const ray1 = polarToSvgCartesian(cx, cy, r, baseRayAngleDeg);
  const ray2 = polarToSvgCartesian(cx, cy, r, baseRayAngleDeg + angleDeg);
  const arcR = 58;
  const arcStart = polarToSvgCartesian(cx, cy, arcR, baseRayAngleDeg);
  const arcEnd = polarToSvgCartesian(cx, cy, arcR, baseRayAngleDeg + angleDeg);
  const qMeasureRadius = angleDeg < 35 ? 66 : angleDeg === 90 ? 40 : 38;
  const qMeasurePos = polarToSvgCartesian(
    cx,
    cy,
    qMeasureRadius,
    baseRayAngleDeg + angleDeg / 2
  );

  return (
    <svg viewBox="0 0 380 230" className="w-full h-56 select-none">
      <defs>
        <pattern id="challengeGrid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path
            d="M 25 0 L 0 0 0 25"
            fill="none"
            stroke="rgba(99, 102, 241, 0.14)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="380" height="230" fill="url(#challengeGrid)" />

      {/* Top-left textbook angle name badge */}
      <g transform="translate(12, 10)">
        <rect
          x="0"
          y="0"
          width="216"
          height="26"
          rx="8"
          fill="rgba(15, 23, 42, 0.9)"
          stroke="rgba(250, 204, 21, 0.55)"
          strokeWidth="1.2"
        />
        <text
          x="108"
          y="13"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FEF08A"
          fontSize="11"
          fontWeight="800"
        >
          {visualSpec.badgeTitleVi}
        </text>
      </g>

      {angleDeg === 90 ? (
        (() => {
          const sqS = 22;
          const p1 = polarToSvgCartesian(cx, cy, sqS, baseRayAngleDeg);
          const p2 = polarToSvgCartesian(p1.x, p1.y, sqS, baseRayAngleDeg + 90);
          const p3 = polarToSvgCartesian(cx, cy, sqS, baseRayAngleDeg + 90);
          return (
            <path
              d={`M ${cx} ${cy} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`}
              fill="rgba(34, 197, 94, 0.28)"
              stroke="#22C55E"
              strokeWidth={2.2}
              strokeLinejoin="miter"
            />
          );
        })()
      ) : (
        <path
          d={`M ${cx} ${cy} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y} Z`}
          fill={cls.colorHex}
          fillOpacity={0.22}
          stroke={cls.colorHex}
          strokeWidth={2}
        />
      )}

      <line
        x1={cx}
        y1={cy}
        x2={ray1.x}
        y2={ray1.y}
        stroke="#38BDF8"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={ray1.x} cy={ray1.y} r={5} fill="#38BDF8" />
      <text x={ray1.x + 8} y={ray1.y + 5} fill="#38BDF8" fontSize="13" fontWeight="800">
        B
      </text>

      <line
        x1={cx}
        y1={cy}
        x2={ray2.x}
        y2={ray2.y}
        stroke={cls.colorHex}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={ray2.x} cy={ray2.y} r={5} fill={cls.colorHex} />
      <text x={ray2.x + 8} y={ray2.y - 6} fill={cls.colorHex} fontSize="13" fontWeight="800">
        A
      </text>

      {/* Optional 180° Semicircular Protractor Overlay for Level 2 Question 13 */}
      {visualSpec.showProtractorOnStandard &&
        (() => {
          const pOuterR = 112;
          const pInnerR = 66;
          return (
            <g>
              {/* Translucent semicircular protractor body */}
              <path
                d={`M ${cx - pOuterR} ${cy} A ${pOuterR} ${pOuterR} 0 0 1 ${cx + pOuterR} ${cy} L ${
                  cx + pInnerR
                } ${cy} A ${pInnerR} ${pInnerR} 0 0 0 ${cx - pInnerR} ${cy} Z`}
                fill="rgba(30, 58, 138, 0.55)"
                stroke="#38BDF8"
                strokeWidth="2"
              />
              {/* Protractor baseline */}
              <line
                x1={cx - pOuterR}
                y1={cy}
                x2={cx + pOuterR}
                y2={cy}
                stroke="#FACC15"
                strokeWidth="2"
              />
              {/* Degree ticks every 10° and numbers every 30° */}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map(
                (deg) => {
                  const isMajor = deg % 30 === 0;
                  const tOuter = polarToSvgCartesian(cx, cy, pOuterR, deg);
                  const tInner = polarToSvgCartesian(cx, cy, pOuterR - (isMajor ? 8 : 4), deg);
                  const outerNumPos = polarToSvgCartesian(cx, cy, pOuterR - 16, deg);
                  const innerNumPos = polarToSvgCartesian(cx, cy, pInnerR + 11, deg);
                  const outerReading = 180 - deg;
                  const innerReading = deg;
                  return (
                    <g key={`ptick-${deg}`}>
                      <line
                        x1={tOuter.x}
                        y1={tOuter.y}
                        x2={tInner.x}
                        y2={tInner.y}
                        stroke={deg === 60 ? '#FF2E93' : isMajor ? '#FACC15' : '#94A3B8'}
                        strokeWidth={deg === 60 ? 2.5 : isMajor ? 1.6 : 0.9}
                      />
                      {isMajor && (
                        <>
                          {/* Outer scale reading (0..180 from left to right) */}
                          <text
                            x={outerNumPos.x}
                            y={outerNumPos.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={deg === 60 ? '#FF77B7' : '#38BDF8'}
                            fontSize={deg === 60 ? '10.5' : '8.5'}
                            fontWeight="800"
                            className="font-mono-num"
                          >
                            {outerReading}
                          </text>
                          {/* Inner scale reading (0..180 from right OB to left) */}
                          <text
                            x={innerNumPos.x}
                            y={innerNumPos.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={deg === 60 ? '#FEF08A' : '#FACC15'}
                            fontSize={deg === 60 ? '10.5' : '8.5'}
                            fontWeight="800"
                            className="font-mono-num"
                          >
                            {innerReading}
                          </text>
                        </>
                      )}
                    </g>
                  );
                }
              )}
              {/* Highlight circle on the 60° (inner) / 120° (outer) mark */}
              {(() => {
                const markPt = polarToSvgCartesian(cx, cy, (pOuterR + pInnerR) / 2, 60);
                return (
                  <circle
                    cx={markPt.x}
                    cy={markPt.y}
                    r="16"
                    fill="none"
                    stroke="#FF2E93"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                );
              })()}
            </g>
          );
        })()}

      {/* Textbook Angle Measure Placed Inside the Angle Corner Near Vertex O */}
      {!visualSpec.hideAllDegreesInShape && !visualSpec.showProtractorOnStandard && (
        <text
          x={qMeasurePos.x}
          y={qMeasurePos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          stroke="#090621"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="15"
          fontWeight="800"
          className="font-mono-num"
        >
          {showDegreeInDiagram ? `${angleDeg}°` : '?°'}
        </text>
      )}

      <circle cx={cx} cy={cy} r={6} fill="#FACC15" />
      <text x={cx - 12} y={cy + 22} fill="#FACC15" fontSize="13" fontWeight="800">
        O
      </text>
    </svg>
  );
};
