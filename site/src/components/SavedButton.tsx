"use client";

import type { SavedEntry } from "../lib/saved";

/** 저장(좋아요) 토글 — 목록에 있으면 누르고, 없으면 눌러 담는다. */
export default function SavedButton({
  entry,
  saved,
  onToggle,
  label = "저장",
}: {
  entry: Omit<SavedEntry, "savedAt">;
  saved: boolean;
  onToggle: (entry: Omit<SavedEntry, "savedAt">) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`savebtn${saved ? " on" : ""}`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(entry);
      }}
    >
      <span className="savebtn__dot" aria-hidden="true" />
      {saved ? `${label}됨` : label}
    </button>
  );
}
