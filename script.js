const temperatureElement = document.getElementById("temperature");
const windElement = document.getElementById("wind");
const statusElement = document.getElementById("api-status");
const apiMessageElement = document.getElementById("api-message");
const weatherAlertElement = document.getElementById("weather-alert");
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
  "https://api.open-meteo.com/v1/forecast?latitude=18.4861&longitude=-69.9312&current=temperature_2m,wind_speed_10m";

async function loadWeather() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Respuesta no exitosa de la API");
    }

    const data = await response.json();
    const weather = data.current;

    currentWeatherAlert = getWeatherAlert(weather.temperature_2m);

    temperatureElement.textContent = `${weather.temperature_2m} grados C`;
    windElement.textContent = `${weather.wind_speed_10m} km/h`;
    statusElement.textContent = "Conectada";
    weatherAlertElement.textContent = currentWeatherAlert;
    apiMessageElement.textContent = "Datos recibidos correctamente desde Open-Meteo.";
    updateSubscriberCard();
  } catch (error) {
    temperatureElement.textContent = "No disponible";
    windElement.textContent = "No disponible";
    statusElement.textContent = "Error";
    weatherAlertElement.textContent = "Sin alerta";
    currentWeatherAlert = "No se pudo calcular la alerta del clima.";
    apiMessageElement.textContent = "No se pudieron cargar los datos del clima.";
    console.error("Error cargando clima:", error);
  }
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

cancelSubscriptionButton.addEventListener("click", cancelSubscription);

async function loadBrokenPromotions() {
  try {
    const response = await fetch("api/promociones-inexistente.json");
    const data = await response.json();
    console.log("Promociones cargadas:", data);
  } catch (error) {
    console.error("Error intencional: promociones no disponibles.", error);
  }
}

loadWeather();
loadBrokenPromotions();
updateSubscriberCard();
