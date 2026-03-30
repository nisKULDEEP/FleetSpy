import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = __dirname;
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '../../.env') });
const migrate = async () => {
