import React from 'react';

export const WorldDotMap: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain opacity-25"
      >
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.8" fill="#1544a0" />
          </pattern>
        </defs>

        {/* Global Dotted Continents Shapes matching Image 2 */}
        {/* NORTH AMERICA */}
        <g fill="#1544a0" opacity="0.85">
          {/* Alaska & Canada */}
          <ellipse cx="140" cy="140" rx="60" ry="35" />
          <ellipse cx="230" cy="110" rx="90" ry="40" />
          <ellipse cx="320" cy="90" rx="70" ry="30" />
          <ellipse cx="380" cy="80" rx="40" ry="25" />
          <circle cx="280" cy="50" r="22" />
          {/* Greenland */}
          <ellipse cx="440" cy="70" rx="45" ry="35" />

          {/* USA */}
          <ellipse cx="210" cy="200" rx="80" ry="45" />
          <ellipse cx="290" cy="210" rx="70" ry="40" />
          <ellipse cx="250" cy="240" rx="60" ry="30" />

          {/* Mexico & Central America */}
          <path d="M190 270 Q210 320 230 360 Q250 380 270 380 Q250 340 230 290 Z" />
          <ellipse cx="240" cy="330" rx="25" ry="40" transform="rotate(25 240 330)" />

          {/* Caribbean */}
          <circle cx="310" cy="330" r="10" />
          <circle cx="330" cy="345" r="8" />

          {/* SOUTH AMERICA */}
          {/* Colombia / Venezuela / Brazil / Peru / Argentina / Chile */}
          <ellipse cx="340" cy="420" rx="55" ry="45" />
          <ellipse cx="370" cy="470" rx="50" ry="60" />
          <ellipse cx="330" cy="530" rx="35" ry="70" />
          <ellipse cx="310" cy="580" rx="20" ry="50" />

          {/* EUROPE */}
          {/* UK & Ireland */}
          <circle cx="565" cy="140" r="18" />
          <circle cx="545" cy="145" r="12" />
          {/* Scandinavia */}
          <ellipse cx="640" cy="90" rx="35" ry="50" transform="rotate(20 640 90)" />
          {/* Western & Central & Eastern Europe */}
          <ellipse cx="590" cy="180" rx="45" ry="35" />
          <ellipse cx="660" cy="170" rx="55" ry="40" />
          <ellipse cx="730" cy="160" rx="60" ry="45" />
          {/* Mediterranean / Iberia / Italy / Balkans */}
          <ellipse cx="550" cy="225" rx="30" ry="25" />
          <ellipse cx="620" cy="230" rx="25" ry="35" transform="rotate(35 620 230)" />
          <ellipse cx="665" cy="240" rx="30" ry="25" />

          {/* AFRICA */}
          {/* North Africa */}
          <ellipse cx="610" cy="310" rx="70" ry="45" />
          <ellipse cx="680" cy="320" rx="60" ry="50" />
          {/* West & Central Africa */}
          <ellipse cx="580" cy="380" rx="50" ry="40" />
          <ellipse cx="650" cy="410" rx="60" ry="55" />
          <ellipse cx="710" cy="400" rx="40" ry="45" />
          {/* Southern Africa & Madagascar */}
          <ellipse cx="660" cy="500" rx="40" ry="55" />
          <circle cx="655" cy="570" r="28" />
          <ellipse cx="745" cy="500" rx="15" ry="35" transform="rotate(15 745 500)" />

          {/* ASIA */}
          {/* Russia / Siberia */}
          <ellipse cx="800" cy="110" rx="80" ry="45" />
          <ellipse cx="910" cy="115" rx="95" ry="50" />
          <ellipse cx="1020" cy="125" rx="80" ry="55" />
          <ellipse cx="1110" cy="135" rx="50" ry="40" />
          {/* Middle East */}
          <ellipse cx="720" cy="270" rx="45" ry="35" />
          <ellipse cx="750" cy="300" rx="35" ry="35" />
          {/* Central Asia */}
          <ellipse cx="820" cy="210" rx="60" ry="45" />
          <ellipse cx="890" cy="220" rx="55" ry="45" />
          {/* India / South Asia */}
          <ellipse cx="820" cy="310" rx="40" ry="50" transform="rotate(10 820 310)" />
          <circle cx="835" cy="380" r="14" />
          {/* East Asia: China, Korea, Japan */}
          <ellipse cx="940" cy="260" rx="75" ry="50" />
          <ellipse cx="980" cy="300" rx="50" ry="40" />
          <ellipse cx="1015" cy="235" rx="16" ry="30" transform="rotate(30 1015 235)" />
          <ellipse cx="1060" cy="230" rx="20" ry="45" transform="rotate(40 1060 230)" />
          {/* Southeast Asia: Vietnam, Thailand, Indonesia, Philippines */}
          <ellipse cx="920" cy="350" rx="30" ry="35" transform="rotate(-15 920 350)" />
          <ellipse cx="935" cy="390" rx="25" ry="30" />
          <ellipse cx="990" cy="370" rx="25" ry="40" transform="rotate(20 990 370)" />
          <ellipse cx="930" cy="450" rx="60" ry="18" transform="rotate(-10 930 450)" />
          <ellipse cx="1000" cy="460" rx="50" ry="20" transform="rotate(5 1000 460)" />

          {/* AUSTRALIA & OCEANIA */}
          <ellipse cx="1020" cy="540" rx="70" ry="48" />
          <circle cx="1075" cy="585" r="14" />
          <ellipse cx="1120" cy="570" rx="20" ry="40" transform="rotate(30 1120 570)" />
        </g>

        {/* Apply dotted matrix mask over the continents */}
        <rect x="0" y="0" width="1200" height="650" fill="url(#dotPattern)" mask="url(#mapMask)" />
      </svg>
    </div>
  );
};
