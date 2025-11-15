# Database Migration Instructions

## Step 1: Run the SQL Migration

1. **Open the Supabase SQL Editor:**
   https://supabase.com/dashboard/project/mrvhvbrcxlxywtwtxzhx/sql/new

2. **Copy the entire contents of:**
   `supabase/migrations/001_initial_schema.sql`

3. **Paste into the SQL Editor and click "Run"**

The migration will:
- Create all necessary tables (companies, accounts, transactions, documents, etc.)
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Insert seed data for your 6 companies:
  - A2G
  - Roger Sanchez
  - Audesign
  - S-CORE
  - TWINYARDS
  - BÂBEL

## Step 2: Create Storage Bucket (Optional - for document uploads)

1. Go to: https://supabase.com/dashboard/project/mrvhvbrcxlxywtwtxzhx/storage/buckets
2. Click "New bucket"
3. Name: `documents`
4. Public: No (keep private)
5. Click "Create bucket"

## Step 3: Verify

After running the migration, you should see all tables in your Supabase dashboard:
https://supabase.com/dashboard/project/mrvhvbrcxlxywtwtxzhx/editor

## Troubleshooting

If you get errors:
- Make sure you're logged into Supabase
- Check that the project ID in the URL matches your .env.local
- Some extensions might already exist (that's OK, you can ignore those errors)

## What's Next?

Once the migration is complete, your app will:
- Load without errors
- Show an empty state (no KPIs yet)
- Allow you to upload documents
- Use AI to extract KPIs from uploaded documents
