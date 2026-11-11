"use client";

import { useState } from "react";

interface Cmd {
  target: string;
  cmd: string;
}

/** 설치 전표 — 영수증처럼 대상·명령을 나열하고 복사할 수 있다. */
export default function InstallCommands({ cmds }: { cmds: Cmd[] | null }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!cmds || cmds.length === 0) {
    return (
      <p className="wait-note">
        README에서 설치 명령을 찾지 못했습니다 — 위 &ldquo;원문에서 보기&rdquo; 링크의 설치 문서를 확인하세요.
      </p>
    );
  }

  async function copy(cmd: string) {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(cmd);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // 클립보드 권한 없음 — 무시
    }
  }

  return (
    <div className="slipbox">
      {cmds.map((c, i) => (
        <div className="row" key={`${c.target}-${i}`}>
          <span className="t">{c.target}</span>
          <code>{c.cmd}</code>
          <button type="button" className="copy" onClick={() => copy(c.cmd)}>
            {copied === c.cmd ? "복사됨" : "복사"}
          </button>
        </div>
      ))}
    </div>
  );
}
