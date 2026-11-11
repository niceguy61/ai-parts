/** @type {import('next').NextConfig} */
const isPages = process.env.PAGES_BUILD === "1";

const nextConfig = {
  // GitHub Pages 배포 빌드 — 정적 export (data/*.json은 workflow가 out에 복사)
  ...(isPages
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
