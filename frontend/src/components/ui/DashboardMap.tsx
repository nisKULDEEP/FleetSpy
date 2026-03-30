import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const DashboardMap = ({
  units,
  center = [52.52, 13.4],
}: {
  units: any[];
  center?: number[];
}) => {
  return (
    <MapContainer
      center={center as [number, number]}
      zoom={11}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {units.map((unit) =>
        unit.location && unit.location.latitude && unit.location.longitude ? (
          <Marker
            key={unit.id}
            position={[unit.location.latitude, unit.location.longitude]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="text-on-surface">
                <strong>{unit.vehicle_number}</strong>
                <br />
                Status: {unit.status}
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  );
};
export default DashboardMap;
