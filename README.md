# FleetSpy 🚨

**A Real-Time Fleet Tracking and Geofence Monitoring System.**

**Live Demo:** [https://fleet-spy.vercel.app/](https://fleet-spy.vercel.app/)

---

## 🎯 What It Can Do
FleetSpy is designed to monitor fleet assets (vehicles, trucks, personnel) across designated map zones and trigger real-time alerts when security or operational boundaries are breached.

### Key Features:
- **🗺️ Geofence Management**: Draw operational (inclusion) or exclusion zones dynamically on an interactive map.
- **🚚 Asset Registry**: Register, track, and manage vehicles, their details, and driver assignments.
- **🛰️ Live Telemetry**: Live map showing active vehicles moving across the simulated world.
- **⚡ Real-Time Alerts**: Powered by WebSockets to push instant breach notifications when a vehicle enters or exits a geofence.
- **🗄️ Violation History**: Immutable audit log of all security breaches mapped strictly to database records.
- **🎮 Built-in Simulator**: A built-in testing interface allowing you to simulate driving a vehicle into/out of geofences to test system responsiveness.

---

## 🏗️ Tech Stack

### Frontend `/frontend`
- **React.js 19** (Vite)
- **Redux Toolkit (RTK Query)** - For robust API caching and mutation state management.
- **Tailwind CSS v4** - Styling and UI consistency.
- **Leaflet & React-Leaflet** - Interactive mapping engine.
- **Socket.io-client** - Real-time event subscription.

### Backend `/backend`
- **Node.js (Express)** - REST API routing.
- **PostgreSQL + PostGIS** - Powerful open-source database with geospatial analytics (PostGIS) to perform intersections between moving points and drawn polygons natively on the database layer.
- **Socket.io** - WebSocket server for live telemetry and security flashes.
- **JWT** - Secure, token-based authentication.

---

## 🧪 How to Test (Using the Live Demo)

1. **Sign Up**: Go to [FleetSpy Live](https://fleet-spy.vercel.app/) and create a new commander account.
2. **Add an Asset**: Navigate to **Assets** and register a vehicle (e.g., Truck `ABC-123`).
3. **Create a Geofence**: Go to **Geofences**, draw a shape on the map, and save it.
4. **Run the Simulator**: 
    - Navigate to the **Simulator** tab.
    - Select your newly created Asset.
    - Click and drag the simulated vehicle across the map.
    - Drive the vehicle **into** and **out of** your drawn Geofence.
    - Watch the real-time notification toaster pop up and check the **Violations** audit log!

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for running the PostgreSQL + PostGIS database easily)

### 1. Database Setup
We use an official PostGIS image to support geospatial operations. Navigate to the backend folder and start the database:
```bash
cd backend
docker-compose up -d postgres
```

### 2. Backend Setup
Set up the environment and run the backend server.

```bash
cd backend
npm install

# Setup your local environment variables
# Copy .env.example if available, or create `.env`:
# PORT=3001
# DATABASE_URL=postgresql://niskuldeep:niskuldeep@localhost:5433/geofence_db
# FRONTEND_URL=http://localhost:5173
# JWT_SECRET=your_super_secret_key

# Run Database Migrations to build the tables
node src/migrations/script.js

# Start the development server
npm run dev
```
*The backend should now be running on `http://localhost:3001`.*

### 3. Frontend Setup
Open a new terminal window / tab, set up the environment, and spin up the Vite development server.

```bash
cd frontend
npm install

# Create environment variables in `.env`:
# VITE_API_URL=http://localhost:3001

# Start the Vite server
npm run dev
```
*The frontend should now be running on `http://localhost:5173`.*

---

## 🚀 Deployment Notes
- **Frontend** is deployed on **Vercel**. Due to it being an SPA (Single Page Application), we use a `vercel.json` file with a rewrite rule to redirect all routes natively back to `index.html` avoiding 404 errors on refresh.
- **Backend / Database** is deployed on platforms compatible with Docker/PostgreSQL (like **Render** or **Railway**) with seamless URL integration mapped through `DATABASE_URL`.