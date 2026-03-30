import express from 'express';
const router = express.Router();
import db from '../config/db.js';

const parsePrefixedId = (value, prefix) => {
  if (!value) return null;
  if (typeof value === 'string' && value.startsWith(prefix)) {
    return parseInt(value.slice(prefix.length), 10);
  }
  return parseInt(value, 10);
};

router.get('/history', async (req, res) => {
  try {
    const { vehicle_id, geofence_id, start_date, end_date, limit, offset } = req.query;
    const filters = ['1=1'];
    const params = [];

    const addFilter = (condition, value) => {
      params.push(value);
      filters.push(condition.replace('$', `$${params.length}`));
    };

    if (vehicle_id) {
      const parsedVehicle = parsePrefixedId(vehicle_id, 'veh_');
      if (!Number.isNaN(parsedVehicle)) {
        addFilter('a.vehicle_id = $', parsedVehicle);
      }
    }
    if (geofence_id) {
      const parsedGeofence = parsePrefixedId(geofence_id, 'geo_');
      if (!Number.isNaN(parsedGeofence)) {
        addFilter('a.geofence_id = $', parsedGeofence);
      }
    }
    if (start_date) {
      addFilter('a.timestamp >= $', start_date);
    }
    if (end_date) {
      addFilter('a.timestamp <= $', end_date);
    }

    const whereClause = filters.join(' AND ');
    const limitValue = Math.min(parseInt(limit, 10) || 50, 500);
    const offsetValue = Math.max(parseInt(offset, 10) || 0, 0);

    const dataParams = [...params, limitValue, offsetValue];
    const query = `
      SELECT 
        a.id, 
        a.event_type, 
        a.timestamp,
        v.id as veh_id, 
        v.vehicle_number, 
        g.id as geo_id, 
        g.name AS geofence_name,
        g.category,
        ST_Y(vl.geom::geometry) AS latitude,
        ST_X(vl.geom::geometry) AS longitude
      FROM alerts a
      JOIN vehicles v ON a.vehicle_id = v.id
      JOIN geofences g ON a.geofence_id = g.id
      LEFT JOIN vehicle_locations vl ON vl.vehicle_id = a.vehicle_id AND vl.timestamp = a.timestamp
      WHERE ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT $${dataParams.length - 1}
      OFFSET $${dataParams.length}
    `;
    const result = await db.query(query, dataParams);

    const countResult = await db.query(
      `SELECT COUNT(*) as total_count FROM alerts a WHERE ${whereClause}`,
      params,
    );

    const violations = result.rows.map((row) => ({
      id: `viol_${row.id}`,
      vehicle_id: `veh_${row.veh_id}`,
      vehicle_number: row.vehicle_number,
      geofence_id: `geo_${row.geo_id}`,
      geofence_name: row.geofence_name,
      event_type: row.event_type,
      type: row.event_type ? row.event_type.toUpperCase() : null,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      timestamp: row.timestamp,
      details: row.event_type
        ? `${row.event_type.toUpperCase()} · ${row.geofence_name}`
        : row.geofence_name,
    }));

    res.json({
      violations,
      total_count: parseInt(countResult.rows[0].total_count, 10),
      time_ns: process.hrtime.bigint().toString(),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;