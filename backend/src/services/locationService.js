import db from '../config/db.js';
const statusCache = new Map();
const vehicleToOwner = new Map();
const ownerToSocket = new Map();
const registerOwnerSocket = (ownerId, socket) => {
    if (!ownerToSocket.has(ownerId)) {
        ownerToSocket.set(ownerId, new Set());
    }
    ownerToSocket.get(ownerId).add(socket);
};
const removeOwnerSocket = (ownerId, socket) => {
    if (ownerToSocket.has(ownerId)) {
        const sockets = ownerToSocket.get(ownerId);
        sockets.delete(socket);
        if (sockets.size === 0) {
            ownerToSocket.delete(ownerId);
        }
    }
};
const processLocation = async (vehicleId, latitude, longitude, timestamp, io) => {
    try {
        const vehicleIdString = vehicleId.toString();
        if (!vehicleToOwner.has(vehicleIdString)) {
            vehicleToOwner.set(vehicleIdString, ['1']);
        }
        const ownersForThisVehicle = vehicleToOwner.get(vehicleIdString) || [];
        ownersForThisVehicle.forEach(ownerId => {
            const activeSockets = ownerToSocket.get(ownerId);
            if (activeSockets && activeSockets.size > 0) {
                activeSockets.forEach(socket => {
                    socket.emit('vehicle_pulse', {
                        vehicleId: `veh_${vehicleId}`,
                        location: { latitude, longitude },
                        timestamp
                    });
                });
            }
        });
        const vehicleQuery = await db.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        if (vehicleQuery.rows.length === 0) {
            throw new Error('Vehicle not found');
        }
        const vehicle = vehicleQuery.rows[0];
        await db.query(`
            INSERT INTO vehicle_locations (vehicle_id, geom, timestamp)
            VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4)
        `, [vehicleId, longitude, latitude, timestamp]);
        const insideQuery = `
            SELECT id, name, category
            FROM geofences
            WHERE ST_Intersects(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)
        `;
        const insideFencesResponse = await db.query(insideQuery, [longitude, latitude]);
        const insideFences = insideFencesResponse.rows;
        const currentlyInsideFenceIds = new Set(insideFences.map(fence => fence.id));
        const currentGeofencesData = insideFences.map(fence => ({
            geofenceId: `geo_${fence.id}`,
            geofenceName: fence.name,
            status: 'inside'
        }));
        for (const fence of insideFences) {
            const cacheKey = `${vehicleId}-${fence.id}`;
            const wasInside = statusCache.get(cacheKey);
            if (!wasInside) {
                statusCache.set(cacheKey, true);
                await triggerAlert('entry', vehicle, fence, latitude, longitude, timestamp, io);
            }
        }
        for (const [cacheKey, wasInside] of statusCache.entries()) {
            if (cacheKey.startsWith(`${vehicleId}-`) && wasInside) {
                const fenceId = parseInt(cacheKey.split('-')[1], 10);
                if (!currentlyInsideFenceIds.has(fenceId)) {
                    statusCache.set(cacheKey, false);
                    const fenceQuery = await db.query('SELECT id, name, category FROM geofences WHERE id = $1', [fenceId]);
                    if (fenceQuery.rows.length > 0) {
                        const fence = fenceQuery.rows[0];
                        await triggerAlert('exit', vehicle, fence, latitude, longitude, timestamp, io);
                    }
                }
            }
        }
        return currentGeofencesData;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const triggerAlert = async (eventType, vehicle, fence, latitude, longitude, timestamp, io) => {
    const alertInsertResult = await db.query(`
        INSERT INTO alerts (vehicle_id, geofence_id, event_type, timestamp) 
        VALUES ($1, $2, $3, $4) RETURNING id, timestamp
    `, [vehicle.id, fence.id, eventType, timestamp]);
    const eventId = alertInsertResult.rows[0].id;
    const payload = {
        eventId: `evt_${eventId}`,
        eventType,
        timestamp,
        vehicle: {
            vehicleId: `veh_${vehicle.id}`,
            vehicleNumber: vehicle.license_plate || vehicle.vehicle_number,
            driverName: vehicle.driver_name || 'Unknown'
        },
        geofence: {
            geofenceId: `geo_${fence.id}`,
            geofenceName: fence.name,
            category: fence.category || 'restricted_zone'
        },
        location: {
            latitude,
            longitude
        }
    };
    if (io) {
        io.of('/ws/alerts').emit('geofence_event', payload);
        io.emit('geofence_event', payload); 
    }
};
export default { 
    registerOwnerSocket,
    removeOwnerSocket,
    processLocation,
    triggerAlert
 };