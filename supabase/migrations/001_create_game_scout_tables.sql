-- Create game tags table
CREATE TABLE IF NOT EXISTS game_tags_a4b7c8d9e2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create game platforms table
CREATE TABLE IF NOT EXISTS game_platforms_a4b7c8d9e2 (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games_a4b7c8d9e2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  released DATE,
  rating NUMERIC(3,2),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create game-genre relations table
CREATE TABLE IF NOT EXISTS game_genre_relations_a4b7c8d9e2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games_a4b7c8d9e2(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES game_tags_a4b7c8d9e2(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, tag_id)
);

-- Create game-platform relations table
CREATE TABLE IF NOT EXISTS game_platform_relations_a4b7c8d9e2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games_a4b7c8d9e2(id) ON DELETE CASCADE,
  platform_id INTEGER REFERENCES game_platforms_a4b7c8d9e2(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, platform_id)
);

-- Enable RLS
ALTER TABLE game_tags_a4b7c8d9e2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms_a4b7c8d9e2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE games_a4b7c8d9e2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_genre_relations_a4b7c8d9e2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platform_relations_a4b7c8d9e2 ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON game_tags_a4b7c8d9e2 FOR SELECT USING (true);
CREATE POLICY "Public read access" ON game_platforms_a4b7c8d9e2 FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games_a4b7c8d9e2 FOR SELECT USING (true);
CREATE POLICY "Public read access" ON game_genre_relations_a4b7c8d9e2 FOR SELECT USING (true);
CREATE POLICY "Public read access" ON game_platform_relations_a4b7c8d9e2 FOR SELECT USING (true);

-- Insert sample platforms
INSERT INTO game_platforms_a4b7c8d9e2 (id, name, slug) VALUES
  (1, 'PC', 'pc'),
  (2, 'PlayStation', 'playstation'),
  (3, 'Xbox', 'xbox'),
  (7, 'Nintendo', 'nintendo')
ON CONFLICT (id) DO NOTHING;

-- Insert sample genres/tags
INSERT INTO game_tags_a4b7c8d9e2 (name, slug) VALUES
  ('Action', 'action'),
  ('Adventure', 'adventure'),
  ('RPG', 'rpg'),
  ('Strategy', 'strategy'),
  ('Simulation', 'simulation'),
  ('Racing', 'racing'),
  ('Sports', 'sports'),
  ('Puzzle', 'puzzle'),
  ('Horror', 'horror'),
  ('Shooter', 'shooter'),
  ('Fighting', 'fighting'),
  ('Platformer', 'platformer'),
  ('Casual', 'casual'),
  ('Indie', 'indie'),
  ('Multiplayer', 'multiplayer'),
  ('Singleplayer', 'singleplayer'),
  ('Co-op', 'co-op'),
  ('Open World', 'open-world'),
  ('Cyberpunk', 'cyberpunk'),
  ('Fantasy', 'fantasy'),
  ('Sci-Fi', 'sci-fi'),
  ('Retro', 'retro'),
  ('Pixel Art', 'pixel-art'),
  ('Story Rich', 'story-rich'),
  ('Atmospheric', 'atmospheric')
ON CONFLICT (name) DO NOTHING;

-- Create function to execute SQL (for query helper)
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS TABLE(result JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query_text;
END;
$$;