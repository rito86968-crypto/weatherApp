import { useEffect, useState } from 'react'
import './App.css'
import TopContent from './TopContent';

interface Forecast {
  city: {
    name: string;
  };
  list: {
    dt_txt: string;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    wind: {
      speed: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  }[];
}

interface Weather {
  timezone: number;
  name: string;
  main: {
    feels_like: number;
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
}

interface CityWeather {
  name: string;
  country: string;
  temp: number;
  weather: string;
}


function App() {
  const API_KEY = "25a9141cb0ad3db660b2bb9e5102246a"
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [city, setCity] = useState<string>("Barcelona")
  const [search, setSearch] = useState("Barcelona");
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const now = new Date();
  const hour = now.getHours();
  const [cities, setCities] = useState<CityWeather[]>([]);


  const cityTime = new Date(Date.now() + weather?.timezone! * 1000 - 7200000)
  // ? new Date(Date.now() + weather.timezone - new Date().getTimezoneOffset() * 60000)
  // : null;

  const getWeatherImage = (main: string) => {
    switch (main) {
      case "Clear":
        return "/sun.png";
      case "Clouds":
        return "/singleCloud.png";
      case "Rain":
        return "/rain.png";
      case "Snow":
        return "/snow.png";
      case "Thunderstorm":
        return "/thunderstorm.png";
      case "Drizzle":
        return "/drizzle.png"
      case "Mist":
        return "/mist.png"
      default:
        return "/default.png";
    }
  };

  const grouped = forecast?.list.reduce((acc, item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(item);

    return acc;
  }, {} as Record<string, Forecast["list"]>);

  const dailyForecast = Object.values(grouped ?? {}).map(day => ({
    min: Math.min(...day.map(item => item.main.temp_min)),
    max: Math.max(...day.map(item => item.main.temp_max)),
    weather: day[0].weather[0],
    date: day[0].dt_txt,
  }));


  const minWeek = Math.min(...dailyForecast.map(day => day.min));

  const maxWeek = Math.max(...dailyForecast.map(day => day.max));

  const range = Math.max(maxWeek - minWeek, 1);


  const formattedTime = cityTime?.toLocaleTimeString(["en-US"], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.cod !== 200) {
          console.error(data.message);
          return;
        }

        setWeather(data);
      });
  }, [city, unit]);


  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
    )
      .then((response) => response.json())
      .then((data) => {

        if (data.cod !== '200') {
          console.error(data.message);
          return;
        }
        console.log("fetch forecast response", data);
        setForecast(data);
      });
  }, [city, unit]);

  useEffect(() => {
    console.log("forecast", forecast)
  }, [forecast])

  useEffect(() => {
    const cityNames = ["New York", "Copenhagen", "Ho Chi Minh City"];

    Promise.all(
      cityNames.map(city =>
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
        ).then(res => res.json())
      )
    ).then(data => {
      const formatted = data.map(city => ({
        name: city.name,
        country: city.sys.country,
        temp: city.main.temp,
        weather: city.weather[0].main,
      }));

      setCities(formatted);
    });
  }, [unit]);

  return (
    <>
      <main>
        <div className="container">
          <TopContent unit={unit} setUnit={setUnit} city={city} setCity={setCity} search={search}
            setSearch={setSearch} />
          <section className='midTopContent'>
            <div className="actualWeather">
              <div className='topActualWeather'>
                <p>{Math.round(weather?.main?.temp ?? 0)}º</p>
                <div>
                  <h1>{weather?.name}</h1>
                  <h2>{formattedTime}</h2>
                </div>
              </div>
              <div className='midActualWeather'>
                <div>
                  <img className='weatherIcon' src={getWeatherImage(weather?.weather[0].main ?? "")}
                    alt="Weather"></img>
                  <p>{weather?.weather[0].main}</p>
                </div>
                <div>
                  <img className='windIcon0120' src="wind.png" alt=""></img>
                  <h2>{weather?.wind.speed} {unit === 'metric' ? "mph" : "m/s"}</h2>
                </div>
              </div>
              <div className='bottomActualWeather'>
                <p>Feel like: {Math.round(weather?.main?.feels_like ?? 0)}º {unit === 'metric' ? "F" : "C"}</p>
                <p>{Math.round(weather?.main.temp_min ?? 0)}º to {Math.round(weather?.main.temp_max ?? 0)}º</p>
              </div>
            </div>
            <ul className="hourlyWeather">
              {forecast?.list.slice(0, 8).map((item, index) => (
                <li key={index}>
                  <p>{item.dt_txt.split(" ")[1].slice(0, -3)}</p>
                  <hr className="line" />
                  <img
                    src={getWeatherImage(item.weather[0].main)}
                    alt={item.weather[0].main}
                  />
                  <h3>{item.weather[0].main}</h3>
                  <h1>{Math.round(item.main.temp)}º</h1>
                </li>
              ))}
            </ul>
          </section>
          <section className='midBottomContent'>
            <div className='largeCities'>
              <p>Other large cities</p>
              {cities.map((city, index) => (
                <div key={index} className="customCities">
                  <div className="cC1">
                    <h2>{city.country}</h2>
                    <h1>{city.name}</h1>
                    <p>{city.weather}</p>
                  </div>

                  <div className="cC2">
                    <img src={getWeatherImage(city.weather)}
                      alt={city.weather} />
                    <h1>{Math.round(city.temp)}º</h1>
                  </div>
                </div>
              ))}
            </div>
            <div className='semanalForecast'>
              <p>5-day forecast</p>
              {dailyForecast?.slice(0, 5).map((day, index) => {

                const left = ((day.min - minWeek) / range) * 100;
                const width = ((day.max - day.min) / range) * 100;

                const dayName = new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                });

                console.log({
                  min: day.min,
                  max: day.max,
                  left,
                  width,
                });

                return (
                  <ul key={index} className="dayForecast">
                    <li>
                      <p>{index === 0 ? "Today" : dayName}</p>
                      <div className='fullLine'>
                        <div className='midLine'>
                          <img src={getWeatherImage(day.weather.main)}
                            alt={day.weather.main} />
                          <h3>{day.weather.main}</h3>
                        </div>
                        <div className='endLine'>
                          <span>{Math.round(day.min)}º</span>
                          <div className='lineTemp'>
                            <div className='lineTempBar'
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}></div>
                          </div>
                          <span>{Math.round(day.max)}º</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                );
              })}
            </div>
          </section>
        </div >
      </main >
    </>
  )
}

export default App
