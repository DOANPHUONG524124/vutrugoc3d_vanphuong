import React, { useMemo, useState } from 'react';
import {
  SetSquareState,
  normalizeDeg360,
} from '../utils/perpendicularMath';
import {
  ParallelChallengeLevel,
  ParallelDiagramPreset,
  PARALLEL_DRAW_TASKS,
  computeParallelGeometry,
  evaluateParallelStepAlignment,
  getParallelQuestionsByLevel,
} from '../utils/parallelMath';
import { calculateStarReward } from '../utils/challengeGenerator';
import { InteractiveParallelSetSquareSVG } from './InteractiveParallelSetSquareSVG';
import { soundFX } from '../utils/soundEffects';

interface ParallelChallengeViewProps {
  onBackHome: () => void;
  onFinishChallengeLevel: (level: ParallelChallengeLevel, score: number, starsEarned: number) => void;
}

const ParallelDiagramSVG: React.FC<{ preset: ParallelDiagramPreset }> = ({ preset }) => {
  return (
    <svg viewBox="0 0 420 230" className="w-full h-auto block">
      <defs>
        <pattern id="par-q-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(129,140,248,0.14)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="420" height="230" rx="14" fill="#0B0826" />
      <rect x="0" y="0" width="420" height="230" rx="14" fill="url(#par-q-grid)" />

      {/* 1. Train track parallel rails */}
      {preset === 'train_track_rails' && (
        <g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const cx = 65 + i * 42;
            const cy = 192 - i * 19;
            return (
              <line
                key={i}
                x1={cx - 10}
                y1={cy - 18}
                x2={cx + 15}
                y2={cy + 22}
                stroke="#92400E"
                strokeWidth="7"
                strokeLinecap="round"
              />
            );
          })}
          <line x1="40" y1="184" x2="372" y2="26" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
          <line x1="62" y1="218" x2="394" y2="60" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {/* 2. Extended rectangle ABCD */}
      {preset === 'rect_abcd_extended_par' && (
        <g>
          <rect x="115" y="64" width="190" height="100" fill="rgba(56,189,248,0.14)" stroke="#94A3B8" strokeWidth="2.5" />
          <line x1="42" y1="64" x2="378" y2="64" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="42" y1="164" x2="378" y2="164" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
          <text x="112" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">A</text>
          <text x="308" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">B</text>
          <text x="112" y="190" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">D</text>
          <text x="308" y="190" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">C</text>
        </g>
      )}

      {/* 3. Rocket in space */}
      {preset === 'rocket_parallel_scene' && (
        <g transform="translate(210, 118) rotate(24)">
          <polygon points="-32,20 -56,56 -26,50" fill="#F97316" />
          <polygon points="32,20 56,56 26,50" fill="#F97316" />
          <path d="M 0 -75 C 28 -45 34 -8 32 46 L -32 46 C -34 -8 -28 -45 0 -75 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <path d="M 0 -75 C 14 -58 22 -42 25 -28 L -25 -28 C -22 -42 -14 -58 0 -75 Z" fill="#EF4444" />
          <rect x="-32" y="4" width="64" height="42" fill="#F97316" />
          <line x1="-44" y1="-28" x2="44" y2="-28" stroke="#34D399" strokeWidth="4" strokeDasharray="6 4" />
          <line x1="-44" y1="4" x2="44" y2="4" stroke="#34D399" strokeWidth="4" strokeDasharray="6 4" />
          <circle cx="0" cy="-12" r="11" fill="#38BDF8" stroke="#FACC15" strokeWidth="3" />
          <polygon points="-16,50 0,80 16,50" fill="#FACC15" />
        </g>
      )}

      {/* 4. Matchstick letters V I E T */}
      {preset === 'viet_matchsticks' && (
        <g stroke="#F472B6" strokeWidth="6.5" strokeLinecap="round">
          {/* V */}
          <line x1="42" y1="62" x2="72" y2="165" />
          <line x1="102" y1="62" x2="72" y2="165" />
          {/* I */}
          <line x1="146" y1="62" x2="146" y2="165" />
          {/* E */}
          <line x1="196" y1="62" x2="196" y2="165" />
          <line x1="196" y1="62" x2="262" y2="62" />
          <line x1="196" y1="113" x2="256" y2="113" />
          <line x1="196" y1="165" x2="262" y2="165" />
          {/* T */}
          <line x1="302" y1="62" x2="378" y2="62" />
          <line x1="340" y1="62" x2="340" y2="165" />
        </g>
      )}

      {/* 5. Street Map: Robot's Yellow House vs Houses A, B, C, D */}
      {preset === 'street_map_robot_mai' && (
        <g>
          {/* Green parks */}
          <rect x="24" y="20" width="372" height="190" rx="12" fill="#14532D" opacity="0.55" />
          {/* Horizontal road 1 (House A) */}
          <line x1="24" y1="66" x2="396" y2="66" stroke="#E2E8F0" strokeWidth="14" />
          {/* Horizontal road 2 (Robot Yellow House — PARALLEL to road 1!) */}
          <line x1="24" y1="138" x2="396" y2="138" stroke="#E2E8F0" strokeWidth="14" />
          {/* Vertical cross street (House B) */}
          <line x1="150" y1="20" x2="150" y2="210" stroke="#CBD5E1" strokeWidth="12" />
          {/* Slanted street (House C & D) */}
          <line x1="235" y1="20" x2="310" y2="210" stroke="#CBD5E1" strokeWidth="12" />

          {/* House A on top parallel road */}
          <g transform="translate(82, 42)">
            <rect x="-15" y="0" width="30" height="18" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
            <polygon points="-19,0 0,-13 19,0" fill="#EF4444" />
            <circle cx="-26" cy="8" r="11" fill="#FACC15" />
            <text x="-26" y="13" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="900">A</text>
          </g>

          {/* House B on vertical cross road */}
          <g transform="translate(124, 96)">
            <rect x="-14" y="0" width="28" height="18" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
            <polygon points="-17,0 0,-12 17,0" fill="#991B1B" />
            <circle cx="-26" cy="8" r="11" fill="#FACC15" />
            <text x="-26" y="13" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="900">B</text>
          </g>

          {/* House C on slanted road */}
          <g transform="translate(262, 34)">
            <rect x="-14" y="0" width="28" height="18" fill="#F472B6" stroke="#FFFFFF" strokeWidth="1.5" />
            <polygon points="-17,0 0,-12 17,0" fill="#9D174D" />
            <circle cx="28" cy="8" r="11" fill="#FACC15" />
            <text x="28" y="13" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="900">C</text>
          </g>

          {/* House D on bottom slanted road */}
          <g transform="translate(284, 174)">
            <rect x="-14" y="0" width="28" height="18" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
            <polygon points="-17,0 0,-12 17,0" fill="#1D4ED8" />
            <circle cx="-26" cy="8" r="11" fill="#FACC15" />
            <text x="-26" y="13" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="900">D</text>
          </g>

          {/* Robot Yellow House on bottom horizontal road */}
          <g transform="translate(345, 110)">
            <rect x="-16" y="0" width="32" height="20" fill="#FACC15" stroke="#FFFFFF" strokeWidth="2" />
            <polygon points="-20,0 0,-14 20,0" fill="#7C3AED" />
            <text x="0" y="34" textAnchor="middle" fill="#FACC15" fontSize="11" fontWeight="900">Nhà Robot</text>
          </g>
        </g>
      )}

      {/* 6. Six Polygons Classification */}
      {preset === 'six_polygons_classify' && (
        <g stroke="#E2E8F0" strokeWidth="2.5" fill="rgba(56,189,248,0.16)">
          {/* 1: Rect */}
          <rect x="26" y="30" width="96" height="58" />
          <text x="74" y="65" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">1</text>
          {/* 2: Trapezoid */}
          <polygon points="175,30 245,30 264,88 156,88" />
          <text x="210" y="65" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">2</text>
          {/* 3: Triangle */}
          <polygon points="295,30 392,30 335,88" />
          <text x="342" y="58" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">3</text>
          {/* 4: Right Triangle */}
          <polygon points="34,126 34,196 116,196" />
          <path d="M 48 196 L 48 182 L 34 182" fill="none" stroke="#34D399" strokeWidth="2.5" />
          <text x="64" y="182" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">4</text>
          {/* 5: Regular Hexagon */}
          <polygon points="184,126 236,126 258,161 236,196 184,196 162,161" />
          <text x="210" y="167" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">5</text>
          {/* 6: House Pentagon */}
          <polygon points="344,120 388,150 388,196 300,196 300,150" />
          <text x="344" y="172" textAnchor="middle" fill="#FACC15" stroke="none" fontSize="16" fontWeight="900">6</text>
        </g>
      )}

      {/* 7. Split Rectangle AMND & MBCN */}
      {preset === 'split_rect_amnd_mbcn_q' && (
        <g>
          <rect x="75" y="62" width="270" height="106" fill="rgba(56,189,248,0.14)" stroke="#FFFFFF" strokeWidth="3.5" />
          <line x1="255" y1="62" x2="255" y2="168" stroke="#FACC15" strokeWidth="4.5" />
          <text x="64" y="54" fill="#FFFFFF" fontSize="18" fontWeight="900">A</text>
          <text x="255" y="52" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900">M</text>
          <text x="352" y="54" fill="#FFFFFF" fontSize="18" fontWeight="900">B</text>
          <text x="64" y="188" fill="#FFFFFF" fontSize="18" fontWeight="900">D</text>
          <text x="255" y="190" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900">N</text>
          <text x="352" y="188" fill="#FFFFFF" fontSize="18" fontWeight="900">C</text>
        </g>
      )}

      {/* 8. 3-Pane Window (1 edge parallel to 3 edges) */}
      {preset === 'window_3_panes_q' && (
        <g>
          <rect x="65" y="60" width="290" height="110" fill="rgba(56,189,248,0.14)" stroke="#FFFFFF" strokeWidth="3.5" />
          <line x1="65" y1="60" x2="65" y2="170" stroke="#FACC15" strokeWidth="5" />
          <line x1="162" y1="60" x2="162" y2="170" stroke="#34D399" strokeWidth="4" />
          <line x1="258" y1="60" x2="258" y2="170" stroke="#34D399" strokeWidth="4" />
          <line x1="355" y1="60" x2="355" y2="170" stroke="#34D399" strokeWidth="4" />
          <text x="65" y="48" textAnchor="middle" fill="#FACC15" fontSize="17" fontWeight="900">A</text>
          <text x="162" y="48" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">M</text>
          <text x="258" y="48" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">P</text>
          <text x="355" y="48" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">B</text>
          <text x="65" y="192" textAnchor="middle" fill="#FACC15" fontSize="17" fontWeight="900">D</text>
          <text x="162" y="192" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">N</text>
          <text x="258" y="192" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">Q</text>
          <text x="355" y="192" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900">C</text>
        </g>
      )}

      {/* 9. Ladder with 4 Rungs */}
      {preset === 'ladder_4_rungs_q' && (
        <g>
          <line x1="130" y1="22" x2="130" y2="208" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          <line x1="290" y1="22" x2="290" y2="208" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          {[
            { y: 50, l: 'A', r: 'B', col: '#FACC15' },
            { y: 95, l: 'C', r: 'D', col: '#34D399' },
            { y: 140, l: 'E', r: 'F', col: '#34D399' },
            { y: 185, l: 'G', r: 'H', col: '#34D399' },
          ].map((rg) => (
            <g key={rg.l}>
              <line x1="130" y1={rg.y} x2="290" y2={rg.y} stroke={rg.col} strokeWidth="5.5" />
              <text x="108" y={rg.y + 6} textAnchor="middle" fill={rg.col} fontSize="16" fontWeight="900">{rg.l}</text>
              <text x="312" y={rg.y + 6} textAnchor="middle" fill={rg.col} fontSize="16" fontWeight="900">{rg.r}</text>
            </g>
          ))}
        </g>
      )}

      {/* 10. Square MNPQ */}
      {preset === 'square_mnpq_read_q' && (
        <g>
          <rect x="145" y="50" width="130" height="130" fill="rgba(56,189,248,0.16)" stroke="#FFFFFF" strokeWidth="3.5" />
          <text x="130" y="45" fill="#FACC15" fontSize="18" fontWeight="900">M</text>
          <text x="282" y="45" fill="#FACC15" fontSize="18" fontWeight="900">N</text>
          <text x="282" y="196" fill="#34D399" fontSize="18" fontWeight="900">P</text>
          <text x="130" y="196" fill="#34D399" fontSize="18" fontWeight="900">Q</text>
        </g>
      )}

      {/* 11. House ABCDE on Grid Paper */}
      {preset === 'house_grid_abcde_q' && (
        <g>
          <polygon points="210,38 298,104 298,192 122,192 122,104" fill="rgba(56,189,248,0.16)" stroke="#FFFFFF" strokeWidth="3.5" />
          <path d="M 138 192 L 138 176 L 122 176" fill="none" stroke="#34D399" strokeWidth="2.5" />
          <path d="M 282 192 L 282 176 L 298 176" fill="none" stroke="#34D399" strokeWidth="2.5" />
          <text x="210" y="28" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900">B</text>
          <text x="104" y="108" fill="#FFFFFF" fontSize="18" fontWeight="900">A</text>
          <text x="312" y="108" fill="#FFFFFF" fontSize="18" fontWeight="900">C</text>
          <text x="104" y="206" fill="#FFFFFF" fontSize="18" fontWeight="900">E</text>
          <text x="312" y="206" fill="#FFFFFF" fontSize="18" fontWeight="900">D</text>
        </g>
      )}

      {/* 12. Regular Hexagon ABCDEF */}
      {preset === 'hexagon_abcdef_q' && (
        <g>
          <polygon
            points="155,48 265,48 318,115 265,182 155,182 102,115"
            fill="rgba(56,189,248,0.16)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <text x="148" y="38" textAnchor="middle" fill="#FACC15" fontSize="17" fontWeight="900">A</text>
          <text x="272" y="38" textAnchor="middle" fill="#FACC15" fontSize="17" fontWeight="900">B</text>
          <text x="334" y="121" textAnchor="middle" fill="#34D399" fontSize="17" fontWeight="900">C</text>
          <text x="272" y="204" textAnchor="middle" fill="#38BDF8" fontSize="17" fontWeight="900">D</text>
          <text x="148" y="204" textAnchor="middle" fill="#38BDF8" fontSize="17" fontWeight="900">E</text>
          <text x="86" y="121" textAnchor="middle" fill="#34D399" fontSize="17" fontWeight="900">F</text>
        </g>
      )}

      {/* 13. 2-Step Drawing Diagram */}
      {preset === 'two_step_draw_par_q' && (
        <g>
          {/* Base line AB */}
          <line x1="60" y1="68" x2="360" y2="68" stroke="#38BDF8" strokeWidth="4" />
          {/* Aux line MN */}
          <line x1="210" y1="24" x2="210" y2="206" stroke="#FB7185" strokeWidth="3" strokeDasharray="7 5" />
          {/* Parallel line CD */}
          <line x1="60" y1="154" x2="360" y2="154" stroke="#34D399" strokeWidth="4" />
          {/* Crisp square 90° symbols */}
          <path d="M 226 68 L 226 84 L 210 84" fill="none" stroke="#FB7185" strokeWidth="2.5" />
          <path d="M 226 154 L 226 170 L 210 170" fill="none" stroke="#34D399" strokeWidth="2.5" />
          <circle cx="210" cy="154" r="5" fill="#FACC15" />
          <text x="85" y="56" fill="#38BDF8" fontSize="16" fontWeight="900">A</text>
          <text x="330" y="56" fill="#38BDF8" fontSize="16" fontWeight="900">B</text>
          <text x="224" y="38" fill="#FDA4AF" fontSize="15" fontWeight="900">M</text>
          <text x="224" y="204" fill="#FDA4AF" fontSize="15" fontWeight="900">N</text>
          <text x="85" y="142" fill="#34D399" fontSize="16" fontWeight="900">C</text>
          <text x="330" y="142" fill="#34D399" fontSize="16" fontWeight="900">D</text>
          <text x="192" y="144" fill="#FACC15" fontSize="16" fontWeight="900">H</text>
        </g>
      )}

      {/* 14. Intersecting non-parallel lines */}
      {preset === 'intersecting_vs_parallel_q' && (
        <g>
          <line x1="48" y1="68" x2="365" y2="108" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="48" y1="176" x2="365" y2="128" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" />
          <text x="210" y="206" textAnchor="middle" fill="#FDE68A" fontSize="13" fontWeight="800">
            Khoảng cách hai đường đang hẹp dần về bên phải
          </text>
        </g>
      )}

      {/* 15. Letter E multi-parallel sticks */}
      {preset === 'letter_e_multi_par_q' && (
        <g strokeLinecap="round">
          <line x1="125" y1="48" x2="125" y2="182" stroke="#38BDF8" strokeWidth="7" />
          <line x1="125" y1="48" x2="295" y2="48" stroke="#FACC15" strokeWidth="7" />
          <line x1="125" y1="115" x2="275" y2="115" stroke="#34D399" strokeWidth="7" />
          <line x1="125" y1="182" x2="295" y2="182" stroke="#34D399" strokeWidth="7" />
          <text x="108" y="54" fill="#FACC15" fontSize="16" fontWeight="900">A</text>
          <text x="308" y="54" fill="#FACC15" fontSize="16" fontWeight="900">B</text>
          <text x="108" y="121" fill="#34D399" fontSize="16" fontWeight="900">C</text>
          <text x="290" y="121" fill="#34D399" fontSize="16" fontWeight="900">D</text>
          <text x="108" y="188" fill="#34D399" fontSize="16" fontWeight="900">E</text>
          <text x="308" y="188" fill="#34D399" fontSize="16" fontWeight="900">F</text>
        </g>
      )}

      {/* 16. Real-World: Acoustic Guitar with 6 Parallel Strings */}
      {preset === 'guitar_strings_real' && (
        <g>
          {/* Wooden guitar body (right side) */}
          <ellipse cx="332" cy="115" rx="72" ry="86" fill="#B45309" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="315" cy="115" r="34" fill="#1E1B4B" stroke="#FDE68A" strokeWidth="3.5" />
          {/* Wooden bridge */}
          <rect x="362" y="72" width="12" height="86" rx="4" fill="#451A03" />
          {/* Fretboard neck */}
          <rect x="34" y="74" width="256" height="82" rx="6" fill="#78350F" stroke="#D97706" strokeWidth="2.5" />
          {/* Vertical frets */}
          {[74, 114, 154, 194, 234, 270].map((fx) => (
            <line key={fx} x1={fx} y1="74" x2={fx} y2="156" stroke="#FCD34D" strokeWidth="2" opacity="0.65" />
          ))}
          {/* 6 Parallel Strings (top gold, other 5 bright emerald/sky) */}
          {[83, 96, 109, 122, 135, 148].map((sy, idx) => (
            <line
              key={sy}
              x1="34"
              y1={sy}
              x2="368"
              y2={sy}
              stroke={idx === 0 ? '#FACC15' : '#34D399'}
              strokeWidth={idx === 0 ? '3.4' : '2.4'}
            />
          ))}
          <text x="148" y="40" textAnchor="middle" fill="#FDE68A" fontSize="13" fontWeight="900">
            6 dây đàn căng thẳng trên cần đàn ghi-ta
          </text>
        </g>
      )}

      {/* 17. Real-World: Pedestrian Zebra Crossing Parallel Stripes */}
      {preset === 'zebra_crossing_real' && (
        <g>
          {/* Asphalt road */}
          <rect x="24" y="26" width="372" height="178" rx="12" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          {/* Top & bottom sidewalk curbs */}
          <rect x="24" y="26" width="372" height="18" rx="6" fill="#64748B" />
          <rect x="24" y="186" width="372" height="18" rx="6" fill="#64748B" />
          {/* 5 Bold Parallel White Crossing Stripes */}
          {[56, 84, 112, 140, 168].map((sy, idx) => (
            <rect
              key={sy}
              x="92"
              y={sy - 7}
              width="236"
              height="14"
              rx="3"
              fill={idx === 0 ? '#FACC15' : '#F8FAFC'}
            />
          ))}
          {/* Pedestrian road sign icon */}
          <circle cx="56" cy="115" r="18" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
          <text x="56" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="18">🚶</text>
          <text x="210" y="220" textAnchor="middle" fill="#BAE6FD" fontSize="12" fontWeight="800">
            Vạch kẻ đường cho người đi bộ
          </text>
        </g>
      )}

      {/* 18. Real-World: 4-Shelf Wooden Bookshelf */}
      {preset === 'bookshelf_real' && (
        <g>
          {/* Back wooden panel */}
          <rect x="106" y="26" width="208" height="184" rx="6" fill="#451A03" opacity="0.65" />
          {/* Colorful books sitting on shelves */}
          {[78, 124, 170].map((baseY, shelfIdx) => (
            <g key={baseY}>
              <rect x="122" y={baseY - 28} width="18" height="28" rx="2" fill={shelfIdx % 2 === 0 ? '#38BDF8' : '#F472B6'} />
              <rect x="142" y={baseY - 32} width="16" height="32" rx="2" fill="#FACC15" />
              <rect x="160" y={baseY - 24} width="20" height="24" rx="2" fill="#34D399" />
              <rect x="244" y={baseY - 30} width="18" height="30" rx="2" fill="#FB923C" />
              <rect x="264" y={baseY - 26} width="18" height="26" rx="2" fill="#A78BFA" />
            </g>
          ))}
          {/* 2 Parallel Vertical Side Panels AG and BH */}
          <line x1="106" y1="36" x2="106" y2="206" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
          <line x1="314" y1="36" x2="314" y2="206" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
          {/* 4 Parallel Horizontal Shelves AB, CD, EF, GH */}
          {[
            { y: 38, l: 'A', r: 'B', col: '#FACC15' },
            { y: 84, l: 'C', r: 'D', col: '#34D399' },
            { y: 130, l: 'E', r: 'F', col: '#34D399' },
            { y: 176, l: 'G', r: 'H', col: '#34D399' },
          ].map((sh) => (
            <g key={sh.l}>
              <line x1="106" y1={sh.y} x2="314" y2={sh.y} stroke={sh.col} strokeWidth="6" strokeLinecap="round" />
              <text x="86" y={sh.y + 6} textAnchor="middle" fill={sh.col} fontSize="16" fontWeight="900">{sh.l}</text>
              <text x="334" y={sh.y + 6} textAnchor="middle" fill={sh.col} fontSize="16" fontWeight="900">{sh.r}</text>
            </g>
          ))}
        </g>
      )}

      {/* 19. Geometry Shape: Trapezoid MNPQ (1 pair of parallel sides) */}
      {preset === 'trapezoid_mnpq_q' && (
        <g>
          <polygon
            points="146,56 274,56 326,174 94,174"
            fill="rgba(56,189,248,0.16)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <text x="136" y="45" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900">M</text>
          <text x="284" y="45" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900">N</text>
          <text x="340" y="186" textAnchor="middle" fill="#34D399" fontSize="18" fontWeight="900">P</text>
          <text x="80" y="186" textAnchor="middle" fill="#34D399" fontSize="18" fontWeight="900">Q</text>
          <text x="210" y="210" textAnchor="middle" fill="#CBD5E1" fontSize="13" fontWeight="800">
            Hình thang MNPQ
          </text>
        </g>
      )}

      {/* 20. Geometry Shape: Parallelogram ABCD (2 pairs of opposite parallel sides) */}
      {preset === 'parallelogram_abcd_q' && (
        <g>
          <polygon
            points="132,58 326,58 286,172 92,172"
            fill="rgba(52,211,153,0.16)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <text x="122" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">A</text>
          <text x="336" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">B</text>
          <text x="298" y="192" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">C</text>
          <text x="80" y="192" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">D</text>
          <text x="210" y="212" textAnchor="middle" fill="#CBD5E1" fontSize="13" fontWeight="800">
            Hình bình hành ABCD
          </text>
        </g>
      )}

      {/* 21. Geometry Shape: Rhombus ABCD (4 equal sides, 2 pairs of slanted parallel sides) */}
      {preset === 'rhombus_abcd_q' && (
        <g>
          <polygon
            points="210,36 322,114 210,192 98,114"
            fill="rgba(244,114,182,0.16)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <text x="210" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">A</text>
          <text x="340" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">B</text>
          <text x="210" y="214" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">C</text>
          <text x="80" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">D</text>
        </g>
      )}
    </svg>
  );
};

