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

function _g(x, y, s, inner, flip) {
  const sc = flip ? `scale(${-(s || 1)},${s || 1})` : `scale(${s || 1})`;
  return `<g transform="translate(${x},${y}) ${sc}">${inner}</g>`;
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
  hen: () => `
    <ellipse cx="0" cy="6" rx="26" ry="22" fill="${PAL.white}"/>
    <path d="M18 -2 q 20 6 22 22 q -18 2 -26 -10Z" fill="#efe6d8"/>
    <circle cx="-18" cy="-16" r="14" fill="${PAL.white}"/>
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
};

function drawScene(scene) {
  if (!scene) return "";
  const bg = (BACKGROUNDS[scene.bg] || BACKGROUNDS.outdoor)();
  const items = (scene.items || [])
    .map(([name, o]) => {
      const fn = ITEMS[name];
      if (!fn) return "";
      const opt = o || {};
      return _g(opt.x || 0, opt.y || 0, opt.s == null ? 1 : opt.s, fn(opt), opt.flip);
    })
    .join("");
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${
    (scene.alt || "Story picture").replace(/"/g, "")
  }">${bg}${items}</svg>`;
}
