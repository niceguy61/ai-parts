/** 카테고리 택소노미 — collector/aic/enrich/summarizer.py의 CATEGORY_TAXONOMY와 동기 유지 */
export const CATEGORIES = [
  "검색·브라우저",
  "파일·문서",
  "데이터베이스",
  "개발자 도구",
  "이미지·영상",
  "메모리·컨텍스트",
  "에이전트 프레임워크",
  "클라우드·인프라",
  "생산성",
  "기타",
] as const;

export const KINDS = [
  { value: "mcp", label: "MCP" },
  { value: "skill", label: "스킬" },
  { value: "plugin", label: "플러그인" },
  { value: "library", label: "라이브러리" },
] as const;

export const RANK_TABS = [
  { key: "stars", label: "전체 스타", desc: "최근 180일 활성 리포 기준 누적 스타" },
  { key: "trending", label: "스타 급상승", desc: "최근 7일 스타 증가분" },
  { key: "velocity", label: "성장 속도", desc: "7일 전 대비 성장률 — 0→1000, 1000→10000 급등 포착" },
  { key: "new", label: "신규 급상승", desc: "생성 90일 이내, 빠르게 붙는 프로젝트" },
  { key: "recent", label: "최신 등록", desc: "새로 생겨난 리포 — 신생 발굴용" },
  { key: "installs", label: "설치수", desc: "skills.sh · ClawHub · npm 기준" },
] as const;
