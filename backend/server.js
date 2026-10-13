// 아주 간단한 날씨 백엔드 서버 (Node.js 기본 모듈만 사용, 외부 패키지 없음)
// - /api/weather?city=도시이름 : Open-Meteo API에서 현재 날씨를 가져와 JSON으로 응답
// - 그 외 경로 : frontend 폴더의 정적 파일(HTML/CSS/JS)을 제공

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

// Open-Meteo 날씨 코드 → 한국어 설명 + 아이콘
const WEATHER_CODES = {
  0: ["맑음", "☀️"],
  1: ["대체로 맑음", "🌤️"],
  2: ["부분적으로 흐림", "⛅"],
  3: ["흐림", "☁️"],
  45: ["안개", "🌫️"],
  48: ["짙은 안개", "🌫️"],
  51: ["약한 이슬비", "🌦️"],
  53: ["이슬비", "🌦️"],
  55: ["강한 이슬비", "🌧️"],
  56: ["어는 이슬비", "🌧️"],
  57: ["강한 어는 이슬비", "🌧️"],
  61: ["약한 비", "🌦️"],
  63: ["비", "🌧️"],
  65: ["강한 비", "🌧️"],
  66: ["어는 비", "🌧️"],
  67: ["강한 어는 비", "🌧️"],
  71: ["약한 눈", "🌨️"],
  73: ["눈", "🌨️"],
  75: ["강한 눈", "❄️"],
  77: ["싸락눈", "🌨️"],
  80: ["약한 소나기", "🌦️"],
  81: ["소나기", "🌧️"],
  82: ["강한 소나기", "⛈️"],
  85: ["약한 눈 소나기", "🌨️"],
  86: ["강한 눈 소나기", "❄️"],
  95: ["뇌우", "⛈️"],
  96: ["우박을 동반한 뇌우", "⛈️"],
  99: ["강한 우박을 동반한 뇌우", "⛈️"],
};

// Open-Meteo 도시 검색은 한글 이름을 잘 못 찾는 경우가 있어, 자주 쓰는 도시는 영어 이름으로 바꿔 검색
const CITY_ALIASES = {
  서울: "Seoul",
  부산: "Busan",
  인천: "Incheon",
  대구: "Daegu",
  대전: "Daejeon",
  광주: "Gwangju",
  울산: "Ulsan",
  세종: "Sejong",
  수원: "Suwon",
  제주: "Jeju City",
  도쿄: "Tokyo",
  오사카: "Osaka",
  베이징: "Beijing",
  상하이: "Shanghai",
  뉴욕: "New York",
  런던: "London",
  파리: "Paris",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// 1단계: 도시 이름 → 위도/경도 (Open-Meteo Geocoding API)
async function findCity(city) {
  const name = CITY_ALIASES[city] || city;
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=10&language=ko&name=" +
    encodeURIComponent(name);
  const response = await fetch(url);
  if (!response.ok) throw new Error("도시 검색 API 오류");
  const data = await response.json();
  if (!data.results) return null;
  // 같은 이름의 작은 마을보다 큰 도시가 먼저 선택되도록 인구가 가장 많은 곳을 고름
  return data.results.reduce((best, place) =>
    (place.population || 0) > (best.population || 0) ? place : best
  );
}

// 2단계: 위도/경도 → 현재 날씨 (Open-Meteo Forecast API)
async function getCurrentWeather(latitude, longitude) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) throw new Error("날씨 API 오류");
  const data = await response.json();
  return data.current;
}

async function handleWeather(req, res, searchParams) {
  const city = (searchParams.get("city") || "").trim();
  if (!city) {
    return sendJson(res, 400, { error: "도시 이름을 입력해 주세요." });
  }

  try {
    const place = await findCity(city);
    if (!place) {
      return sendJson(res, 404, { error: `'${city}' 도시를 찾을 수 없습니다.` });
    }

    const current = await getCurrentWeather(place.latitude, place.longitude);
    const [description, icon] = WEATHER_CODES[current.weather_code] || ["알 수 없음", "🌡️"];

    sendJson(res, 200, {
      city: place.name,
      country: place.country || "",
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      description,
      icon,
      time: current.time,
    });
  } catch (err) {
    console.error(err);
    sendJson(res, 502, { error: "날씨 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." });
  }
}

function serveStatic(res, pathname) {
  const fileName = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.join(FRONTEND_DIR, fileName);

  // frontend 폴더 밖의 파일은 읽지 못하도록 막기
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("파일을 찾을 수 없습니다.");
    }
    const type = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === "/api/weather") {
    handleWeather(req, res, searchParams);
  } else {
    serveStatic(res, pathname);
  }
});

server.listen(PORT, () => {
  console.log(`날씨 앱 서버 실행 중: http://localhost:${PORT}`);
});
