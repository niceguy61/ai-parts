"use client";

import { useMemo } from "react";
import { formatNumber } from "../../lib/format";
import { KINDS } from "../../lib/taxonomy";
import { useRankData } from "./RankDataProvider";

/** 세 가지 기준 — 각 카드는 실제로 쓰는 화면 조각을 보여준다. */
export default function Criteria() {
  const rank = useRankData();

  const rows = rank.rows ?? [];

  const byStars = useMemo(() => rows.slice(0, 4), [rows]);
  const byDelta = useMemo(
    () => [...rows].filter((r) => (r.d7 ?? 0) > 0).sort((a, b) => (b.d7 ?? 0) - (a.d7 ?? 0)).slice(0, 4),
    [rows],
  );
  const kindCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.k, (counts.get(r.k) ?? 0) + 1);
    const list = KINDS.map((k) => ({ kind: k.value, label: k.label, count: counts.get(k.value) ?? 0 }));
    const max = Math.max(1, ...list.map((x) => x.count));
    return list.map((x) => ({ ...x, ratio: x.count / max }));
  }, [rows]);

  const total = Math.max(1, rows.length);

  return (
    <section className="section" id="criteria" aria-labelledby="criteria-title">
      <div className="wrap">
        <div className="grid section-head">
          <h2 className="span-5" id="criteria-title">숫자로 고르는 기준</h2>
          <div className="span-6 start-7">
            <p>
              별수만 보지 않습니다. 7일 증가량, 성장 속도, 설치수 기준이 함께 있고 종류와 테마로 좁힐 수
              있습니다. 기준을 바꾸면 목록 전체가 그 기준으로 다시 매겨집니다.
            </p>
            <a className="link" href="#ranking">기준 바꾸기</a>
          </div>
        </div>

        <div className="grid cards">
          <article className="card span-4">
            <h3>별수 순위 매기기</h3>
            <p>최근 180일 안에 푸시된 리포만 남기고, 누적 별수 순으로 정렬합니다.</p>
            <div className="panel">
              <ul className="frag frag--list">
                {byStars.map((r, i) => (
                  <li key={r.slug}>
                    <span className="frag__rank">{String(i + 1).padStart(2, "0")}</span>
                    <span className="frag__name">{r.n}</span>
                    <span className="frag__num">{formatNumber(r.st)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="card span-4">
            <h3>7일 급상승 찾기</h3>
            <p>7일 사이 별수가 가장 많이 늘어난 항목부터 봅니다. 새로 붙은 프로젝트가 먼저 올라옵니다.</p>
            <div className="panel">
              <ul className="frag frag--list">
                {byDelta.length === 0 ? (
                  <li className="frag__empty">7일 증가 기록이 아직 쌓이는 중입니다.</li>
                ) : (
                  byDelta.map((r, i) => (
                    <li key={r.slug}>
                      <span className="frag__rank">{String(i + 1).padStart(2, "0")}</span>
                      <span className="frag__name">{r.n}</span>
                      <span className="frag__num frag__num--rise">+{formatNumber(r.d7 ?? 0)}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </article>

          <article className="card span-4">
            <h3>종류와 테마로 좁히기</h3>
            <p>MCP 서버, 스킬, 플러그인, 라이브러리 중 원하는 종류만 보고 테마별로 다시 거릅니다.</p>
            <div className="panel">
              <ul className="frag frag--bars">
                {kindCounts.map((k) => (
                  <li key={k.kind}>
                    <span className="frag__name">{k.label}</span>
                    <span className="frag__bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(k.ratio * 100)}%` }} />
                    </span>
                    <span className="frag__num">{k.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <p className="frag__note">현재 기준의 {total.toLocaleString()}개 항목 기준</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
