const { createClient } = require('@supabase/supabase-js')

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

async function setupStorage() {
  try {
    console.log('🗄️  Setting up Supabase Storage...\n')

    // Create 'documents' bucket
    console.log('📦 Creating "documents" bucket...')

    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ]
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "documents" already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('✅ Bucket "documents" created successfully')
    }

    console.log('\n✅ Storage setup completed!')
    console.log('\n📝 Bucket configuration:')
    console.log('   - Name: documents')
    console.log('   - Public: No')
    console.log('   - Max file size: 10MB')
    console.log('   - Allowed types: PDF, Excel, CSV, Images\n')

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message)
    console.log('\n⚠️  Please create the bucket manually:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/mrvhvbrcxlxywtwtxzhx/storage/buckets')
    console.log('   2. Click "New bucket"')
    console.log('   3. Name: documents')
    console.log('   4. Public: NO')
    console.log('   5. Click "Create bucket"\n')
    process.exit(1)
  }
}

setupStorage()
