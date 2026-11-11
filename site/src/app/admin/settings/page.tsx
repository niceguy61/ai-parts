"use client";

import AdminTokenGate, { useAdminToken } from "../../../components/AdminTokenGate";
import LlmSettingsForm from "./LlmSettingsForm";

export default function AdminSettingsPage() {
  const { token, loaded } = useAdminToken();
  return (
    <AdminTokenGate token={token} loaded={loaded}>
      <div>
        <h1 style={{ fontSize: 20, margin: "18px 0 8px" }}>LLM 설정</h1>
        <p className="summary">
          OpenAI 호환 엔드포인트라면 무엇이든 됩니다. 알려진 provider(NVIDIA NIM, OpenRouter)는
          모델 목록을 자동으로 불러와 드롭다운으로 선택할 수 있습니다.
        </p>
        <LlmSettingsForm token={token} />
      </div>
    </AdminTokenGate>
  );
}
