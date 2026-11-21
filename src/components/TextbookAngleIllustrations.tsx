import React from 'react';

/**
 * Hình minh họa 1 (Vector sắc nét): Cách đọc tên góc và so sánh hai góc theo sách giáo khoa Toán lớp 4
 * - Góc đỉnh O; cạnh OA, OB
 * - Góc đỉnh P; cạnh PM, PN
 */
export const TextbookAngleNamingSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 border-yellow-400/70 bg-[#0B192C] shadow-lg ${className}`}
    >
      <svg
        viewBox="0 0 460 220"
        className="w-full h-auto block select-none"
        role="img"
        aria-label="Minh họa cách đọc tên góc: Góc đỉnh O; cạnh OA, OB và Góc đỉnh P; cạnh PM, PN"
      >
        <defs>
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F3D3E" />
            <stop offset="100%" stopColor="#092627" />
          </linearGradient>
          <pattern id="boardGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Chalkboard Frame & Surface */}
        <rect x="0" y="0" width="460" height="220" fill="url(#boardBg)" />
        <rect x="0" y="0" width="460" height="220" fill="url(#boardGrid)" />
        <rect
          x="6"
          y="6"
          width="448"
          height="208"
          rx="12"
          fill="none"
          stroke="#D97706"
          strokeWidth="4"
        />

        {/* Top Header Banner: CÁCH ĐỌC TÊN GÓC */}
        <g transform="translate(18, 16)">
          <rect
            x="0"
            y="0"
            width="424"
            height="40"
            rx="12"
            fill="#FFFBEB"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <text
            x="212"
            y="20"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0F172A"
            fontSize="16"
            fontWeight="900"
            letterSpacing="0.5"
          >
            CÁCH ĐỌC TÊN GÓC
          </text>
        </g>

        {/* LEFT ANGLE: Góc đỉnh O; cạnh OA, OB (52°) */}
        <g transform="translate(0, 10)">
          {/* Angle Sector Arc */}
          <path
            d="M 75 162 L 111 162 A 36 36 0 0 0 97 133 Z"
            fill="rgba(250, 204, 21, 0.25)"
            stroke="#FACC15"
            strokeWidth="2"
          />
          {/* Side OB (Horizontal) */}
          <line
            x1="75"
            y1="162"
            x2="185"
            y2="162"
            stroke="#FDE047"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Side OA (Slanted) */}
          <line
            x1="75"
            y1="162"
            x2="138"
            y2="80"
            stroke="#FDE047"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Endpoints & Vertex Dots */}
          <circle cx="75" cy="162" r="5" fill="#FACC15" stroke="#092627" strokeWidth="2" />
          <circle cx="185" cy="162" r="4" fill="#38BDF8" />
          <circle cx="138" cy="80" r="4" fill="#38BDF8" />

          {/* Labels O, A, B */}
          <text
            x="56"
            y="174"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="18"
            fontWeight="900"
          >
            O
          </text>
          <text
            x="118"
            y="76"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="17"
            fontWeight="900"
          >
            A
          </text>
          <text
            x="192"
            y="170"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="17"
            fontWeight="900"
          >
            B
          </text>

          {/* Caption Badge */}
          <rect
            x="38"
            y="180"
            width="174"
            height="22"
            rx="6"
            fill="rgba(9, 6, 33, 0.78)"
            stroke="rgba(250, 204, 21, 0.5)"
            strokeWidth="1"
          />
          <text
            x="125"
            y="191"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FEF08A"
            fontSize="11"
            fontWeight="800"
          >
            Góc đỉnh O; cạnh OA, OB
          </text>
        </g>

        {/* RIGHT ANGLE: Góc đỉnh P; cạnh PM, PN (68°) */}
        <g transform="translate(225, 10)">
          {/* Angle Sector Arc */}
          <path
            d="M 65 162 L 103 162 A 38 38 0 0 0 80 127 Z"
            fill="rgba(244, 114, 182, 0.28)"
            stroke="#F472B6"
            strokeWidth="2"
          />
          {/* Side PN (Horizontal) */}
          <line
            x1="65"
            y1="162"
            x2="185"
            y2="162"
            stroke="#FDE047"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Side PM (Wider Slanted) */}
          <line
            x1="65"
            y1="162"
            x2="112"
            y2="72"
            stroke="#FDE047"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Endpoints & Vertex Dots */}
          <circle cx="65" cy="162" r="5" fill="#F472B6" stroke="#092627" strokeWidth="2" />
          <circle cx="185" cy="162" r="4" fill="#38BDF8" />
          <circle cx="112" cy="72" r="4" fill="#38BDF8" />

          {/* Labels P, M, N */}
          <text
            x="45"
            y="174"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="18"
            fontWeight="900"
          >
            P
          </text>
          <text
            x="90"
            y="72"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="17"
            fontWeight="900"
          >
            M
          </text>
          <text
            x="192"
            y="170"
            fill="#FFFFFF"
            stroke="#092627"
            strokeWidth="3"
            paintOrder="stroke"
            fontSize="17"
            fontWeight="900"
          >
            N
          </text>

          {/* Caption Badge */}
          <rect
            x="34"
            y="180"
            width="178"
            height="22"
            rx="6"
            fill="rgba(9, 6, 33, 0.78)"
            stroke="rgba(244, 114, 182, 0.5)"
            strokeWidth="1"
          />
          <text
            x="123"
            y="191"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FBCFE8"
            fontSize="11"
            fontWeight="800"
          >
            Góc đỉnh P; cạnh PM, PN
          </text>
        </g>
      </svg>
    </div>
  );
};

