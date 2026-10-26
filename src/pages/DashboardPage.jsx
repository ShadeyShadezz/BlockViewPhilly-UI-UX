import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import { featuredResources, resourcePath } from '../data/resourceCatalog';


const weatherCodeMap = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

export default function DashboardPage(){
  const [now,setNow]=useState(new Date());
  const [weather,setWeather]=useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9526&longitude=-75.1652&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FNew_York&temperature_unit=fahrenheit&wind_speed_unit=mph')
      .then((response) => {
        if (!response.ok) throw new Error('Weather unavailable');
        return response.json();
      })
      .then((data) => {
        if (!ignore && data?.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            wind: Math.round(data.current.wind_speed_10m),
          });
        }
      })
      .catch(() => {
        if (!ignore) setWeather(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(now);

  const condition = weather ? weatherCodeMap[weather.code] ?? 'Conditions' : 'Conditions unavailable';

  return (
    <div className="page-stack">
      <section className={styles.overview} aria-label="Dashboard overview">
        <div className={styles.introduction}>
          <header className={styles.titleBar}>
            <h1>Dashboard</h1>
            <span>Philadelphia explorer</span>
          </header>
          <section className={styles.mission} aria-labelledby="dashboard-mission-heading">
            <span className={styles.label}>OUR MISSION</span>
            <h2 id="dashboard-mission-heading">Public information.<br />Open to everyone.</h2>
            <p>Make Philadelphia public information easier to explore. Connect places, Census context, and transparent sources to better understand the city around you.</p>
            <Link className={styles.missionLink} to="/resources">Explore our resources <span aria-hidden="true">&rarr;</span></Link>
          </section>
        </div>
        <div className={styles.utilities}>
          <section className={styles.livePanel} aria-label="Philadelphia time and weather">
            <div className={styles.liveHeading}><span className={styles.label}>PHILADELPHIA / LIVE</span><span className={styles.timeZone}>Eastern time</span></div>
            <dl className={styles.clock}>
              <div><dt>Time</dt><dd className={styles.time}>{timeLabel}</dd></div>
              <div><dt>Date</dt><dd className={styles.date}>{dateLabel}</dd></div>
            </dl>
            <dl className={styles.weather} aria-live="polite">
              <div><dt>Weather</dt><dd>{weather ? `${weather.temp}\u00b0F` : 'Unavailable'}</dd></div>
              <div><dt>Conditions</dt><dd>{condition}</dd></div>
              <div><dt>Wind</dt><dd>{weather ? `${weather.wind} mph` : '--'}</dd></div>
            </dl>
          </section>
          <nav className={styles.shortcuts} aria-label="Explore Philadelphia maps">
            <Link className={styles.shortcut} to="/map-overview"><span><strong>2D Map</strong><span>Explore places and Census context</span></span><span aria-hidden="true">&rarr;</span></Link>
            <Link className={styles.shortcut} to="/map"><span><strong>3D Map</strong><span>Explore Philadelphia in three dimensions</span></span><span aria-hidden="true">&rarr;</span></Link>
          </nav>
        </div>
      </section>

      <section aria-labelledby="dashboard-resources-heading">
        <div className="panel-header">
          <div><span className="eyebrow">BEHIND THE EXPLORER</span><h2 id="dashboard-resources-heading">Resources used in BlockView</h2></div>
          <Link className="text-link" to="/resources">View all resources &gt;</Link>
        </div>
        <div className="tutorial-card-grid dashboard-resource-cards">
          {featuredResources.map((resource, index) => (
            <Link className="tutorial-card" key={resource.id} to={resourcePath(resource.id)}>
              <span className="card-number">0{index + 1} &gt;</span>
              <h3>{resource.name}</h3>
              <p>{resource.description}</p>
              <span className="resource-card-action">View dataset &amp; source &gt;</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
