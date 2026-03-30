import express from 'express';
const router = express.Router();
import db from '../config/db.js';
import LocationService from '../services/locationService.js';

router.post('/', async (req, res) => {
  const { vehicle_number, driver_name, vehicle_type, phone } = req.body;
  const user_id = req.user.id;
  try {
    const newVehicle = await db.query(
      'INSERT INTO vehicles (vehicle_number, driver_name, vehicle_type, phone, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [vehicle_number, driver_name, vehicle_type, phone, user_id]
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
    const user_id = req.user.id;
    const result = await db.query(`
      SELECT v.*, (SELECT ST_Y(geom::geometry) as lat FROM vehicle_locations vl WHERE vl.vehicle_id = v.id ORDER BY timestamp DESC LIMIT 1), (SELECT ST_X(geom::geometry) as lng FROM vehicle_locations vl WHERE vl.vehicle_id = v.id ORDER BY timestamp DESC LIMIT 1) FROM vehicles v WHERE v.user_id = $1 ORDER BY v.id DESC
    `, [user_id]);
    const mapped = result.rows.map(v => ({
      id: `veh_${v.id}`,
      vehicle_number: v.vehicle_number,
      driver_name: v.driver_name,
      vehicle_type: v.vehicle_type,
      phone: v.phone,
      status: v.status,
      created_at: v.created_at,
      location: v.lat && v.lng ? { latitude: v.lat, longitude: v.lng } : null
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
  console.log('Received location update:', { vehicle_id, latitude, longitude, timestamp });
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
export default router;