/**
 * Hình minh họa 2 (Vector sắc nét): Vị trí ghi số đo góc bên trong khe góc sát đỉnh (Tứ giác ABCD: 60°, 90°, 90°, 120°)
 */
export const TextbookAngleMeasurePlacementSVG: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  // Exact geometric vertices for Quadrilateral ABCD:
  // A = (78, 174) -> Bottom-left (90° right angle between vertical AB and horizontal AD)
  // B = (78, 34)  -> Top-left (60° acute angle between BA and BC)
  // C = (236, 114)-> Right vertex (90° right angle between CB and CD)
  // D = (188, 174)-> Bottom-right (120° obtuse angle between DA and DC)
  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 border-emerald-400/70 bg-[#0D1333] shadow-lg ${className}`}
    >
      <svg
        viewBox="0 0 310 220"
        className="w-full h-auto block select-none"
        role="img"
        aria-label="Minh họa vị trí ghi số đo góc 60°, 90°, 120° ở ngay bên trong khe góc sát đỉnh A, B, C, D"
      >
        <defs>
          <pattern id="quadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(99, 102, 241, 0.14)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="310" height="220" fill="#090621" />
        <rect x="0" y="0" width="310" height="220" fill="url(#quadGrid)" />

        {/* Quadrilateral ABCD Subtle Fill (Exact 90° at A and C, 60° at B, 120° at D) */}
        <polygon
          points="78,174 78,34 216.6,114 182,174"
          fill="rgba(56, 189, 248, 0.08)"
        />

        {/* Angle Highlights at A, B, C, D: Square symbols for 90° (A, C) and sectors for 60° (B), 120° (D) */}
        {/* Vertex A (90°) exact square symbol */}
        <rect
          x="78"
          y="152"
          width="22"
          height="22"
          fill="rgba(34, 197, 94, 0.28)"
          stroke="#22C55E"
          strokeWidth="2"
        />
        {/* Vertex B (60°) sector */}
        <path
          d="M 78 34 L 78 72 A 38 38 0 0 0 111 53 Z"
          fill="rgba(250, 204, 21, 0.28)"
          stroke="#FACC15"
          strokeWidth="1.8"
        />
        {/* Vertex C (90°) exact rotated square symbol */}
        <polygon
          points="216.6,114 199.3,104 189.3,121.3 206.6,131.3"
          fill="rgba(34, 197, 94, 0.28)"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        {/* Vertex D (120°) sector */}
        <path
          d="M 182 174 L 199 144.5 A 34 34 0 0 0 148 174 Z"
          fill="rgba(244, 114, 182, 0.28)"
          stroke="#F472B6"
          strokeWidth="1.8"
        />

        {/* Quadrilateral ABCD Crisp Outline */}
        <polygon
          points="78,174 78,34 216.6,114 182,174"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Vertex Dots */}
        <circle cx="78" cy="174" r="4.5" fill="#22C55E" />
        <circle cx="78" cy="34" r="4.5" fill="#FACC15" />
        <circle cx="216.6" cy="114" r="4.5" fill="#22C55E" />
        <circle cx="182" cy="174" r="4.5" fill="#F472B6" />

        {/* Vertex Labels A, B, C, D */}
        <text x="54" y="184" fill="#38BDF8" fontSize="18" fontWeight="900">
          A
        </text>
        <text x="56" y="28" fill="#38BDF8" fontSize="18" fontWeight="900">
          B
        </text>
        <text x="228" y="119" fill="#38BDF8" fontSize="18" fontWeight="900">
          C
        </text>
        <text x="190" y="191" fill="#38BDF8" fontSize="18" fontWeight="900">
          D
        </text>

        {/* Degree Measures Nestled Inside Each Vertex Corner (Textbook Standard) */}
        {/* 60° inside Vertex B */}
        <text
          x="99"
          y="66"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FEF08A"
          stroke="#090621"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="15"
          fontWeight="800"
          className="font-mono-num"
        >
          60°
        </text>

        {/* 90° inside Vertex A */}
        <text
          x="114"
          y="156"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#86EFAC"
          stroke="#090621"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="15"
          fontWeight="800"
          className="font-mono-num"
        >
          90°
        </text>

        {/* 90° inside Vertex C */}
        <text
          x="176"
          y="116"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#86EFAC"
          stroke="#090621"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="15"
          fontWeight="800"
          className="font-mono-num"
        >
          90°
        </text>

        {/* 120° inside Vertex D */}
        <text
          x="162"
          y="156"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FBCFE8"
          stroke="#090621"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="15"
          fontWeight="800"
          className="font-mono-num"
        >
          120°
        </text>

        {/* Footer Caption */}
        <rect
          x="22"
          y="194"
          width="266"
          height="20"
          rx="6"
          fill="rgba(15, 23, 42, 0.9)"
          stroke="rgba(52, 211, 153, 0.45)"
          strokeWidth="1"
        />
        <text
          x="155"
          y="204"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#A7F3D0"
          fontSize="10.5"
          fontWeight="800"
        >
          Vị trí ghi số đo: Đặt ở góc trong sát mỗi đỉnh
        </text>
      </svg>
    </div>
  );
};
