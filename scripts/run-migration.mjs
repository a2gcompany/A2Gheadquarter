import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = postgres(process.env.DATABASE_URL);
const migration = readFileSync(join(__dirname, '../drizzle/0000_clumsy_owl.sql'), 'utf-8');

// Split by statement-breakpoint and execute each
const statements = migration.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

console.log(`Running ${statements.length} statements...`);

for (const statement of statements) {
  const preview = statement.substring(0, 60).replace(/\n/g, ' ');
  console.log('→', preview + '...');
  await sql.unsafe(statement);
}

console.log('✅ Migration complete! 5 tables created.');
await sql.end();
