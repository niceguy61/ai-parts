import type { Metadata } from "next";
import "./globals.css";
import { BASE_PATH } from "../lib/format";
import DataTimestamp from "../components/DataTimestamp";

export const metadata: Metadata = {
  title: "ai_insight — AI 부품 랭킹 포털",
  description:
    "MCP 서버·에이전트 스킬을 수집·요약해 스타·급상승·설치수 랭킹과 검색으로 보여주는 한국어 포털",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="site">
          <div className="container inner">
            <a href={`${BASE_PATH}/`} className="logo">
              ai<em>_</em>insight
            </a>
            <span className="tagline">AI 부품 장부 — MCP · 스킬 · 플러그인</span>
            <nav>
              <a href={`${BASE_PATH}/`}>랭킹</a>
              <a href={`${BASE_PATH}/search`}>검색</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site">
          <div className="container">
            모든 항목은 원문 출처 링크와 함께 제공됩니다 · 출처: GitHub, skills.sh, ClawHub, 공식 MCP Registry, npm
            <DataTimestamp />
          </div>
        </footer>
      </body>
    </html>
  );
}
