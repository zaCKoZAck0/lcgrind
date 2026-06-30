// Server component — Math.random() runs per request → unique pattern each visit

const STAR_PATHS = [
  // s1: 10-point star
  "M158.682 195 100 127.008 41.219 195l43.344-79.687L5 77.551l85.5 18.732L100 5l9.5 91.283L195 77.65l-79.661 37.663z",
  // s2: octagon
  "m100 5 67.175 27.825L195 100l-27.825 67.175L100 195l-67.175-27.825L5 100l27.825-67.175z",
  // s4: 5-point star
  "M158.727 195 100 150.193 41.273 195l22.353-72.545L5 77.545l72.546-.101L100 5l22.455 72.444 72.545.102-58.626 44.909z",
  // s6: 4-point diamond star
  "m100 5 25.659 69.341L195 100l-69.341 25.659L100 195l-25.659-69.341L5 100l69.341-25.659z",
  // s7: 4-point crosshair
  "m100 5 6.718 88.283L195 100l-88.282 6.718L100 195l-6.718-88.282L5 100l88.283-6.718z",
  // s8: 4-point smooth star
  "M100 5s5.088 49.035 25.527 69.473C145.965 94.912 195 100 195 100s-49.035 5.088-69.473 25.527C105.088 145.965 100 195 100 195s-5.088-49.035-25.527-69.473C54.035 105.088 5 100 5 100s49.035-5.088 69.473-25.527C94.912 54.035 100 5 100 5",
];

const STAR_SIZE = 28;
const CELL_W = 38;
const CELL_H = 34;
const BANNER_H = 96; // h-24
const COLS = 26;
const ROWS = Math.ceil(BANNER_H / CELL_H) + 1;

export function ProfileBanner() {
  const path = STAR_PATHS[Math.floor(Math.random() * STAR_PATHS.length)]!;

  const stars: { x: number; y: number; opacity: number }[] = [];
  for (let row = 0; row < ROWS; row++) {
    const xOffset = row % 2 === 1 ? CELL_W / 2 : 0;
    const y = row * CELL_H - STAR_SIZE / 2;
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL_W + xOffset - STAR_SIZE / 2;
      stars.push({ x, y, opacity: 0.12 + Math.random() * 0.18 });
    }
  }

  return (
    <div className="relative h-24 bg-main border-b-2 border-border overflow-hidden">
      {stars.map((s, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          width={STAR_SIZE}
          height={STAR_SIZE}
          className="absolute text-main-foreground"
          style={{ left: s.x, top: s.y, opacity: s.opacity }}
          aria-hidden="true"
        >
          <path fill="currentColor" d={path} />
        </svg>
      ))}
    </div>
  );
}
