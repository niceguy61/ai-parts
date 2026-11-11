"use client";

import { useEffect, useState } from "react";

const PRESETS: Record<string, string> = {
  nvidia: "https://integrate.api.nvidia.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

interface SavedLlm {
  base_url?: string;
  api_key?: string;
  model?: string;
}

export default function LlmSettingsForm({ token }: { token: string }) {
  const [provider, setProvider] = useState<string>("nvidia");
  const [baseUrl, setBaseUrl] = useState(PRESETS.nvidia);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/config?key=llm", {
          headers: { "X-Admin-Token": token },
        });
        if (!res.ok) return;
        const body = await res.json();
        const cfg: SavedLlm = body.value ?? {};
        if (cfg.base_url) setBaseUrl(cfg.base_url);
        if (cfg.api_key) setApiKey(cfg.api_key);
        if (cfg.model) setModel(cfg.model);
        const detected = Object.entries(PRESETS).find(([, u]) => u === cfg.base_url);
        setProvider(detected ? detected[0] : cfg.base_url ? "custom" : "nvidia");
      } catch {
        // 기본값으로 진행
      }
    })();
  }, [token]);

  async function loadModels() {
    setLoadingModels(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ base_url: baseUrl, api_key: apiKey });
      const res = await fetch(`/api/admin/models?${params}`, {
        headers: { "X-Admin-Token": token },
      });
      const body = await res.json();
      const list: string[] = body.models ?? [];
      setModels(list);
      if (list.length === 0) {
        setMessage("모델 목록을 가져오지 못했습니다 — 모델명을 직접 입력하세요.");
      } else if (!list.includes(model)) {
        setModel(list[0]);
      }
    } catch {
      setModels([]);
      setMessage("모델 목록 조회 실패 — 모델명을 직접 입력하세요.");
    } finally {
      setLoadingModels(false);
    }
  }

  async function save() {
    if (!model.trim()) {
      setMessage("모델을 선택하거나 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({
          key: "llm",
          value: { base_url: baseUrl, api_key: apiKey, model: model.trim() },
        }),
      });
      if (res.ok) {
        setMessage("✅ 저장되었습니다. 다음 요약 작업부터 적용됩니다.");
      } else {
        const body = await res.json().catch(() => ({}));
        setMessage(`❌ 저장 실패: ${body.error ?? `HTTP ${res.status}`}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#8b949e" }}>Provider</span>
        <select
          value={provider}
          onChange={(e) => {
            const p = e.target.value;
            setProvider(p);
            if (PRESETS[p]) setBaseUrl(PRESETS[p]);
          }}
          style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px" }}
        >
          <option value="nvidia">NVIDIA NIM</option>
          <option value="openrouter">OpenRouter</option>
          <option value="custom">직접 입력</option>
        </select>
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#8b949e" }}>엔드포인트 (base_url)</span>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://integrate.api.nvidia.com/v1"
          disabled={provider !== "custom"}
          style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px", opacity: provider !== "custom" ? 0.7 : 1 }}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#8b949e" }}>API 키</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="nvapi-… / sk-or-…"
          style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px" }}
        />
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={loadModels} disabled={loadingModels}>
          {loadingModels ? "불러오는 중…" : "모델 목록 불러오기"}
        </button>
        {models.length > 0 ? <span style={{ fontSize: 12, color: "#8b949e" }}>{models.length}개 모델</span> : null}
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#8b949e" }}>모델</span>
        {models.length > 0 ? (
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px" }}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="예: meta/llama-3.3-70b-instruct"
            style={{ background: "#161b22", border: "1px solid #21262d", color: "#e6edf3", borderRadius: 8, padding: "8px 12px" }}
          />
        )}
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={save} disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </button>
        {message ? <span style={{ fontSize: 13, color: "#8b949e" }}>{message}</span> : null}
      </div>
    </div>
  );
}
