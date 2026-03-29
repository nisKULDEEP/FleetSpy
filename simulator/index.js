import io from 'socket.io-client';
import axios from 'axios';
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJlbWFpbCI6Imt1bGRlZXBuaXNoYWQuc2luZ2hAZ21haWwuY29tIn0sImlhdCI6MTc3NDc3ODU0MywiZXhwIjoxNzc0ODY0OTQzfQ.jR0zFXzxPNMbhlxcVm0eByUjVSm6mh8X7hjAV8WiXEQ';
const backendUrl = 'http://localhost:3001';
console.log('=== 1. Starting Frontend Dashboard WebSocket Client ===');
const socket = io(`${backendUrl}/ws/alerts`, {
    auth: {
        token: jwtToken
    }
});
socket.on('connect', () => {
    console.log(`[Dashboard] Connected to WebSocket Server! Socket ID: ${socket.id}`);
});
socket.on('disconnect', () => {
    console.log('[Dashboard] Disconnected from WebSocket Server.');
});
socket.on('connect_error', (error) => {
    console.log(`[Dashboard] Connection Error: ${error.message}`);
});
socket.on('geofence_event', (eventData) => {
    console.log('\n🚨 [DASHBOARD ALERT] 🚨 Real-time Notification Received!');
    console.log(JSON.stringify(eventData, null, 2));
    console.log('----------------------------------------------------------\n');
});
socket.on('vehicle_pulse', (pulseData) => {
    console.log('\n📍 [DASHBOARD] Pulse Received:', pulseData.vehicleId);
});
console.log('\n=== 2. Starting Vehicle Hardware Simulator ===');
const sendVehicleLocation = async (latitude, longitude) => {
    try {
        console.log(`[Vehicle] Sending GPS ping -> Lat: ${latitude}, Lng: ${longitude}...`);
        await axios.post(`${backendUrl}/vehicles/location`, {
            vehicle_id: 'veh_1',
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        }, {
            headers: { Authorization: `Bearer ${jwtToken}` }
        });
        console.log('[Vehicle] Ping successful.');
    } catch (error) {
        console.error('[Vehicle Error] Failed to send ping:', error.response?.data || error.message);
    }
};
const simulatedPath = [
    { latitude: 10.000, longitude: 10.000 },
    { latitude: 10.005, longitude: 10.005 },
    { latitude: 10.010, longitude: 10.010 },
    { latitude: 10.015, longitude: 10.015 },
    { latitude: 10.020, longitude: 10.020 },
    { latitude: 10.025, longitude: 10.025 }
];
let currentStep = 0;
setInterval(() => {
    if (currentStep >= simulatedPath.length) {
        currentStep = 0;
    }
    const coordinates = simulatedPath[currentStep];
    sendVehicleLocation(coordinates.latitude, coordinates.longitude);
    currentStep++;
}, 30000);