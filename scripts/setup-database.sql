-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS daily_reflections CASCADE;
DROP TABLE IF EXISTS daily_progress CASCADE;
DROP TABLE IF EXISTS challenge_plans CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  preferences JSONB DEFAULT '{
    "time_commitment": "30 mins",
    "goal": "",
    "notifications_enabled": true
  }'::jsonb,
  plan JSONB DEFAULT NULL,
  daily_feedback JSONB[] DEFAULT '{}',
  uploads JSONB[] DEFAULT '{}'
);

-- Create challenge_plans table
CREATE TABLE challenge_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  days JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_progress table
CREATE TABLE daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenge_plans(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  completed_tasks BOOLEAN[] NOT NULL,
  proof_text TEXT NOT NULL,
  proof_file TEXT DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Create daily_reflections table
CREATE TABLE daily_reflections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  motivation INTEGER NOT NULL CHECK (motivation >= 1 AND motivation <= 10),
  completion INTEGER NOT NULL CHECK (completion >= 1 AND completion <= 10),
  reflection TEXT DEFAULT '',
  ai_feedback TEXT NOT NULL,
  bonus_task TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own plans" ON challenge_plans;
DROP POLICY IF EXISTS "Users can create own plans" ON challenge_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON challenge_plans;

DROP POLICY IF EXISTS "Users can view own progress" ON daily_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON daily_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON daily_progress;

DROP POLICY IF EXISTS "Users can view own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can create own reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON daily_reflections;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for challenge_plans
CREATE POLICY "Users can view own plans" ON challenge_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" ON challenge_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON challenge_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for daily_progress
CREATE POLICY "Users can view own progress" ON daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for daily_reflections
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_challenge_plans_user_id ON challenge_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_challenge_id ON daily_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_day ON daily_progress(user_id, day);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_day ON daily_reflections(user_id, day);

-- Verify tables were created
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'challenge_plans', 'daily_progress', 'daily_reflections');
