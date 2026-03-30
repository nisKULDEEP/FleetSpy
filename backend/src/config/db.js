import { Pool } from 'pg';

console.log('Initializing database connection...', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  //  ssl: { rejectUnauthorized: false }
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
