"use client";

import { formatNumber, KIND_LABEL } from "../../lib/format";
import ShareButton from "../ShareButton";
import { useSaved } from "../SavedProvider";
import { useRankData } from "./RankDataProvider";

/** 내 목록과 공유 — 서버로 보내지 않는 저장과, 링크로 옮기는 공유. */
export default function SavedSplit() {
  const saved = useSaved();
  const rank = useRankData();
  const shared = rank.sharedEntries;

  return (
    <section className="section" id="saved" aria-labelledby="saved-title">
      <div className="wrap grid">
        <div className="span-5">
          <h2 id="saved-title">고른 항목은 내 브라우저에 남습니다</h2>
          <p>
            저장 버튼을 누르면 목록이 이 브라우저에만 남습니다. 서버로 보내지 않으니 계정도 필요 없습니다.
            목록 공유를 누르면 항목들이 담긴 링크가 만들어져, 받은 사람은 그 항목들만 볼 수 있습니다.
          </p>
          <a className="link" href="#ranking">랭킹에서 항목 고르기</a>
        </div>

        <div className="frame savedframe span-6 start-7">
          <div className="savedpanel">
            <div className="savedpanel__head">
              <h3>내 목록</h3>
              <ShareButton />
            </div>
            {saved.list.length === 0 ? (
              <p className="frag__empty">
                아직 저장한 항목이 없습니다. 랭킹 목록의 저장 버튼을 누르면 여기에 모입니다.
              </p>
            ) : (
              <ul className="savedlist">
                {saved.list.slice(0, 4).map((e) => (
                  <li key={e.slug}>
                    <span className={`ktag ${e.k}`}>{KIND_LABEL[e.k] ?? e.k}</span>
                    <span className="savedlist__name">{e.n}</span>
                    <span className="savedlist__num">{formatNumber(e.st)}</span>
                  </li>
                ))}
              </ul>
            )}
            {saved.list.length > 4 ? (
              <p className="savedpanel__note">외 {saved.list.length - 4}개가 더 있습니다.</p>
            ) : null}
          </div>

          <div className="savedpanel savedpanel--shared">
            <div className="savedpanel__head">
              <h3>공유받은 목록</h3>
              {shared.length > 0 ? (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() =>
                    saved.addMany(
                      shared.map((e) => ({ slug: e.slug, n: e.n, k: e.k, st: e.st, sh: e.sh })),
                    )
                  }
                >
                  내 목록에 저장
                </button>
              ) : null}
            </div>
            {rank.sharedStatus === "loading" ? (
              <p className="frag__empty">공유 목록을 불러오는 중…</p>
            ) : shared.length === 0 ? (
              <>
                <p className="frag__empty">
                  공유 링크를 열면 이 자리에 그 목록이 나타납니다. 링크의 주소 끝에
                  <code className="savedcode">?saved=소유자/저장소,소유자/저장소</code> 형태로 항목들이 담깁니다.
                </p>
                <p className="savedpanel__note">
                  받은 사람은 내 목록을 보지 않고 그 항목들만 봅니다. 보고 싶으면 내 목록에 저장할 수 있습니다.
                </p>
              </>
            ) : (
              <ul className="savedlist">
                {shared.slice(0, 4).map((e) => (
                  <li key={e.slug}>
                    <span className={`ktag ${e.k}`}>{KIND_LABEL[e.k] ?? e.k}</span>
                    <span className="savedlist__name">{e.n}</span>
                    <span className="savedlist__num">{e.cat ?? "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="savedframe__foot">
            저장 위치 · 이 브라우저(localStorage) · 서버 전송 없음
          </p>
        </div>
      </div>
    </section>
  );
}
