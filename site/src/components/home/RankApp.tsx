"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_PATH, formatNumber, KIND_LABEL } from "../../lib/format";
import { CATEGORIES, KINDS, RANK_TABS } from "../../lib/taxonomy";
import { toSavedEntry } from "../../lib/saved";
import SavedButton from "../SavedButton";
import Sparkline from "../Sparkline";
import { useSaved } from "../SavedProvider";
import { useRankData, type ListRow } from "./RankDataProvider";

/** 랭킹 앱 — 목록(왼쪽)과 열린 항목(오른쪽). 실제 제품 화면이다. */
export default function RankApp() {
  const rank = useRankData();
  const saved = useSaved();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const listRows = useMemo<ListRow[]>(() => {
    if (rank.view === "saved") {
      return saved.list.map((e) => ({ slug: e.slug, n: e.n, k: e.k, st: e.st, sh: e.sh }));
    }
    if (rank.view === "shared") return rank.sharedEntries;
    return rank.pageRows;
  }, [rank.view, rank.pageRows, rank.sharedEntries, saved.list]);

  const selected = useMemo<ListRow | null>(() => {
    if (listRows.length === 0) return null;
    return listRows.find((r) => r.slug === selectedSlug) ?? listRows[0];
  }, [listRows, selectedSlug]);

  // 목록이 바뀌면 선택도 처음으로 되돌린다.
  useEffect(() => {
    setSelectedSlug(null);
  }, [rank.view, rank.tab, rank.page]);

  const activeTab = RANK_TABS.find((t) => t.key === rank.tab) ?? RANK_TABS[0];

  function move(direction: 1 | -1) {
    if (listRows.length === 0) return;
    const index = selected ? listRows.findIndex((r) => r.slug === selected.slug) : -1;
    const next = Math.min(listRows.length - 1, Math.max(0, index + direction));
    const target = listRows[next];
    setSelectedSlug(target.slug);
    const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-slug="${CSS.escape(target.slug)}"]`);
    button?.focus();
  }

  return (
    <div className="app frame">
      <div className="app__toolbar">
        <div className="apptabs" role="tablist" aria-label="랭킹 기준">
          {RANK_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`ranktab-${t.key}`}
              aria-selected={rank.tab === t.key}
              aria-controls="ranklist"
              tabIndex={rank.tab === t.key ? 0 : -1}
              onClick={() => rank.setTab(t.key)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const index = RANK_TABS.findIndex((x) => x.key === rank.tab);
                const next = RANK_TABS[(index + (e.key === "ArrowRight" ? 1 : -1) + RANK_TABS.length) % RANK_TABS.length];
                rank.setTab(next.key);
                document.getElementById(`ranktab-${next.key}`)?.focus();
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="appviews">
          <button
            type="button"
            className={`viewbtn${rank.view === "rank" ? " on" : ""}`}
            aria-pressed={rank.view === "rank"}
            onClick={() => rank.setView("rank")}
          >
            랭킹
          </button>
          <button
            type="button"
            className={`viewbtn${rank.view === "saved" ? " on" : ""}`}
            aria-pressed={rank.view === "saved"}
            onClick={() => rank.setView("saved")}
          >
            내 목록{saved.list.length > 0 ? ` ${saved.list.length}` : ""}
          </button>
          {rank.sharedSlugs.length > 0 ? (
            <button
              type="button"
              className={`viewbtn${rank.view === "shared" ? " on" : ""}`}
              aria-pressed={rank.view === "shared"}
              onClick={() => rank.setView("shared")}
            >
              공유 목록 {rank.sharedSlugs.length}
            </button>
          ) : null}
        </div>
      </div>

      <div className="appfilters">
        <div className="chipgroup" role="group" aria-label="종류">
          <button type="button" className={`chip${!rank.kind ? " on" : ""}`} aria-pressed={!rank.kind}
                  onClick={() => rank.setKind(undefined)}>
            전체
          </button>
          {KINDS.map((k) => (
            <button key={k.value} type="button" className={`chip${rank.kind === k.value ? " on" : ""}`}
                    aria-pressed={rank.kind === k.value} onClick={() => rank.setKind(k.value)}>
              {k.label}
            </button>
          ))}
        </div>

        <label className="appselect">
          <span>테마</span>
          <select value={rank.category ?? ""} onChange={(e) => rank.setCategory(e.target.value || undefined)}>
            <option value="">모든 테마</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {rank.error ? <p className="app__error">{rank.error}</p> : null}

      <div className="app__body">
        <div
          className="app__pane app__pane--list"
          id="ranklist"
          role="tabpanel"
          aria-labelledby={`ranktab-${rank.tab}`}
        >
          {rank.view === "rank" ? (
            <p className="app__hint">
              {activeTab.desc}
              {rank.filtered.length > 0 ? ` · ${rank.filtered.length.toLocaleString()}개` : ""}
            </p>
          ) : rank.view === "saved" ? (
            <p className="app__hint">이 브라우저에 저장한 목록 {saved.list.length}개</p>
          ) : (
            <p className="app__hint">공유 링크로 받은 목록 {rank.sharedSlugs.length}개</p>
          )}

          <div
            className="applist"
            role="listbox"
            aria-label="항목 목록"
            ref={listRef}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              }
            }}
          >
            {listRows.length === 0 ? (
              <p className="app__empty">
                {rank.view === "saved"
                  ? "저장한 항목이 없습니다. 목록에서 저장 버튼을 누르면 여기에 모입니다."
                  : rank.view === "shared"
                    ? "공유 링크의 항목을 불러오지 못했습니다."
                    : "불러오는 중…"}
              </p>
            ) : (
              listRows.map((r, i) => (
                <button
                  key={r.slug}
                  type="button"
                  role="option"
                  data-slug={r.slug}
                  aria-selected={selected?.slug === r.slug}
                  tabIndex={selected?.slug === r.slug ? 0 : -1}
                  className="aprow"
                  onClick={() => setSelectedSlug(r.slug)}
                >
                  <span className="aprow__rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="aprow__name">
                    <span className={`ktag ${r.k}`}>{KIND_LABEL[r.k] ?? r.k}</span>
                    <span className="aprow__title">{r.n}</span>
                  </span>
                  <span className="aprow__spark">{r.sp && r.sp.length > 1 ? <Sparkline series={r.sp} /> : null}</span>
                  <span className="aprow__nums">
                    <span className="stars">{formatNumber(r.st)}</span>
                    {r.d7 && r.d7 > 0 ? <span className="delta">▲{formatNumber(r.d7)}</span> : null}
                  </span>
                </button>
              ))
            )}
          </div>

          {rank.view === "rank" && rank.totalPages > 1 ? (
            <nav className="app__pager" aria-label="페이지">
              <button type="button" className="pgbtn" onClick={() => rank.setPage(Math.max(1, rank.page - 1))} disabled={rank.page === 1}>
                이전
              </button>
              <span className="pgnum">{rank.page} / {rank.totalPages}</span>
              <button type="button" className="pgbtn" onClick={() => rank.setPage(Math.min(rank.totalPages, rank.page + 1))} disabled={rank.page === rank.totalPages}>
                다음
              </button>
            </nav>
          ) : null}
        </div>

        <div className="app__pane app__pane--open">
          {selected ? (
            <>
              <div className="appopen__head">
                <span className={`ktag ${selected.k}`}>{KIND_LABEL[selected.k] ?? selected.k}</span>
                <h3>{selected.n}</h3>
                <p className="appopen__path">{selected.slug}</p>
              </div>
              <p className="appopen__summary">
                {selected.sh?.trim() || "요약이 아직 채워지지 않았습니다 — 상세 페이지에서 원문을 볼 수 있습니다."}
              </p>
              <dl className="appopen__stats">
                <div>
                  <dt>별수</dt>
                  <dd>{formatNumber(selected.st)}</dd>
                </div>
                <div>
                  <dt>7일 증가</dt>
                  <dd>{selected.d7 ? `+${formatNumber(selected.d7)}` : "-"}</dd>
                </div>
                <div>
                  <dt>설치수</dt>
                  <dd>{selected.in ? formatNumber(selected.in) : "-"}</dd>
                </div>
              </dl>
              {selected.sp && selected.sp.length > 1 ? (
                <div className="appopen__chart">
                  <Sparkline series={selected.sp} width={320} height={72} />
                </div>
              ) : null}
              {selected.cat ? <p className="appopen__cat">테마 · {selected.cat}</p> : null}
              <div className="appopen__cta">
                <a className="btn btn--secondary btn--sm" href={`${BASE_PATH}/entry?slug=${selected.slug}`}>
                  상세 보기
                </a>
                <SavedButton
                  entry={toSavedEntry({
                    slug: selected.slug,
                    n: selected.n,
                    k: selected.k,
                    st: selected.st,
                    sh: selected.sh ?? null,
                  })}
                  saved={saved.isSaved(selected.slug)}
                  onToggle={saved.toggle}
                />
              </div>
            </>
          ) : (
            <p className="app__empty">목록에서 항목을 고르면 여기에서 요약과 추이를 볼 수 있습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
