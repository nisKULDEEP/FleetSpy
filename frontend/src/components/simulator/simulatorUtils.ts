import L from 'leaflet';

export const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const presetRoute: [number, number][] = [
  [52.52, 13.4],
  [52.5205, 13.401],
  [52.521, 13.402],
  [52.5215, 13.403],
  [52.522, 13.404],
  [52.5225, 13.405],
  [52.523, 13.406],
  [52.5235, 13.407],
  [52.524, 13.4075],
  [52.5245, 13.408],
];

export interface Vehicle {
  id: string;
  vehicle_number: string;
}

export interface Geofence {
  id: string;
  name: string;
}

export interface Alert {
  eventType: string;
  vehicleId: string;
  vehicle: { vehicleNumber: string };
  geofenceId: string;
  geofence: { geofenceName: string };
  timestamp: string;
}
