/** 스파크라인 — 최근 별수 추이를 얇은 선으로 그린다. 색은 CSS 토큰이 정한다. */
export default function Sparkline({
  series,
  width = 72,
  height = 26,
}: {
  series: number[];
  width?: number;
  height?: number;
}) {
  if (!series || series.length < 2) {
    return <span className="spark spark--empty" aria-hidden="true" />;
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const step = width / (series.length - 1);
  const rising = series[series.length - 1] >= series[0];
  const points = series
    .map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - ((v - min) / range) * (height - 4)).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      className={`spark ${rising ? "up" : "down"}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline points={points} fill="none" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
