/*
 * A small original SVG picture kit for the story pages.
 *
 * Rather than one hand-drawn image per page (55+ drawings), stories compose
 * scenes from a shared cast and prop list. Same cast across a story = the
 * characters stay recognisable page to page, which is half of what makes a
 * picture book feel like a book.
 *
 * A scene is: { bg, items: [ [name, {x, y, s, flip, ...}], ... ] }
 * Everything draws into a 400x300 viewBox.
 */

const PAL = {
  sky: "#bfe3f5", skyDusk: "#6b7fb8", night: "#25305c",
  grass: "#8ec96b", grassDark: "#6fae52", sand: "#e8d3a0",
  wall: "#f3e7d6", floor: "#c9a87c", water: "#5bb3d9",
  cream: "#f2ddc0", tan: "#d9a86c", brown: "#a06a3e", dark: "#3e3226",
  white: "#ffffff", black: "#2b2b33", red: "#e05c53", orange: "#f0913f",
  yellow: "#ffd24a", pink: "#f2a0b5", purple: "#9b7fd4", teal: "#4fb8a8",
  green: "#5aa85f",
};

function _g(x, y, s, inner, flip, rot) {
  const sc = flip ? `scale(${-(s || 1)},${s || 1})` : `scale(${s || 1})`;
  return `<g transform="translate(${x},${y})${rot ? ` rotate(${rot})` : ""} ${sc}">${inner}</g>`;
}

/* ---------------- backgrounds ---------------- */

