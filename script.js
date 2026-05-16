const temperatureElement = document.getElementById("temperature");
const windElement = document.getElementById("wind");
const statusElement = document.getElementById("api-status");
const apiMessageElement = document.getElementById("api-message");
const weatherAlertElement = document.getElementById("weather-alert");
const cloudCoverElement = document.getElementById("cloud-cover");
const conditionElement = document.getElementById("condition");
const tomorrowRainElement = document.getElementById("tomorrow-rain");
const tomorrowTempElement = document.getElementById("tomorrow-temp");
const recommendationElement = document.getElementById("recommendation");
const dailySummaryElement = document.getElementById("daily-summary");
const alertForm = document.getElementById("alert-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const formMessageElement = document.getElementById("form-message");
const subscriberCard = document.getElementById("subscriber-card");
const subscriberNameElement = document.getElementById("subscriber-name");
const subscriberAlertElement = document.getElementById("subscriber-alert");
const cancelSubscriptionButton = document.getElementById("cancel-subscription-btn");

let currentWeatherAlert = "Esperando datos del clima.";

const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=18.4861&longitude=-69.9312&current=temperature_2m,wind_speed_10m,cloud_cover,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSanto_Domingo";

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

async function loadWeather() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Respuesta no exitosa de la API");
    }

    const data = await response.json();
    const weather = data.current;
    const tomorrow = getTomorrowForecast(data.daily);

    currentWeatherAlert = getWeatherAlert(weather.temperature_2m);

    setText(temperatureElement, `${weather.temperature_2m} grados C`);
    setText(windElement, `${weather.wind_speed_10m} km/h`);
    setText(cloudCoverElement, `${weather.cloud_cover}%`);
    setText(conditionElement, getWeatherCondition(weather.weather_code));
    setText(statusElement, "Conectada");
    setText(weatherAlertElement, currentWeatherAlert);
    setText(apiMessageElement, "Datos recibidos correctamente desde Open-Meteo.");

    if (tomorrow) {
      const rain = tomorrow.precipitationProbability;
      const maxTemp = tomorrow.maxTemperature;
      const minTemp = tomorrow.minTemperature;
      const condition = getWeatherCondition(tomorrow.weatherCode);

      setText(tomorrowRainElement, `${rain}%`);
      setText(tomorrowTempElement, `${minTemp} - ${maxTemp} grados C`);
      setText(recommendationElement, getRecommendation(rain, maxTemp));
      setText(
        dailySummaryElement,
        `Para manana se espera: ${condition.toLowerCase()}.`
      );
    }

    updateSubscriberCard();
  } catch (error) {
    setText(temperatureElement, "No disponible");
    setText(windElement, "No disponible");
    setText(cloudCoverElement, "No disponible");
    setText(conditionElement, "No disponible");
    setText(tomorrowRainElement, "No disponible");
    setText(tomorrowTempElement, "No disponible");
    setText(recommendationElement, "Revisar conexion");
    setText(dailySummaryElement, "No se pudo consultar el pronostico.");
    setText(statusElement, "Error");
    setText(weatherAlertElement, "Sin alerta");
    currentWeatherAlert = "No se pudo calcular la alerta del clima.";
    setText(apiMessageElement, "No se pudieron cargar los datos del clima.");
    console.error("Error cargando clima:", error);
  }
}

function getTomorrowForecast(daily) {
  if (!daily || !daily.time || daily.time.length < 2) {
    return null;
  }

  return {
    precipitationProbability: daily.precipitation_probability_max[1],
    maxTemperature: daily.temperature_2m_max[1],
    minTemperature: daily.temperature_2m_min[1],
    weatherCode: daily.weather_code[1]
  };
}

function getWeatherCondition(code) {
  const conditions = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna fuerte",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia fuerte",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos fuertes",
    95: "Tormenta"
  };

  return conditions[code] || "Condicion variable";
}

function getRecommendation(rainProbability, maxTemperature) {
  if (rainProbability >= 60) {
    return "Lleva sombrilla";
  }

  if (maxTemperature >= 32) {
    return "Evita mucho sol";
  }

  if (maxTemperature <= 21) {
    return "Lleva abrigo ligero";
  }

  return "Clima manejable";
}

function getWeatherAlert(temperature) {
  if (temperature >= 32) {
    return "Muy caluroso";
  }

  if (temperature >= 28) {
    return "Caluroso";
  }

  if (temperature >= 22) {
    return "Normal";
  }

  if (temperature >= 18) {
    return "Algo frio";
  }

  return "Frio";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveSubscription(name, email) {
  const subscription = {
    name,
    email,
    alert: currentWeatherAlert,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("weatherSubscription", JSON.stringify(subscription));
  return subscription;
}

function getSubscription() {
  const saved = localStorage.getItem("weatherSubscription");

  if (!saved) {
    return null;
  }

  return JSON.parse(saved);
}

function updateSubscriberCard() {
  if (!subscriberCard || !subscriberNameElement || !subscriberAlertElement) {
    return;
  }

  const subscription = getSubscription();

  if (!subscription) {
    subscriberCard.hidden = true;
    subscriberNameElement.textContent = "";
    subscriberAlertElement.textContent = "";
    return;
  }

  subscriberCard.hidden = false;
  subscriberNameElement.textContent = `${subscription.name} (${subscription.email})`;
  subscriberAlertElement.textContent =
    `Recibiras notificaciones cuando el clima este: ${currentWeatherAlert}.`;
}

function cancelSubscription() {
  localStorage.removeItem("weatherSubscription");
  updateSubscriberCard();
  formMessageElement.classList.remove("success", "error");
  formMessageElement.textContent = "Tu suscripcion fue cancelada correctamente.";
}

if (alertForm) {
  alertForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    formMessageElement.classList.remove("success", "error");

    if (name.length < 2) {
      formMessageElement.textContent = "Escribe un nombre valido.";
      formMessageElement.classList.add("error");
      return;
    }

    if (!isValidEmail(email)) {
      formMessageElement.textContent = "Escribe un correo electronico valido.";
      formMessageElement.classList.add("error");
      return;
    }

    const subscription = saveSubscription(name, email);

    formMessageElement.textContent =
      `Listo, ${subscription.name}. Tu suscripcion fue guardada correctamente.`;
    formMessageElement.classList.add("success");
    updateSubscriberCard();
    alertForm.reset();
  });
}

if (cancelSubscriptionButton) {
  cancelSubscriptionButton.addEventListener("click", cancelSubscription);
}

loadWeather();
updateSubscriberCard();
