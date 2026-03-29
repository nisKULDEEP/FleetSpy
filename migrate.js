import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import db from './backend/src/config/db.js';
async function runMigration() {
    try {
        console.log('Reading migration file...');
        const sqlPath = path.join(__dirname, 'backend', 'src', 'migrations', '001_init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing migration script on DB...');
        await db.query(sql);
        console.log('✅ Tables created successfully, including `users`!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
runMigration();