import db from '../config/db.js';

const vehicleGeofenceStateCache = new Map();
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

const getVehicleOwners = async (vehicleId, vehicleIdString) => {
    if (!vehicleToOwner.has(vehicleIdString)) {
        try {
            const vehicleRes = await db.query('SELECT user_id FROM vehicles WHERE id = $1', [vehicleId]);
            const owners = vehicleRes.rows.map(row => row.user_id.toString());
            vehicleToOwner.set(vehicleIdString, owners);
        } catch (error) {
            console.error('Error fetching vehicle owners from DB:', error.message);
        }
    }
    return vehicleToOwner.get(vehicleIdString) || [];
};

const emitLocationUpdateToOwners = (vehicleId, latitude, longitude, timestamp, owners) => {
    owners.forEach(ownerId => {
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
};

const persistVehicleLocation = async (vehicleId, latitude, longitude, timestamp) => {
    const vehicleQuery = await db.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
    if (vehicleQuery.rows.length === 0) {
        throw new Error('Vehicle not found');
    }
    
    const vehicle = vehicleQuery.rows[0];
    await db.query(`
        INSERT INTO vehicle_locations (vehicle_id, geom, timestamp)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4)
    `, [vehicleId, longitude, latitude, timestamp]);
    
    return vehicle;
};

const getIntersectingGeofences = async (latitude, longitude, owners) => {
    // If there are no owners mapped yet, just return empty so we don't query 
    if (!owners || owners.length === 0) return [];
    
    // We only want to check the geofences created by the owner(s) of this specific vehicle
    const insideQuery = `
        SELECT id, name, category, user_id
        FROM geofences
        WHERE user_id = ANY($1::int[]) 
        AND ST_Intersects(geom, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)
    `;
    const response = await db.query(insideQuery, [owners, longitude, latitude]);
    return response.rows;
};

const checkAndTriggerAlerts = async (vehicle, insideFences, latitude, longitude, timestamp, owners) => {
    const vehicleId = vehicle.id;
    
    // Convert insideFences to a Map of { id -> fence } for easy entire object lookups later if needed,
    // but we only strictly cache the lightweight IDs + essential data.
    const currentFencesMap = new Map(insideFences.map(fence => [fence.id, fence]));
    
    // Retrieve previous state: expected to be a Map of { geofenceId -> geofenceObject }
    const previousFencesMap = vehicleGeofenceStateCache.get(vehicleId) || new Map();

    // 1. Check for Geofence Entry (In 'current' but not in 'previous')
    for (const [fenceId, fence] of currentFencesMap.entries()) {
        if (!previousFencesMap.has(fenceId)) {
            await triggerAlert('entry', vehicle, fence, latitude, longitude, timestamp, owners);
        }
    }

    // 2. Check for Geofence Exit (In 'previous' but not in 'current')
    for (const [prevFenceId, prevFence] of previousFencesMap.entries()) {
        if (!currentFencesMap.has(prevFenceId)) {
            // We have the whole prevFence object stored in cache, no DB query needed!
            await triggerAlert('exit', vehicle, prevFence, latitude, longitude, timestamp, owners);
        }
    }

    // 3. Update the cache with the current state (Storing the Maps instead of just Sets)
    vehicleGeofenceStateCache.set(vehicleId, currentFencesMap);
};

const processLocation = async (vehicleId, latitude, longitude, timestamp, io) => {
    try {
        console.log(`Processing location for Vehicle ID: ${vehicleId} at (${latitude}, ${longitude})`);
        const vehicleIdString = vehicleId.toString();
        
        // 1. Fetch the owners who have access to this vehicle
        const owners = await getVehicleOwners(vehicleId, vehicleIdString);

        console.log(`Owners for Vehicle ID ${vehicleId}:`, owners);
        
        // 2. Broadcast live pulse directly to their connected sockets
        emitLocationUpdateToOwners(vehicleId, latitude, longitude, timestamp, owners);

        // 3. Save the actual coordinate data
        const vehicle = await persistVehicleLocation(vehicleId, latitude, longitude, timestamp);

        // 4. Calculate spatial intersections for the owner's geofences only
        const insideFences = await getIntersectingGeofences(latitude, longitude, owners);
        
        // 5. Evaluate state boundaries to potentially trigger push alert events directly to owners
        await checkAndTriggerAlerts(vehicle, insideFences, latitude, longitude, timestamp, owners);
        
        return insideFences.map(fence => ({
            geofenceId: `geo_${fence.id}`,
            geofenceName: fence.name,
            status: 'inside'
        }));

    } catch (error) {
        console.error('Location Processing Error:', error);
        throw error;
    }
};

const triggerAlert = async (eventType, vehicle, fence, latitude, longitude, timestamp, owners) => {
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
    
    // Emit alert strictly to the specific Client's Sockets (same logic as pulse)
    owners.forEach(ownerId => {
        const activeSockets = ownerToSocket.get(ownerId);
        if (activeSockets && activeSockets.size > 0) {
            activeSockets.forEach(socket => {
                socket.emit('geofence_event', payload);
            });
        }
    });
};
export default { 
    registerOwnerSocket,
    removeOwnerSocket,
    processLocation,
    triggerAlert
 };