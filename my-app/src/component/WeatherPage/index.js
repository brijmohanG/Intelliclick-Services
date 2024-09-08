import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './index.css';

const WeatherPage = () => {
  const { cityId } = useParams();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [clickedWeather, setClickedWeather] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);

  const API_KEY = 'da03f86bf420488d356f9ed2ea43c1c5'; // OpenWeatherMap API key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBgHN_mg7Irvl-fS4vw5ZAusbg1bmyn2Zc'; 

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const currentWeatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            id: cityId,
            appid: API_KEY,
            units: 'metric'
          }
        });

        const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            id: cityId,
            appid: API_KEY,
            units: 'metric'
          }
        });

        setWeather({
          current: currentWeatherResponse.data,
          forecast: forecastResponse.data
        });
      } catch (error) {
        setError('Failed to fetch weather data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [cityId]);

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedMarker({ lat, lng });

    try {
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat,
          lon: lng,
          appid: API_KEY,
          units: 'metric'
        }
      });
      setClickedWeather(weatherResponse.data);
    } catch (error) {
      setError('Failed to fetch weather data for this location.');
    }
  };

  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          try {
            const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
              params: {
                lat: latitude,
                lon: longitude,
                appid: API_KEY,
                units: 'metric'
              }
            });
            setCurrentLocationWeather(weatherResponse.data);
            setSelectedMarker({ lat: latitude, lng: longitude });
          } catch (error) {
            setError('Failed to fetch weather data for your location.');
          }
        },
        (error) => {
          setError('Geolocation is not supported or permission denied.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  const center = {
    lat: weather?.current?.coord?.lat || 0,
    lng: weather?.current?.coord?.lon || 0
  };

  // Helper function to format date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="weather-page">
      <h1 className="page-title">{weather?.current?.name} Weather</h1>
      <div className="weather-content">
        <div className="current-weather card">
          <h2>Current Weather</h2>
          <p><strong>Temperature:</strong> {weather?.current?.main?.temp}°C</p>
          <p><strong>Description:</strong> {weather?.current?.weather[0]?.description}</p>
          <p><strong>Humidity:</strong> {weather?.current?.main?.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weather?.current?.wind?.speed} m/s</p>
          <p><strong>Pressure:</strong> {weather?.current?.main?.pressure} hPa</p>
        </div>
        <h2>5-Day Forecast</h2>
        <div className="forecast card">
          {weather?.forecast?.list.map((item) => (
            <div key={item.dt} className="forecast-item card">
              <h3>{formatDateTime(item.dt)}</h3>
              <p><strong>High:</strong> {item.main.temp_max}°C</p>
              <p><strong>Low:</strong> {item.main.temp_min}°C</p>
              <p><strong>Description:</strong> {item.weather[0].description}</p>
              <p><strong>Precipitation:</strong> {item.rain ? item.rain['3h'] : '0'} mm</p>
            </div>
          ))}
        </div>
        <div className="map-container">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ height: '400px', width: '100%' }}
              center={center}
              zoom={10}
              onClick={handleMapClick}
            >
              {selectedMarker && (
                <Marker position={selectedMarker} />
              )}
              {clickedWeather && (
                <InfoWindow
                  position={selectedMarker}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div>
                    <h4>{clickedWeather.name}</h4>
                    <p><strong>Temperature:</strong> {clickedWeather.main.temp}°C</p>
                    <p><strong>Description:</strong> {clickedWeather.weather[0].description}</p>
                  </div>
                </InfoWindow>
              )}
              {currentLocation && (
                <Marker position={currentLocation} />
              )}
              {currentLocationWeather && (
                <InfoWindow
                  position={currentLocation}
                  onCloseClick={() => setCurrentLocation(null)}
                >
                  <div>
                    <h4>Your Location</h4>
                    <p><strong>Temperature:</strong> {currentLocationWeather.main.temp}°C</p>
                    <p><strong>Description:</strong> {currentLocationWeather.weather[0].description}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
          <button
                className="current-location-button"
                onClick={handleCurrentLocationClick}
            >
                Use Current Location
            </button>
        </div>
        
            
          
      </div>
    </div>
  );
};

export default WeatherPage;
