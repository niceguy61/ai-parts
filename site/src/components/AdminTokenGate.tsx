"use client";

import { useEffect, useState } from "react";

/** admin_token을 localStorage에서 관리하는 훅 + 게이트 컴포넌트. */
export function useAdminToken(): { token: string; loaded: boolean; setToken: (t: string) => void } {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setToken(localStorage.getItem("admin_token") ?? "");
    setLoaded(true);
  }, []);
  return { token, loaded, setToken };
}

export function saveAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

/** 토큰이 없으면 입력 폼, 있으면 children(일반 노드)을 렌더한다. */
export default function AdminTokenGate({
  token,
  loaded,
  children,
  failed = false,
  onClearToken,
}: {
  token: string;
  loaded: boolean;
  children: React.ReactNode;
  /** 진 토큰이 서버에서 401로 거부된 상태 — 입력 폼으로 돌아갈 탈출구 제공 */
  failed?: boolean;
  onClearToken?: () => void;
}) {
  const [input, setInput] = useState("");

  if (!loaded) return <p className="empty">불러오는 중…</p>;

  if (failed) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto" }}>
        <h1 style={{ fontSize: 18 }}>관리자 토큰이 올바르지 않습니다</h1>
        <p className="summary">
          저장된 토큰이 서버에서 거부되었습니다(401). 지우고 다시 입력해 주세요. 입력한 토큰은
          브라우저 localStorage에만 있었고 서버에는 아무것도 기록되지 않았습니다.
        </p>
        {onClearToken ? (
          <button type="button" className="btn" onClick={onClearToken}>
            토큰 지우고 다시 입력
          </button>
        ) : null}
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto" }}>
        <h1 style={{ fontSize: 18 }}>관리자 접근</h1>
        <p className="summary">
          .env의 <code>ADMIN_TOKEN</code> 값을 입력하세요. 브라우저에만 저장됩니다.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAdminToken(input);
            window.location.reload();
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADMIN_TOKEN"
            aria-label="ADMIN_TOKEN"
            style={{ flex: 1, background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px" }}
          />
          <button type="submit">열기</button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
