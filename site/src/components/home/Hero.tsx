"use client";

import { useEffect, useState } from "react";
import { fetchRank } from "../../lib/catalog";
import { BASE_PATH, formatNumber, KIND_LABEL, type SlimEntry } from "../../lib/format";

/** 히어로 — 문장 하나와 실제 랭킹 화면 한 창. */
export default function Hero() {
  const [top, setTop] = useState<SlimEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRank("stars")
      .then((rows) => {
        if (!cancelled) setTop(rows.slice(0, 5));
      })
      .catch(() => {
        if (!cancelled) setTop([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero hero--centred" aria-labelledby="hero-title">
      <div className="wrap">
        <div className="hero-text">
          <div className="hero__c">
            <h1 id="hero-title">
              MCP 서버와 에이전트 스킬을 고르는 AI 부품 랭킹
            </h1>
            <p className="hero__lead">
              GitHub·skills.sh·ClawHub·MCP Registry·npm 5개 소스에서 AI 부품을 모아
              별수·급상승·설치수로 비교합니다. 고른 항목은 내 목록에 담아 두고 링크로 나눌 수 있습니다.
            </p>
            <div className="btn-row">
              <a className="btn btn--primary" href="#ranking">랭킹 보기</a>
              <a className="btn btn--secondary" href={`${BASE_PATH}/search`}>검색하기</a>
            </div>
          </div>

          <div className="hero__window">
            <div className="win__bar">
              <span className="win__title">ai_insight · 별수 기준 상위 5</span>
              <span className="win__meta">매일 갱신</span>
            </div>
            {top === null ? (
              <p className="win__loading">랭킹을 불러오는 중…</p>
            ) : top.length === 0 ? (
              <p className="win__loading">랭킹 데이터를 불러오지 못했습니다.</p>
            ) : (
              <ol className="win__rows">
                {top.map((row, i) => (
                  <li key={row.slug}>
                    <span className="win__rank">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`ktag ${row.k}`}>{KIND_LABEL[row.k] ?? row.k}</span>
                    <span className="win__name">{row.n}</span>
                    <span className="win__stars">{formatNumber(row.st)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
