// Vercel 배포용 서버리스 함수: /api/weather?city=도시이름
// (Vercel은 api 폴더의 파일을 자동으로 API 주소로 만들어 줌. 실제 로직은 backend/weather.js)

const { getWeather } = require("../backend/weather");

module.exports = async (req, res) => {
  const { status, body } = await getWeather(req.query.city);
  res.status(status).json(body);
};
