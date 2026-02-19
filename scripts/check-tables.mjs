import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

const tables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  ORDER BY table_name
`;

console.log('📊 Tablas en Supabase:');
tables.forEach(t => console.log('  ✓', t.table_name));

await sql.end();
