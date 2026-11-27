import React, { useEffect, useState } from 'react';
import { exportRewardCertificatePdf } from '../utils/certificatePdf';
import {
  formatVietnameseDate,
  getCertificateAwardCopy,
  JourneyTopicId,
} from '../utils/journeyProgress';
import { soundFX } from '../utils/soundEffects';

interface TopicRewardModalProps {
  target: JourneyTopicId | 'all' | null;
  studentName: string;
  studentClass: string;
  starsEarned: number;
  completedDateVi?: string;
  onChangeStudentInfo: (name: string, className: string) => void;
  onClose: () => void;
}

export const TopicRewardModal: React.FC<TopicRewardModalProps> = ({
  target,
  studentName,
  studentClass,
  starsEarned,
  completedDateVi,
  onChangeStudentInfo,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFile, setExportedFile] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setExportedFile(null);
    setExportError(null);
  }, [target]);

  if (!target) return null;

  const award = getCertificateAwardCopy(target);
  const dateText = completedDateVi || formatVietnameseDate();
  const previewName = studentName.trim() || 'NHÀ TOÁN HỌC NHÍ XUẤT SẮC';

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      soundFX.playVictory();
      const filename = await exportRewardCertificatePdf({
        target,
        studentName,
        studentClass,
        starsEarned,
        completedDateVi: dateText,
      });
      setExportedFile(filename);
    } catch {
      setExportError('Không thể tạo file PDF lúc này. Em hãy thử bấm lại nhé!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thông báo khen thưởng hoàn thành chủ đề"
      data-testid="topic-reward-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl card-3d-cosmic rounded-3xl p-5 sm:p-6 border-2 border-yellow-400 shadow-2xl space-y-4 my-auto">
        {/* Top Celebration Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
              🎉 CHÚC MỪNG HOÀN THÀNH 100% CHỦ ĐỀ
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Thông Báo Khen Thưởng Vũ Trụ Hình Học Lớp 4
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            aria-label="Đóng thông báo khen thưởng"
            className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-400/50 text-indigo-200 hover:text-white hover:border-yellow-400 font-extrabold cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Live Certificate Preview Card */}
        <div className="rounded-2xl bg-[#FFFDF6] text-slate-900 p-4 sm:p-5 border-4 border-amber-500 shadow-inner relative overflow-hidden">
          <div className="border-2 border-amber-400 rounded-xl p-4 sm:p-5 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/assets/aistudio/ava_04065f25.png"
                alt="Trường TH Trần Quang Diệu"
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
              />
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-extrabold text-indigo-950">
                  TRƯỜNG TIỂU HỌC TRẦN QUANG DIỆU · VŨ TRỤ HÌNH HỌC LỚP 4
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  HÀNH TRÌNH CHINH PHỤC VŨ TRỤ
                </div>
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight">
              THÔNG BÁO KHEN THƯỞNG
            </div>

            <div
              className="inline-block px-4 py-1 rounded-full text-xs font-extrabold text-white shadow-sm"
              style={{
                background: `linear-gradient(90deg, ${award.secondaryHex}, ${award.accentHex})`,
              }}
            >
              ★ {award.badgeTitleVi} ★
            </div>

            <div className="pt-1">
              <div className="text-xs italic font-bold text-slate-600">
                Trân trọng tuyên dương và khen thưởng em:
              </div>
              <div
                data-testid="certificate-preview-student-name"
                className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-0.5"
              >
                {previewName}
              </div>
              {studentClass.trim() && (
                <div className="text-xs sm:text-sm font-extrabold text-blue-700">
                  Học sinh lớp: {studentClass.trim()}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-400 rounded-xl p-3 space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-amber-800">
                {award.topicHeadingVi}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {award.achievementLineVi}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-700">
              <div className="inline-flex items-center gap-1.5 bg-indigo-950 text-yellow-300 px-3 py-1 rounded-xl font-extrabold font-mono-num">
                <span>★</span>
                <span>{starsEarned} Sao thưởng · Hoàn thành 100%</span>
              </div>
              <div className="text-right">
                <div className="italic text-[11px] text-slate-500">{dateText}</div>
                <div className="font-extrabold text-red-700">
                  Lê Thị Hải Vân – Doãn Thị Phượng
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Student Info for PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B0826] rounded-2xl p-3.5 border border-indigo-400/40">
          <div className="sm:col-span-2">
            <label
              htmlFor="modal-student-name"
              className="block text-[11px] font-extrabold text-sky-300 mb-1"
            >
              HỌ VÀ TÊN HỌC SINH (HIỆN TRÊN GIẤY KHEN PDF):
            </label>
            <input
              id="modal-student-name"
              type="text"
              value={studentName}
              onChange={(e) => onChangeStudentInfo(e.target.value, studentClass)}
              placeholder="Ví dụ: Nguyễn Minh Anh"
              className="w-full px-3 py-2 rounded-xl bg-indigo-950/90 border border-indigo-400/50 text-sm font-bold text-white placeholder-indigo-300/60 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label
              htmlFor="modal-student-class"
              className="block text-[11px] font-extrabold text-sky-300 mb-1"
            >
              LỚP:
            </label>
            <input
              id="modal-student-class"
              type="text"
              value={studentClass}
              onChange={(e) => onChangeStudentInfo(studentName, e.target.value)}
              placeholder="Ví dụ: 4A"
              className="w-full px-3 py-2 rounded-xl bg-indigo-950/90 border border-indigo-400/50 text-sm font-bold text-white placeholder-indigo-300/60 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        {exportedFile && (
          <div
            data-testid="pdf-export-success-banner"
            className="bg-emerald-500/20 border border-emerald-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-2"
          >
            <span>✅</span>
            <span>
              Đã xuất thành công file PDF khen thưởng:{' '}
              <strong className="text-white">{exportedFile}</strong>
            </span>
          </div>
        )}

        {exportError && (
          <div className="bg-rose-500/20 border border-rose-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-200">
            ⚠️ {exportError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-950 border border-indigo-400/50 text-indigo-100 font-bold text-sm cursor-pointer hover:border-white"
          >
            Để sau
          </button>
          <button
            type="button"
            data-testid="btn-export-reward-pdf"
            disabled={isExporting}
            onClick={handleExportPdf}
            className="btn-3d-gold px-5 py-2.5 rounded-xl font-extrabold text-sm text-slate-950 cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            <span>📄</span>
            <span>
              {isExporting
                ? 'Đang tạo file PDF...'
                : 'Xuất Thông Báo Khen Thưởng (PDF)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
