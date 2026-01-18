import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

// Create missing tables
console.log('Creating missing tables...');

try {
  await sql`
    CREATE TABLE IF NOT EXISTS "projects" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "type" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log('✓ projects');
} catch (e) {
  console.log('→ projects:', e.message);
}

try {
  await sql`
    CREATE TABLE IF NOT EXISTS "releases" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      "track_name" text NOT NULL,
      "labels_contacted" jsonb DEFAULT '[]'::jsonb,
      "status" text DEFAULT 'draft' NOT NULL,
      "release_date" date,
      "notes" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log('✓ releases');
} catch (e) {
  console.log('→ releases:', e.message);
}

try {
  await sql`
    CREATE TABLE IF NOT EXISTS "reports" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "project_id" uuid REFERENCES projects(id) ON DELETE CASCADE,
      "submitted_by" text NOT NULL,
      "period" text NOT NULL,
      "department" text NOT NULL,
      "data" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log('✓ reports');
} catch (e) {
  console.log('→ reports:', e.message);
}

// Check if transactions and bookings have the right structure for Drizzle
// Add project_id foreign key if missing
try {
  await sql`
    ALTER TABLE "transactions"
    ADD COLUMN IF NOT EXISTS "project_id" uuid REFERENCES projects(id) ON DELETE CASCADE
  `;
  console.log('✓ transactions.project_id added');
} catch (e) {
  console.log('→ transactions.project_id:', e.message);
}

try {
  await sql`
    ALTER TABLE "bookings"
    ADD COLUMN IF NOT EXISTS "project_id" uuid REFERENCES projects(id) ON DELETE CASCADE
  `;
  console.log('✓ bookings.project_id added');
} catch (e) {
  console.log('→ bookings.project_id:', e.message);
}

console.log('\n✅ Done!');
await sql.end();
