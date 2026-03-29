import express from 'express';
const router = express.Router();
import db from '../config/db.js';
import LocationService from '../services/locationService.js';
router.post('/', async (req, res) => {
  const { vehicle_number, driver_name, vehicle_type, phone } = req.body;
  try {
    const newVehicle = await db.query(
      'INSERT INTO vehicles (vehicle_number, driver_name, vehicle_type, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [vehicle_number, driver_name, vehicle_type, phone]
    );
    res.status(201).json({
      id: `veh_${newVehicle.rows[0].id}`,
      vehicle_number: newVehicle.rows[0].vehicle_number,
      status: newVehicle.rows[0].status,
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vehicles ORDER BY id DESC');
    const mapped = result.rows.map(v => ({
      id: `veh_${v.id}`,
      vehicle_number: v.vehicle_number,
      driver_name: v.driver_name,
      vehicle_type: v.vehicle_type,
      phone: v.phone,
      status: v.status,
      created_at: v.created_at
    }));
    res.json({
      vehicles: mapped,
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/location', async (req, res) => {
  const { vehicle_id, latitude, longitude, timestamp } = req.body;
  if (!vehicle_id || latitude == null || longitude == null || !timestamp) {
      return res.status(400).json({ msg: 'Missing required payload fields' });
  }
  try {
      const io = req.app.get('io');
      const numericId = typeof vehicle_id === 'string' && vehicle_id.startsWith('veh_') 
          ? parseInt(vehicle_id.split('_')[1], 10) 
          : parseInt(vehicle_id, 10);
      const current_geofences = await LocationService.processLocation(
          numericId, latitude, longitude, timestamp, io
      );
      res.status(200).json({
          vehicle_id: `veh_${numericId}`,
          location_updated: true,
          current_geofences,
          time_ns: process.hrtime.bigint().toString()
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});
router.get('/location/:vehicle_id', async (req, res) => {
  try {
    const v_id = req.params.vehicle_id;
    const numericId = v_id.startsWith('veh_') ? parseInt(v_id.split('_')[1], 10) : parseInt(v_id, 10);
    const vehicleQuery = await db.query('SELECT * FROM vehicles WHERE id = $1', [numericId]);
    if (vehicleQuery.rows.length === 0) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    const locQuery = await db.query('SELECT ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng, timestamp FROM vehicle_locations WHERE vehicle_id = $1 ORDER BY timestamp DESC LIMIT 1', [numericId]);
    let current_location = null;
    let current_geofences = [];
    if (locQuery.rows.length > 0) {
      current_location = {
        latitude: locQuery.rows[0].lat,
        longitude: locQuery.rows[0].lng,
        timestamp: locQuery.rows[0].timestamp
      };
      const insideQuery = `
         SELECT id, name, category
         FROM geofences
         WHERE ST_Intersects(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)
      `;
      const insideFences = await db.query(insideQuery, [current_location.longitude, current_location.latitude]);
      current_geofences = insideFences.rows.map(f => ({
        geofence_id: `geo_${f.id}`,
        geofence_name: f.name,
        category: f.category
      }));
    }
    res.json({
      vehicle_id: `veh_${numericId}`,
      vehicle_number: vehicleQuery.rows[0].vehicle_number,
      current_location,
      current_geofences,
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
export default router;
