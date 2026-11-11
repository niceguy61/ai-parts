import { BASE_PATH, KIND_LABEL, avatarFromSlug, formatNumber } from "../lib/format";
import type { SlimEntry } from "../lib/format";

/** 72×26 미니 스파크라인 — 리스트에서 추이를 바로 본다. */
function MiniSpark({ series }: { series: number[] }) {
  if (series.length < 2) return <span className="spark" />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const w = 72;
  const h = 26;
  const step = w / (series.length - 1);
  const rising = series[series.length - 1] >= series[0];
  const pts = series
    .map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - ((v - min) / range) * (h - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={rising ? "#0e9f6e" : "#c2beb2"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 랭킹 장부의 한 행(전표). 한줄 요약(20자) → 설치 명령 → repo 경로 순으로 보여준다. */
export default function EntryCard({ entry, rank }: { entry: SlimEntry; rank?: number }) {
  const short = entry.sh?.trim();
  const avatar = avatarFromSlug(entry.slug);
  const repoPath = entry.slug;

  return (
    <a className="slip" href={`${BASE_PATH}/entry?slug=${entry.slug}`}>
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
          {entry.mo && entry.mo >= 2 ? <span className="momtag">🔥 {entry.mo}일 연속</span> : null}
        </span>
        {short ? (
          <span className="brief">{short}</span>
        ) : repoPath ? (
          <span className="brief">{repoPath}</span>
        ) : null}
      </span>
      <span className="sparkcell">
        <MiniSpark series={entry.sp ?? []} />
      </span>
      <span className="nums">
        <span className="stars">
          <span className="icon">⭐</span>
          {formatNumber(entry.st)}
        </span>
        {entry.d7 && entry.d7 > 0 ? (
          <span className="delta">▲ {formatNumber(entry.d7)}<span className="unit">/7d</span></span>
        ) : entry.in ? (
          <span className="installs">📥 {formatNumber(entry.in)}</span>
        ) : null}
      </span>
    </a>
  );
}
