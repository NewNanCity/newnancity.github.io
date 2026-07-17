import './Map.css';

const MAP_URL = 'https://map1.newnan.city:10402';

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
