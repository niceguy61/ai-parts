import type { Metadata } from "next";
import "./globals.css";
import { BASE_PATH } from "../lib/format";
import DataTimestamp from "../components/DataTimestamp";
import { SavedProvider } from "../components/SavedProvider";

export const metadata: Metadata = {
  title: "ai_insight — AI 부품 랭킹 포털",
  description:
    "MCP 서버·에이전트 스킬을 수집·요약해 스타·급상승·설치수 랭킹과 검색으로 보여주는 한국어 포털",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-type="software" data-radius="sharp">
      <body>
        <SavedProvider>
          <header className="nav site">
            <div className="wrap inner">
              <a href={`${BASE_PATH}/`} className="nav__logo logo">
                ai<em>_</em>insight
              </a>
              <nav className="nav__links" aria-label="주요 메뉴">
                <a href={`${BASE_PATH}/#ranking`}>랭킹</a>
                <a href={`${BASE_PATH}/#criteria`}>기준</a>
                <a href={`${BASE_PATH}/#sources`}>수집</a>
                <a href={`${BASE_PATH}/#faq`}>FAQ</a>
              </nav>
              <div className="nav__actions">
                <a className="btn btn--primary nav__cta" href={`${BASE_PATH}/#ranking`}>
                  랭킹 보기
                </a>
              </div>
            </div>
          </header>

          <main>{children}</main>

          <footer className="site closing">
            <div className="wrap">
              <div className="closing__cta">
                <h2>오늘의 AI 부품 랭킹을 확인하세요</h2>
                <p className="muted">
                  GitHub·skills.sh·ClawHub·MCP Registry·npm에서 모은 AI 부품을 별수·급상승·설치수로 비교합니다.
                </p>
                <a className="btn btn--primary btn--xl" href={`${BASE_PATH}/#ranking`}>
                  랭킹 보기
                </a>
              </div>
              <div className="closing__links">
                <div className="grid">
                  <div className="span-6 closing__mark">
                    <a href={`${BASE_PATH}/`} className="logo">ai<em>_</em>insight</a>
                    <p>AI 부품 장부 — MCP · 스킬 · 플러그인 · 라이브러리</p>
                  </div>
                  <div className="span-3 start-7 closing__col">
                    <h4>둘러보기</h4>
                    <ul>
                      <li><a href={`${BASE_PATH}/#ranking`}>랭킹</a></li>
                      <li><a href={`${BASE_PATH}/#criteria`}>기준</a></li>
                      <li><a href={`${BASE_PATH}/#sources`}>수집</a></li>
                    </ul>
                  </div>
                  <div className="span-3 closing__col">
                    <h4>더 보기</h4>
                    <ul>
                      <li><a href={`${BASE_PATH}/search`}>검색</a></li>
                      <li><a href={`${BASE_PATH}/#saved`}>내 목록</a></li>
                      <li><a href={`${BASE_PATH}/#faq`}>FAQ</a></li>
                    </ul>
                  </div>
                </div>
                <div className="closing__legal">
                  <span>모든 항목은 원문 출처 링크와 함께 제공됩니다 · 출처: GitHub, skills.sh, ClawHub, MCP Registry, npm</span>
                  <DataTimestamp />
                </div>
              </div>
            </div>
          </footer>
        </SavedProvider>
      </body>
    </html>
  );
}
