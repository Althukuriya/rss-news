-- Settings table (key-value pairs)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'rejected')),
  source_url TEXT,
  source_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  hashtags TEXT,
  faq TEXT DEFAULT '[]',
  author TEXT,
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  read_time INTEGER,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  is_auto_generated INTEGER DEFAULT 0,
  is_breaking INTEGER DEFAULT 0
);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  article_id TEXT NOT NULL,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  summary TEXT,
  seo_title TEXT,
  seo_description TEXT,
  slug TEXT,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE(article_id, language_code)
);

-- Affiliate keywords table
CREATE TABLE IF NOT EXISTS affiliate_keywords (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  keyword TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  is_global INTEGER DEFAULT 1,
  article_id TEXT,
  link_all_occurrences INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- RSS sources table
CREATE TABLE IF NOT EXISTS rss_sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT,
  language TEXT DEFAULT 'en',
  is_active INTEGER DEFAULT 1,
  fetch_interval_minutes INTEGER DEFAULT 30,
  last_fetched_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Live scores table
CREATE TABLE IF NOT EXISTS live_scores (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sport TEXT NOT NULL,
  match_title TEXT NOT NULL,
  team1 TEXT,
  team2 TEXT,
  score1 TEXT,
  score2 TEXT,
  status TEXT,
  match_time TEXT,
  league TEXT,
  source_url TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  keyword TEXT NOT NULL,
  region TEXT NOT NULL,
  volume INTEGER,
  fetched_at TEXT DEFAULT (datetime('now'))
);

-- Ad slots table
CREATE TABLE IF NOT EXISTS ad_slots (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slot_name TEXT NOT NULL,
  slot_position TEXT NOT NULL,
  ad_network TEXT NOT NULL,
  ad_code TEXT,
  is_active INTEGER DEFAULT 1
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  keyword_id TEXT,
  article_id TEXT,
  clicked_at TEXT DEFAULT (datetime('now')),
  ip_hash TEXT,
  FOREIGN KEY (keyword_id) REFERENCES affiliate_keywords(id) ON DELETE SET NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  article_id TEXT,
  viewed_at TEXT DEFAULT (datetime('now')),
  ip_hash TEXT,
  language_code TEXT,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- Deals table for affiliate products
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT,
  original_price TEXT,
  affiliate_url TEXT NOT NULL,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Article generation queue
CREATE TABLE IF NOT EXISTS article_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  source_type TEXT NOT NULL,
  source_url TEXT,
  source_text TEXT,
  topic TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TEXT DEFAULT (datetime('now')),
  processed_at TEXT,
  article_id TEXT,
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Generation jobs table for bulk generation
CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  total INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  auto_publish INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  results TEXT DEFAULT '[]'
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
('site_name', 'NewsFlow AI'),
('site_tagline', 'AI-Powered News & Media Platform'),
('site_url', 'https://newsflow.ai'),
('logo_url', ''),
('favicon_url', ''),
('author_name', 'NewsFlow Team'),
('author_bio', 'Dedicated to delivering the latest news with AI-powered insights.'),
('author_photo_url', ''),
('contact_email', 'contact@newsflow.ai'),
('contact_phone', ''),
('social_twitter', ''),
('social_facebook', ''),
('social_instagram', ''),
('social_youtube', ''),
('social_telegram', ''),
('social_whatsapp', ''),
('google_search_console_code', ''),
('google_analytics_id', ''),
('adsense_publisher_id', ''),
('adsterra_publisher_id', ''),
('auto_publish', 'true'),
('auto_publish_limit', '10'),
('auto_publish_categories', 'india,world,business,technology,sports,entertainment'),
('min_word_count', '400'),
('translate_languages', 'hi,ta,te,kn,ml,bn,mr,gu'),
('trends_fetch_interval', '2'),
('trending_regions', 'IN,US,GB,AE'),
('breaking_news_ticker', 'true'),
('comments_enabled', 'false'),
('disqus_shortname', ''),
('theme_mode', 'light'),
('privacy_policy', 'Privacy Policy content goes here.'),
('about_page', 'About Us content goes here.'),
('disclaimer', 'Disclaimer content goes here.');

-- Insert default RSS sources
INSERT OR IGNORE INTO rss_sources (id, name, url, category, language, is_active, fetch_interval_minutes) VALUES
('rss01', 'NDTV', 'https://feeds.feedburner.com/ndtvnews-top-stories', 'india', 'en', 1, 30),
('rss02', 'Times of India', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', 'india', 'en', 1, 30),
('rss03', 'The Hindu', 'https://www.thehindu.com/feeder/default.rss', 'india', 'en', 1, 30),
('rss04', 'Economic Times', 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', 'business', 'en', 1, 30),
('rss05', 'BBC India', 'http://feeds.bbci.co.uk/news/world/asia/india/rss.xml', 'india', 'en', 1, 30),
('rss06', 'BBC World', 'http://feeds.bbci.co.uk/news/world/rss.xml', 'world', 'en', 1, 30),
('rss07', 'Reuters', 'https://feeds.reuters.com/reuters/topNews', 'world', 'en', 1, 30),
('rss08', 'Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', 'world', 'en', 1, 30),
('rss09', 'India Today', 'https://www.indiatoday.in/rss/home', 'india', 'en', 1, 30),
('rss10', 'Hindustan Times', 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', 'india', 'en', 1, 30);

-- Insert default ad slots
INSERT OR IGNORE INTO ad_slots (id, slot_name, slot_position, ad_network, is_active) VALUES
('ad01', 'Header Banner', 'header', 'adsense', 0),
('ad02', 'In Article', 'in-article', 'adsense', 0),
('ad03', 'Sidebar', 'sidebar', 'adsense', 0),
('ad04', 'Footer', 'footer', 'adsense', 0),
('ad05', 'Between Articles', 'between-articles', 'adsense', 0),
('ad06', 'Popunder', 'popunder', 'adsterra', 0),
('ad07', 'Native Banner', 'native', 'adsterra', 0),
('ad08', 'Social Bar', 'social-bar', 'adsterra', 0);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_translations_article_id ON translations(article_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_keywords_article ON affiliate_keywords(article_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_keyword ON affiliate_clicks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_page_views_article ON page_views(article_id);
CREATE INDEX IF NOT EXISTS idx_rss_sources_active ON rss_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_live_scores_sport ON live_scores(sport);
CREATE INDEX IF NOT EXISTS idx_trending_region ON trending_topics(region);
