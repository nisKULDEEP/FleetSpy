import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const migrate = async () => {
  try {
    const { default: db } = await import('../config/db.js');
    const files = readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running: ${file}`);
      const sql = readFileSync(join(__dirname, file), 'utf8');
      await db.query(sql);
    }
    console.log('✅ Done');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};
migrate();
