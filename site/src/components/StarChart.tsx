"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

export interface StarPoint {
  time: string; // YYYY-MM-DD
  value: number;
}

const RANGES = [
  { days: 14, label: "14일" },
  { days: 30, label: "30일" },
  { days: 90, label: "90일" },
  { days: 0, label: "전체" },
] as const;

/** TradingView 스타일 스타 추이 — lightweight-charts 기반, 일별 마지막 값 사용. */
export default function StarChart({ points }: { points: StarPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [rangeDays, setRangeDays] = useState<number>(0); // 0 = 전체

  // 일별 마지막 값으로 정규화 (같은 날 여러 스냅샷 → 마지막)
  const daily = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const p of points) byDay.set(p.time, p.value);
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, value]) => ({ time: time as Time, value }));
  }, [points]);

  const filtered = useMemo(() => {
    if (!rangeDays) return daily;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);
    const key = cutoff.toISOString().slice(0, 10);
    return daily.filter((p) => (p.time as string) >= key);
  }, [daily, rangeDays]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "#5c6066",
        fontFamily: "var(--sans)",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#ecebe4" },
        horzLines: { color: "#ecebe4" },
      },
      rightPriceScale: { borderColor: "#e3e0d8" },
      timeScale: {
        borderColor: "#e3e0d8",
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#2e4de6", width: 1, style: 3, labelBackgroundColor: "#2e4de6" },
        horzLine: { color: "#2e4de6", width: 1, style: 3, labelBackgroundColor: "#2e4de6" },
      },
      localization: {
        priceFormatter: (p: number) => p.toLocaleString("ko-KR"),
      },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#2e4de6",
      topColor: "rgba(46, 77, 230, 0.18)",
      bottomColor: "rgba(46, 77, 230, 0.02)",
      lineWidth: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    series.setData(filtered);
    chartRef.current?.timeScale().fitContent();
  }, [filtered]);

  if (daily.length < 2) {
    return (
      <p className="wait-note">
        스냅샷이 2일 이상 쌓이면 추이가 그려집니다 — 수집기가 6시간마다 기록 중입니다.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className="rangebtn"
            aria-pressed={rangeDays === r.days}
            onClick={() => setRangeDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} style={{ width: "100%", height: 260 }} />
    </div>
  );
}
