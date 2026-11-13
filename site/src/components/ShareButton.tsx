"use client";

import { useState } from "react";
import { useSaved } from "./SavedProvider";

/** 공유 버튼 — 현재 목록을 담은 URL을 클립보드에 복사한다. */
export default function ShareButton({ label = "목록 공유" }: { label?: string }) {
  const saved = useSaved();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const url = saved.shareUrl();
  const empty = saved.list.length === 0;

  async function copy() {
    if (empty) return;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <span className="sharebox">
      <button type="button" className="btn btn--secondary btn--sm" onClick={copy} disabled={empty}>
        {state === "copied" ? "링크 복사됨" : label}
      </button>
      {state === "failed" ? (
        <span className="sharebox__fallback">
          복사가 막혀 있습니다. 아래 링크를 직접 복사하세요.
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        </span>
      ) : null}
    </span>
  );
}
