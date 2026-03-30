const fs = require('fs');
const file = './backend/src/routes/vehicles.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const result = await db.query('SELECT * FROM vehicles WHERE user_id = $1 ORDER BY id DESC', [user_id]);",
  "const result = await db.query(`\n      SELECT v.*, (SELECT ST_Y(geom::geometry) as lat FROM vehicle_locations vl WHERE vl.vehicle_id = v.id ORDER BY timestamp DESC LIMIT 1), (SELECT ST_X(geom::geometry) as lng FROM vehicle_locations vl WHERE vl.vehicle_id = v.id ORDER BY timestamp DESC LIMIT 1) FROM vehicles v WHERE v.user_id = $1 ORDER BY v.id DESC\n    `, [user_id]);"
);

content = content.replace(
  "created_at: v.created_at",
  "created_at: v.created_at,\n      location: v.lat && v.lng ? { latitude: v.lat, longitude: v.lng } : null"
);

fs.writeFileSync(file, content);
console.log('Done mapping locations to vehicle list api');
