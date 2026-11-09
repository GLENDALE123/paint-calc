# 도료 배합 계산기 v2

Vite + React + Tailwind CSS 4 + Motion. 서버/DB 없이 기기(localStorage)에만 저장하는 PWA.

## 실행
```bash
npm install
npm run dev      # 개발 서버
npm test         # 계산 로직 테스트
npm run build    # dist/ 생성 (정적 파일)
```

## 배포 (GitHub Pages)
`main` 브랜치에 push하면 GitHub Actions가 테스트 → 빌드 → Pages 배포를 자동으로 합니다
(`.github/workflows/deploy.yml`). 처음 한 번만 저장소 **Settings → Pages → Source**를
**GitHub Actions**로 바꿔 주세요.

주소: `https://<계정>.github.io/<저장소>/`

## 설치 (iPhone / Android)
위 주소를 Safari(안드로이드는 Chrome)로 열고 **공유 → 홈 화면에 추가**.
한 번 열면 오프라인으로도 동작하고, 새 버전은 다음에 열 때 자동 반영됩니다.

## 데이터
배합·통 기록은 각 기기에만 저장되고 서버/저장소로 올라가지 않습니다.
기기를 바꾸거나 동료와 나눌 땐 **배합 탭 → 내보내기/가져오기**(JSON 파일)를 쓰세요.

## 구조
- `src/calc.js` — 배합/보정 계산 (외할 기준, 신나 1:x, 안료 % 기준 주제 또는 주제+신나)
- `src/i18n.js` — ko / en / vi / zh / ru / uk (번역은 현장 검수 필요)
- `src/store.jsx` — 로컬 저장, 배합 내보내기/가져오기(JSON)
- `src/screens/` — 작업(새로 섞기·보정), 배합, 차지율
