# Geofence Simulator

This simulator demonstrates the two separate actors in a real-time geofence system:

1. **The Vehicle (Hardware)**: Uses standard `HTTP POST` pings every 30 seconds.
2. **The Dashboard (Frontend)**: Maintains an always-open `WebSocket` connection to instantly receive alerts when the backend detects the vehicle crossed a boundary.

## How to usage
1. Ensure the Node backend `app.js` is running on port 3001.
2. Obtain a valid JWT Token via POST to `/api/auth/register`.
3. Paste the Token into `simulator/index.js` `JWT_TOKEN` variable.
4. Set up Vehicle ID 1 and a Geofence around Lat `10.010` Lng `10.010` in DB.
5. Run: `cd simulator && node index.js`
