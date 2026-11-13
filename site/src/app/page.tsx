import Hero from "../components/home/Hero";
import RankApp from "../components/home/RankApp";
import Criteria from "../components/home/Criteria";
import Sources from "../components/home/Sources";
import SavedSplit from "../components/home/SavedSplit";
import Faq from "../components/home/Faq";
import { RankDataProvider } from "../components/home/RankDataProvider";

export default function Home() {
  return (
    <RankDataProvider>
      <Hero />

      <section className="section" id="ranking" aria-labelledby="ranking-title">
        <div className="wrap">
          <div className="grid section-head">
            <h2 className="span-5" id="ranking-title">오늘의 AI 부품 랭킹</h2>
            <div className="span-6 start-7">
              <p>
                기준을 고르면 목록 전체가 그 기준으로 다시 매겨집니다. 목록에서 항목을 열면 한줄 요약과
                7일 추이, 설치수를 바로 볼 수 있고, 저장해 둘 수 있습니다.
              </p>
            </div>
          </div>
          <RankApp />
        </div>
      </section>

      <Criteria />
      <Sources />
      <SavedSplit />
      <Faq />
    </RankDataProvider>
  );
}
