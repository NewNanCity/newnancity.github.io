import './Map.css';

const MAP_URL = 'https://dynmap1.newnan.city:30443';

export default function Map() {
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
