export interface Setting {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  body: string;
  summary: string | null;
  category: string;
  language: string;
  status: 'draft' | 'published' | 'rejected';
  source_url: string | null;
  source_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  hashtags: string[] | null;
  faq: FAQItem[];
  author: string | null;
  thumbnail_url: string | null;
  view_count: number;
  read_time: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_auto_generated: boolean;
  is_breaking: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Translation {
  id: string;
  article_id: string;
  language_code: string;
  title: string;
  body: string;
  summary: string | null;
  seo_title: string | null;
  seo_description: string | null;
  slug: string | null;
  status: string;
  created_at: string;
}

export interface AffiliateKeyword {
  id: string;
  keyword: string;
  affiliate_url: string;
  is_global: boolean;
  article_id: string | null;
  link_all_occurrences: boolean;
  click_count: number;
  created_at: string;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: string | null;
  language: string;
  is_active: boolean;
  fetch_interval_minutes: number;
  last_fetched_at: string | null;
  created_at: string;
}

export interface LiveScore {
  id: string;
  sport: string;
  match_title: string;
  team1: string | null;
  team2: string | null;
  score1: string | null;
  score2: string | null;
  status: string | null;
  match_time: string | null;
  league: string | null;
  source_url: string | null;
  updated_at: string;
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  region: string;
  volume: number | null;
  fetched_at: string;
}

export interface AdSlot {
  id: string;
  slot_name: string;
  slot_position: string;
  ad_network: 'adsense' | 'adsterra';
  ad_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AffiliateClick {
  id: string;
  keyword_id: string | null;
  article_id: string | null;
  clicked_at: string;
  ip_hash: string | null;
}

export interface PageView {
  id: string;
  article_id: string | null;
  viewed_at: string;
  ip_hash: string | null;
  language_code: string | null;
}

export interface Deal {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  original_price: string | null;
  affiliate_url: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ArticleQueue {
  id: string;
  source_type: string;
  source_url: string | null;
  source_text: string | null;
  topic: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at: string | null;
  article_id: string | null;
}

export interface DashboardStats {
  articlesToday: number;
  articlesThisWeek: number;
  articlesThisMonth: number;
  pageViewsToday: number;
  topArticles: Article[];
  affiliateClicksToday: number;
  affiliateClicksThisWeek: number;
  activeSources: number;
  lastTrendFetch: string | null;
}

export const CATEGORIES = [
  { slug: 'india', name: 'India News' },
  { slug: 'world', name: 'World' },
  { slug: 'business', name: 'Business' },
  { slug: 'technology', name: 'Technology' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'entertainment', name: 'Entertainment' },
  { slug: 'science', name: 'Science' },
  { slug: 'health', name: 'Health' },
  { slug: 'education', name: 'Education' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'weather', name: 'Weather' }
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese Simplified' }
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];
export type LanguageCode = typeof LANGUAGES[number]['code'];
