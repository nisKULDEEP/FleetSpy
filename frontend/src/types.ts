export interface Vehicle {
  id: string;
  vehicle_number: string;
  driver_name: string;
  vehicle_type: string;
  phone: string;
  last_location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export interface Geofence {
  id: string;
  name: string;
  description: string;
  category: string;
  coordinates: [number, number][];
}

export interface Alert {
  id: string;
  geofence_id: string;
  vehicle_id?: string;
  event_type: 'enter' | 'exit';
  timestamp: string;
}

export interface Violation {
  id: string;
  vehicle_id: string;
  geofence_id: string;
  timestamp: string;
  details: string;
}

export interface User {
  id: string;
  email: string;
}
