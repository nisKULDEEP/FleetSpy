import { Pool } from 'pg';
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'geofence_db',
  user: process.env.DB_USER || 'niskuldeep',
  password: process.env.DB_PASSWORD || 'niskuldeep',
});
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  console.log('✅ Connected to PostgreSQL + PostGIS');
  if (release) release();
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});
export default { 
  query: (text, params) => pool.query(text, params),
  pool,
};
