import './Map.css';

export default function Map() {
  return (
    <div className="map-container">
      <iframe
        src="http://map1.newnan.city:10404"
        title="牛腩地图"
        className="map-iframe"
        allowFullScreen
      />
    </div>
  );
}
