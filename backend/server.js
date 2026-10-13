// 로컬 개발용 날씨 백엔드 서버 (Node.js 기본 모듈만 사용, 외부 패키지 없음)
// - /api/weather?city=도시이름 : 현재 날씨를 JSON으로 응답 (실제 로직은 weather.js)
// - 그 외 경로 : frontend 폴더의 정적 파일(HTML/CSS/JS)을 제공

const http = require("http");
const fs = require("fs");
const path = require("path");
const { getWeather } = require("./weather");

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

async function handleWeather(res, searchParams) {
  const { status, body } = await getWeather(searchParams.get("city"));
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
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
    handleWeather(res, searchParams);
  } else {
    serveStatic(res, pathname);
  }
});

server.listen(PORT, () => {
  console.log(`날씨 앱 서버 실행 중: http://localhost:${PORT}`);
});