export const ParallelChallengeView: React.FC<ParallelChallengeViewProps> = ({
  onBackHome,
  onFinishChallengeLevel,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ParallelChallengeLevel>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  // Level 1 & 2 quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Level 3 interactive 2-step Ê Ke drawing state
  const [lvl3Idx, setLvl3Idx] = useState(0);
  const [lvl3Step, setLvl3Step] = useState<1 | 2>(1);
  const [lvl3DrawnStep1, setLvl3DrawnStep1] = useState(false);
  const [lvl3SetSquare, setLvl3SetSquare] = useState<SetSquareState>(
    PARALLEL_DRAW_TASKS[0].initialSetSquare
  );
  const [lvl3DoneMap, setLvl3DoneMap] = useState<Record<number, boolean>>({});
  const [lvl3Feedback, setLvl3Feedback] = useState<string>('');

  const questions = useMemo(
    () => (selectedLevel === 3 ? [] : getParallelQuestionsByLevel(selectedLevel)),
    [selectedLevel]
  );

  const currentLvl3Task = PARALLEL_DRAW_TASKS[lvl3Idx];
  const lvl3Alignment = useMemo(
    () => evaluateParallelStepAlignment(lvl3SetSquare, currentLvl3Task, lvl3Step),
    [lvl3SetSquare, currentLvl3Task, lvl3Step]
  );

  const startLevel = (lvl: ParallelChallengeLevel) => {
    soundFX.playClick();
    setSelectedLevel(lvl);
    setIsPlaying(true);
    setFinished(false);
    setCurrentIdx(0);
    setAnswers({});
    setLvl3Idx(0);
    setLvl3Step(1);
    setLvl3DrawnStep1(false);
    setLvl3DoneMap({});
    setLvl3Feedback('');
    setLvl3SetSquare(PARALLEL_DRAW_TASKS[0].initialSetSquare);
  };

  // --- LEVEL SELECTION HUB (3 PLANET CARDS) ---
  if (!isPlaying) {
    const levelCards: Array<{
      lvl: ParallelChallengeLevel;
      planetVi: string;
      titleVi: string;
      descVi: string;
      colorClass: string;
      badgeText: string;
      highlightsVi: string[];
    }> = [
      {
        lvl: 1,
        planetVi: 'HÀNH TINH 1 · SAO THỦY',
        titleVi: 'CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ',
        descVi:
          'Nhận biết đường thẳng song song qua đồ vật thực tế quanh em (đường ray, dây đàn ghi-ta, vạch kẻ đường, tên lửa), bản đồ phố và hình thang.',
        colorClass: 'border-yellow-400',
        badgeText: '12 câu nhận biết',
        highlightsVi: [
          '🎸 Đồ vật thực tế: đường ray, dây đàn ghi-ta, vạch kẻ đường',
          '🗺️ Giải đố bản đồ đường phố và que tính V-I-E-T',
          '📐 Nhận diện cặp cạnh song song trên hình thang và đa giác',
        ],
      },
      {
        lvl: 2,
        planetVi: 'HÀNH TINH 2 · SAO MỘC',
        titleVi: 'CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ',
        descVi:
          'Luyện đọc chuẩn tên cạnh song song trên hình bình hành, hình thoi, hình thang, giá sách 4 tầng và mở rộng 1 cạnh song song nhiều cạnh!',
        colorClass: 'border-pink-500',
        badgeText: '12 câu đọc và mở rộng',
        highlightsVi: [
          '🔷 Xác định cạnh song song trên hình bình hành, hình thoi, hình thang',
          '🌟 Mở rộng: 1 cạnh song song với 2 hoặc 3 cạnh (giá sách, cửa sổ)',
          '✏️ Tổng hợp phân biệt song song và vuông góc với nhau',
        ],
      },
      {
        lvl: 3,
        planetVi: 'HÀNH TINH 3 · SAO THỔ',
        titleVi: 'CẤP ĐỘ 3 – BẬC THẦY SONG SONG',
        descVi:
          'Trực tiếp kéo xoay thước Ê Ke thực hiện quy trình 2 bước (vẽ đường phụ MN rồi vẽ CD song song với AB) trên đường ngang, đứng và nghiêng!',
        colorClass: 'border-emerald-400',
        badgeText: '5 bài vẽ Ê Ke 2 bước',
        highlightsVi: [
          '📐 Bước 1: Dùng Ê Ke vẽ đường phụ MN vuông góc với AB qua H',
          '🛤️ Bước 2: Dùng Ê Ke vẽ CD vuông góc với MN qua H để được CD song song với AB',
          '⭐ Chinh phục cả làn chạy nghiêng trên sân thể dục',
        ],
      },
    ];

    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
          >
            ← Trang Chủ
          </button>
          <div className="text-center">
            <div className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
              CHỦ ĐỀ 3 · CHINH PHỤC 3 HÀNH TINH SONG SONG
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              3. THỬ THÁCH HAI ĐƯỜNG THẲNG SONG SONG
            </h2>
          </div>
          <div className="w-24 hidden sm:block" />
        </div>

        {/* Robot Toán Học Welcome Banner */}
        <div className="card-3d-cosmic rounded-3xl p-4 border-2 border-sky-400/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0">
            <img
              src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
              alt="Robot Toán Học"
              className="w-full h-full object-cover scale-[1.35]"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs font-extrabold text-yellow-300">ROBOT TOÁN HỌC MỜI EM CHỌN HÀNH TINH:</div>
            <p className="text-sm font-semibold text-indigo-100 mt-0.5">
              Chọn 1 trong 3 cấp độ bên dưới — từ nhận biết đời sống, bài tập mở rộng 1 cạnh song song với nhiều cạnh đến trực tiếp vẽ đường thẳng song song 2 bước bằng Ê Ke nhé!
            </p>
          </div>
        </div>

        {/* 3 Aligned Planet Level Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {levelCards.map((card) => (
            <div
              key={card.lvl}
              className={`card-3d-cosmic rounded-3xl p-5 border-2 ${card.colorClass} flex flex-col justify-between gap-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-yellow-300 uppercase tracking-wider whitespace-nowrap">
                    {card.planetVi}
                  </span>
                  <span className="text-[11px] font-extrabold bg-indigo-950 border border-indigo-400/50 text-sky-300 px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0">
                    {card.badgeText}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {card.titleVi}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">{card.descVi}</p>
                <ul className="space-y-1.5 text-xs text-indigo-200 bg-[#0B0826] rounded-2xl p-3 border border-indigo-500/30">
                  {card.highlightsVi.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                data-testid={`par-start-level-${card.lvl}`}
                onClick={() => startLevel(card.lvl)}
                className={`${
                  card.lvl === 1
                    ? 'btn-3d-gold'
                    : card.lvl === 2
                      ? 'btn-3d-pink'
                      : 'btn-3d-emerald'
                } w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer`}
              >
                🚀 Bắt đầu Cấp độ {card.lvl}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- FINISHED SCREEN ---
  if (finished) {
    const totalCount =
      selectedLevel === 3 ? PARALLEL_DRAW_TASKS.length : questions.length;
    const correctCount =
      selectedLevel === 3
        ? Object.values(lvl3DoneMap).filter(Boolean).length
        : questions.reduce((acc, q, idx) => (answers[idx] === q.correctOptionIndex ? acc + 1 : acc), 0);
    const stars = calculateStarReward(correctCount, totalCount);

    return (
      <div className="max-w-3xl w-full mx-auto px-4 py-8">
        <div className="card-3d-cosmic rounded-3xl p-8 border-2 border-yellow-400/70 text-center space-y-5">
          <div className="text-5xl">🏆</div>
          <div className="text-xs font-extrabold text-yellow-300 uppercase">
            CẤP ĐỘ {selectedLevel} · HAI ĐƯỜNG THẲNG SONG SONG
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            CHÚC MỪNG NHÀ TOÁN HỌC NHÍ!
          </h2>
          <p className="text-lg font-bold text-indigo-100">
            Em đã hoàn thành xuất sắc{' '}
            <span className="font-mono-num text-yellow-300 text-2xl">
              {correctCount} / {totalCount}
            </span>{' '}
            thử thách!
          </p>
          <div className="flex items-center justify-center gap-3 text-4xl">
            {[1, 2, 3].map((s) => (
              <span key={s} className={s <= stars ? 'text-yellow-400' : 'text-indigo-800'}>
                ★
              </span>
            ))}
          </div>
          <div className="text-sm font-bold text-emerald-300">
            Phần thưởng: +{stars} Sao Vàng Vũ Trụ
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="btn-3d-emerald px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🔄 Chơi lại Cấp độ {selectedLevel}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setIsPlaying(false);
                setFinished(false);
              }}
              className="btn-3d-gold px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🪐 Chọn Cấp độ khác
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-cobalt px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              ← Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 3: INTERACTIVE 2-STEP PARALLEL DRAWING ---
  if (selectedLevel === 3) {
    const completedCount = Object.values(lvl3DoneMap).filter(Boolean).length;
    const isCurrentDone = Boolean(lvl3DoneMap[lvl3Idx]);

    const handleLvl3Snap = () => {
      soundFX.playSnap();
      const geom = computeParallelGeometry(currentLvl3Task);
      setLvl3SetSquare(lvl3Step === 1 ? geom.step1Snap : geom.step2Snap);
      setLvl3Feedback(
        lvl3Step === 1
          ? '✨ Đã đặt chuẩn Ê Ke cho Bước 1! Hãy bấm nút vạch đường phụ MN ngay nhé!'
          : '✨ Đã đặt chuẩn Ê Ke cho Bước 2! Hãy bấm nút vạch đường song song CD ngay nhé!'
      );
    };

    const handleLvl3Draw = () => {
      if (!lvl3Alignment.isFullyAligned) {
        soundFX.playWrong();
        setLvl3Feedback(
          lvl3Step === 1
            ? `⚠️ Bước 1: Đặt 1 cạnh góc vuông ê ke trùng ${currentLvl3Task.baseLine.nameVi} và cạnh thứ hai chạm điểm ${currentLvl3Task.targetPointLabel} nhé!`
            : `⚠️ Bước 2: Đặt 1 cạnh góc vuông ê ke trùng đường phụ ${currentLvl3Task.auxLineLabels.join('')} tại điểm ${currentLvl3Task.targetPointLabel} nhé!`
        );
        return;
      }
      if (lvl3Step === 1) {
        soundFX.playSuccess();
        setLvl3DrawnStep1(true);
        setLvl3Step(2);
        setLvl3Feedback('✅ Hoàn thành Bước 1! Tiếp tục đặt Ê Ke trùng đường phụ MN để vẽ Bước 2 nhé!');
      } else {
        soundFX.playSuccess();
        setLvl3DoneMap((prev) => ({ ...prev, [lvl3Idx]: true }));
        setLvl3Feedback(
          `🎉 Chính xác tuyệt đối! Đường thẳng ${currentLvl3Task.parallelLineLabels.join('')} đi qua ${currentLvl3Task.targetPointLabel} và song song với ${currentLvl3Task.baseLine.nameVi}!`
        );
      }
    };

    const handleSelectLvl3Task = (idx: number) => {
      soundFX.playClick();
      setLvl3Idx(idx);
      setLvl3Step(1);
      setLvl3DrawnStep1(Boolean(lvl3DoneMap[idx]));
      setLvl3Feedback('');
      setLvl3SetSquare(PARALLEL_DRAW_TASKS[idx].initialSetSquare);
    };

    const handleLvl3NextOrFinish = () => {
      soundFX.playClick();
      if (lvl3Idx < PARALLEL_DRAW_TASKS.length - 1) {
        handleSelectLvl3Task(lvl3Idx + 1);
      } else {
        const doneTotal = Object.values(lvl3DoneMap).filter(Boolean).length;
        const stars = calculateStarReward(doneTotal, PARALLEL_DRAW_TASKS.length);
        onFinishChallengeLevel(3, doneTotal * 20, stars);
        setFinished(true);
        soundFX.playSuccess();
      }
    };

    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setIsPlaying(false);
            }}
            className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
          >
            ← Chọn Cấp Độ
          </button>
          <div className="text-center">
            <div className="text-xs font-extrabold text-emerald-300 uppercase">
              HÀNH TINH 3 · CẤP ĐỘ 3 – BẬC THẦY SONG SONG
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              THỬ THÁCH {lvl3Idx + 1} / {PARALLEL_DRAW_TASKS.length}: VẼ SONG SONG 2 BƯỚC BẰNG Ê KE
            </h2>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/60 px-3.5 py-1.5 rounded-xl text-xs font-mono-num font-extrabold text-emerald-200">
            Hoàn thành: {completedCount}/{PARALLEL_DRAW_TASKS.length}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {PARALLEL_DRAW_TASKS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectLvl3Task(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border ${
                idx === lvl3Idx
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                  : lvl3DoneMap[idx]
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400'
                    : 'bg-[#130E38]/95 text-indigo-200 border-indigo-400/40'
              }`}
            >
              {lvl3DoneMap[idx] ? '✓ ' : ''}Bài {idx + 1}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-3">
            <InteractiveParallelSetSquareSVG
              task={currentLvl3Task}
              activeStep={lvl3Step}
              hasDrawnStep1={lvl3DrawnStep1 || isCurrentDone}
              hasDrawnStep2={isCurrentDone}
              setSquare={lvl3SetSquare}
              onChangeSetSquare={setLvl3SetSquare}
              alignment={lvl3Alignment}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#130E38]/95 border border-indigo-400/40 rounded-2xl p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-200 mr-1">Xoay nhanh ê ke:</span>
                {[15, 5, -5, -15, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      soundFX.playTick(Math.abs(d) * 4);
                      setLvl3SetSquare((prev) => ({
                        ...prev,
                        rotationDeg: normalizeDeg360(prev.rotationDeg + d),
                      }));
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-400/50 text-xs font-extrabold text-white hover:bg-indigo-800 cursor-pointer font-mono-num"
                  >
                    {d > 0 ? `↺ +${d}°` : `↻ ${d}°`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                data-testid="par-lvl3-snap-btn"
                onClick={handleLvl3Snap}
                className="px-3 py-1.5 rounded-lg bg-yellow-400/20 border border-yellow-400/60 text-xs font-extrabold text-yellow-200 hover:bg-yellow-400/30 cursor-pointer"
              >
                💡 Gợi ý đặt chuẩn Bước {lvl3Step}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-yellow-300 uppercase">
                {currentLvl3Task.badgeVi}
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                {currentLvl3Task.titleVi}
              </h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                {lvl3Step === 1 ? currentLvl3Task.instructionStep1Vi : currentLvl3Task.instructionStep2Vi}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <div
                className={`p-2 rounded-xl border text-center ${
                  lvl3DrawnStep1 || isCurrentDone
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                }`}
              >
                {lvl3DrawnStep1 || isCurrentDone ? '✅ ' : '1️⃣ '}Bước 1: MN vuông góc với AB
              </div>
              <div
                className={`p-2 rounded-xl border text-center ${
                  isCurrentDone
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : lvl3Step === 2
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                      : 'bg-[#0B0826] border-indigo-500/40 text-indigo-300'
                }`}
              >
                {isCurrentDone ? '✅ ' : '2️⃣ '}Bước 2: CD vuông góc với MN
              </div>
            </div>

            {!isCurrentDone && (
              <button
                type="button"
                data-testid="par-lvl3-draw-btn"
                onClick={handleLvl3Draw}
                className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                {lvl3Step === 1
                  ? `✏️ Vạch đường phụ ${currentLvl3Task.auxLineLabels.join('')}`
                  : `✨ Vạch đường song song ${currentLvl3Task.parallelLineLabels.join('')}`}
              </button>
            )}

            {lvl3Feedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border leading-relaxed ${
                  isCurrentDone || lvl3Feedback.startsWith('✅') || lvl3Feedback.startsWith('✨')
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-amber-500/20 border-amber-400 text-amber-100'
                }`}
              >
                {lvl3Feedback}
              </div>
            )}

            {isCurrentDone && (
              <button
                type="button"
                onClick={handleLvl3NextOrFinish}
                className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                {lvl3Idx < PARALLEL_DRAW_TASKS.length - 1
                  ? 'Thử thách tiếp theo →'
                  : '🏆 Hoàn thành Cấp độ 3'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 1 & LEVEL 2 QUIZ SCREEN ---
  const currentQ = questions[currentIdx];
  const selectedOption = answers[currentIdx];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = selectedOption === currentQ.correctOptionIndex;
  const correctCount = questions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctOptionIndex ? acc + 1 : acc),
    0
  );

  const handleSelectOption = (optionIdx: number) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
    if (optionIdx === currentQ.correctOptionIndex) {
      soundFX.playSuccess();
    } else {
      soundFX.playWrong();
    }
  };

  const handleNextOrFinish = () => {
    soundFX.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      const stars = calculateStarReward(correctCount, questions.length);
      onFinishChallengeLevel(selectedLevel, correctCount * 10, stars);
      setFinished(true);
      soundFX.playSuccess();
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setIsPlaying(false);
          }}
          className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          ← Chọn Cấp Độ
        </button>
        <div className="text-center">
          <div className="text-xs font-extrabold text-yellow-300 uppercase">
            {selectedLevel === 1
              ? 'HÀNH TINH 1 · CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ'
              : 'HÀNH TINH 2 · CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            THỬ THÁCH HAI ĐƯỜNG THẲNG SONG SONG
          </h2>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-400/60 px-3.5 py-1.5 rounded-xl text-xs font-mono-num font-extrabold text-emerald-200">
          Điểm: {correctCount}/{questions.length}
        </div>
      </div>

      {/* Quick Question Number Strip 1..10 */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {questions.map((q, idx) => {
          const ans = answers[idx];
          const isCur = idx === currentIdx;
          const isRight = ans !== undefined && ans === q.correctOptionIndex;
          const isWrong = ans !== undefined && ans !== q.correctOptionIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCurrentIdx(idx);
              }}
              className={`w-9 h-9 rounded-xl text-xs font-mono-num font-extrabold cursor-pointer border-2 transition-all ${
                isCur
                  ? 'bg-indigo-700 border-yellow-400 text-white scale-105'
                  : isRight
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : isWrong
                      ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                      : 'bg-[#130E38]/95 border-indigo-400/40 text-indigo-200 hover:border-sky-300'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Split Card */}
      <div className="card-3d-cosmic rounded-3xl p-5 sm:p-6 border-2 border-indigo-400/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-yellow-300">🛤️ {currentQ.categoryLabelVi}</span>
            <span className="text-sky-300">{currentQ.badgeTitleVi}</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-indigo-400/50 shadow-lg">
            <ParallelDiagramSVG preset={currentQ.diagramPreset} />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="text-xs font-extrabold text-indigo-300 uppercase">
              CÂU HỎI {currentIdx + 1} / {questions.length}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
              {currentQ.promptVi}
            </h3>
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isChosen = selectedOption === idx;
              const isRightOpt = idx === currentQ.correctOptionIndex;

              let btnClass =
                'bg-[#130E38]/90 border-indigo-400/50 text-white hover:border-yellow-400';
              if (isAnswered) {
                if (isRightOpt) {
                  btnClass = 'bg-emerald-500/25 border-emerald-400 text-emerald-100';
                } else if (isChosen) {
                  btnClass = 'bg-rose-500/25 border-rose-400 text-rose-100';
                } else {
                  btnClass = 'bg-[#0B0826]/80 border-indigo-500/30 text-indigo-300 opacity-70';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center gap-3 transition-all ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer'
                  } ${btnClass}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-400/50 flex items-center justify-center font-mono-num font-extrabold text-xs text-yellow-300 shrink-0">
                    {letter}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-3 pt-1">
              <div
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400 text-rose-100'
                }`}
              >
                {isCorrect ? '🎉 Chính xác! ' : '💡 Giải thích: '}
                {currentQ.explanationVi}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextOrFinish}
                  className="btn-3d-gold px-6 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer"
                >
                  {currentIdx < questions.length - 1 ? 'Câu tiếp theo →' : '🏆 Xem kết quả'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
