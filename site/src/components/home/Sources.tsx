"use client";

import { formatNumber } from "../../lib/format";
import { useRankData } from "./RankDataProvider";

const STEPS = [
  { name: "수집", body: "GitHub·skills.sh·ClawHub·MCP Registry·npm을 돌아다니며 새 항목을 긁어옵니다." },
  { name: "정리", body: "같은 저장소를 한 항목으로 합치고 태그·테마·설치 명령을 붙입니다." },
  { name: "요약", body: "한줄 요약과 사용 방법을 LLM이 한국어로 정리합니다." },
  { name: "게시", body: "별수·증가량·설치수 기준 랭킹 JSON으로 내보내 사이트에 올립니다." },
];

/** 수집 파이프라인 — 어디서 항목이 오고 어떻게 게시되는지. */
export default function Sources() {
  const rank = useRankData();
  const rows = (rank.rows ?? []).slice(0, 3);
  const total = rank.manifest?.entries ?? null;

  return (
    <section className="section" id="sources" aria-labelledby="sources-title">
      <div className="wrap grid">
        <h2 className="span-5" id="sources-title">수집부터 게시까지 자동으로</h2>
        <div className="span-6 start-7">
          <p>
            수집은 정해진 주기로 돌아가고, 요약은 LLM이 채웁니다. 게시된 데이터는 정적 파일이라
            페이지가 열릴 때마다 서버를 부르지 않습니다.
          </p>
        </div>

        <div className="frame frame--hero span-12">
          <div className="stage pipeline">
            <ol className="pipeline__steps">
              {STEPS.map((s, i) => (
                <li key={s.name}>
                  <span className="pipeline__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pipeline__name">{s.name}</span>
                </li>
              ))}
            </ol>
            <div className="pipeline__body">
              <div className="pipeline__col">
                <p className="pipeline__label">소스</p>
                <ul className="pipeline__list">
                  <li><span>GitHub</span><span>6시간마다</span></li>
                  <li><span>skills.sh</span><span>12시간마다</span></li>
                  <li><span>ClawHub</span><span>12시간마다</span></li>
                  <li><span>MCP Registry · npm</span><span>하루마다</span></li>
                </ul>
              </div>
              <div className="pipeline__col">
                <p className="pipeline__label">게시된 항목</p>
                {total !== null ? (
                  <p className="pipeline__total">{total.toLocaleString()}개</p>
                ) : (
                  <p className="pipeline__total">불러오는 중…</p>
                )}
                <ul className="pipeline__list">
                  {rows.map((r) => (
                    <li key={r.slug}>
                      <span>{r.n}</span>
                      <span>{formatNumber(r.st)}★</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {STEPS.map((s) => (
          <div className="span-3" key={s.name}>
            <h3>{s.name}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
