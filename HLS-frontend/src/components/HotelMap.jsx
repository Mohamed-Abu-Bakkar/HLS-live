import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

const HotelMap = ({ latitude, longitude, title, price }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [distanceKm, setDistanceKm] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (isNaN(latNum) || isNaN(lngNum)) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([latNum, lngNum], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const hotelMarker = L.marker([latNum, lngNum]).addTo(map);
      hotelMarker
        .bindPopup(
          `<strong>${title || 'Hotel Location'}</strong><br/>$${price || 0} / night<br/><small>${latNum.toFixed(4)}°, ${lngNum.toFixed(4)}°</small>`
        )
        .openPopup();

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([latNum, lngNum], 14);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latNum, lngNum, title, price]);

  const handleCheckUserDistance = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = calculateDistanceKm(userLat, userLng, latNum, lngNum);
        setDistanceKm(dist);
        setLocating(false);

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;

          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          const userIcon = L.divIcon({
            className: 'user-location-pin',
            html: `<div style="background-color:#16a34a;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">You are here</div>`,
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          });

          userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
          userMarkerRef.current.bindPopup('Your Current Location').openPopup();

          const bounds = L.latLngBounds([
            [userLat, userLng],
            [latNum, lngNum],
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(err.message || 'Could not access your location');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="map-container-box" ref={mapContainerRef} />

      <div className="map-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} color="var(--primary)" />
          <span>
            Coordinates: {latNum.toFixed(6)}°, {lngNum.toFixed(6)}°
          </span>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleCheckUserDistance}
          disabled={locating}
        >
          <Navigation size={14} />
          <span>{locating ? 'Locating…' : 'Calculate Distance From My Location'}</span>
        </button>
      </div>

      {distanceKm !== null && (
        <div style={{ marginTop: '0.75rem' }}>
          <span className="geo-distance-badge">
            <Navigation size={14} />
            <span>Approximately {distanceKm} km away from your location</span>
          </span>
        </div>
      )}

      {geoError && (
        <p className="error-text" style={{ marginTop: '0.5rem' }}>
          {geoError}
        </p>
      )}
    </div>
  );
};

export default HotelMap;
