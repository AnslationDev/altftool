export const BATSMAN_STANCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
  <defs>
    <radialGradient id="helmetShininess" cx="40%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#172554"/>
    </radialGradient>
    <filter id="fabricShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Shadow on Ground -->
  <ellipse cx="50" cy="145" rx="25" ry="5" fill="#000" opacity="0.3"/>

  <!-- Back Leg -->
  <path d="M55,80 L55,115 L65,115 L65,80 Z" fill="#fff" filter="url(#fabricShadow)"/>
  <rect x="53" y="115" width="16" height="30" rx="2" fill="#fff"/> <!-- Pad -->
  <path d="M53,145 L69,145 L69,150 L53,150 Z" fill="#111"/> <!-- Shoe -->

  <!-- Front Leg -->
  <path d="M35,80 L35,115 L45,115 L45,80 Z" fill="#fff" filter="url(#fabricShadow)"/>
  <rect x="33" y="115" width="16" height="30" rx="2" fill="#fff"/> <!-- Pad -->
  <path d="M33,145 L49,145 L49,150 L33,150 Z" fill="#111"/> <!-- Shoe -->

  <!-- Torso (Side Profile) -->
  <path d="M38,40 Q35,60 38,85 L62,85 Q65,60 62,40 Z" fill="#1d4ed8"/>
  <path d="M38,40 L62,40 L62,55 L38,55 Z" fill="#1e3a8a" opacity="0.2"/> <!-- Chest Shadow -->

  <!-- Head/Helmet -->
  <circle cx="50" cy="25" r="14" fill="url(#helmetShininess)"/>
  <path d="M50,25 L64,28 L64,32 L50,30 Z" fill="#cbd5e1"/> <!-- Grill -->

  <!-- Arms -->
  <path d="M45,45 Q30,60 40,70" stroke="#fcd34d" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M55,45 Q70,60 50,70" stroke="#fcd34d" stroke-width="8" stroke-linecap="round" fill="none"/>

  <!-- Gloves -->
  <circle cx="40" cy="70" r="6" fill="#fff"/>
  <circle cx="50" cy="72" r="6" fill="#fff"/>

  <!-- Bat -->
  <g transform="rotate(-15 45 70)">
     <rect x="40" y="70" width="10" height="70" rx="1" fill="#fbbf24" stroke="#92400e" stroke-width="1"/>
     <rect x="43" y="60" width="4" height="15" fill="#111"/> <!-- Handle -->
  </g>
</svg>
`;

export const BATSMAN_SHOT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
  <defs>
    <filter id="motionBlur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.5 0" />
    </filter>
  </defs>

  <!-- Shadow -->
  <ellipse cx="50" cy="145" rx="30" ry="5" fill="#000" opacity="0.3"/>

  <!-- Legs Twisted -->
  <g transform="rotate(-10 50 140)">
      <rect x="35" y="100" width="14" height="40" rx="3" fill="#fff"/>
      <rect x="55" y="95" width="14" height="40" rx="3" fill="#fff"/>
      <path d="M35,140 L49,140 L49,145 L35,145 Z" fill="#111"/>
      <path d="M55,135 L69,135 L69,140 L55,140 Z" fill="#111"/>
  </g>

  <!-- Torso Coiled -->
  <path d="M35,45 C30,65 35,90 40,95 L65,90 C70,85 70,60 65,45 Z" fill="#1d4ed8"/>

  <!-- Head -->
  <circle cx="55" cy="25" r="14" fill="#172554"/>

  <!-- Bat Swing High -->
  <g transform="rotate(120 60 50)">
    <rect x="55" y="40" width="10" height="75" rx="1" fill="#fbbf24" stroke="#92400e"/>
    <rect x="58" y="30" width="4" height="15" fill="#111"/>
  </g>

  <!-- Arms Extended -->
  <path d="M45,50 L70,40" stroke="#fcd34d" stroke-width="8" stroke-linecap="round"/>
  <path d="M55,50 L75,45" stroke="#fcd34d" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

// REALISTIC BOWLER - ATHLETIC BUILD
export const BOWLER_RUNUP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
  <defs>
    <linearGradient id="jerseyGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ef4444"/> <!-- Red Jersey -->
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="60" cy="145" rx="20" ry="4" fill="#000" opacity="0.3"/>

  <!-- Rear Leg (Pushing off) -->
  <path d="M30,90 Q25,110 20,130" stroke="#1f2937" stroke-width="14" stroke-linecap="round"/>
  <path d="M20,130 L10,140" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/> <!-- Shoe -->

  <!-- Front Leg (Driving high) -->
  <path d="M50,90 Q70,95 80,110" stroke="#1f2937" stroke-width="14" stroke-linecap="round"/>
  <path d="M80,110 L85,130" stroke="#1f2937" stroke-width="12" stroke-linecap="round"/> <!-- Calf -->

  <!-- Torso (Leaning Forward) -->
  <path d="M30,40 L60,40 L55,90 L35,90 Z" fill="url(#jerseyGrad)" transform="skewX(-10)"/>

  <!-- Jersey Number -->
  <text x="38" y="75" font-family="sans-serif" font-weight="900" font-size="20" fill="white" opacity="0.8">18</text>

  <!-- Head -->
  <circle cx="55" cy="25" r="12" fill="#7f1d1d"/>
  <path d="M55,20 L65,22" stroke="#000" stroke-width="3"/> <!-- Hair/Cap tint -->

  <!-- Arms (Pumping) -->
  <path d="M35,45 Q20,60 25,80" stroke="#fcd34d" stroke-width="9" stroke-linecap="round"/> <!-- Left Arm Back -->
  <path d="M55,45 Q75,50 85,35" stroke="#fcd34d" stroke-width="9" stroke-linecap="round"/> <!-- Right Arm Fwd -->

  <!-- Ball hidden in hand -->
  <circle cx="85" cy="35" r="4" fill="#991b1b"/>
</svg>
`;

export const BOWLER_DELIVERY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
  <defs>
    <linearGradient id="jerseyGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="50" cy="145" rx="15" ry="4" fill="#000" opacity="0.3"/>

  <!-- Planting Leg (Straight) -->
  <path d="M45,90 L45,140" stroke="#1f2937" stroke-width="14" stroke-linecap="round"/>
  <path d="M45,140 L50,145" stroke="#fff" stroke-width="4"/> <!-- Shoe -->

  <!-- Rear Leg (Kicking up) -->
  <path d="M55,90 Q75,100 85,80" stroke="#1f2937" stroke-width="14" stroke-linecap="round"/>

  <!-- Torso (Upright/Arching) -->
  <path d="M35,40 L65,40 L60,95 L40,95 Z" fill="url(#jerseyGrad)"/>

  <!-- Jersey Number -->
  <text x="42" y="75" font-family="sans-serif" font-weight="900" font-size="20" fill="white" opacity="0.8">18</text>

  <!-- Head (Looking down pitch) -->
  <circle cx="50" cy="25" r="12" fill="#7f1d1d"/>

  <!-- High Arm (Delivery) -->
  <path d="M60,45 L60,10" stroke="#fcd34d" stroke-width="9" stroke-linecap="round"/>
  <circle cx="60" cy="8" r="5" fill="#fff" stroke="#cc0000" stroke-width="1"/> <!-- BALL -->

  <!-- Non-bowling Arm (Tucked) -->
  <path d="M40,45 L30,60" stroke="#fcd34d" stroke-width="9" stroke-linecap="round"/>
</svg>
`;

export const getSvgDataUri = (svgString) => {
  return 'data:image/svg+xml;base64,' + btoa(svgString);
};
