// Weather App JavaScript with API Integration

// API Configuration
const API_KEY = 'da27f890f4f663c44752581c595207f4'; // You'll need to get this from OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfo = document.querySelector('.weather-info');
const searchCitySection = document.querySelector('.search-city');

// Weather info elements
const countryTxt = document.querySelector('.country-txt');
const currentDateTxt = document.querySelector('.current-date-txt');
const weatherImg = document.querySelector('.weather-summary-img');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-text');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windSpeedTxt = document.querySelectorAll('.humidity-value-txt')[1]; // Second element is wind speed

// Weather icon mapping (since we're using SVG files)
const weatherIcons = {
    'clear sky': 'assets/assets/weather/sun.svg',
    'few clouds': 'assets/assets/weather/clouds.svg',
    'scattered clouds': 'assets/assets/weather/clouds.svg',
    'broken clouds': 'assets/assets/weather/clouds.svg',
    'overcast clouds': 'assets/assets/weather/clouds.svg',
    'shower rain': 'assets/assets/weather/rain.svg',
    'rain': 'assets/assets/weather/rain.svg',
    'thunderstorm': 'assets/assets/weather/thunderstorm.svg',
    'snow': 'assets/assets/weather/snow.svg',
    'mist': 'assets/assets/weather/mist.svg'
};

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Main search function
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    // Show loading state
    showLoading();
    
    try {
        // Fetch current weather data
        const weatherData = await fetchWeatherData(city);
        
        // Fetch forecast data
        const forecastData = await fetchForecastData(city);
        
        // Update UI with weather data
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        
        // Show weather info and hide search message
        showWeatherInfo();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('City not found or network error. Please try again.');
    }
}

// Fetch current weather data from API
async function fetchWeatherData(city) {
    const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
}

// Fetch 5-day forecast data from API
async function fetchForecastData(city) {
    const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
}

// Update the main weather UI with current weather data
function updateWeatherUI(data) {
    // Update location
    countryTxt.textContent = `${data.name}, ${data.sys.country}`;
    
    // Update date
    const currentDate = new Date();
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    };
    currentDateTxt.textContent = currentDate.toLocaleDateString('en-US', options);
    
    // Update temperature (rounded to nearest integer)
    tempTxt.textContent = `${Math.round(data.main.temp)}°C`;
    
    // Update weather condition
    const condition = data.weather[0].description;
    conditionTxt.textContent = capitalizeFirstLetter(condition);
    
    // Update weather icon
    const iconKey = condition.toLowerCase();
    const iconPath = weatherIcons[iconKey] || 'assets/assets/weather/clouds.svg';
    weatherImg.src = iconPath;
    weatherImg.alt = condition;
    
    // Update humidity
    humidityTxt.textContent = `${data.main.humidity}%`;
    
    // Update wind speed (converted from m/s and rounded)
    windSpeedTxt.textContent = `${Math.round(data.wind.speed)} m/s`;
}

// Update forecast UI with 5-day forecast data
function updateForecastUI(data) {
    const forecastContainer = document.querySelector('.forecast-items-container');
    
    // Clear existing forecast items
    forecastContainer.innerHTML = '';
    
    // Get daily forecasts (API returns 3-hour intervals, so we need to filter)
    const dailyForecasts = getDailyForecasts(data.list);
    
    // Create forecast items (limit to 4 days)
    dailyForecasts.slice(0, 4).forEach(forecast => {
        const forecastItem = createForecastItem(forecast);
        forecastContainer.appendChild(forecastItem);
    });
}

// Extract daily forecasts from 3-hour interval data
function getDailyForecasts(forecastList) {
    const dailyData = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        // Keep only the first forecast for each day (around noon)
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = item;
        }
    });
    
    return Object.values(dailyData);
}

// Create a forecast item element
function createForecastItem(forecast) {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    
    const date = new Date(forecast.dt * 1000);
    const dateStr = date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
    });
    
    const condition = forecast.weather[0].description.toLowerCase();
    const iconPath = weatherIcons[condition] || 'assets/assets/weather/clouds.svg';
    const temp = Math.round(forecast.main.temp);
    
    forecastItem.innerHTML = `
        <h5 class="forecast-item-date regular-txt">${dateStr}</h5>
        <img src="${iconPath}" class="forecast-item-img" alt="${forecast.weather[0].description}">
        <h5 class="forecast-item-temp">${temp}°C</h5>
    `;
    
    return forecastItem;
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show weather info section and hide search message
function showWeatherInfo() {
    weatherInfo.style.display = 'flex';
    searchCitySection.style.display = 'none';
}

// Show search message and hide weather info
function showSearchMessage() {
    weatherInfo.style.display = 'none';
    searchCitySection.style.display = 'flex';
}

// Show loading state
function showLoading() {
    const searchMessage = searchCitySection.querySelector('h1');
    const searchDescription = searchCitySection.querySelector('h4');
    
    searchMessage.textContent = 'Loading...';
    searchDescription.textContent = 'Fetching weather data for your city';
    
    showSearchMessage();
}

// Show error message
function showError(message) {
    const searchMessage = searchCitySection.querySelector('h1');
    const searchDescription = searchCitySection.querySelector('h4');
    
    searchMessage.textContent = 'Error!';
    searchDescription.textContent = message;
    
    showSearchMessage();
    
    // Reset to original message after 3 seconds
    setTimeout(() => {
        searchMessage.textContent = 'Search city';
        searchDescription.textContent = "Find your city's weather forecast";
    }, 3000);
}

// Initialize app
function initApp() {
    // Show search message by default
    showSearchMessage();
    
    // You can also load weather for user's current location
    // loadCurrentLocationWeather();
}

// Optional: Get user's current location weather
async function loadCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const response = await fetch(url);
                const data = await response.json();
                
                updateWeatherUI(data);
                
                const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();
                
                updateForecastUI(forecastData);
                showWeatherInfo();
                
            } catch (error) {
                console.error('Error fetching location weather:', error);
                showSearchMessage();
            }
        });
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initApp);

