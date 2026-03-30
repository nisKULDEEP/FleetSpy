import express from 'express';
const router = express.Router();
import db from '../config/db.js';

router.post('/configure', async (req, res) => {
  const { geofence_id, vehicle_id, event_type } = req.body;
  if (!geofence_id || !event_type) {
      return res.status(400).json({ msg: 'Missing geofence_id or event_type' });
  }
  try {
    const geoIdNum = parseInt(geofence_id.replace('geo_', ''), 10);
    const vehIdNum = vehicle_id ? parseInt(vehicle_id.replace('veh_', ''), 10) : null;
    const newRule = await db.query(
      `INSERT INTO alert_rules (geofence_id, vehicle_id, event_type, status) 
       VALUES ($1, $2, $3, 'active') RETURNING id`,
      [geoIdNum, vehIdNum, event_type]
    );
    res.status(201).json({
      alert_id: `alert_${newRule.rows[0].id}`,
      geofence_id: `geo_${geoIdNum}`,
      vehicle_id: typeof vehIdNum === 'number' ? `veh_${vehIdNum}` : null,
      event_type,
      status: "active",
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const { geofence_id, vehicle_id } = req.query;
    let query = `
      SELECT ar.id, ar.event_type, ar.status, ar.created_at,
             g.id as geo_id, g.name as geofence_name,
             v.id as veh_id, v.vehicle_number
      FROM alert_rules ar
      JOIN geofences g ON ar.geofence_id = g.id
      LEFT JOIN vehicles v ON ar.vehicle_id = v.id
      WHERE 1=1
    `;
    let params = [];
    let pCount = 1;
    if (geofence_id) {
        query += ` AND ar.geofence_id = $${pCount++}`;
        params.push(parseInt(geofence_id.replace('geo_', ''), 10));
    }
    if (vehicle_id) {
        query += ` AND ar.vehicle_id = $${pCount++}`;
        params.push(parseInt(vehicle_id.replace('veh_', ''), 10));
    }
    query += ' ORDER BY ar.id DESC';
    const result = await db.query(query, params);
    const alerts = result.rows.map(row => ({
      alert_id: `alert_${row.id}`,
      geofence_id: `geo_${row.geo_id}`,
      geofence_name: row.geofence_name,
      vehicle_id: row.veh_id ? `veh_${row.veh_id}` : null,
      vehicle_number: row.vehicle_number,
      event_type: row.event_type,
      status: row.status,
      created_at: row.created_at
    }));
    res.json({
      alerts,
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
