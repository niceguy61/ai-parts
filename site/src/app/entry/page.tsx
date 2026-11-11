"use client";

import { Suspense } from "react";
import EntryDetailInner from "./EntryDetailInner";

export default function EntryPage() {
  return (
    <Suspense fallback={<p className="empty">불러오는 중…</p>}>
      <EntryDetailInner />
    </Suspense>
  );
}
