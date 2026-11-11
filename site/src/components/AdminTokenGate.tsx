"use client";

import { useEffect, useState } from "react";

/** admin_token을 localStorage에서 관리하는 훅 + 게이트 컴포넌트. */
export function useAdminToken(): { token: string; loaded: boolean } {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setToken(localStorage.getItem("admin_token") ?? "");
    setLoaded(true);
  }, []);
  return { token, loaded };
}

export function saveAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
}

/** 토큰이 없으면 입력 폼을, 있으면 children(일반 노드)을 렌더한다. */
export default function AdminTokenGate({
  token,
  loaded,
  children,
}: {
  token: string;
  loaded: boolean;
  children: React.ReactNode;
}) {
  const [input, setInput] = useState("");

  if (!loaded) return <p className="empty">불러오는 중…</p>;

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
