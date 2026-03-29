import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import timeNs from './middleware/timeNs.js';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import geofenceRoutes from './routes/geofences.js';
import alertRoutes from './routes/alerts.js';
import violationRoutes from './routes/violations.js';
import authMiddleware from './middleware/auth.js';
import locationService from './services/locationService.js';
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});
app.use(cors());
app.use(express.json());
app.use(timeNs());
app.use('/auth', authRoutes);
app.use('/vehicles', authMiddleware, vehicleRoutes);
app.use('/geofences', authMiddleware, geofenceRoutes);
app.use('/alerts', authMiddleware, alertRoutes);
app.use('/violations', authMiddleware, violationRoutes);
io.of('/ws/alerts').use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
        socket.user = decoded.user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
});
io.of('/ws/alerts').on('connection', (socket) => {
    const ownerId = socket.user.id.toString(); 
    locationService.registerOwnerSocket(ownerId, socket);
    socket.on('disconnect', () => {
        locationService.removeOwnerSocket(ownerId, socket);
    });
});
app.set('io', io);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        const databaseResponse = await db.query('SELECT NOW() AS current_time_stamp');
        console.log(`DB Connected at: ${databaseResponse.rows[0].current_time_stamp}`);
    } catch (error) {
        console.error('DB Connection Failed:', error.message);
    }
});
export {  app, server, io  };