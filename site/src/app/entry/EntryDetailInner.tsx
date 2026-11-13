"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InstallCommands from "../../components/InstallCommands";
import StarChart from "../../components/StarChart";
import { fetchEntry, fetchHistory, fetchMetrics } from "../../lib/catalog";
import { BASE_PATH, KIND_LABEL, avatarFromSlug } from "../../lib/format";
import type { EntryDetail, EntryHistoryPoint, EntryMetrics } from "../../lib/format";

const SOURCE_LABEL: Record<string, string> = {
  github: "GitHub",
  skills_sh: "skills.sh",
  clawhub: "ClawHub",
  mcp_registry: "MCP Registry",
  npm: "npm",
  geeknews: "GeekNews",
  backfill: "내부 백필",
  rank_ref: "전체 랭킹",
};

export default function EntryDetailInner() {
  const sp = useSearchParams();
  const slug = sp.get("slug") ?? "";
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [metrics, setMetrics] = useState<EntryMetrics | null>(null);
  const [history, setHistory] = useState<EntryHistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setEntry(null);
    setMetrics(null);
    setHistory([]);
    setError(null);
    // 정적 전문 + 별수(metrics) + 히스토리는 각각 로드 — 부분 실패해도 나머지 표시
    fetchEntry(slug)
      .then(setEntry)
      .catch(() => setError("notfound"));
    fetchMetrics()
      .then((m) => {
        const t = m[slug];
        setMetrics(t ? { st: t[0], d7: t[1], d24: t[2], in: t[3], npm: t[4] } : null);
      })
      .catch(() => setMetrics(null));
    fetchHistory()
      .then((h) => setHistory((h[slug] ?? []).map(([d, v]) => {
        // history.json은 압축형(YYYYMMDD 정수) — 차트가 기대하는 YYYY-MM-DD로 변환
        const s = String(d);
        return { d: `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`, v };
      })))
      .catch(() => setHistory([]));
  }, [slug]);

  if (!slug) return <p className="empty">항목이 지정되지 않았습니다.</p>;
  if (error) return <p className="empty">항목을 찾을 수 없습니다.</p>;
  if (!entry) return <p className="empty">불러오는 중…</p>;

  const primary = entry.repo ?? entry.homepage ?? entry.appearances.find((a) => a.url)?.url ?? null;
  const st = metrics?.st ?? 0;
  const d7 = metrics?.d7 ?? null;
  const installs = metrics?.in ?? null;
  const npmMonthly = metrics?.npm ?? null;

  return (
    <article className="detail container page">
      <h1>
        {avatarFromSlug(entry.slug) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="davatar" src={avatarFromSlug(entry.slug)!} alt="" width={44} height={44} />
        ) : null}
        {entry.name}
      </h1>
      <div className="subline">
        <span className="chip accent">{KIND_LABEL[entry.kind] ?? entry.kind}</span>
        {entry.category ? <span className="chip">{entry.category}</span> : null}
        <span className="chip gold">{st.toLocaleString()}</span>
        {d7 && d7 > 0 ? <span className="chip rise">▲ +{d7.toLocaleString()} / 7d</span> : null}
        {installs ? <span className="chip">{installs.toLocaleString()}</span> : null}
        {npmMonthly ? <span className="chip">npm/월 {npmMonthly.toLocaleString()}</span> : null}
        {entry.license ? <span className="chip">{entry.license}</span> : null}
        {entry.repo ? <span className="chip">{entry.repo.replace("https://github.com/", "")}</span> : null}
      </div>

      <div className="cta">
        {primary ? (
          <a className="primary" href={primary} target="_blank" rel="noreferrer">
            원문에서 보기 ↗
          </a>
        ) : null}
        <a className="ghost" href={`${BASE_PATH}/`}>
          랭킹으로
        </a>
      </div>

      <section className="section">
        <h2>한 줄 · 상세 요약</h2>
        {entry.short ? <p className="shortline">{entry.short}</p> : null}
        {entry.summary ? (
          <p className="prose" style={{ lineHeight: 1.7 }}>{entry.summary}</p>
        ) : (
          <p className="wait-note">요약이 아직 생성되지 않았습니다 — 원문 링크로 직접 확인할 수 있습니다.</p>
        )}
        {entry.usage ? (
          <p className="prose" style={{ lineHeight: 1.7, marginTop: 12 }}>{entry.usage}</p>
        ) : null}
      </section>

      <section className="section">
        <h2>설치</h2>
        <InstallCommands cmds={entry.install} />
      </section>

      <section className="section">
        <h2>스타 추이</h2>
        {history.length > 1 ? (
          <StarChart points={history.map((h) => ({ time: h.d, value: h.v }))} />
        ) : (
          <p className="wait-note">스냅샷이 2일 이상 쌓이면 추이가 그려집니다.</p>
        )}
      </section>

      <section className="section">
        <h2>어디서 화제가 되었나 — 원문 출처</h2>
        <ul className="sources">
          {entry.appearances.map((a) => (
            <li key={`${a.source}-${a.external_id}`}>
              <a href={a.url ?? "#"} target="_blank" rel="noreferrer">{SOURCE_LABEL[a.source] ?? a.source}</a>
              <span className="ext">{a.external_id}</span>
              {a.metrics && Object.keys(a.metrics).length > 0 ? (
                <span className="ext">
                  {Object.entries(a.metrics).map(([k, v]) => `${k} ${String(v)}`).join(" · ")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
