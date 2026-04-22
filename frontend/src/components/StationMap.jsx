import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#00E5FF;width:16px;height:16px;border-radius:50%;border:3px solid #0A0A0A;box-shadow:0 0 12px rgba(0,229,255,0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const stationIcon = L.divIcon({
  className: '',
  html: `<div style="background:#00F58D;width:14px;height:14px;border-radius:2px;border:2px solid #0A0A0A;transform:rotate(45deg);box-shadow:0 0 10px rgba(0,245,141,0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const FitBounds = ({ a, b }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([a, b]);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [a, b, map]);
  return null;
};

export const StationMap = ({ station, user }) => {
  const userPos = [user.user_lat, user.user_lng];
  const stnPos = [station.lat, station.lng];
  const center = [
    (user.user_lat + station.lat) / 2,
    (user.user_lng + station.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', minHeight: 220 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={userPos} icon={userIcon}>
        <Popup>Your location</Popup>
      </Marker>
      <Marker position={stnPos} icon={stationIcon}>
        <Popup>
          <strong>{station.name}</strong>
          <br />
          {station.address}
        </Popup>
      </Marker>
      <Polyline
        positions={[userPos, stnPos]}
        pathOptions={{ color: '#00E5FF', weight: 3, dashArray: '6 8', opacity: 0.8 }}
      />
      <FitBounds a={userPos} b={stnPos} />
    </MapContainer>
  );
};
