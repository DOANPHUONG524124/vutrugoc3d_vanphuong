import { jsPDF } from 'jspdf';
import {
  buildCertificateFilename,
  formatVietnameseDate,
  getCertificateAwardCopy,
  JourneyTopicId,
} from './journeyProgress';

export interface CertificatePdfOptions {
  target: JourneyTopicId | 'all';
  studentName?: string;
  studentClass?: string;
  starsEarned: number;
  completedDateVi?: string;
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fill: string
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }
  return y;
}

export async function renderCertificateCanvas(
  options: CertificatePdfOptions
): Promise<HTMLCanvasElement> {
  const W = 1684;
  const H = 1190;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Không thể khởi tạo khung vẽ giấy khen thưởng.');
  }

  const award = getCertificateAwardCopy(options.target);
  const displayName = (options.studentName || '').trim() || 'NHÀ TOÁN HỌC NHÍ XUẤT SẮC';
  const displayClass = (options.studentClass || '').trim();
  const dateText = options.completedDateVi || formatVietnameseDate();

  const [avatarImg, robotImg] = await Promise.all([
    loadImageSafe('/assets/aistudio/ava_04065f25.png'),
    loadImageSafe('/assets/aistudio/Th_m_ti_u____9352a9ad.png'),
  ]);

  // 1. Outer deep cosmic navy frame
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#140E3B');
  bgGrad.addColorStop(0.5, '#1E1B4B');
  bgGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle decorative stars on the outer cosmic frame
  const cosmicStars = [
    [70, 70, 9],
    [1614, 70, 9],
    [70, 1120, 9],
    [1614, 1120, 9],
    [842, 34, 8],
    [842, 1156, 8],
  ];
  for (const [sx, sy, sr] of cosmicStars) {
    drawStar(ctx, sx, sy, 5, sr * 1.4, sr * 0.6, '#FACC15');
  }

  // 2. Inner parchment certificate body
  drawRoundedRect(ctx, 56, 56, W - 112, H - 112, 26);
  ctx.fillStyle = '#FFFDF6';
  ctx.fill();

  // Double gold ornamental borders
  drawRoundedRect(ctx, 74, 74, W - 148, H - 148, 20);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 6;
  ctx.stroke();

  drawRoundedRect(ctx, 90, 90, W - 180, H - 180, 14);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Corner flourishes
  const corners = [
    [118, 118],
    [W - 118, 118],
    [118, H - 118],
    [W - 118, H - 118],
  ];
  for (const [cx, cy] of corners) {
    drawStar(ctx, cx, cy, 5, 16, 7, '#F59E0B');
  }

  // 3. Top Header (Emblem + School + App Brand)
  if (avatarImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(210, 185, 52, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 158, 133, 104, 104);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(210, 185, 52, 0, Math.PI * 2);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E1B4B';
  ctx.font = '800 26px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText('TRƯỜNG TIỂU HỌC TRẦN QUANG DIỆU · VŨ TRỤ HÌNH HỌC LỚP 4', W / 2, 162);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 20px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText('HÀNH TRÌNH CHINH PHỤC VŨ TRỤ · CHỨNG NHẬN HOÀN THÀNH CHỦ ĐỀ', W / 2, 198);

  // Decorative gold divider
  ctx.beginPath();
  ctx.moveTo(460, 222);
  ctx.lineTo(W - 460, 222);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4. Main Certificate Heading
  ctx.fillStyle = '#B91C1C';
  ctx.font = '900 66px "Baloo 2", "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText('THÔNG BÁO KHEN THƯỞNG', W / 2, 306);

  // Award Ribbon Subtitle
  drawRoundedRect(ctx, W / 2 - 390, 326, 780, 52, 26);
  const ribbonGrad = ctx.createLinearGradient(W / 2 - 390, 326, W / 2 + 390, 378);
  ribbonGrad.addColorStop(0, award.secondaryHex);
  ribbonGrad.addColorStop(1, award.accentHex);
  ctx.fillStyle = ribbonGrad;
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`★  ${award.badgeTitleVi}  ★`, W / 2, 360);

  // 5. Recipient Name & Class
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 700 26px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText('Trân trọng tuyên dương và khen thưởng em:', W / 2, 434);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 58px "Baloo 2", "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText(displayName.toUpperCase(), W / 2, 508);

  // Underline beneath student name
  ctx.beginPath();
  ctx.moveTo(W / 2 - 340, 524);
  ctx.lineTo(W / 2 + 340, 524);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (displayClass) {
    ctx.fillStyle = '#1D4ED8';
    ctx.font = '800 28px "Nunito", "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Học sinh lớp: ${displayClass}`, W / 2, 566);
  }

  // 6. Completed Topic Banner
  const topicBoxY = displayClass ? 592 : 562;
  drawRoundedRect(ctx, 220, topicBoxY, W - 440, 228, 22);
  ctx.fillStyle = '#FEF9C3';
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.font = '900 32px "Baloo 2", "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillText(award.topicHeadingVi, W / 2, topicBoxY + 50);

  ctx.fillStyle = '#1E293B';
  ctx.font = '700 23px "Nunito", "Segoe UI", Arial, sans-serif';
  const afterAchievementY = wrapCenteredText(
    ctx,
    award.achievementLineVi,
    W / 2,
    topicBoxY + 95,
    W - 530,
    34
  );

  ctx.fillStyle = '#0F766E';
  ctx.font = 'italic 700 22px "Nunito", "Segoe UI", Arial, sans-serif';
  wrapCenteredText(
    ctx,
    `"${award.praiseNoteVi}"`,
    W / 2,
    afterAchievementY + 12,
    W - 550,
    32
  );

  // 7. Bottom Row: Left Robot + Gold Seal, Center Stars Pill, Right Date & Signatures
  const footerY = 895;

  // Left: Robot + Seal
  if (robotImg) {
    ctx.save();
    drawRoundedRect(ctx, 165, footerY - 30, 128, 128, 24);
    ctx.fillStyle = '#1E1B4B';
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(robotImg, 155, footerY - 40, 148, 148);
    ctx.restore();
  }

  // Gold Achievement Medal Seal next to Robot
  const sealX = 380;
  const sealY = footerY + 34;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 64, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  drawStar(ctx, sealX, sealY - 22, 5, 16, 7, '#FFFFFF');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 22px "Nunito", Arial, sans-serif';
  ctx.fillText('100%', sealX, sealY + 14);
  ctx.font = '800 13px "Nunito", Arial, sans-serif';
  ctx.fillText('HOÀN THÀNH', sealX, sealY + 34);

  // Center: Earned Stars Box
  drawRoundedRect(ctx, 515, footerY - 12, 410, 96, 20);
  ctx.fillStyle = '#1E1B4B';
  ctx.fill();
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FDE047';
  ctx.font = '900 32px "Baloo 2", "Nunito", Arial, sans-serif';
  ctx.fillText(`★ ${options.starsEarned} SAO THƯỞNG`, 720, footerY + 32);
  ctx.fillStyle = '#E0E7FF';
  ctx.font = '700 18px "Nunito", Arial, sans-serif';
  ctx.fillText('Robot Toán Học chứng nhận thành tích', 720, footerY + 64);

  // Right: Date & Teachers signature
  const sigX = 1270;
  ctx.fillStyle = '#334155';
  ctx.font = 'italic 700 22px "Nunito", Arial, sans-serif';
  ctx.fillText(dateText, sigX, footerY - 2);

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 23px "Nunito", Arial, sans-serif';
  ctx.fillText('GIÁO VIÊN HƯỚNG DẪN', sigX, footerY + 34);

  ctx.fillStyle = '#B91C1C';
  ctx.font = '900 26px "Baloo 2", "Nunito", Arial, sans-serif';
  ctx.fillText('Lê Thị Hải Vân – Doãn Thị Phượng', sigX, footerY + 74);

  ctx.fillStyle = '#475569';
  ctx.font = '700 19px "Nunito", Arial, sans-serif';
  ctx.fillText('Trường Tiểu học Trần Quang Diệu', sigX, footerY + 104);

  return canvas;
}

export async function exportRewardCertificatePdf(
  options: CertificatePdfOptions
): Promise<string> {
  const canvas = await renderCertificateCanvas(options);
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
  const filename = buildCertificateFilename(options.target, options.studentName);
  pdf.save(filename);
  return filename;
}
