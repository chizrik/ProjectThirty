import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateChallengePlan } from '@/lib/generateChallengePlan'

interface ChallengePlan {
  title: string
  description: string
  metrics: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
    difficulty_level: string
  }
  specific_goals: string[]
  potential_obstacles: string[]
  days: Array<{
    day: number
    tasks: string[]
    tips?: string[]
    bonus_task?: string
    difficulty_rating?: number
  }>
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    const { goal, time_commitment, category, difficulty, specific_goals, obstacles, user_id } = await request.json()
    const requiredFields = {
      goal,
      time_commitment,
      category,
      difficulty,
      specific_goals,
      obstacles,
      user_id
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          fields: missingFields
        },
        { status: 400 }
      )
    }

    const parsedTimeCommitment = typeof time_commitment === 'string' 
      ? parseInt(time_commitment.split(' ')[0]) 
      : parseInt(time_commitment)

    if (isNaN(parsedTimeCommitment)) {
      return NextResponse.json(
        { error: 'time_commitment must be a valid number' },
        { status: 400 }
      )
    }

    const plan: ChallengePlan = await generateChallengePlan({
      goal,
      timeCommitment: parsedTimeCommitment,
      category,
      difficulty,
      specificGoals: Array.isArray(specific_goals) ? specific_goals : specific_goals.split(',').map((goal: string) => goal.trim()),
      obstacles: Array.isArray(obstacles) ? obstacles : obstacles.split(',').map((obstacle: string) => obstacle.trim()),
    })
    // Save the challenge plan
    // Create challenge_plans table if it doesn't exist
    const { error: createPlanTableError } = await supabase
      .rpc('create_challenge_plans_table')

    // The corresponding SQL function should be created in Supabase SQL editor:
    /*
    create or replace function create_challenge_plans_table()
    returns void
    language plpgsql
    security definer
    set search_path = ''
    as $$
    begin
      create table if not exists public.challenge_plans (
        id uuid default uuid_generate_v4() primary key,
        user_id uuid references auth.users(id) on delete cascade,
        title text not null,
        description text not null,
        days jsonb not null,
        metrics jsonb not null,
        created_at timestamp with time zone default timezone('utc'::text, now())
      );
      
      create index if not exists challenge_plans_user_id_idx on public.challenge_plans(user_id);
      
      -- Grant necessary permissions
      grant all on public.challenge_plans to authenticated;
      grant all on public.challenge_plans to service_role;
      
      -- Enable RLS
      alter table public.challenge_plans enable row level security;
      
      -- Create RLS policies
      drop policy if exists "Users can view their own challenge plans" on public.challenge_plans;
      create policy "Users can view their own challenge plans"
        on public.challenge_plans for all
        using (auth.uid() = user_id);
    end;
    $$;
    */

    if (createPlanTableError) {
      console.error('Failed to create challenge_plans table:', createPlanTableError)
      return NextResponse.json(
        { error: 'Failed to initialize challenge plans' },
        { status: 500 }
      )
    }

    // Ensure days is properly formatted as a JSON object
    let daysData;
    try {
      // First, ensure we have a proper JavaScript object
      daysData = typeof plan.days === 'string' ? JSON.parse(plan.days) : plan.days;
      
      // Validate that daysData is an array
      if (!Array.isArray(daysData)) {
        throw new Error('Days data is not an array');
      }
      
      // Validate that we have 30 days
      if (daysData.length !== 30) {
        throw new Error(`Expected 30 days, but got ${daysData.length}`);
      }
      
      // Validate each day has the required structure
      daysData.forEach((day, index) => {
        if (!day.day || !Array.isArray(day.tasks)) {
          throw new Error(`Day ${index + 1} is missing required fields (day number or tasks array)`);
        }
        
        // Ensure day is a number
        if (typeof day.day !== 'number') {
          day.day = parseInt(day.day, 10);
          if (isNaN(day.day)) {
            throw new Error(`Day ${index + 1} has an invalid day number`);
          }
        }
        
        // Ensure tasks are strings
        day.tasks = day.tasks.map(task => String(task));
      });
      
      // Ensure daysData is in the correct format for JSONB
      // We don't need to stringify it as Supabase will handle the conversion to JSONB
      // Just make sure it's a valid JavaScript object
      daysData = JSON.parse(JSON.stringify(daysData));
    } catch (error) {
      console.error('Error parsing days data:', error);
      console.error('Days data that caused the error:', {
        days_type: typeof plan.days,
        days_sample: typeof plan.days === 'string' ? plan.days.substring(0, 200) + '...' : JSON.stringify(plan.days).substring(0, 200) + '...'
      });
      return NextResponse.json(
        { 
          error: 'Invalid days data format', 
          message: error instanceof Error ? error.message : 'Unknown error',
          hint: 'Ensure days is a valid array of 30 day objects, each with a day number and tasks array'
        },
        { status: 400 }
      );
    }

    // Insert into challenge_plans table
    const { data: savedPlan, error: planError } = await supabase
      .from('challenge_plans')
      .insert({
        user_id,
        title: plan.title,
        description: plan.description,
        metrics: {
          success_likelihood: plan.metrics.success_likelihood || 85,
          effort_level: plan.metrics.effort_level || 'moderate',
          time_per_day: parsedTimeCommitment || 30,
          difficulty_level: difficulty,
          specific_goals: plan.specific_goals,
          potential_obstacles: plan.potential_obstacles
        },
        days: daysData
      })
      .select()
      .single()
      
    // Create challenges table if it doesn't exist
    const { error: createChallengesTableError } = await supabase
      .rpc('create_challenges_table')

    // The corresponding SQL function should be created in Supabase SQL editor:
    /*
    create or replace function create_challenges_table()
    returns void
    language plpgsql
    security definer
    set search_path = ''
    as $$
    begin
      create table if not exists public.challenges (
        id uuid default uuid_generate_v4() primary key,
        user_id uuid references auth.users(id) on delete cascade,
        title text not null,
        description text not null,
        category text default 'General',
        created_at timestamp with time zone default timezone('utc'::text, now())
      );
      
      create index if not exists challenges_user_id_idx on public.challenges(user_id);
      
      -- Grant necessary permissions
      grant all on public.challenges to authenticated;
      grant all on public.challenges to service_role;
      
      -- Enable RLS
      alter table public.challenges enable row level security;
      
      -- Create RLS policies
      drop policy if exists "Users can view their own challenges" on public.challenges;
      create policy "Users can view their own challenges"
        on public.challenges for all
        using (auth.uid() = user_id);
    end;
    $$;
    */

    if (createChallengesTableError) {
      console.error('Failed to create challenges table:', createChallengesTableError)
    }

    // If challenge_plans insertion was successful, also insert into challenges table
    if (!planError && savedPlan) {
      // Try to execute the SQL directly to ensure the table exists with the correct schema
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.challenges (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT DEFAULT 'General',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security (RLS)
        ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policy 
            WHERE polrelid = 'public.challenges'::regclass 
            AND polname = 'Users can view their own challenges'
          ) THEN
            CREATE POLICY "Users can view their own challenges"
              ON public.challenges FOR ALL
              USING (auth.uid() = user_id);
          END IF;
        END $$;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS challenges_user_id_idx ON public.challenges(user_id);
        
        -- Grant necessary permissions
        GRANT ALL ON public.challenges TO authenticated;
        GRANT ALL ON public.challenges TO service_role;
      `;
      
      // Execute the SQL to ensure the table exists
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Failed to create challenges table via SQL:', sqlError);
        // Continue anyway, as the table might already exist
      }
      
      // Now try to insert into the challenges table
      const { error: challengeError } = await supabase
        .from('challenges')
        .insert({
          id: savedPlan.id,
          user_id,
          title: plan.title,
          description: plan.description,
          category: difficulty || 'General',
          created_at: new Date().toISOString()
        })
      
      if (challengeError) {
        console.log('Failed to insert into challenges table, but challenge_plans insertion was successful:', challengeError)
        
        // If the error is about the category column not existing, try inserting without it
        if (challengeError.message && challengeError.message.includes('category')) {
          console.log('Trying to insert without category column...')
          const { error: retryError } = await supabase
            .from('challenges')
            .insert({
              id: savedPlan.id,
              user_id,
              title: plan.title,
              description: plan.description,
              created_at: new Date().toISOString()
            })
          
          if (retryError) {
            console.log('Still failed to insert into challenges table:', retryError)
          } else {
            console.log('Successfully inserted into challenges table without category')
          }
        }
      }
    }

    if (planError) {
      console.error('Supabase error when saving challenge plan:', planError)
      console.error('Plan data that failed to save:', {
        title: plan.title,
        description: plan.description.substring(0, 50) + '...',
        metrics: JSON.stringify(plan.metrics).substring(0, 200) + '...',
        days_type: typeof daysData,
        days_is_array: Array.isArray(daysData),
        days_length: Array.isArray(daysData) ? daysData.length : 'N/A',
        days_sample: Array.isArray(daysData) ? JSON.stringify(daysData[0]).substring(0, 100) + '...' : 'N/A',
        days_stringified: JSON.stringify(daysData).substring(0, 200) + '...',
        days_stringified_type: typeof JSON.stringify(daysData),
        days_keys: Array.isArray(daysData) ? Object.keys(daysData[0]).join(', ') : 'N/A',
        user_id: user_id,
        error_code: planError.code,
        error_message: planError.message,
        error_details: planError.details,
        error_hint: planError.hint,
        schema: 'challenge_plans(id UUID, user_id UUID, title TEXT, description TEXT, days JSONB, metrics JSONB, created_at TIMESTAMP)'
      })
      
      // Try to diagnose specific issues
      let diagnosticHint = 'Check data format and database schema compatibility';
      if (planError.code === '22P02') {
        diagnosticHint = 'Invalid input syntax for type. Ensure days data is a valid JSON object.';
      } else if (planError.code === '23503') {
        diagnosticHint = 'Foreign key violation. Ensure user_id exists in auth.users table.';
      } else if (planError.code === '23505') {
        diagnosticHint = 'Unique constraint violation. A record with this key already exists.';
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save challenge plan', 
          details: planError.message,
          code: planError.code,
          hint: planError.hint || diagnosticHint,
          debug_info: {
            days_type: typeof daysData,
            days_stringified_type: typeof JSON.stringify(daysData),
            days_length: Array.isArray(daysData) ? daysData.length : 'N/A'
          }
        },
        { status: 500 }
      )
    }

    // Create daily progress table if it doesn't exist
    const { error: createTableError } = await supabase
      .rpc('create_daily_progress_table')

    // The corresponding SQL function should be created in Supabase SQL editor:
    /*
    create or replace function create_daily_progress_table()
    returns void
    language plpgsql
    security definer
    set search_path = ''
    as $$
    begin
      create table if not exists public.daily_progress (
        id uuid default uuid_generate_v4() primary key,
        user_id uuid references auth.users(id) on delete cascade,
        challenge_id uuid references public.challenges(id) on delete cascade,
        day integer not null,
        completed_tasks boolean[] not null,
        proof_text text not null,
        proof_file text default null,
        completed_at timestamp with time zone default timezone('utc'::text, now()),
        unique(user_id, challenge_id, day)
      );
      
      create index if not exists daily_progress_user_id_idx on public.daily_progress(user_id);
      create index if not exists daily_progress_challenge_id_idx on public.daily_progress(challenge_id);
      
      -- Grant necessary permissions
      grant all on public.daily_progress to authenticated;
      grant all on public.daily_progress to service_role;
      
      -- Enable RLS
      alter table public.daily_progress enable row level security;
      
      -- Create RLS policies
      drop policy if exists "Users can view their own daily progress" on public.daily_progress;
      create policy "Users can view their own daily progress"
        on public.daily_progress for all
        using (auth.uid() = user_id);
    end;
    $$;
    */

    if (createTableError) {
      console.error('Failed to create daily_progress table:', createTableError)
      return NextResponse.json(
        { error: 'Failed to initialize challenge tracking' },
        { status: 500 }
      )
    }

    // Ensure we have the correct data format for daily progress records
    const daysArray = Array.isArray(daysData) ? daysData : 
                     (typeof daysData === 'string' ? JSON.parse(daysData) : []);
    
    if (!Array.isArray(daysArray) || daysArray.length !== 30) {
      console.error('Invalid days array for daily progress records:', {
        days_type: typeof daysArray,
        days_is_array: Array.isArray(daysArray),
        days_length: Array.isArray(daysArray) ? daysArray.length : 'N/A'
      });
      return NextResponse.json(
        { error: 'Failed to create daily progress records: invalid days data' },
        { status: 500 }
      );
    }
    
    // Create daily progress records
    const dailyProgressRecords = Array.from({ length: 30 }, (_, i) => {
      // Ensure tasks is an array
      const tasks = Array.isArray(daysArray[i]?.tasks) ? daysArray[i].tasks : [];
      
      return {
        user_id,
        challenge_id: savedPlan.id, // Add the challenge_id reference
        day: i + 1,
        completed_tasks: tasks.map(() => false), // Initialize all tasks as not completed
        proof_text: "", // Empty proof text initially
      }
    })

    // Try to insert daily progress records, but don't fail if there are duplicates
    // We'll handle the error if it's a duplicate key violation (code 23505)
    const { error: progressError } = await supabase
      .from('daily_progress')
      .insert(dailyProgressRecords)

    if (progressError) {
      // If it's a duplicate key violation (23505), we can ignore it and continue
      // This happens when a user already has progress records for these days
      if (progressError.code === '23505') {
        console.log('Duplicate daily progress records detected, continuing with existing records')
      } else {
        console.error('Failed to create daily progress records:', progressError)
        console.error('Daily progress data that failed to save:', {
          records_count: dailyProgressRecords.length,
          sample_record: JSON.stringify(dailyProgressRecords[0]).substring(0, 200) + '...',
          sample_completed_tasks: JSON.stringify(dailyProgressRecords[0].completed_tasks).substring(0, 100) + '...',
          schema_fields: 'user_id, day, completed_tasks, proof_text',
          error_code: progressError.code,
          error_message: progressError.message,
          error_details: progressError.details,
          error_hint: progressError.hint
        })
        
        // Delete the challenge plan from both tables if progress records creation fails
        // (but only if it's not a duplicate key violation)
        await supabase.from('challenge_plans').delete().eq('id', savedPlan.id)
        await supabase.from('challenges').delete().eq('id', savedPlan.id)
        
        return NextResponse.json(
          { 
            error: 'Failed to initialize challenge progress',
            details: progressError.message,
            code: progressError.code,
            hint: progressError.hint || 'Check data format and database schema compatibility'
          },
          { status: 500 }
        )
      }
    }

    // Return success response with the saved plan
    return NextResponse.json(
      { 
        success: true,
        plan: savedPlan,
        message: 'Challenge plan created successfully'
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Plan generation failed:', err)
    const isGroqError = err instanceof Error && err.message.includes('Groq')
    const statusCode = isGroqError ? 503 : 500
    const errorMessage = err instanceof Error 
      ? err.message
      : 'An unexpected error occurred while generating the plan'

    return NextResponse.json(
      { 
        error: errorMessage,
        code: isGroqError ? 'GROQ_API_ERROR' : 'INTERNAL_SERVER_ERROR'
      },
      { status: statusCode }
    )
  }
}