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

    // 색상 리터럴: lightweight-charts는 문자열 색만 받음 — 테마 토큰 미러(#6c8cff 액센트 · #939cad muted · #242b38/#2c3648 보더 계열). 토큰 변경 시 함께 갱신.
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "#939cad",
        fontFamily: "var(--sans)",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#242b3a" },
        horzLines: { color: "#242b3a" },
      },
      rightPriceScale: { borderColor: "#2c3648" },
      timeScale: {
        borderColor: "#2c3648",
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#6c8cff", width: 1, style: 3, labelBackgroundColor: "#6c8cff", labelTextColor: "#0b0e14" },
        horzLine: { color: "#6c8cff", width: 1, style: 3, labelBackgroundColor: "#6c8cff", labelTextColor: "#0b0e14" },
      },
      localization: {
        priceFormatter: (p: number) => p.toLocaleString("ko-KR"),
      },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#6c8cff",
      topColor: "rgba(108, 140, 255, 0.15)",
      bottomColor: "rgba(108, 140, 255, 0.02)",
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
      <div className="rangeline">
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
      <div ref={containerRef} className="starplot" />
    </div>
  );
}
