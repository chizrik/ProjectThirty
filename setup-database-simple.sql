-- Simple Database Setup Script (UUID compatible)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Drop existing challenges table if it exists (to handle schema conflicts)
DROP TABLE IF EXISTS public.daily_progress CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.challenge_plans CASCADE;

-- Step 1.1: Create the challenges table with UUID
CREATE TABLE public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create daily_progress table
CREATE TABLE public.daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  completed_tasks BOOLEAN[] NOT NULL DEFAULT '{}',
  proof_text TEXT NOT NULL DEFAULT '',
  proof_file TEXT DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Step 3: Create challenge_plans table
CREATE TABLE public.challenge_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  days JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Insert sample challenge data
INSERT INTO public.challenges (
    title,
    description,
    category
) 
SELECT 
    '30-Day Fitness Challenge',
    'A comprehensive 30-day fitness program designed to build strength, endurance, and healthy habits. Each day includes specific exercises and goals to help you transform your fitness level.',
    'Fitness'
WHERE NOT EXISTS (
    SELECT 1 FROM public.challenges WHERE title = '30-Day Fitness Challenge'
);

-- Step 5: Insert sample daily progress data
WITH challenge_data AS (
  SELECT id FROM public.challenges WHERE title = '30-Day Fitness Challenge' LIMIT 1
)
INSERT INTO public.daily_progress (user_id, challenge_id, day, completed_tasks, proof_text, proof_file, completed_at)
SELECT 
  NULL as user_id,
  challenge_data.id as challenge_id,
  day_data.day,
  day_data.completed_tasks,
  day_data.proof_text,
  day_data.proof_file,
  day_data.completed_at
FROM challenge_data, (
VALUES 
  (1, ARRAY[true,true,false], 'Completed day 1 workout', NULL, NOW() - INTERVAL '29 days'),
  (2, ARRAY[true,true,true], 'Completed day 2 workout', NULL, NOW() - INTERVAL '28 days'),
  (3, ARRAY[true,false,true], 'Completed day 3 workout', NULL, NOW() - INTERVAL '27 days'),
  (4, ARRAY[true,true,true], 'Completed day 4 workout', NULL, NOW() - INTERVAL '26 days'),
  (5, ARRAY[true,true,false], 'Completed day 5 workout', NULL, NOW() - INTERVAL '25 days'),
  (6, ARRAY[true,true,true], 'Completed day 6 workout', NULL, NOW() - INTERVAL '24 days'),
  (7, ARRAY[true,false,true], 'Completed day 7 workout', NULL, NOW() - INTERVAL '23 days'),
  (8, ARRAY[true,true,true], 'Completed day 8 workout', NULL, NOW() - INTERVAL '22 days'),
  (9, ARRAY[true,true,false], 'Completed day 9 workout', NULL, NOW() - INTERVAL '21 days'),
  (10, ARRAY[true,true,true], 'Completed day 10 workout', NULL, NOW() - INTERVAL '20 days'),
  (11, ARRAY[true,false,true], 'Completed day 11 workout', NULL, NOW() - INTERVAL '19 days'),
  (12, ARRAY[false,false,false], 'Missed day 12', NULL, NOW() - INTERVAL '18 days'),
  (13, ARRAY[true,true,true], 'Completed day 13 workout', NULL, NOW() - INTERVAL '17 days'),
  (14, ARRAY[true,true,false], 'Completed day 14 workout', NULL, NOW() - INTERVAL '16 days'),
  (15, ARRAY[false,false,false], 'Missed day 15', NULL, NOW() - INTERVAL '15 days'),
  (16, ARRAY[true,true,true], 'Completed day 16 workout', NULL, NOW() - INTERVAL '14 days'),
  (17, ARRAY[true,false,true], 'Completed day 17 workout', NULL, NOW() - INTERVAL '13 days'),
  (18, ARRAY[true,true,true], 'Completed day 18 workout', NULL, NOW() - INTERVAL '12 days'),
  (19, ARRAY[true,true,false], 'Completed day 19 workout', NULL, NOW() - INTERVAL '11 days'),
  (20, ARRAY[true,true,true], 'Completed day 20 workout', NULL, NOW() - INTERVAL '10 days'),
  (21, ARRAY[false,false,false], 'Pending day 21', NULL, NOW() - INTERVAL '9 days'),
  (22, ARRAY[false,false,false], 'Pending day 22', NULL, NOW() - INTERVAL '8 days'),
  (23, ARRAY[false,false,false], 'Pending day 23', NULL, NOW() - INTERVAL '7 days'),
  (24, ARRAY[false,false,false], 'Pending day 24', NULL, NOW() - INTERVAL '6 days'),
  (25, ARRAY[false,false,false], 'Pending day 25', NULL, NOW() - INTERVAL '5 days'),
  (26, ARRAY[false,false,false], 'Pending day 26', NULL, NOW() - INTERVAL '4 days'),
  (27, ARRAY[false,false,false], 'Pending day 27', NULL, NOW() - INTERVAL '3 days'),
  (28, ARRAY[false,false,false], 'Pending day 28', NULL, NOW() - INTERVAL '2 days'),
  (29, ARRAY[false,false,false], 'Pending day 29', NULL, NOW() - INTERVAL '1 day'),
  (30, ARRAY[false,false,false], 'Pending day 30', NULL, NOW())
) AS day_data(day, completed_tasks, proof_text, proof_file, completed_at)
ON CONFLICT (user_id, day) DO NOTHING;

-- Step 6: Insert sample challenge plan data
INSERT INTO public.challenge_plans (
    title,
    description,
    category,
    days,
    metrics
) 
SELECT 
    '30-Day Fitness Challenge',
    'A comprehensive 30-day fitness program designed to build strength, endurance, and healthy habits.',
    'Fitness',
    '{}',
    '{"success_likelihood":80,"effort_level":"moderate","time_per_day":60,"difficulty_level":"intermediate"}'
WHERE NOT EXISTS (
    SELECT 1 FROM public.challenge_plans WHERE title = '30-Day Fitness Challenge'
);

-- Step 7: Grant permissions (disable RLS for testing)
GRANT ALL ON public.challenges TO anon, authenticated;
GRANT ALL ON public.daily_progress TO anon, authenticated;
GRANT ALL ON public.challenge_plans TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Disable RLS for testing (enable later for production)
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_plans DISABLE ROW LEVEL SECURITY;

-- Verification queries
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as challenges_count FROM public.challenges;
SELECT COUNT(*) as progress_count FROM public.daily_progress;
SELECT COUNT(*) as plans_count FROM public.challenge_plans;