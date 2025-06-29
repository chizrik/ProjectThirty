-- Complete Database Setup for ProjectThirty Challenge Application
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.daily_progress CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.challenge_plans CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 1. Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create challenges table
CREATE TABLE public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'medium',
  time_commitment INTEGER DEFAULT 30, -- minutes per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create challenge_plans table (for AI-generated challenge plans)
CREATE TABLE public.challenge_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'medium',
  days JSONB NOT NULL DEFAULT '[]', -- Array of daily tasks and structure
  metrics JSONB DEFAULT '{}', -- Success likelihood, effort level, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create daily_progress table
CREATE TABLE public.daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_tasks BOOLEAN[] DEFAULT '{}', -- Array of task completion status
  reflection TEXT,
  ai_feedback TEXT,
  proof_text TEXT DEFAULT '',
  proof_file TEXT,
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  completion_rating INTEGER CHECK (completion_rating >= 1 AND completion_rating <= 10),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, day)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX idx_challenges_created_at ON public.challenges(created_at);
CREATE INDEX idx_challenge_plans_user_id ON public.challenge_plans(user_id);
CREATE INDEX idx_daily_progress_user_id ON public.daily_progress(user_id);
CREATE INDEX idx_daily_progress_challenge_id ON public.daily_progress(challenge_id);
CREATE INDEX idx_daily_progress_day ON public.daily_progress(day);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_plans_updated_at BEFORE UPDATE ON public.challenge_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON public.daily_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Users can view own challenges" ON public.challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges" ON public.challenges
  FOR DELETE USING (auth.uid() = user_id);

-- Challenge plans policies
CREATE POLICY "Users can view own challenge plans" ON public.challenge_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge plans" ON public.challenge_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge plans" ON public.challenge_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge plans" ON public.challenge_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Daily progress policies
CREATE POLICY "Users can view own daily progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily progress" ON public.daily_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.challenges TO authenticated;
GRANT ALL ON public.challenge_plans TO authenticated;
GRANT ALL ON public.daily_progress TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data will be created automatically when users sign up and create challenges
-- No sample data insertion needed as it would violate foreign key constraints

-- Verification queries
SELECT 'Database setup completed successfully!' as status;
SELECT 
  'user_profiles' as table_name, 
  COUNT(*) as record_count 
FROM public.user_profiles
UNION ALL
SELECT 
  'challenges' as table_name, 
  COUNT(*) as record_count 
FROM public.challenges
UNION ALL
SELECT 
  'challenge_plans' as table_name, 
  COUNT(*) as record_count 
FROM public.challenge_plans
UNION ALL
SELECT 
  'daily_progress' as table_name, 
  COUNT(*) as record_count 
FROM public.daily_progress;

-- Show table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'challenges', 'challenge_plans', 'daily_progress')
ORDER BY table_name, ordinal_position;