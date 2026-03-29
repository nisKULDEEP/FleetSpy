import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'fleetspy-tactical-secret';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(express.json());

  // In-memory data store for the demo
  const db = {
    users: [] as any[],
    vehicles: [
      { id: 'veh_1', vehicle_number: 'SENTINEL-01', driver_name: 'John Doe', vehicle_type: 'Truck', phone: '1234567890', status: 'In Transit', speed: 42 },
      { id: 'veh_2', vehicle_number: 'SENTINEL-02', driver_name: 'Jane Smith', vehicle_type: 'Van', phone: '0987654321', status: 'Idle', speed: 0 },
    ],
    geofences: [
      { id: 'geo_1', name: 'Downtown Sector', category: 'General', coordinates: [13.40, 52.52], radius: 500 },
      { id: 'geo_2', name: 'Restricted Zone Alpha', category: 'Restricted', coordinates: [13.41, 52.53], radius: 300 },
    ],
    alerts: [
      { id: 'rule_1', type: 'SPEED_LIMIT', threshold: 80, vehicle_id: 'veh_1' },
    ],
    violations: [
      { id: 'v_1', vehicle_id: 'veh_1', geofence_id: 'geo_2', timestamp: new Date().toISOString(), details: 'Unauthorized entry into Restricted Zone Alpha' },
    ]
  };

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // API Endpoints
  app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'User exists' });
    const user = { id: Date.now().toString(), email, password };
    db.users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  });

  app.get('/api/vehicles', authenticate, (req, res) => res.json(db.vehicles));
  app.post('/api/vehicles', authenticate, (req, res) => {
    const vehicle = { id: `veh_${Date.now()}`, ...req.body, status: 'Idle', speed: 0 };
    db.vehicles.push(vehicle);
    res.json(vehicle);
  });

  app.get('/api/geofences', authenticate, (req, res) => {
    const { category } = req.query;
    const filtered = category ? db.geofences.filter(g => g.category === category) : db.geofences;
    res.json(filtered);
  });

  app.post('/api/geofences', authenticate, (req, res) => {
    const geofence = { id: `geo_${Date.now()}`, ...req.body };
    db.geofences.push(geofence);
    res.json(geofence);
  });

  app.get('/api/alerts', authenticate, (req, res) => res.json(db.alerts));
  app.post('/api/alerts/configure', authenticate, (req, res) => {
    const alert = { id: `rule_${Date.now()}`, ...req.body };
    db.alerts.push(alert);
    res.json(alert);
  });

  app.get('/api/violations/history', authenticate, (req, res) => res.json(db.violations));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // WebSocket for real-time alerts
  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');
    
    // Simulate real-time alerts
    const interval = setInterval(() => {
      const randomVehicle = db.vehicles[Math.floor(Math.random() * db.vehicles.length)];
      const alert = {
        id: `alert_${Date.now()}`,
        type: 'SPEED_LIMIT',
        vehicle_id: randomVehicle.id,
        timestamp: new Date().toISOString(),
        details: `Vehicle ${randomVehicle.vehicle_number} exceeded speed limit.`
      };
      socket.emit('alert', alert);
    }, 10000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected');
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
