// ==========================================
// 1. IMPORTS & CONFIG
// ==========================================
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import db from './config/db.js';
import timeNs from './middleware/timeNs.js';
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import locationService from './services/locationService.js';

import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import geofenceRoutes from './routes/geofences.js';
import alertRoutes from './routes/alerts.js';
import violationRoutes from './routes/violations.js';



// ==========================================
// 2. APP SETUP & MIDDLEWARE
// ==========================================
const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

// Clean up FRONTEND_URL to ensure no trailing slash causes CORS mismatch
const frontendUrl = process.env.FRONTEND_URL? process.env.FRONTEND_URL.replace(/\/+$/, '') : null;
const allowedOrigins = [frontendUrl];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

app.set('io', io);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(timeNs());

// ==========================================
// 3. HTTP ROUTES
// ==========================================
app.use('/auth', authRoutes);
app.use('/vehicles', authMiddleware, vehicleRoutes);
app.use('/geofences', authMiddleware, geofenceRoutes);
app.use('/alerts', authMiddleware, alertRoutes);
app.use('/violations', authMiddleware, violationRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// ==========================================
// 4. WEBSOCKETS (Socket.IO)
// ==========================================
const verifySocketToken = (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded.user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};

io.of('/ws/alerts').use(verifySocketToken);
io.of('/ws/vehicles').use(verifySocketToken);

io.of('/ws/alerts').on('connection', (socket) => {
    console.log(`Owner connected: ${socket.user.id}, Socket ID: ${socket.id}`);
    const ownerId = socket.user.id.toString(); 
    locationService.registerOwnerSocket(ownerId, socket);

    socket.on('disconnect', () => {
        locationService.removeOwnerSocket(ownerId, socket);
    });
});

io.of('/ws/vehicles').on('connection', (socket) => {
    const vehicleId = socket.handshake.auth.vehicle_id || socket.handshake.query.vehicle_id || 'Unknown';
    console.log(`[Hardware] Vehicle connected: ${vehicleId}, Socket ID: ${socket.id}`);

    socket.on('vehicle_location', async (data) => {
        try {
            const numericId = typeof data.vehicle_id === 'string' && data.vehicle_id.startsWith('veh_') 
                ? parseInt(data.vehicle_id.split('_')[1], 10) 
                : parseInt(data.vehicle_id, 10);
            
            // Note: io.of('/ws/alerts') isn't used directly in locationService anymore, but passed as placeholder
            const current_geofences = await locationService.processLocation(
                numericId, data.latitude, data.longitude, data.timestamp, io
            );
            socket.emit('location_updated', { current_geofences });
        } catch (err) {
            console.error('[Hardware] Socket vehicle_location error:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Hardware] Vehicle disconnected: ${vehicleId}`);
    });
});

// ==========================================
// 5. ERROR HANDLING
// ==========================================
// Register error handler middleware after all routes
app.use(errorHandler);

// ==========================================
// 6. SERVER STARTUP
// ==========================================
if(!PORT) {
    console.error('❌ PORT environment variable is not set. Please set it to a valid port number.');
    process.exit(1);
}

server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        console.log('Testing database connection...');
        const databaseResponse = await db.query('SELECT NOW() AS current_time_stamp');
        console.log(`DB Connected at: ${databaseResponse.rows[0].current_time_stamp}`);
    } catch (error) {
        console.error('DB Connection Failed:', error.message);
    }
});

export {  app, server, io  };