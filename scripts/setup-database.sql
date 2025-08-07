-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  embed_link TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on channels" ON channels
  FOR SELECT USING (true);

-- Create policies to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on channels" ON channels
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_category_id ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert some sample data
INSERT INTO categories (name) VALUES 
  ('Bengali'),
  ('Hindi'),
  ('Sports'),
  ('Kids'),
  ('Music')
ON CONFLICT (name) DO NOTHING;
