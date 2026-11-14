"use client";

import { BASE_PATH } from "../lib/format";
import { useSaved } from "./SavedProvider";

/** 헤더의 내 목록 링크 — 저장한 개수를 실시간으로 보여준다. */
export default function HeaderSavedLink() {
  const saved = useSaved();
  const n = saved.list.length;
  return (
    <a className="nav__saved" href={`${BASE_PATH}/#saved`} aria-label={`내 목록 — 저장한 항목 ${n}개`}>
      내 목록
      {n > 0 ? <span className="nav__saved-count">{n}</span> : null}
    </a>
  );
}
