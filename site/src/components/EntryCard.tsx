"use client";

import { BASE_PATH, KIND_LABEL, avatarFromSlug, formatNumber } from "../lib/format";
import type { SlimEntry } from "../lib/format";
import Sparkline from "./Sparkline";
import SavedButton from "./SavedButton";
import { useSaved } from "./SavedProvider";
import { toSavedEntry } from "../lib/saved";

/** 랭킹 장부의 한 행(전표). 한줄 요약(20자) → 설치 명령 → repo 경로 순으로 보여준다. */
export default function EntryCard({ entry, rank, showVelocity }:
                                     { entry: SlimEntry; rank?: number; showVelocity?: boolean }) {
  const short = entry.sh?.trim();
  const avatar = avatarFromSlug(entry.slug);
  const repoPath = entry.slug;
  const saved = useSaved();

  return (
    <div className="slip">
      <a className="slip__link" href={`${BASE_PATH}/entry?slug=${entry.slug}`}>
        <span className={`rank${(rank ?? 99) <= 3 ? " top" : ""}`}>
          {rank !== undefined ? String(rank).padStart(2, "0") : ""}
        </span>
        <span className="who">
          <span className="titlerow">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar" src={avatar} alt="" width={22} height={22} loading="lazy" />
            ) : null}
            <span className={`ktag ${entry.k}`}>{KIND_LABEL[entry.k] ?? entry.k}</span>
            <span className="name">{entry.n}</span>
            {entry.mo && entry.mo >= 2 ? <span className="momtag">{entry.mo}일 연속</span> : null}
          </span>
          {short ? (
            <span className="brief">{short}</span>
          ) : repoPath ? (
            <span className="brief">{repoPath}</span>
          ) : null}
        </span>
        <span className="sparkcell">
          <Sparkline series={entry.sp ?? []} />
        </span>
        <span className="nums">
          <span className="stars">
            <span className="icon"></span>
            {formatNumber(entry.st)}
          </span>
          {showVelocity && entry.vl != null ? (
            <span className="delta">▲ {entry.vl >= 100 ? Math.round(entry.vl) : entry.vl}%<span className="unit">/7d</span></span>
          ) : entry.d7 && entry.d7 > 0 ? (
            <span className="delta">▲ {formatNumber(entry.d7)}<span className="unit">/7d</span></span>
          ) : entry.in ? (
            <span className="installs">{formatNumber(entry.in)}</span>
          ) : null}
        </span>
      </a>
      <SavedButton
        entry={toSavedEntry(entry)}
        saved={saved.isSaved(entry.slug)}
        onToggle={saved.toggle}
      />
    </div>
  );
}
