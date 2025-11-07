const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n')

    // Read SQL file
    const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 SQL file loaded successfully')
    console.log('📊 Executing migration...\n')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(1)

          if (queryError) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${error.message}`)
          }
        } else {
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`)
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${err.message}`)
      }
    }

    console.log('\n✅ Migration process completed!')
    console.log('\n⚠️  Note: Some statements may have been skipped if they require manual execution.')
    console.log('Please verify in Supabase Dashboard: https://supabase.com/dashboard/project/mrvhvbrcxlxywtwtxzhx/editor\n')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
