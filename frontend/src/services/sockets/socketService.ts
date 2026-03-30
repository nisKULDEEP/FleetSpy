import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL;

let alertSocket: Socket | null = null;
const vehicleSockets: Record<string, Socket> = {};

export const socketService = {
  connect: () => {
    if (alertSocket) return;

    const token = localStorage.getItem('fleetspy_token');
    if (!token) return;

    alertSocket = io(`${API_BASE_URL}/ws/alerts`, {
      auth: { token },
    });

    alertSocket.on('connect', () => {
      console.log('Connected to FleetSpy WebSocket Server');
    });

    alertSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket Server');
    });

    alertSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });
  },

  disconnect: () => {
    if (alertSocket) {
      alertSocket.disconnect();
      alertSocket = null;
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    if (!alertSocket) socketService.connect();
    alertSocket?.on(event, callback);
  },

  off: (event: string, callback?: (data: any) => void) => {
    alertSocket?.off(event, callback);
  },

  emit: (event: string, data: any) => {
    if (!alertSocket) socketService.connect();
    alertSocket?.emit(event, data);
  },

  connectVehicle: (vehicleId: string): Socket => {
    if (!vehicleSockets[vehicleId]) {
      const token = localStorage.getItem('fleetspy_token');
      vehicleSockets[vehicleId] = io(`${API_BASE_URL}/ws/vehicles`, {
        auth: {
          vehicle_id: vehicleId,
          token: token,
        },
      });
    }
    return vehicleSockets[vehicleId];
  },

  disconnectVehicle: (vehicleId: string) => {
    if (vehicleSockets[vehicleId]) {
      vehicleSockets[vehicleId].disconnect();
      delete vehicleSockets[vehicleId];
    }
  },
};
