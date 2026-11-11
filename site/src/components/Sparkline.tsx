/** 의존성 없는 SVG 스파크라인. 2점 미만이면 비어 있는 축만 그린다. */
export default function Sparkline({ points }: { points: number[] }) {
  const width = 280;
  const height = 60;
  const pad = 4;

  if (points.length >= 2) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = (width - pad * 2) / (points.length - 1);
    const coords = points.map((v, i) => {
      const x = pad + i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="스타 추이"
      >
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={coords[coords.length - 1].split(",")[0]}
          cy={coords[coords.length - 1].split(",")[1]}
          r="3"
          fill="#f97316"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="스타 추이 데이터 없음"
    >
      <line
        x1={pad}
        y1={height / 2}
        x2={width - pad}
        y2={height / 2}
        stroke="#21262d"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
