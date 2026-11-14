const ITEMS = [
  {
    q: "무엇을 비교하나요?",
    a: "GitHub, skills.sh, ClawHub, MCP Registry, npm에서 수집한 MCP 서버, 에이전트 스킬, 플러그인, 라이브러리입니다. 각 항목에는 저장소 주소, 한국어 한줄 요약, 설치 명령, 별수와 7일 증가량, 설치수가 함께 붙습니다.",
  },
  {
    q: "데이터는 얼마나 자주 바뀌나요?",
    a: "GitHub와 스냅샷은 6시간, skills.sh와 ClawHub는 12시간, MCP Registry와 npm은 하루 주기로 다시 긁습니다. 별수 차이는 1시간마다 계산하고, 사이트에 게시되는 랭킹 파일은 배포할 때 바뀝니다.",
  },
  {
    q: "별수와 설치수는 어디서 오나요?",
    a: "별수는 GitHub 저장소의 스타 수이고, 설치수는 skills.sh와 ClawHub가 기록한 설치·다운로드 수 중 더 큰 값입니다. 같은 저장소가 여러 소스에 나타나면 하나의 항목으로 합쳐 한 번만 보여줍니다.",
  },
  {
    q: "저장한 목록은 어디에 남나요?",
    a: "브라우저의 localStorage에만 남습니다. 서버로 보내지 않으니 계정이 필요 없고, 브라우저 데이터를 지우면 목록도 함께 사라집니다.",
  },
  {
    q: "목록을 어떻게 공유하나요?",
    a: "목록 공유 버튼을 누르면 저장한 항목들이 담긴 링크가 복사됩니다. 링크를 받은 사람은 내 목록 대신 그 항목들만 보고, 내 목록에 저장할지 고를 수 있습니다.",
  },
];

/** 자주 묻는 질문 — 답은 항상 펼쳐 둔다. */
export default function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="wrap grid">
        <div className="span-5 faq__intro">
          <h2 id="faq-title">자주 묻는 질문</h2>
          <p>
            수집 방식과 저장 방식에 대해 자주 물어보는 내용을 모았습니다. 다른 궁금한 점이 있으면
            원문 저장소의 README에서 더 자세한 설명을 볼 수 있습니다.
          </p>
        </div>
        <div className="faq span-6 start-7">
          {ITEMS.map((item) => (
            <div className="faq__item" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
