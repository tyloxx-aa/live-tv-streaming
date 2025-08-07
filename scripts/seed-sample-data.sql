-- Insert sample channels (you can modify these)
WITH category_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO channels (name, logo_url, embed_link, category_id) VALUES 
  -- Bengali Channels
  ('Star Jalsha', 'https://example.com/star-jalsha-logo.png', 'https://example.com/embed/star-jalsha', (SELECT id FROM category_ids WHERE name = 'Bengali')),
  ('Zee Bangla', 'https://example.com/zee-bangla-logo.png', 'https://example.com/embed/zee-bangla', (SELECT id FROM category_ids WHERE name = 'Bengali')),
  
  -- Hindi Channels
  ('Star Plus', 'https://example.com/star-plus-logo.png', 'https://example.com/embed/star-plus', (SELECT id FROM category_ids WHERE name = 'Hindi')),
  ('Colors TV', 'https://example.com/colors-logo.png', 'https://example.com/embed/colors', (SELECT id FROM category_ids WHERE name = 'Hindi')),
  
  -- Sports Channels
  ('Star Sports 1', 'https://example.com/star-sports-logo.png', 'https://example.com/embed/star-sports-1', (SELECT id FROM category_ids WHERE name = 'Sports')),
  ('Sony Ten 1', 'https://example.com/sony-ten-logo.png', 'https://example.com/embed/sony-ten-1', (SELECT id FROM category_ids WHERE name = 'Sports')),
  
  -- Kids Channels
  ('Cartoon Network', 'https://example.com/cn-logo.png', 'https://example.com/embed/cartoon-network', (SELECT id FROM category_ids WHERE name = 'Kids')),
  ('Disney Channel', 'https://example.com/disney-logo.png', 'https://example.com/embed/disney', (SELECT id FROM category_ids WHERE name = 'Kids')),
  
  -- Music Channels
  ('MTV', 'https://example.com/mtv-logo.png', 'https://example.com/embed/mtv', (SELECT id FROM category_ids WHERE name = 'Music')),
  ('9XM', 'https://example.com/9xm-logo.png', 'https://example.com/embed/9xm', (SELECT id FROM category_ids WHERE name = 'Music'))
ON CONFLICT DO NOTHING;
