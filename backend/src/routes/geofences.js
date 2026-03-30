import express from 'express';
const router = express.Router();
import db from '../config/db.js';

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const user_id = req.user.id;
    console.log(`Fetching geofences for user_id: ${user_id}, category filter: ${category}`);
    let query = `
      SELECT id, name, description, category, created_at, 
            ST_AsGeoJSON(geom)::json AS geometry
      FROM geofences
      WHERE user_id = $1
    `;
    let params = [user_id];
    let paramIndex = 2;
    
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
    }

    query += ` ORDER BY id DESC`;
    const result = await db.query(query, params);
    
    const geofences = result.rows.map(row => {
      const rawCoords = row.geometry.coordinates[0];
      const mappedCoords = rawCoords.map(c => [c[1], c[0]]);
      return {
        id: `geo_${row.id}`,
        name: row.name,
        description: row.description,
        coordinates: mappedCoords,
        category: row.category,
        created_at: row.created_at
      };
    });

    res.json({
      geofences,
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/', async (req, res) => {
  const { name, description, coordinates, category } = req.body;
  const user_id = req.user.id; 

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 4) {
      return res.status(400).json({ msg: 'Invalid coordinates array for Polygon. Minimum 4 points needed.' });
  }
  try {
    const coordsStr = coordinates.map(c => `${c[1]} ${c[0]}`).join(', ');
    const polygonWKT = `POLYGON((${coordsStr}))`;
    const newGeofence = await db.query(
      `INSERT INTO geofences (name, description, category, geom, user_id) 
       VALUES ($1, $2, $3, ST_GeogFromText($4), $5) 
       RETURNING id, name`,
      [name, description, category || 'general', polygonWKT, user_id]
    );
    res.status(201).json({
      id: `geo_${newGeofence.rows[0].id}`,
      name: newGeofence.rows[0].name,
      status: "active",
      time_ns: process.hrtime.bigint().toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;
    const numericId = id.startsWith('geo_') ? parseInt(id.replace('geo_', ''), 10) : parseInt(id, 10);
    const result = await db.query('DELETE FROM geofences WHERE id = $1 AND user_id = $2 RETURNING id', [numericId, user_id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ msg: 'Geofence not found or unauthorized' });
    }
    
    res.json({ msg: 'Geofence deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