const BACKGROUNDS = {
  outdoor: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="330" cy="55" r="30" fill="${PAL.yellow}"/>
    <ellipse cx="90" cy="60" rx="42" ry="20" fill="#ffffff" opacity=".85"/>
    <ellipse cx="120" cy="52" rx="30" ry="18" fill="#ffffff" opacity=".85"/>
    <path d="M0 215 Q 100 185 200 212 T 400 205 L400 300 L0 300Z" fill="${PAL.grass}"/>
    <path d="M0 240 Q 120 225 400 245 L400 300 L0 300Z" fill="${PAL.grassDark}" opacity=".55"/>`,
  hill: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="60" cy="50" r="26" fill="${PAL.yellow}"/>
    <path d="M-20 300 Q 140 120 420 300 Z" fill="${PAL.grass}"/>
    <path d="M-20 300 Q 160 170 420 300 Z" fill="${PAL.grassDark}" opacity=".5"/>`,
  indoor: () => `
    <rect width="400" height="300" fill="${PAL.wall}"/>
    <rect y="215" width="400" height="85" fill="${PAL.floor}"/>
    <rect y="207" width="400" height="12" fill="#a98763"/>
    <rect x="250" y="40" width="110" height="85" rx="6" fill="${PAL.sky}" stroke="#b9a88a" stroke-width="3" />`,
  water: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="60" cy="55" r="26" fill="${PAL.yellow}"/>
    <rect y="170" width="400" height="130" fill="${PAL.water}"/>
    <path d="M0 178 q 25 -9 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="#ffffff" stroke-width="3" opacity=".6"/>
    <path d="M0 205 q 25 -9 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="#ffffff" stroke-width="3" opacity=".35"/>`,
  night: () => `
    <rect width="400" height="300" fill="${PAL.night}"/>
    <circle cx="320" cy="60" r="26" fill="#fdf3c8"/>
    <circle cx="308" cy="52" r="22" fill="${PAL.night}"/>
    <g fill="#fdf3c8">
      <circle cx="60" cy="45" r="2.5"/><circle cx="120" cy="80" r="2"/><circle cx="200" cy="40" r="2.5"/>
      <circle cx="250" cy="100" r="2"/><circle cx="40" cy="120" r="2"/><circle cx="160" cy="130" r="2"/>
      <circle cx="370" cy="140" r="2"/><circle cx="95" cy="165" r="2"/>
    </g>
    <path d="M0 230 Q 120 205 400 235 L400 300 L0 300Z" fill="#2f4a3a"/>`,
  snow: () => `
    <rect width="400" height="300" fill="#cfe3f2"/>
    <circle cx="60" cy="50" r="24" fill="#fdf6d8"/>
    <path d="M0 210 Q 110 180 220 208 T 400 200 L400 300 L0 300Z" fill="#ffffff"/>
    <path d="M0 245 Q 140 228 400 250 L400 300 L0 300Z" fill="#eaf2f8"/>
    <g fill="#ffffff" opacity=".9">
      <circle cx="40" cy="90" r="4"/><circle cx="130" cy="60" r="3"/><circle cx="210" cy="110" r="4"/>
      <circle cx="300" cy="70" r="3"/><circle cx="350" cy="130" r="4"/><circle cx="90" cy="150" r="3"/>
      <circle cx="250" cy="160" r="3"/><circle cx="170" cy="30" r="3"/>
    </g>`,
  garden: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="340" cy="50" r="26" fill="${PAL.yellow}"/>
    <rect y="200" width="400" height="100" fill="${PAL.grass}"/>
    <g fill="${PAL.brown}" opacity=".5">
      <rect x="0" y="196" width="400" height="8"/>
    </g>
    <g>
      <rect x="20" y="150" width="8" height="55" fill="#8a6a45"/><rect x="60" y="150" width="8" height="55" fill="#8a6a45"/>
      <rect x="100" y="150" width="8" height="55" fill="#8a6a45"/><rect x="10" y="160" width="105" height="7" fill="#a3835c"/>
      <rect x="10" y="185" width="105" height="7" fill="#a3835c"/>
    </g>`,
  farm: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="70" cy="50" r="24" fill="${PAL.yellow}"/>
    <path d="M0 190 Q 120 160 240 185 T 400 175 L400 300 L0 300Z" fill="#a9d67f"/>
    <rect y="205" width="400" height="95" fill="${PAL.grass}"/>
    <g stroke="#a3835c" stroke-width="5"><path d="M0 222 h400"/><path d="M0 240 h400"/></g>
    <g fill="#8a6a45"><rect x="20" y="212" width="7" height="40"/><rect x="120" y="212" width="7" height="40"/><rect x="220" y="212" width="7" height="40"/><rect x="320" y="212" width="7" height="40"/></g>`,
  beach: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="330" cy="55" r="28" fill="${PAL.yellow}"/>
    <rect y="140" width="400" height="70" fill="${PAL.water}"/>
    <path d="M0 150 q 25 -8 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="#ffffff" stroke-width="3" opacity=".6"/>
    <path d="M0 205 Q 120 190 240 205 T 400 198 L400 300 L0 300Z" fill="${PAL.sand}"/>`,
  soil: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <rect y="95" width="400" height="12" fill="${PAL.grass}"/>
    <rect y="105" width="400" height="195" fill="#8b6340"/>
    <rect y="200" width="400" height="100" fill="#74512f"/>
    <g fill="#5e3f22" opacity=".7"><circle cx="40" cy="140" r="5"/><circle cx="300" cy="130" r="4"/><circle cx="350" cy="250" r="6"/><circle cx="90" cy="260" r="4"/><circle cx="200" cy="230" r="3"/></g>
    <g fill="#a99a88"><ellipse cx="260" cy="270" rx="18" ry="10"/><ellipse cx="60" cy="190" rx="12" ry="7"/></g>`,
  kitchen: () => `
    <rect width="400" height="300" fill="#f6ecdc"/>
    <rect x="40" y="30" width="120" height="70" rx="6" fill="${PAL.sky}" stroke="#c9b495" stroke-width="4"/>
    <rect x="230" y="30" width="140" height="60" rx="4" fill="#d9c3a3"/>
    <rect y="190" width="400" height="16" fill="#c9a87c"/>
    <rect y="206" width="400" height="94" fill="#e6d3b8"/>
    <g stroke="#cdb796" stroke-width="3"><path d="M100 206 v94"/><path d="M200 206 v94"/><path d="M300 206 v94"/></g>`,
  rail: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <circle cx="60" cy="50" r="24" fill="${PAL.yellow}"/>
    <path d="M0 200 Q 120 175 240 196 T 400 190 L400 300 L0 300Z" fill="${PAL.grass}"/>
    <rect y="240" width="400" height="8" fill="#7b6a58"/><rect y="262" width="400" height="8" fill="#7b6a58"/>
    <g fill="#9a7a52">${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 30}" y="236" width="12" height="38" rx="2"/>`).join("")}</g>
    <rect y="240" width="400" height="5" fill="#9aa0a8"/><rect y="262" width="400" height="5" fill="#9aa0a8"/>`,
  sea: () => `
    <rect width="400" height="300" fill="#3a8fc4"/>
    <rect width="400" height="40" fill="${PAL.sky}"/>
    <path d="M0 40 q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 V 55 H0Z" fill="#5bb3d9"/>
    <g fill="#ffffff" opacity=".25"><circle cx="60" cy="200" r="5"/><circle cx="72" cy="180" r="3"/><circle cx="330" cy="150" r="4"/><circle cx="340" cy="130" r="2.5"/></g>
    <path d="M0 270 Q 100 255 200 272 T 400 265 L400 300 L0 300Z" fill="#e2cf9d"/>`,
  woods: () => `
    <rect width="400" height="300" fill="#cfe8d0"/>
    <g fill="#4f9455"><circle cx="40" cy="120" r="50"/><circle cx="130" cy="95" r="58"/><circle cx="260" cy="105" r="55"/><circle cx="360" cy="115" r="52"/></g>
    <g fill="#7a5b3c"><rect x="32" y="150" width="16" height="70"/><rect x="122" y="140" width="16" height="80"/><rect x="252" y="145" width="16" height="75"/><rect x="352" y="150" width="16" height="70"/></g>
    <rect y="215" width="400" height="85" fill="#7fb865"/>`,
  street: () => `
    <rect width="400" height="300" fill="${PAL.sky}"/>
    <g><rect x="20" y="90" width="90" height="120" fill="#e3b58f"/><path d="M10 92 l 55 -40 l 55 40Z" fill="#a8604a"/><rect x="50" y="160" width="28" height="50" fill="#7a4a35"/>
       <rect x="290" y="80" width="90" height="130" fill="#d7c6a6"/><path d="M280 82 l 55 -42 l 55 42Z" fill="#8a5a42"/><rect x="305" y="110" width="22" height="22" fill="${PAL.sky}"/><rect x="345" y="110" width="22" height="22" fill="${PAL.sky}"/></g>
    <rect y="205" width="400" height="30" fill="#cfcac0"/>
    <rect y="235" width="400" height="65" fill="#6f747d"/>
    <g fill="#ffffff">${Array.from({ length: 7 }, (_, i) => `<rect x="${i * 62 + 10}" y="264" width="34" height="6" rx="2"/>`).join("")}</g>`,
};

/* ---------------- cast ---------------- */

const ITEMS = {
  pug: (o = {}) => {
    const mud = o.muddy ? `<ellipse cx="0" cy="18" rx="26" ry="12" fill="#8a6a45" opacity=".8"/><circle cx="-14" cy="4" r="5" fill="#8a6a45" opacity=".7"/><circle cx="12" cy="10" r="4" fill="#8a6a45" opacity=".7"/>` : "";
    return `
      <ellipse cx="0" cy="14" rx="30" ry="22" fill="${PAL.cream}"/>
      <path d="M22 8 q 18 -6 10 -20 q -4 10 -14 10Z" fill="${PAL.cream}"/>
      ${mud}
      <circle cx="-20" cy="-14" r="23" fill="${PAL.cream}"/>
      <path d="M-38 -26 q -8 -4 -6 12 q 6 4 10 -4Z" fill="${PAL.brown}"/>
      <path d="M-2 -26 q 8 -4 6 12 q -6 4 -10 -4Z" fill="${PAL.brown}"/>
      <ellipse cx="-22" cy="-6" rx="12" ry="9" fill="${PAL.dark}" opacity=".85"/>
      <circle cx="-22" cy="-9" r="3.4" fill="${PAL.black}"/>
      <circle cx="-30" cy="-18" r="4" fill="${PAL.white}"/><circle cx="-29" cy="-18" r="2.4" fill="${PAL.black}"/>
      <circle cx="-13" cy="-18" r="4" fill="${PAL.white}"/><circle cx="-12" cy="-18" r="2.4" fill="${PAL.black}"/>
      <rect x="-18" y="32" width="8" height="8" rx="3" fill="${PAL.cream}"/>
      <rect x="4" y="32" width="8" height="8" rx="3" fill="${PAL.cream}"/>`;
  },
  hen: (o = {}) => `
    <ellipse cx="0" cy="6" rx="26" ry="22" fill="${o.c || PAL.white}"/>
    <path d="M18 -2 q 20 6 22 22 q -18 2 -26 -10Z" fill="${o.c2 || "#efe6d8"}"/>
    <circle cx="-18" cy="-16" r="14" fill="${o.c || PAL.white}"/>
    <path d="M-24 -30 q 4 -8 8 0 q 4 -8 8 0 q -6 4 -16 0Z" fill="${PAL.red}"/>
    <path d="M-30 -12 l -10 4 l 10 4Z" fill="${PAL.orange}"/>
    <path d="M-18 -4 q -3 8 2 10" fill="none" stroke="${PAL.red}" stroke-width="3"/>
    <circle cx="-20" cy="-18" r="2.6" fill="${PAL.black}"/>
    <rect x="-8" y="26" width="4" height="10" fill="${PAL.orange}"/>
    <rect x="6" y="26" width="4" height="10" fill="${PAL.orange}"/>`,
  fox: () => `
    <ellipse cx="0" cy="10" rx="28" ry="18" fill="${PAL.orange}"/>
    <path d="M24 6 q 26 -4 26 -24 q -12 14 -26 10Z" fill="${PAL.orange}"/>
    <path d="M40 -12 q 10 -4 10 -6 q -8 2 -12 2Z" fill="${PAL.white}"/>
    <circle cx="-22" cy="-10" r="18" fill="${PAL.orange}"/>
    <path d="M-38 -22 l -2 -18 l 14 10Z" fill="${PAL.orange}"/>
    <path d="M-8 -22 l 4 -18 l -14 10Z" fill="${PAL.orange}"/>
    <path d="M-36 -4 q 12 12 26 0 q -12 6 -26 0Z" fill="${PAL.white}"/>
    <ellipse cx="-30" cy="-2" rx="9" ry="7" fill="${PAL.white}"/>
    <circle cx="-34" cy="-2" r="3" fill="${PAL.black}"/>
    <circle cx="-30" cy="-14" r="3" fill="${PAL.black}"/>
    <circle cx="-14" cy="-14" r="3" fill="${PAL.black}"/>
    <rect x="-16" y="24" width="7" height="9" rx="3" fill="${PAL.brown}"/>
    <rect x="4" y="24" width="7" height="9" rx="3" fill="${PAL.brown}"/>`,
  cat: (o = {}) => `
    <ellipse cx="0" cy="10" rx="26" ry="18" fill="${o.c || PAL.tan}"/>
    <path d="M24 8 q 22 2 18 -20" fill="none" stroke="${o.c || PAL.tan}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="-20" cy="-10" r="17" fill="${o.c || PAL.tan}"/>
    <path d="M-34 -22 l -3 -15 l 13 8Z" fill="${o.c || PAL.tan}"/>
    <path d="M-8 -22 l 3 -15 l -13 8Z" fill="${o.c || PAL.tan}"/>
    <g stroke="${PAL.dark}" stroke-width="2" opacity=".45">
      <path d="M-6 2 h 16"/><path d="M-4 10 h 14"/>
    </g>
    <circle cx="-27" cy="-13" r="3" fill="${PAL.black}"/>
    <circle cx="-13" cy="-13" r="3" fill="${PAL.black}"/>
    <path d="M-20 -5 l -3 3 h 6Z" fill="${PAL.pink}"/>
    <rect x="-16" y="24" width="7" height="8" rx="3" fill="${o.c || PAL.tan}"/>
    <rect x="4" y="24" width="7" height="8" rx="3" fill="${o.c || PAL.tan}"/>`,
  duck: () => `
    <ellipse cx="0" cy="8" rx="26" ry="19" fill="${PAL.yellow}"/>
    <path d="M20 4 q 18 -2 18 -16 q -10 10 -20 8Z" fill="${PAL.yellow}"/>
    <circle cx="-18" cy="-14" r="14" fill="${PAL.yellow}"/>
    <path d="M-30 -12 q -14 2 -14 6 q 8 4 14 2Z" fill="${PAL.orange}"/>
    <circle cx="-20" cy="-18" r="2.8" fill="${PAL.black}"/>
    <rect x="-10" y="24" width="5" height="8" fill="${PAL.orange}"/>
    <rect x="6" y="24" width="5" height="8" fill="${PAL.orange}"/>`,
  dog: () => `
    <ellipse cx="0" cy="12" rx="30" ry="20" fill="${PAL.brown}"/>
    <path d="M26 8 q 20 -2 16 -22" fill="none" stroke="${PAL.brown}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="-22" cy="-10" r="18" fill="${PAL.brown}"/>
    <ellipse cx="-40" cy="-12" rx="7" ry="15" fill="#7d5330"/>
    <ellipse cx="-4" cy="-12" rx="7" ry="15" fill="#7d5330"/>
    <ellipse cx="-24" cy="0" rx="11" ry="8" fill="${PAL.cream}"/>
    <circle cx="-26" cy="-2" r="3.4" fill="${PAL.black}"/>
    <circle cx="-30" cy="-16" r="3" fill="${PAL.black}"/>
    <circle cx="-15" cy="-16" r="3" fill="${PAL.black}"/>
    <rect x="-18" y="28" width="8" height="8" rx="3" fill="${PAL.brown}"/>
    <rect x="4" y="28" width="8" height="8" rx="3" fill="${PAL.brown}"/>`,
  fish: (o = {}) => `
    <ellipse cx="0" cy="0" rx="26" ry="16" fill="${o.c || PAL.teal}"/>
    <path d="M22 0 l 20 -13 v 26Z" fill="${o.c || PAL.teal}"/>
    <path d="M-4 -16 q 8 -10 14 -2" fill="none" stroke="${o.c || PAL.teal}" stroke-width="6"/>
    <circle cx="-14" cy="-3" r="4" fill="${PAL.white}"/><circle cx="-15" cy="-3" r="2" fill="${PAL.black}"/>
    <path d="M-2 -6 q 8 6 0 12" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".6"/>`,
  kid: (o = {}) => {
    const skin = o.skin || "#e8b98f", hair = o.hair || "#3b2a1c", shirt = o.shirt || PAL.red;
    const hairShape = o.long
      ? `<path d="M-17 -34 q 17 -16 34 0 q 5 28 -2 34 q 2 -22 -15 -24 q -17 2 -15 24 q -7 -6 -2 -34Z" fill="${hair}"/>`
      : `<path d="M-17 -32 q 17 -18 34 0 q -4 -8 -17 -6 q -13 -2 -17 6Z" fill="${hair}"/>`;
    return `
      <rect x="-20" y="-2" width="40" height="42" rx="12" fill="${shirt}"/>
      <rect x="-16" y="36" width="12" height="22" rx="5" fill="#4a5a86"/>
      <rect x="4" y="36" width="12" height="22" rx="5" fill="#4a5a86"/>
      <rect x="-30" y="4" width="11" height="28" rx="5" fill="${shirt}"/>
      <rect x="19" y="4" width="11" height="28" rx="5" fill="${shirt}"/>
      <circle cx="-25" cy="34" r="6" fill="${skin}"/><circle cx="25" cy="34" r="6" fill="${skin}"/>
      <circle cx="0" cy="-16" r="20" fill="${skin}"/>
      ${hairShape}
      <circle cx="-7" cy="-16" r="3" fill="${PAL.black}"/><circle cx="7" cy="-16" r="3" fill="${PAL.black}"/>
      <path d="M-6 -6 q 6 6 12 0" fill="none" stroke="${PAL.black}" stroke-width="2.4" stroke-linecap="round"/>`;
  },

  /* ---------------- props ---------------- */
  ball: (o = {}) => `<circle cx="0" cy="0" r="14" fill="${o.c || PAL.red}"/><path d="M-14 0 q 14 -10 28 0 q -14 10 -28 0" fill="#ffffff" opacity=".5"/>`,
  box: () => `<rect x="-26" y="-20" width="52" height="40" rx="3" fill="#caa06a"/><path d="M-26 -6 h52" stroke="#a8814f" stroke-width="3"/><path d="M0 -20 v40" stroke="#a8814f" stroke-width="3"/>`,
  bin: () => `<path d="M-20 -18 l 4 40 h 32 l 4 -40Z" fill="#7f8a99"/><rect x="-24" y="-24" width="48" height="8" rx="3" fill="#5f6a79"/>`,
  sock: (o = {}) => `<path d="M-8 -22 h 16 v 26 q 0 10 12 12 v 12 q -30 0 -30 -18Z" fill="${o.c || PAL.red}"/><rect x="-9" y="-24" width="18" height="7" rx="3" fill="#ffffff"/>`,
  net: () => `<circle cx="0" cy="0" r="18" fill="none" stroke="#9a7a52" stroke-width="4"/><path d="M-13 -10 h26 M-16 0 h32 M-13 10 h26 M-10 -14 v28 M0 -18 v36 M10 -14 v28" stroke="#cbb894" stroke-width="1.6"/><rect x="14" y="8" width="6" height="34" rx="3" transform="rotate(-30 14 8)" fill="#9a7a52"/>`,
  rock: () => `<path d="M-34 18 q -6 -22 14 -26 q 10 -12 24 -2 q 20 0 18 28Z" fill="#9aa0a8"/><path d="M-14 6 q 8 -8 18 -2" stroke="#7c838c" stroke-width="3" fill="none"/>`,
  pan: () => `<ellipse cx="0" cy="0" rx="24" ry="9" fill="#57606d"/><path d="M-24 0 q 2 16 24 16 q 22 0 24 -16Z" fill="#6b7483"/><rect x="22" y="-4" width="30" height="7" rx="3" fill="#3f4753"/>`,
  tub: () => `<path d="M-44 -14 q 0 42 12 44 h 64 q 12 -2 12 -44Z" fill="#e9f3f8" stroke="#b9ccd6" stroke-width="3"/><ellipse cx="0" cy="-14" rx="44" ry="10" fill="#dceaf2"/><ellipse cx="0" cy="-12" rx="38" ry="7" fill="${PAL.water}" opacity=".75"/>`,
  mud: () => `<ellipse cx="0" cy="0" rx="52" ry="16" fill="#7a5b39"/><ellipse cx="-10" cy="-3" rx="26" ry="8" fill="#67492b"/>`,
  shed: () => `<rect x="-44" y="-18" width="88" height="58" fill="#c08a5a"/><path d="M-54 -18 l 54 -34 l 54 34Z" fill="#8d5f38"/><rect x="-14" y="4" width="28" height="36" rx="2" fill="#6f4626"/><circle cx="8" cy="22" r="3" fill="${PAL.yellow}"/>`,
  tree: () => `<rect x="-7" y="-10" width="14" height="52" fill="#8a6a45"/><circle cx="0" cy="-28" r="30" fill="${PAL.green}"/><circle cx="-22" cy="-14" r="20" fill="${PAL.green}"/><circle cx="22" cy="-14" r="20" fill="${PAL.green}"/>`,
  boat: () => `<path d="M-44 0 h88 l -14 24 h-60Z" fill="#c4643f"/><rect x="-3" y="-52" width="6" height="52" fill="#8a6a45"/><path d="M3 -50 l 34 34 h-34Z" fill="#ffffff"/>`,
  bed: () => `<rect x="-50" y="-6" width="100" height="30" rx="5" fill="#b4855c"/><rect x="-50" y="-30" width="14" height="30" rx="4" fill="#8a6a45"/><rect x="36" y="-20" width="14" height="20" rx="4" fill="#8a6a45"/><rect x="-38" y="-10" width="76" height="12" rx="5" fill="${PAL.purple}"/><rect x="-34" y="-20" width="26" height="14" rx="6" fill="#ffffff"/>`,
  cake: () => `<rect x="-26" y="-6" width="52" height="26" rx="4" fill="#e9c48e"/><path d="M-26 -6 q 13 -10 26 0 q 13 10 26 0 v 6 h-52Z" fill="${PAL.pink}"/><rect x="-2" y="-24" width="4" height="16" fill="#ffffff"/><circle cx="0" cy="-26" r="4" fill="${PAL.orange}"/>`,
  bike: () => `<circle cx="-24" cy="12" r="18" fill="none" stroke="${PAL.dark}" stroke-width="4"/><circle cx="24" cy="12" r="18" fill="none" stroke="${PAL.dark}" stroke-width="4"/><path d="M-24 12 l 16 -24 h 20 l 12 24 M-8 -12 l 12 24" stroke="${PAL.red}" stroke-width="4" fill="none"/><path d="M-10 -14 h -10" stroke="${PAL.dark}" stroke-width="4"/>`,
  star: (o = {}) => `<path d="M0 -16 l 5 11 l 12 1 l -9 8 l 3 12 l -11 -6 l -11 6 l 3 -12 l -9 -8 l 12 -1Z" fill="${o.c || PAL.yellow}"/>`,
  splash: () => `<g fill="#ffffff" opacity=".9"><path d="M-30 0 q 6 -22 12 -2"/><path d="M0 -4 q 8 -28 14 -4"/><path d="M24 0 q 6 -20 12 -2"/></g>`,
  bang: (o = {}) => `<path d="M0 -30 l 8 -12 l 4 14 l 14 -8 l -6 15 l 16 3 l -14 9 l 11 11 l -16 -2 l 1 16 l -12 -10 l -9 13 l -4 -15 l -16 5 l 7 -14 l -15 -6 l 14 -8 l -10 -12 l 16 2Z" fill="${o.c || PAL.orange}"/>`,
  sun: () => `<circle cx="0" cy="0" r="26" fill="${PAL.yellow}"/><g stroke="${PAL.yellow}" stroke-width="5" stroke-linecap="round"><path d="M0 -38 v-8"/><path d="M0 38 v8"/><path d="M-38 0 h-8"/><path d="M38 0 h8"/><path d="M-27 -27 l-6 -6"/><path d="M27 27 l6 6"/><path d="M27 -27 l6 -6"/><path d="M-27 27 l-6 6"/></g>`,
  moon: () => `<circle cx="0" cy="0" r="26" fill="#fdf3c8"/><circle cx="-9" cy="-6" r="5" fill="#e8dcb0"/><circle cx="7" cy="8" r="4" fill="#e8dcb0"/>`,
  nest: () => `<ellipse cx="0" cy="6" rx="34" ry="16" fill="#a8814f"/><ellipse cx="0" cy="0" rx="26" ry="10" fill="#8a6a45"/><circle cx="-9" cy="-1" r="7" fill="#f4f0e2"/><circle cx="5" cy="-2" r="7" fill="#f4f0e2"/>`,
  rain: () => `<g stroke="#5f9ed6" stroke-width="4" stroke-linecap="round" opacity=".8">
      <path d="M-80 -40 l -8 20"/><path d="M-40 -60 l -8 20"/><path d="M0 -35 l -8 20"/>
      <path d="M40 -62 l -8 20"/><path d="M80 -38 l -8 20"/><path d="M-60 0 l -8 20"/>
      <path d="M20 5 l -8 20"/><path d="M64 -5 l -8 20"/><path d="M-20 -12 l -8 20"/>
    </g>`,
  coin: () => `<circle cx="0" cy="0" r="13" fill="#f0c04a" stroke="#d1a02f" stroke-width="3"/><circle cx="0" cy="0" r="6" fill="#d1a02f" opacity=".5"/>`,
  bowl: (o = {}) => `<path d="M-22 -8 q 2 20 22 20 q 20 0 22 -20Z" fill="${o.c || PAL.teal}"/><ellipse cx="0" cy="-8" rx="22" ry="6" fill="#3d968a"/>`,
  bag: (o = {}) => `<path d="M-18 -12 h36 l 4 34 h-44Z" fill="${o.c || "#c9a87c"}"/><path d="M-9 -12 q 9 -16 18 0" fill="none" stroke="#8a6a45" stroke-width="3"/>`,
  hat: (o = {}) => `<ellipse cx="0" cy="6" rx="26" ry="7" fill="${o.c || PAL.purple}"/><path d="M-16 6 q 0 -24 16 -24 q 16 0 16 24Z" fill="${o.c || PAL.purple}"/><rect x="-16" y="0" width="32" height="6" fill="#00000022"/>`,
  snowman: () => `
    <circle cx="0" cy="18" r="26" fill="#ffffff" stroke="#dfe9f0" stroke-width="2"/>
    <circle cx="0" cy="-14" r="19" fill="#ffffff" stroke="#dfe9f0" stroke-width="2"/>
    <circle cx="0" cy="-42" r="14" fill="#ffffff" stroke="#dfe9f0" stroke-width="2"/>
    <path d="M-14 -52 h28 v-4 h-28Z" fill="${PAL.black}"/><rect x="-9" y="-70" width="18" height="16" fill="${PAL.black}"/>
    <path d="M0 -42 l 16 4 l -16 4Z" fill="${PAL.orange}"/>
    <circle cx="-5" cy="-46" r="2.4" fill="${PAL.black}"/><circle cx="5" cy="-46" r="2.4" fill="${PAL.black}"/>
    <circle cx="0" cy="-20" r="3" fill="${PAL.black}"/><circle cx="0" cy="-8" r="3" fill="${PAL.black}"/>
    <path d="M-19 -14 l -20 -12" stroke="#8a6a45" stroke-width="4"/><path d="M19 -14 l 20 -12" stroke="#8a6a45" stroke-width="4"/>`,
  flowers: () => `<g><rect x="-1" y="0" width="3" height="22" fill="${PAL.green}"/><circle cx="0" cy="-4" r="7" fill="${PAL.pink}"/><circle cx="0" cy="-4" r="3" fill="${PAL.yellow}"/></g>`,

  /* ---------------- added for the early and non-fiction books ---------------- */
  pig: () => `
    <ellipse cx="0" cy="4" rx="40" ry="26" fill="#f4b4c0"/>
    <rect x="-28" y="20" width="10" height="18" rx="4" fill="#e99aaa"/><rect x="18" y="20" width="10" height="18" rx="4" fill="#e99aaa"/>
    <circle cx="34" cy="-10" r="20" fill="#f4b4c0"/>
    <path d="M24 -28 l 6 -10 l 6 10Z" fill="#e99aaa"/><path d="M38 -28 l 8 -8 l 2 12Z" fill="#e99aaa"/>
    <ellipse cx="48" cy="-6" rx="9" ry="7" fill="#e99aaa"/><circle cx="46" cy="-6" r="1.8" fill="#9c5566"/><circle cx="51" cy="-6" r="1.8" fill="#9c5566"/>
    <circle cx="33" cy="-15" r="2.6" fill="${PAL.black}"/>
    <path d="M-40 0 q -12 -4 -8 -14" stroke="#e99aaa" stroke-width="3" fill="none"/>`,
  tin: (o = {}) => `<rect x="-18" y="-22" width="36" height="44" rx="4" fill="#aeb6c2"/><ellipse cx="0" cy="-22" rx="18" ry="5" fill="#cfd5de"/><rect x="-18" y="-6" width="36" height="14" fill="${o.c || PAL.red}"/>`,
  pin: () => `<rect x="-1.5" y="-14" width="3" height="28" fill="#8a919c"/><circle cx="0" cy="-16" r="5" fill="${PAL.red}"/>`,
  map: () => `<rect x="-40" y="-28" width="80" height="56" rx="3" fill="#f4e6c4" stroke="#c9b082" stroke-width="3"/><path d="M-28 14 q 14 -26 30 -6 t 22 -18" stroke="#b5562e" stroke-width="3" fill="none" stroke-dasharray="5 5"/><path d="M20 -16 l 8 8 M28 -16 l -8 8" stroke="${PAL.red}" stroke-width="4"/>`,
  mop: () => `<rect x="-3" y="-60" width="6" height="66" fill="#c08a5a"/><path d="M-20 6 h40 l 6 24 h-52Z" fill="#9ccbe0"/><g stroke="#7fb1c8" stroke-width="3"><path d="M-14 10 v18"/><path d="M0 10 v18"/><path d="M14 10 v18"/></g>`,
  cap: (o = {}) => `<path d="M-24 4 q 0 -26 24 -26 q 24 0 24 26Z" fill="${o.c || PAL.teal}"/><path d="M14 2 h26 q 4 6 -4 8 h-22Z" fill="${o.c || PAL.teal}"/><circle cx="0" cy="-22" r="3" fill="#ffffff"/>`,
  flowerpot: () => `<path d="M-22 -14 h44 l -6 36 h-32Z" fill="#c9693c"/><rect x="-25" y="-20" width="50" height="9" rx="2" fill="#b65a30"/>`,
  rug: (o = {}) => `<rect x="-60" y="-12" width="120" height="24" rx="4" fill="${o.c || PAL.purple}"/><g stroke="#ffffff" stroke-width="3" opacity=".6"><path d="M-40 -12 v24"/><path d="M0 -12 v24"/><path d="M40 -12 v24"/></g>`,
  rugroll: (o = {}) => `<rect x="-58" y="-18" width="116" height="36" rx="18" fill="${o.c || PAL.purple}"/><ellipse cx="-58" cy="0" rx="10" ry="18" fill="#7d62b6"/><path d="M-62 -6 q 4 6 0 12" stroke="#ffffff" stroke-width="2" fill="none" opacity=".7"/>`,
  log: () => `<rect x="-50" y="-14" width="100" height="28" rx="14" fill="#9a6b40"/><ellipse cx="50" cy="0" rx="9" ry="14" fill="#d9b07a"/><ellipse cx="50" cy="0" rx="4" ry="7" fill="#b98a55"/><path d="M-30 -6 h30" stroke="#7a5230" stroke-width="2"/>`,
  bug: (o = {}) => `<ellipse cx="0" cy="0" rx="16" ry="13" fill="${o.c || PAL.red}"/><path d="M0 -13 v26" stroke="${PAL.black}" stroke-width="2"/><circle cx="-6" cy="-3" r="3" fill="${PAL.black}"/><circle cx="7" cy="4" r="3" fill="${PAL.black}"/><circle cx="16" cy="-4" r="7" fill="${PAL.black}"/><circle cx="18" cy="-6" r="1.5" fill="#ffffff"/>`,
  van: (o = {}) => `<rect x="-60" y="-34" width="100" height="48" rx="8" fill="${o.c || "#ffffff"}" stroke="#b9c2cc" stroke-width="3"/><path d="M40 -22 h12 q 10 0 12 14 v22 h-24Z" fill="${o.c || "#ffffff"}" stroke="#b9c2cc" stroke-width="3"/><rect x="44" y="-18" width="14" height="12" rx="2" fill="${PAL.sky}"/><circle cx="-34" cy="16" r="11" fill="${PAL.black}"/><circle cx="36" cy="16" r="11" fill="${PAL.black}"/><rect x="-50" y="-16" width="60" height="8" fill="${PAL.teal}"/>`,
  cup: (o = {}) => `<path d="M-14 -16 h28 v26 q 0 8 -8 8 h-12 q -8 0 -8 -8Z" fill="${o.c || "#ffffff"}" stroke="#b9c2cc" stroke-width="2"/><path d="M14 -10 q 12 0 10 10 q -2 8 -10 6" stroke="#b9c2cc" stroke-width="3" fill="none"/>`,
  jamjar: () => `<rect x="-20" y="-20" width="40" height="44" rx="6" fill="#d8eef6" stroke="#a9c9d6" stroke-width="2"/><rect x="-18" y="-6" width="36" height="28" rx="4" fill="#c7364a"/><rect x="-22" y="-28" width="44" height="10" rx="3" fill="#e2b34a"/>`,
  lid: () => `<ellipse cx="0" cy="0" rx="22" ry="8" fill="#e2b34a"/><ellipse cx="0" cy="-2" rx="16" ry="4" fill="#f0c860"/>`,
  splat: () => `<path d="M0 -18 q 8 -4 10 6 q 12 -2 8 10 q 10 6 0 12 q 2 12 -10 8 q -6 10 -14 0 q -12 4 -10 -8 q -10 -6 0 -12 q -4 -12 8 -10 q 2 -10 8 -6Z" fill="#c7364a"/>`,
  bun: (o = {}) => `<path d="M-30 6 q 0 -26 30 -26 q 30 0 30 26Z" fill="#d9a05a"/><rect x="-30" y="4" width="60" height="10" rx="4" fill="#f1d3a1"/>${o.jam ? `<rect x="-26" y="1" width="52" height="6" rx="3" fill="#c7364a"/>` : ""}`,
  fig: () => `<path d="M0 -20 q 18 14 14 26 q -4 10 -14 10 q -10 0 -14 -10 q -4 -12 14 -26Z" fill="#7d4a8a"/><path d="M0 -20 v-6" stroke="#5a8a3a" stroke-width="3"/>`,
  knife: () => `<rect x="-26" y="-4" width="22" height="8" rx="3" fill="#6b4a2e"/><path d="M-4 -5 h30 q 6 4 0 10 h-30Z" fill="#cfd5de"/>`,
  tank: () => `<rect x="-60" y="-40" width="120" height="80" rx="6" fill="#bfe6f2" stroke="#8fb9c8" stroke-width="4"/><rect x="-56" y="-26" width="112" height="62" fill="#7cc7e0" opacity=".6"/><path d="M-50 34 q 10 -14 18 0 M30 34 q 6 -20 14 0" stroke="${PAL.green}" stroke-width="4" fill="none"/>`,
  sheep: () => `
    <g fill="#ffffff"><circle cx="-20" cy="-4" r="16"/><circle cx="0" cy="-10" r="18"/><circle cx="20" cy="-4" r="16"/><circle cx="-8" cy="8" r="16"/><circle cx="12" cy="8" r="16"/></g>
    <rect x="-18" y="18" width="7" height="18" fill="${PAL.black}"/><rect x="12" y="18" width="7" height="18" fill="${PAL.black}"/>
    <ellipse cx="36" cy="-6" rx="11" ry="14" fill="${PAL.black}"/><circle cx="39" cy="-10" r="2" fill="#ffffff"/>`,
  goat: () => `
    <ellipse cx="0" cy="0" rx="36" ry="20" fill="#e9e4dc"/>
    <rect x="-26" y="14" width="8" height="22" fill="#cfc8bc"/><rect x="18" y="14" width="8" height="22" fill="#cfc8bc"/>
    <path d="M28 -10 q 18 -6 22 12 q -6 10 -18 6Z" fill="#e9e4dc"/><path d="M32 -14 q 0 -16 10 -20 M38 -12 q 4 -14 14 -16" stroke="#8a7a66" stroke-width="3" fill="none"/>
    <path d="M44 14 l 2 10 l 4 -10Z" fill="#cfc8bc"/><circle cx="40" cy="-2" r="2.2" fill="${PAL.black}"/>`,
  corn: () => `<g fill="#f0c04a">${[[-18,0],[-8,4],[2,-2],[12,3],[20,-1],[-12,-6],[6,6],[16,7]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="2.5"/>`).join("")}</g>`,
  barn: () => `<rect x="-60" y="-50" width="120" height="100" fill="#c0463c"/><path d="M-70 -50 l 70 -46 l 70 46Z" fill="#9b3730"/><rect x="-26" y="-4" width="52" height="54" fill="#8b2f29"/><path d="M-26 -4 l 52 54 M26 -4 l -52 54" stroke="#ffffff" stroke-width="4"/><rect x="-12" y="-40" width="24" height="18" fill="#f3e7d6"/>`,
  seed: () => `<ellipse cx="0" cy="0" rx="7" ry="4.5" fill="#c49a5a" transform="rotate(-20)"/>`,
  sprout: () => `<path d="M0 20 v-26" stroke="${PAL.green}" stroke-width="4"/><path d="M0 -4 q -16 -10 -18 -22 q 14 2 18 18" fill="${PAL.green}"/><path d="M0 -8 q 16 -8 20 -20 q -16 0 -20 16" fill="#6fbf5f"/>`,
  plant: () => `<path d="M0 40 v-80" stroke="${PAL.green}" stroke-width="5"/><g fill="#6fbf5f"><path d="M0 10 q -26 -6 -30 -22 q 20 0 30 18"/><path d="M0 -10 q 26 -6 30 -22 q -20 0 -30 18"/><path d="M0 -30 q -20 -6 -22 -20 q 16 0 22 16"/></g><circle cx="0" cy="-44" r="9" fill="${PAL.yellow}"/>`,
  roots: () => `<path d="M0 -20 v20 M0 0 q -14 10 -22 24 M0 0 q 12 12 18 26 M0 6 q -4 14 -2 26" stroke="#e2d2b0" stroke-width="3" fill="none"/>`,
  rabbit: () => `
    <ellipse cx="0" cy="8" rx="30" ry="22" fill="#b8b0a6"/><circle cx="-26" cy="4" r="8" fill="#ffffff"/>
    <circle cx="26" cy="-12" r="17" fill="#b8b0a6"/>
    <ellipse cx="20" cy="-42" rx="6" ry="18" fill="#b8b0a6"/><ellipse cx="32" cy="-42" rx="6" ry="18" fill="#b8b0a6"/>
    <ellipse cx="20" cy="-42" rx="2.5" ry="12" fill="#f2b8c4"/><ellipse cx="32" cy="-42" rx="2.5" ry="12" fill="#f2b8c4"/>
    <circle cx="32" cy="-14" r="2.4" fill="${PAL.black}"/><circle cx="42" cy="-8" r="2.4" fill="#d97a8a"/>`,
  carrot: () => `<path d="M-6 -16 h12 l -6 40Z" fill="${PAL.orange}"/><path d="M0 -16 q -10 -12 -6 -20 M0 -16 q 0 -14 6 -20 M0 -16 q 10 -10 12 -16" stroke="${PAL.green}" stroke-width="3" fill="none"/>`,
  fence: () => `<g fill="#c9a87c">${[-48, -24, 0, 24, 48].map((x) => `<rect x="${x - 4}" y="-26" width="8" height="46" rx="2"/>`).join("")}</g><rect x="-56" y="-14" width="112" height="6" fill="#a8814f"/><rect x="-56" y="6" width="112" height="6" fill="#a8814f"/>`,
  tent: (o = {}) => `<path d="M-60 34 l 60 -76 l 60 76Z" fill="${o.c || PAL.orange}"/><path d="M0 -42 l -16 76 h32Z" fill="#c8682a"/><path d="M0 -42 v76" stroke="#8a4a1c" stroke-width="2"/>`,
  lamp: () => `<rect x="-10" y="-14" width="20" height="26" rx="4" fill="#fff3b0" stroke="#5f6a79" stroke-width="3"/><path d="M-8 -14 q 8 -14 16 0" stroke="#5f6a79" stroke-width="3" fill="none"/><rect x="-12" y="12" width="24" height="5" fill="#5f6a79"/><circle cx="0" cy="0" r="22" fill="#fff3b0" opacity=".35"/>`,
  train: (o = {}) => `
    <rect x="-80" y="-30" width="70" height="44" rx="6" fill="${o.c || PAL.green}"/><rect x="-72" y="-22" width="20" height="16" rx="2" fill="${PAL.sky}"/><rect x="-44" y="-22" width="20" height="16" rx="2" fill="${PAL.sky}"/>
    <rect x="-2" y="-40" width="82" height="54" rx="8" fill="${o.c2 || PAL.red}"/><rect x="50" y="-56" width="14" height="18" fill="#3f4753"/><rect x="10" y="-30" width="24" height="18" rx="3" fill="${PAL.sky}"/>
    <path d="M80 6 l 14 10 h-14Z" fill="#3f4753"/>
    <g fill="${PAL.black}"><circle cx="-62" cy="18" r="9"/><circle cx="-28" cy="18" r="9"/><circle cx="14" cy="18" r="10"/><circle cx="44" cy="18" r="10"/><circle cx="70" cy="18" r="8"/></g>`,
  steam: () => `<g fill="#ffffff" opacity=".85"><circle cx="0" cy="0" r="12"/><circle cx="16" cy="-12" r="14"/><circle cx="36" cy="-20" r="11"/></g>`,
  crab: () => `
    <ellipse cx="0" cy="0" rx="24" ry="15" fill="#e0583f"/>
    <g stroke="#e0583f" stroke-width="4" fill="none"><path d="M-18 8 l -14 10"/><path d="M-10 12 l -8 14"/><path d="M18 8 l 14 10"/><path d="M10 12 l 8 14"/><path d="M-20 -6 l -12 -14"/><path d="M20 -6 l 12 -14"/></g>
    <circle cx="-34" cy="-24" r="8" fill="#e0583f"/><circle cx="34" cy="-24" r="8" fill="#e0583f"/>
    <circle cx="-6" cy="-14" r="4" fill="#ffffff"/><circle cx="6" cy="-14" r="4" fill="#ffffff"/><circle cx="-6" cy="-14" r="2" fill="${PAL.black}"/><circle cx="6" cy="-14" r="2" fill="${PAL.black}"/>`,
  gull: () => `<ellipse cx="0" cy="0" rx="22" ry="12" fill="#ffffff" stroke="#c9d2da" stroke-width="2"/><path d="M-6 -4 q -14 -22 -34 -18 q 18 10 26 22Z" fill="#aab4be"/><circle cx="18" cy="-8" r="9" fill="#ffffff"/><path d="M26 -8 l 10 3 l -10 3Z" fill="${PAL.orange}"/><circle cx="20" cy="-10" r="1.8" fill="${PAL.black}"/>`,
  blanket: () => `<rect x="-60" y="-16" width="120" height="32" fill="#ffffff"/><g fill="${PAL.red}" opacity=".75">${[-60, -36, -12, 12, 36].map((x) => `<rect x="${x}" y="-16" width="12" height="32"/>`).join("")}</g><g fill="${PAL.red}" opacity=".45"><rect x="-60" y="-16" width="120" height="8"/><rect x="-60" y="0" width="120" height="8"/></g>`,
  dolphin: () => `<path d="M-50 10 q 30 -40 80 -20 q 14 6 24 2 q -6 10 -20 10 q -34 20 -84 8Z" fill="#7d97ad"/><path d="M-4 -16 l 10 -18 l 6 16Z" fill="#6a8399"/><path d="M-50 10 l -14 -12 l 2 18Z" fill="#6a8399"/><path d="M-30 14 q 30 8 66 -6" stroke="#c8d6e0" stroke-width="5" fill="none"/><circle cx="30" cy="-6" r="2.4" fill="${PAL.black}"/>`,
  tray: () => `<rect x="-44" y="-12" width="88" height="24" rx="4" fill="#cfe2ee" stroke="#9fb9c9" stroke-width="2"/><g fill="#e9f3f8">${[-34, -12, 10, 32].map((x) => `<rect x="${x - 8}" y="-7" width="16" height="14" rx="2"/>`).join("")}</g>`,
  jug: () => `<path d="M-18 -26 h30 l 4 6 v40 q 0 8 -8 8 h-22 q -8 0 -8 -8Z" fill="#e9f3f8" stroke="#9fb9c9" stroke-width="2"/><rect x="-16" y="-4" width="30" height="30" rx="4" fill="#f5b7c3"/><path d="M16 -14 q 16 2 12 18 q -2 8 -12 6" stroke="#9fb9c9" stroke-width="4" fill="none"/>`,
  melon: () => `<path d="M-30 0 a 30 30 0 0 0 60 0Z" fill="#6fae52"/><path d="M-25 0 a 25 25 0 0 0 50 0Z" fill="#f2808f"/><g fill="#3a2a2a"><ellipse cx="-10" cy="8" rx="2" ry="3"/><ellipse cx="2" cy="12" rx="2" ry="3"/><ellipse cx="12" cy="7" rx="2" ry="3"/></g>`,
  icepop: (o = {}) => `<rect x="-14" y="-34" width="28" height="44" rx="12" fill="${o.c || "#f5b7c3"}"/><rect x="-4" y="8" width="8" height="26" rx="3" fill="#dcb98a"/><path d="M-8 -26 v18" stroke="#ffffff" stroke-width="4" opacity=".6" stroke-linecap="round"/>`,
  freezer: () => `<rect x="-36" y="-60" width="72" height="120" rx="6" fill="#eef3f7" stroke="#b9c6d1" stroke-width="3"/><path d="M-36 -18 h72" stroke="#b9c6d1" stroke-width="3"/><rect x="24" y="-50" width="5" height="22" rx="2" fill="#9fb0bf"/><rect x="24" y="-8" width="5" height="26" rx="2" fill="#9fb0bf"/><g fill="#ffffff" opacity=".9"><path d="M-14 -44 l 4 4 l 4 -4 l -4 -4Z"/></g>`,
  strawhut: () => `<path d="M-50 40 v-40 h100 v40Z" fill="#f0d47a"/><path d="M-60 2 l 60 -50 l 60 50Z" fill="#e6c25a"/><g stroke="#c9a23e" stroke-width="2">${[-40, -25, -10, 5, 20, 35].map((x) => `<path d="M${x} 4 v34"/>`).join("")}</g><rect x="-12" y="12" width="24" height="28" fill="#a8814f"/>`,
  stickhut: () => `<path d="M-50 40 v-40 h100 v40Z" fill="#b48a5a"/><path d="M-60 2 l 60 -50 l 60 50Z" fill="#8a6a45"/><g stroke="#7a5638" stroke-width="3">${[-42, -30, -18, -6, 6, 18, 30, 42].map((x) => `<path d="M${x} 2 v38"/>`).join("")}</g><rect x="-12" y="12" width="24" height="28" fill="#5e4026"/>`,
  brickhut: () => `<rect x="-50" y="0" width="100" height="40" fill="#c0563f"/><path d="M-60 2 l 60 -50 l 60 50Z" fill="#7c3a2c"/><g stroke="#e8c7a8" stroke-width="1.6">${[8, 16, 24, 32].map((y) => `<path d="M-50 ${y} h100"/>`).join("")}${[-38, -14, 10, 34].map((x) => `<path d="M${x} 0 v8 M${x + 12} 8 v8 M${x} 16 v8 M${x + 12} 24 v8"/>`).join("")}</g><rect x="-12" y="12" width="24" height="28" fill="#5e4026"/><rect x="22" y="-36" width="12" height="20" fill="#7c3a2c"/>`,
  sticks: () => `<g stroke="#8a6a45" stroke-width="5" stroke-linecap="round"><path d="M-30 10 l 60 -14"/><path d="M-26 -6 l 52 12"/><path d="M-20 14 l 44 2"/></g>`,
  bricks: () => `<g fill="#c0563f" stroke="#e8c7a8" stroke-width="1.5"><rect x="-30" y="0" width="28" height="14"/><rect x="0" y="0" width="28" height="14"/><rect x="-15" y="-14" width="28" height="14"/></g>`,
  wheat: () => `<g><path d="M0 40 v-70" stroke="#c9a23e" stroke-width="3"/>${[-26, -18, -10, -2].map((y) => `<ellipse cx="-5" cy="${y}" rx="4" ry="7" fill="#e6c25a" transform="rotate(-25 -5 ${y})"/><ellipse cx="5" cy="${y}" rx="4" ry="7" fill="#e6c25a" transform="rotate(25 5 ${y})"/>`).join("")}<ellipse cx="0" cy="-34" rx="4" ry="7" fill="#e6c25a"/></g>`,
  chick: () => `<circle cx="0" cy="0" r="12" fill="${PAL.yellow}"/><circle cx="9" cy="-10" r="8" fill="${PAL.yellow}"/><path d="M16 -11 l 6 2 l -6 3Z" fill="${PAL.orange}"/><circle cx="11" cy="-12" r="1.6" fill="${PAL.black}"/>`,
  cookpot: () => `<path d="M-32 -12 h64 v26 q 0 18 -32 18 q -32 0 -32 -18Z" fill="#3f4753"/><ellipse cx="0" cy="-12" rx="32" ry="8" fill="#56606d"/><rect x="-42" y="-8" width="12" height="6" rx="3" fill="#3f4753"/><rect x="30" y="-8" width="12" height="6" rx="3" fill="#3f4753"/><ellipse cx="0" cy="-14" rx="26" ry="5" fill="#e9dcc0"/>`,
  oats: (o = {}) => `<path d="M-60 20 q -10 -30 20 -34 q 8 -24 40 -14 q 28 -14 44 10 q 26 6 16 38Z" fill="#e9dcc0"/><g fill="#d6c49e"><circle cx="-30" cy="0" r="4"/><circle cx="0" cy="-10" r="4"/><circle cx="26" cy="2" r="4"/><circle cx="-6" cy="10" r="3"/></g>`,
  notes: () => `<g fill="${PAL.plum || "#3f2d6b"}"><circle cx="-12" cy="10" r="6"/><rect x="-7" y="-20" width="3" height="30"/><circle cx="12" cy="4" r="6"/><rect x="17" y="-26" width="3" height="30"/><rect x="-7" y="-26" width="27" height="5"/></g>`,
  zzz: () => `<g fill="#6b5aa8" font-family="sans-serif" font-weight="700"><text x="0" y="0" font-size="22">z</text><text x="14" y="-14" font-size="16">z</text><text x="25" y="-26" font-size="12">z</text></g>`,
  heart: () => `<path d="M0 12 q -22 -14 -18 -26 q 6 -12 18 -2 q 12 -10 18 2 q 4 12 -18 26Z" fill="#e85d75"/>`,
  kit: () => `<rect x="-26" y="-16" width="52" height="34" rx="5" fill="#e9f3f8" stroke="#b9c6d1" stroke-width="3"/><path d="M-10 -16 v-6 h20 v6" stroke="#b9c6d1" stroke-width="3" fill="none"/><path d="M-6 0 h12 M0 -6 v12" stroke="${PAL.red}" stroke-width="4"/>`,
  bandage: () => `<rect x="-14" y="-5" width="28" height="10" rx="4" fill="#f4d3b0"/><g fill="#d6ad86"><circle cx="-4" cy="0" r="1.2"/><circle cx="4" cy="0" r="1.2"/></g>`,
};

function drawScene(scene) {
  if (!scene) return "";
  const bg = (BACKGROUNDS[scene.bg] || BACKGROUNDS.outdoor)();
  const items = (scene.items || [])
    .map(([name, o]) => {
      const fn = ITEMS[name];
      if (!fn) return "";
      const opt = o || {};
      return _g(opt.x || 0, opt.y || 0, opt.s == null ? 1 : opt.s, fn(opt), opt.flip, opt.rot);
    })
    .join("");
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${
    (scene.alt || "Story picture").replace(/"/g, "")
  }">${bg}${items}</svg>`;
}
