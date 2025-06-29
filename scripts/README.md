# Database Fix Scripts

This directory contains scripts to fix database schema issues and ensure proper data migration between tables.

## Fix Challenges Script

### Purpose

The `fix-challenges.sql` script addresses issues with the challenges table and ensures proper data migration from the `challenge_plans` table to the `challenges` table. It also fixes foreign key constraints and unique constraints in the `daily_progress` table.

### What it does

1. Creates the `challenges` table if it doesn't exist
2. Enables Row Level Security (RLS) on the table
3. Creates appropriate RLS policies
4. Creates an index on the `user_id` column for better performance
5. Migrates data from `challenge_plans` to `challenges` table
6. Fixes foreign key constraints in the `daily_progress` table
7. Fixes unique constraints in the `daily_progress` table

## Running the Fix Scripts

### Windows

Run the `run-fix-script.bat` file by double-clicking it or executing it from the command line:

```
.\scripts\run-fix-script.bat
```

### macOS/Linux

Make the script executable and run it:

```bash
chmod +x ./scripts/run-fix-script.sh
./scripts/run-fix-script.sh
```

## Troubleshooting

If you encounter issues running the scripts:

1. Make sure you have the Supabase CLI installed
2. Ensure your `.env.local` file contains the correct Supabase credentials
3. Check that you have the necessary permissions to execute SQL on your Supabase instance

If you continue to experience issues, you can manually execute the SQL in the Supabase SQL Editor in the dashboard.