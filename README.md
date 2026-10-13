# 날씨 웹앱

도시 이름을 입력하고 "날씨 확인" 버튼을 누르면 현재 날씨를 보여주는 간단한 웹앱입니다.

- 프론트엔드: HTML, CSS, JavaScript (프레임워크 없음)
- 백엔드: Node.js 기본 `http` 모듈 (Express 등 외부 패키지 없음, `npm install` 불필요)
- 날씨 데이터: [Open-Meteo](https://open-meteo.com/) 무료 API (**API Key 필요 없음**)

## 폴더 구조

```
.
├── backend/
│   ├── weather.js    ← 백엔드 핵심: Open-Meteo에서 날씨를 가져오는 로직
│   └── server.js     ← 로컬 실행용 서버: /api/weather + 프론트엔드 파일 제공
├── api/
│   └── weather.js    ← Vercel 배포용 함수 (backend/weather.js 를 그대로 사용)
├── frontend/
│   ├── index.html    ← 화면 구조
│   ├── style.css     ← 디자인
│   └── app.js        ← 버튼 클릭 시 백엔드에 요청하고 결과 표시
├── vercel.json       ← Vercel 설정 (frontend 폴더를 웹사이트로 사용)
└── README.md
```

## 동작 흐름

1. 브라우저(app.js)가 `/api/weather?city=서울` 로 백엔드에 요청
2. 백엔드(server.js)가 Open-Meteo Geocoding API로 도시의 위도·경도를 찾음
3. 백엔드가 Open-Meteo Forecast API로 해당 위치의 현재 날씨를 가져옴
4. 백엔드가 필요한 정보만 JSON으로 정리해 브라우저에 응답
5. 브라우저가 온도, 날씨 상태, 체감 온도, 습도, 풍속을 화면에 표시

## 실행 방법

1. **Node.js 설치 확인** (18 이상 필요)
   터미널에서 다음을 입력해 버전이 나오는지 확인합니다. 없다면 https://nodejs.org 에서 LTS 버전을 설치하세요.
   ```bash
   node -v
   ```

2. **프로젝트 폴더로 이동**
   ```bash
   cd "프로젝트 폴더 경로"
   ```

3. **백엔드 서버 실행**
   ```bash
   node backend/server.js
   ```
   `날씨 앱 서버 실행 중: http://localhost:3000` 메시지가 나오면 성공입니다.

4. **브라우저에서 접속**
   주소창에 http://localhost:3000 을 입력합니다.

5. **날씨 확인**
   도시 이름(예: `서울`, `부산`, `Tokyo`, `London`)을 입력하고 "날씨 확인" 버튼을 누릅니다.

6. **서버 종료**
   터미널에서 `Ctrl + C` 를 누릅니다.

> 참고: `frontend/index.html` 파일을 더블클릭해서 직접 열면 백엔드와 연결되지 않습니다. 반드시 서버를 실행한 뒤 http://localhost:3000 으로 접속하세요.

## Vercel에 배포하기

Vercel은 계속 켜져 있는 서버(`backend/server.js`)를 실행하지 않습니다. 대신 다음과 같이 동작합니다.

- `vercel.json` 설정에 따라 `frontend` 폴더가 웹사이트로 제공됩니다.
- `api/weather.js` 파일이 자동으로 `/api/weather` 주소의 서버리스 함수가 됩니다.

배포 순서:

1. https://vercel.com 에서 GitHub 계정으로 로그인합니다.
2. **Add New → Project** 에서 이 GitHub 저장소를 선택하고 **Import** 합니다.
3. 설정은 기본값 그대로 두고(Framework Preset: Other) **Deploy** 를 누릅니다.
4. 이후 GitHub에 푸시할 때마다 Vercel이 자동으로 다시 배포합니다.

## API 직접 확인해 보기

서버 실행 중에 브라우저 주소창에 아래 주소를 입력하면 백엔드가 돌려주는 JSON을 볼 수 있습니다.

```
http://localhost:3000/api/weather?city=Seoul
```

## 참고 사항

- Open-Meteo 도시 검색은 일부 한글 이름(예: "서울")을 잘 찾지 못해서, `server.js`의 `CITY_ALIASES`에 주요 도시의 한글 → 영어 이름을 등록해 두었습니다. 다른 도시는 영어로 입력하거나 이 목록에 추가하면 됩니다.
- 3000번 포트가 이미 사용 중이라면 `server.js`의 `PORT` 값을 바꾸세요.
