"use client";

import { useEffect, useState } from "react";
import { fetchManifest } from "../lib/catalog";

/** 푸터에 데이터 기준 시각 표시 — 배포 성공 여부를 바로 확인용. */
export default function DataTimestamp() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest()
      .then((m) => {
        const d = new Date(m.generatedAt);
        if (Number.isNaN(d.getTime())) return;
        setText(
          d.toLocaleString("ko-KR", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", hour12: false,
          }),
        );
      })
      .catch(() => {});
  }, []);

  if (!text) return null;
  return <span className="data-ts">데이터 기준 {text} KST</span>;
}
