-- Create table for mood responses
CREATE TABLE public.mood_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_text TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.mood_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read moods (public feature)
CREATE POLICY "Anyone can view moods"
  ON public.mood_responses
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert moods (public feature)
CREATE POLICY "Anyone can share moods"
  ON public.mood_responses
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries by date
CREATE INDEX idx_mood_responses_created_at ON public.mood_responses(created_at DESC);

-- Enable realtime for the table
ALTER TABLE public.mood_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_responses;