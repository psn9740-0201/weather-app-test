// 프론트엔드: 사용자가 입력한 도시 이름을 백엔드(/api/weather)로 보내고 결과를 화면에 표시

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const button = form.querySelector("button");
const message = document.getElementById("message");
const result = document.getElementById("result");

function showMessage(text, isLoading = false) {
  message.textContent = text;
  message.classList.toggle("loading", isLoading);
}

function showWeather(data) {
  document.getElementById("icon").textContent = data.icon;
  document.getElementById("city-name").textContent =
    data.country ? `${data.city}, ${data.country}` : data.city;
  document.getElementById("temperature").textContent = `${Math.round(data.temperature)}°C`;
  document.getElementById("description").textContent = data.description;
  document.getElementById("feels-like").textContent = `${Math.round(data.feelsLike)}°C`;
  document.getElementById("humidity").textContent = `${data.humidity}%`;
  document.getElementById("wind").textContent = `${data.windSpeed} km/h`;
  document.getElementById("time").textContent = `현지 기준 ${data.time.replace("T", " ")}`;
  result.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // 페이지 새로고침 막기

  const city = cityInput.value.trim();
  if (!city) {
    showMessage("도시 이름을 입력해 주세요.");
    return;
  }

  result.classList.add("hidden");
  showMessage("날씨를 불러오는 중...", true);
  button.disabled = true;

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "오류가 발생했습니다.");
      return;
    }

    showMessage("");
    showWeather(data);
  } catch (err) {
    showMessage("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해 주세요.");
  } finally {
    button.disabled = false;
  }
});
