import { useEffect, useState } from 'react';
import './Map.css';

const MAP_URL = 'https://map1.newnan.city:10402';
const MOBILE_QUERY = '(max-width: 768px)';

export default function Map() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isMobile) {
    return (
      <main id="main-content" className="map-mobile">
        <img
          className="map-mobile-background"
          src="/pic/NSrank_KXChengqu.webp"
          alt="牛腩小镇城区全景"
        />
        <div className="map-mobile-overlay" aria-hidden="true" />
        <div className="map-mobile-content">
          <span className="section-tag pixel-text">WORLD MAP</span>
          <h1>牛腩世界地图</h1>
          <p>主世界、城镇与交通网络</p>
          <a className="mc-btn mc-btn-primary" href={MAP_URL} target="_blank" rel="noopener noreferrer">
            打开实时地图 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="map-container">
      <h1 className="map-title-visually-hidden">牛腩世界实时地图</h1>
      <iframe
        src={MAP_URL}
        title="牛腩世界实时地图"
        className="map-iframe"
        allowFullScreen
      />
    </main>
  );
}
