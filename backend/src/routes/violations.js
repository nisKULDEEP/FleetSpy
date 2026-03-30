import express from 'express';
const router = express.Router();
import db from '../config/db.js';

router.get('/history', async (req, res) => {
  try {
    const { vehicle_id, geofence_id, start_date, end_date, limit } = req.query;
    let query = `
      SELECT 
        a.id, 
        a.event_type, 
        a.timestamp,
        v.id as veh_id, 
        v.vehicle_number, 
        g.id as geo_id, 
        g.name AS geofence_name
      FROM alerts a
      JOIN vehicles v ON a.vehicle_id = v.id
      JOIN geofences g ON a.geofence_id = g.id
      WHERE 1=1
    `;
    let params = [];
    let pCount = 1;
    if (vehicle_id) {
        query += ` AND a.vehicle_id = $${pCount++}`;
        params.push(parseInt(vehicle_id.replace('veh_', ''), 10));
    }
    if (geofence_id) {
        query += ` AND a.geofence_id = $${pCount++}`;
        params.push(parseInt(geofence_id.replace('geo_', ''), 10));
    }
    if (start_date) {
        query += ` AND a.timestamp >= $${pCount++}`;
        params.push(start_date);
    }
    if (end_date) {
        query += ` AND a.timestamp <= $${pCount++}`;
        params.push(end_date);
    }
    query += ` ORDER BY a.timestamp DESC`;
    let parsedLimit = 50;
    if (limit) {
        parsedLimit = Math.min(parseInt(limit, 10), 500);
    }
    query += ` LIMIT $${pCount++}`;
    params.push(parsedLimit);
    const result = await db.query(query, params);
    const violations = result.rows.map(row => ({
      id: `viol_${row.id}`,
      vehicle_id: `veh_${row.veh_id}`,
      vehicle_number: row.vehicle_number,
      geofence_id: `geo_${row.geo_id}`,
      geofence_name: row.geofence_name,
      event_type: row.event_type,
      latitude: 0, 
      longitude: 0,
      timestamp: row.timestamp
    }));
    res.json({
      violations,
      total_count: violations.length, 
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
export default router;
