import React from 'react';

interface HeritageIllustrationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const HeritageIllustration: React.FC<HeritageIllustrationProps> = ({
  className = '',
  width = '100%',
  height = '100%',
}) => {
  return (
    <svg
      viewBox="0 0 700 740"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width, height, display: 'block' }}
      aria-label="Artistic heritage illustration of classical Indian financial architecture with golden dome and iconic yellow taxis"
      role="img"
    >
      <defs>
        <linearGradient id="bgSky" x1="350" y1="0" x2="350" y2="740" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a2533" />
          <stop offset="60%" stopColor="#0d3b4c" />
          <stop offset="100%" stopColor="#08212d" />
        </linearGradient>

        <linearGradient id="goldDomeGrad" x1="350" y1="180" x2="350" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="sideDomeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="buildingFacade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="30%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        <linearGradient id="taxiYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="taxiTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <radialGradient id="sunGlow" cx="50%" cy="28%" r="40%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0d3b4c" stopOpacity="0" />
        </radialGradient>

        <filter id="domeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#F59E0B" floodOpacity="0.45" />
        </filter>

        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Atmospheric Glow */}
      <rect width="700" height="740" fill="url(#bgSky)" rx="24" />
      <circle cx="350" cy="240" r="280" fill="url(#sunGlow)" />

      {/* Retro Hindi Devanagari typographic accent in soft contrast */}
      <g opacity="0.12" fill="#FFFFFF" style={{ userSelect: 'none' }}>
        <text
          x="350"
          y="150"
          textAnchor="middle"
          fontSize="110"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
        >
          मर्चेंट पल्स
        </text>
      </g>

      {/* Central Spire & Finial */}
      <path d="M350 170 L350 205" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
      <circle cx="350" cy="168" r="6" fill="#FDE68A" filter="url(#domeGlow)" />
      <circle cx="350" cy="180" r="3.5" fill="#F59E0B" />

      {/* MAIN GOLDEN DOME */}
      <path
        d="M295 270 C295 210, 325 200, 350 200 C375 200, 405 210, 405 270 Z"
        fill="url(#goldDomeGrad)"
        filter="url(#domeGlow)"
      />
      {/* Dome Ribs */}
      <path d="M350 200 Q348 235 348 270" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.7" fill="none" />
      <path d="M350 200 Q330 235 320 270" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
      <path d="M350 200 Q370 235 380 270" stroke="#B45309" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
      <rect x="290" y="268" width="120" height="8" rx="2" fill="#FBBF24" />

      {/* CLOCK TOWER OCTAGON / CYLINDER */}
      <path d="M305 276 L395 276 L390 345 L310 345 Z" fill="#E2E8F0" />
      <rect x="300" y="342" width="100" height="8" rx="2" fill="#F8FAFC" />

      {/* Vintage Clock Face */}
      <circle cx="350" cy="310" r="22" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <circle cx="350" cy="310" r="18" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" />
      {/* Clock Hands indicating 10:10 (Symbol of precision & elegance) */}
      <line x1="350" y1="310" x2="341" y2="299" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <line x1="350" y1="310" x2="363" y2="303" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="350" cy="310" r="3" fill="#D97706" />

      {/* Clock Tower Arched Louvers */}
      <path d="M316 325 C316 318 322 314 326 314 C330 314 336 318 336 325 L336 340 L316 340 Z" fill="#0F2937" />
      <path d="M364 325 C364 318 370 314 374 314 C378 314 384 318 384 325 L384 340 L364 340 Z" fill="#0F2937" />

      {/* TOWER LOWER BALUSTRADE */}
      <rect x="285" y="348" width="130" height="26" fill="#F1F5F9" />
      {/* Balusters */}
      {[292, 305, 318, 331, 344, 357, 370, 383, 396, 404].map((bx) => (
        <rect key={bx} x={bx} y="352" width="4" height="18" rx="1" fill="#64748B" />
      ))}
      <rect x="280" y="372" width="140" height="7" fill="#CBD5E1" />

      {/* LEFT & RIGHT WING MINI-DOMES */}
      {/* Left Turret & Dome */}
      <path d="M125 385 C125 350 142 345 155 345 C168 345 185 350 185 385 Z" fill="url(#sideDomeGrad)" />
      <line x1="155" y1="333" x2="155" y2="345" stroke="#FDE68A" strokeWidth="3" />
      <circle cx="155" cy="331" r="3" fill="#FDE68A" />
      <rect x="120" y="384" width="70" height="6" fill="#EAB308" />
      <rect x="126" y="390" width="58" height="28" fill="#E2E8F0" />
      <path d="M142 400 C142 393 148 390 155 390 C162 390 168 393 168 400 L168 418 L142 418 Z" fill="#0F2937" />

      {/* Right Turret & Dome */}
      <path d="M515 385 C515 350 532 345 545 345 C558 345 575 350 575 385 Z" fill="url(#sideDomeGrad)" />
      <line x1="545" y1="333" x2="545" y2="345" stroke="#FDE68A" strokeWidth="3" />
      <circle cx="545" cy="331" r="3" fill="#FDE68A" />
      <rect x="510" y="384" width="70" height="6" fill="#EAB308" />
      <rect x="516" y="390" width="58" height="28" fill="#E2E8F0" />
      <path d="M532 400 C532 393 538 390 545 390 C552 390 558 393 558 400 L558 418 L532 418 Z" fill="#0F2937" />

      {/* MAIN NEOCLASSICAL FACADE */}
      <rect x="110" y="415" width="480" height="210" fill="url(#buildingFacade)" filter="url(#softShadow)" />

      {/* Classical Dentils / Cornice */}
      <rect x="95" y="415" width="510" height="12" fill="#F8FAFC" />
      {[105, 125, 145, 165, 185, 205, 225, 245, 265, 285, 305, 325, 345, 365, 385, 405, 425, 445, 465, 485, 505, 525, 545, 565, 585].map(
        (dx) => (
          <rect key={dx} x={dx} y="420" width="8" height="5" fill="#94A3B8" />
        )
      )}

      {/* UPPER FLOOR (Tier 1) - Classical Arched Windows & Corinthian Pilasters */}
      <g>
        {[135, 185, 235, 285, 335, 385, 435, 485, 535].map((wx) => (
          <g key={`t1-${wx}`}>
            {/* Pilaster Column */}
            <rect x={wx - 10} y="428" width="6" height="58" fill="#CBD5E1" />
            <rect x={wx - 12} y="427" width="10" height="4" fill="#D97706" />
            {/* Arched Window with warm glow */}
            <path
              d={`M${wx} 446 C${wx} 435 ${wx + 13} 430 ${wx + 20} 430 C${wx + 27} 430 ${wx + 40} 435 ${wx + 40} 446 L${wx + 40} 482 L${wx} 482 Z`}
              fill="#081D28"
            />
            {/* Window Pane Divider */}
            <line x1={wx + 20} y1="432" x2={wx + 20} y2="482" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1={wx} y1="454" x2={wx + 40} y2="454" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1={wx} y1="468" x2={wx + 40} y2="468" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Window Sill */}
            <rect x={wx - 2} y="482" width="44" height="4" fill="#F8FAFC" />
          </g>
        ))}
      </g>

      {/* Middle Floor Balcony / Stringcourse */}
      <rect x="100" y="490" width="500" height="10" fill="#E2E8F0" />
      <rect x="105" y="492" width="490" height="2" fill="#D97706" />

      {/* MIDDLE FLOOR (Tier 2) - Tall Double Arched Windows */}
      <g>
        {[135, 185, 235, 285, 335, 385, 435, 485, 535].map((wx) => (
          <g key={`t2-${wx}`}>
            <rect x={wx - 10} y="500" width="6" height="60" fill="#CBD5E1" />
            <rect x={wx - 12} y="499" width="10" height="4" fill="#D97706" />
            <path
              d={`M${wx} 518 C${wx} 507 ${wx + 13} 502 ${wx + 20} 502 C${wx + 27} 502 ${wx + 40} 507 ${wx + 40} 518 L${wx + 40} 556 L${wx} 556 Z`}
              fill="#081D28"
            />
            <line x1={wx + 20} y1="504" x2={wx + 20} y2="556" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1={wx} y1="528" x2={wx + 40} y2="528" stroke="#E2E8F0" strokeWidth="1.5" />
            <rect x={wx - 2} y="556" width="44" height="4" fill="#F8FAFC" />
          </g>
        ))}
      </g>

      {/* Lower Cornice */}
      <rect x="100" y="563" width="500" height="12" fill="#CBD5E1" />

      {/* GROUND FLOOR - Grand Porticos & Rusticated Arcade */}
      <rect x="105" y="575" width="490" height="55" fill="#B91C1C" opacity="0.85" />
      <g>
        {[130, 180, 230, 280, 330, 380, 430, 480, 530].map((px) => (
          <g key={`portico-${px}`}>
            {/* Awning Canvas */}
            <path d={`M${px - 4} 575 L${px + 44} 575 L${px + 40} 595 L${px} 595 Z`} fill="#1E3A8A" />
            {/* Entrance Door / Arch */}
            <rect x={px + 4} y="595" width="32" height="35" fill="#0B132B" rx="3" />
            <rect x={px + 8} y="600" width="10" height="25" fill="#FBBF24" opacity="0.6" rx="1" />
            <rect x={px + 22} y="600" width="10" height="25" fill="#FBBF24" opacity="0.6" rx="1" />
          </g>
        ))}
      </g>

      {/* STREET LEVEL / PAVEMENT */}
      <rect x="0" y="625" width="700" height="115" fill="#0F172A" />
      <rect x="0" y="625" width="700" height="6" fill="#334155" />

      {/* Street Trees */}
      <g>
        <circle cx="85" cy="580" r="38" fill="#14532D" opacity="0.9" />
        <circle cx="105" cy="565" r="30" fill="#166534" opacity="0.85" />
        <rect x="92" y="605" width="8" height="22" fill="#451A03" />

        <circle cx="615" cy="580" r="38" fill="#14532D" opacity="0.9" />
        <circle cx="595" cy="565" r="30" fill="#166534" opacity="0.85" />
        <rect x="608" y="605" width="8" height="22" fill="#451A03" />
      </g>

      {/* Street Lamps */}
      <g stroke="#94A3B8" strokeWidth="2">
        <line x1="115" y1="625" x2="115" y2="560" />
        <path d="M115 560 C115 550 128 550 128 558" fill="none" />
        <circle cx="128" cy="560" r="4" fill="#FDE68A" stroke="none" />

        <line x1="585" y1="625" x2="585" y2="560" />
        <path d="M585 560 C585 550 572 550 572 558" fill="none" />
        <circle cx="572" cy="560" r="4" fill="#FDE68A" stroke="none" />
      </g>

      {/* ICONIC YELLOW TAXIS (Kolkata Ambassador / Mumbai Padmini Vibe) */}
      {/* Background Taxis */}
      <g opacity="0.75">
        {/* Taxi Far Left */}
        <g transform="translate(10, 626) scale(0.65)">
          <path d="M10 32 L35 15 L85 15 L115 32 L130 35 L130 50 L0 50 L0 36 Z" fill="url(#taxiYellow)" />
          <path d="M35 15 L85 15 L108 30 L20 30 Z" fill="url(#taxiTop)" />
          <circle cx="30" cy="50" r="10" fill="#000000" />
          <circle cx="30" cy="50" r="5" fill="#E2E8F0" />
          <circle cx="100" cy="50" r="10" fill="#000000" />
          <circle cx="100" cy="50" r="5" fill="#E2E8F0" />
        </g>
        {/* Taxi Mid Left */}
        <g transform="translate(110, 626) scale(0.65)">
          <path d="M10 32 L35 15 L85 15 L115 32 L130 35 L130 50 L0 50 L0 36 Z" fill="url(#taxiYellow)" />
          <path d="M35 15 L85 15 L108 30 L20 30 Z" fill="url(#taxiTop)" />
          <circle cx="30" cy="50" r="10" fill="#000000" />
          <circle cx="30" cy="50" r="5" fill="#E2E8F0" />
          <circle cx="100" cy="50" r="10" fill="#000000" />
          <circle cx="100" cy="50" r="5" fill="#E2E8F0" />
        </g>
        {/* Taxi Far Right */}
        <g transform="translate(490, 626) scale(0.65)">
          <path d="M10 32 L35 15 L85 15 L115 32 L130 35 L130 50 L0 50 L0 36 Z" fill="url(#taxiYellow)" />
          <path d="M35 15 L85 15 L108 30 L20 30 Z" fill="url(#taxiTop)" />
          <circle cx="30" cy="50" r="10" fill="#000000" />
          <circle cx="30" cy="50" r="5" fill="#E2E8F0" />
          <circle cx="100" cy="50" r="10" fill="#000000" />
          <circle cx="100" cy="50" r="5" fill="#E2E8F0" />
        </g>
      </g>

      {/* FOREGROUND MAIN HERO TAXI (Centre-bottom) */}
      <g transform="translate(195, 642) scale(1.05)" filter="url(#softShadow)">
        {/* Shadow */}
        <ellipse cx="140" cy="74" rx="145" ry="12" fill="#000000" opacity="0.6" />

        {/* Taxi Body Lower */}
        <path
          d="M15 48 C20 40, 45 24, 75 22 L195 22 C230 24, 255 40, 268 48 L280 54 C285 58, 285 68, 280 72 L10 72 C5 68, 5 56, 10 52 Z"
          fill="url(#taxiYellow)"
        />

        {/* Black Roof Top */}
        <path
          d="M75 22 L100 3 L180 3 L205 22 Z"
          fill="url(#taxiTop)"
        />

        {/* Windows */}
        <path d="M102 7 L138 7 L138 21 L85 21 Z" fill="#38BDF8" opacity="0.75" />
        <path d="M144 7 L176 7 L195 21 L144 21 Z" fill="#38BDF8" opacity="0.75" />

        {/* Taxi Roof Sign */}
        <rect x="130" y="-3" width="22" height="7" rx="2" fill="#FFFFFF" />
        <text x="141" y="2.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#B45309">
          TAXI
        </text>

        {/* Chrome Bumper & Details */}
        <rect x="6" y="65" width="275" height="5" rx="2.5" fill="#E2E8F0" />
        <circle cx="18" cy="54" r="5" fill="#FEF08A" />
        <circle cx="270" cy="54" r="5" fill="#EF4444" />

        {/* Wheels */}
        <circle cx="65" cy="72" r="17" fill="#0F172A" />
        <circle cx="65" cy="72" r="9" fill="#E2E8F0" />
        <circle cx="65" cy="72" r="4" fill="#64748B" />

        <circle cx="225" cy="72" r="17" fill="#0F172A" />
        <circle cx="225" cy="72" r="9" fill="#E2E8F0" />
        <circle cx="225" cy="72" r="4" fill="#64748B" />

        {/* Taxi Door Badge */}
        <circle cx="140" cy="50" r="10" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
        <text x="140" y="53" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0F172A">
          COMMERCE
        </text>
      </g>

      {/* Street Curbs & Reflection */}
      <line x1="0" y1="735" x2="700" y2="735" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.4" />
    </svg>
  );
};

export default HeritageIllustration;
