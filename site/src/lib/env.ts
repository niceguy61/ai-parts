import fs from "fs";
import path from "path";

/**
 * web은 저장소 루트의 .env를 자동으로 읽지 않으므로(Next는 web/만 봄)
 * ADMIN_TOKEN 등을 여기서 직접 읽는다. 환경변수가 우선.
 */

export const COLLECTOR_URL = process.env.COLLECTOR_URL ?? "http://127.0.0.1:8111";
export const PAGES_REPO_PATH = process.env.PAGES_REPO_PATH ?? path.join(process.cwd(), "..", "pages");

let cachedToken: string | undefined;

export function adminToken(): string {
  if (cachedToken !== undefined) return cachedToken;
  let token = process.env.ADMIN_TOKEN;
  if (!token) {
    try {
      const envPath = path.join(process.cwd(), "..", ".env");
      const text = fs.readFileSync(envPath, "utf8");
      for (const line of text.split(/\r?\n/)) {
        if (line.trim().startsWith("ADMIN_TOKEN=")) {
          token = line.split("=").slice(1).join("=").trim();
          break;
        }
      }
    } catch {
      // .env 없음
    }
  }
  cachedToken = token;
  // collector(aic.config)의 기본값과 동일하게 유지 — .env가 없어도 게이트가 일관되게 동작
  return cachedToken || "change-me";
}
