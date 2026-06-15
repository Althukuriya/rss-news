const API_URL = import.meta.env.VITE_API_URL || '';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('adminToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Settings
export async function getSettings(): Promise<Record<string, string>> {
  const data = await apiRequest('/api/settings');
  const settings: Record<string, string> = {};
  data.forEach((item: { key: string; value: string | null }) => {
    settings[item.key] = item.value || '';
  });
  return settings;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await apiRequest('/api/settings', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
}

// Articles
export async function getArticles(options: {
  status?: string;
  category?: string;
  language?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  isBreaking?: boolean;
} = {}): Promise<{ data: any[]; count: number }> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.category) params.set('category', options.category);
  if (options.language) params.set('language', options.language);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());
  if (options.orderBy) params.set('orderBy', options.orderBy);
  if (options.isBreaking) params.set('isBreaking', 'true');

  return apiRequest(`/api/articles?${params.toString()}`);
}

export async function getArticleBySlug(slug: string): Promise<any> {
  return apiRequest(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function getArticleById(id: string): Promise<any> {
  return apiRequest(`/api/articles/id/${id}`);
}

export async function createArticle(article: any): Promise<any> {
  return apiRequest('/api/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  });
}

export async function updateArticle(id: string, updates: any): Promise<any> {
  return apiRequest(`/api/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await apiRequest(`/api/articles/${id}`, { method: 'DELETE' });
}

export async function searchArticles(searchTerm: string, options?: { category?: string; language?: string }): Promise<any[]> {
  const params = new URLSearchParams();
  params.set('q', searchTerm);
  if (options?.category) params.set('category', options.category);
  if (options?.language) params.set('language', options.language);
  return apiRequest(`/api/search?${params.toString()}`);
}

export async function getRelatedArticles(articleId: string, category: string, limit: number = 4): Promise<any[]> {
  return apiRequest(`/api/articles/${articleId}/related?category=${category}&limit=${limit}`);
}

// Translations
export async function getTranslations(articleId: string): Promise<any[]> {
  return apiRequest(`/api/articles/${articleId}/translations`);
}

export async function translateArticle(articleId: string, languageCode: string): Promise<any> {
  return apiRequest('/api/articles/translate', {
    method: 'POST',
    body: JSON.stringify({ article_id: articleId, language_code: languageCode }),
  });
}

// Affiliate Keywords
export async function getAffiliateKeywords(articleId?: string): Promise<any[]> {
  const params = articleId ? `?articleId=${articleId}` : '';
  return apiRequest(`/api/affiliates${params}`);
}

export async function createAffiliateKeyword(keyword: any): Promise<any> {
  return apiRequest('/api/affiliates', {
    method: 'POST',
    body: JSON.stringify(keyword),
  });
}

export async function deleteAffiliateKeyword(id: string): Promise<void> {
  await apiRequest(`/api/affiliates/${id}`, { method: 'DELETE' });
}

export async function trackAffiliateClick(keywordId: string, articleId: string): Promise<void> {
  await apiRequest('/api/affiliates/track', {
    method: 'POST',
    body: JSON.stringify({ keyword_id: keywordId, article_id: articleId }),
  });
}

// RSS Sources
export async function getRSSSources(): Promise<any[]> {
  return apiRequest('/api/rss-sources');
}

export async function createRSSSource(source: any): Promise<any> {
  return apiRequest('/api/rss-sources', {
    method: 'POST',
    body: JSON.stringify(source),
  });
}

export async function updateRSSSource(id: string, updates: any): Promise<any> {
  return apiRequest(`/api/rss-sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteRSSSource(id: string): Promise<void> {
  await apiRequest(`/api/rss-sources/${id}`, { method: 'DELETE' });
}

// Live Scores
export async function getLiveScores(): Promise<any[]> {
  return apiRequest('/api/live-scores');
}

export async function createLiveScore(score: any): Promise<any> {
  return apiRequest('/api/live-scores', {
    method: 'POST',
    body: JSON.stringify(score),
  });
}

export async function updateLiveScore(id: string, updates: any): Promise<any> {
  return apiRequest(`/api/live-scores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteLiveScore(id: string): Promise<void> {
  await apiRequest(`/api/live-scores/${id}`, { method: 'DELETE' });
}

// Ad Slots
export async function getAdSlots(): Promise<any[]> {
  return apiRequest('/api/ad-slots');
}

export async function updateAdSlot(id: string, updates: any): Promise<any> {
  return apiRequest(`/api/ad-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Deals
export async function getDeals(): Promise<any[]> {
  return apiRequest('/api/deals');
}

// Trending Topics
export async function getTrendingTopics(): Promise<any[]> {
  return apiRequest('/api/trending');
}

// Page Views
export async function trackPageView(articleId: string, languageCode: string = 'en'): Promise<void> {
  await apiRequest('/api/page-views', {
    method: 'POST',
    body: JSON.stringify({ article_id: articleId, language_code: languageCode }),
  });
}

// Admin Auth
export async function adminLogin(password: string): Promise<{ token: string }> {
  const response = await apiRequest('/api/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return response;
}

export function clearAdminAuth() {
  localStorage.removeItem('adminToken');
}

export function isAdminLoggedIn(): boolean {
  return !!localStorage.getItem('adminToken');
}

// Article Generation
export async function generateArticle(content: string, type: 'topic' | 'url' | 'text'): Promise<any> {
  return apiRequest('/api/articles/generate', {
    method: 'POST',
    body: JSON.stringify({ content, type }),
  });
}

export async function bulkGenerateArticles(count: number, autoPublish: boolean): Promise<{ message: string; jobId: string }> {
  return apiRequest('/api/articles/bulk-generate', {
    method: 'POST',
    body: JSON.stringify({ count, autoPublish }),
  });
}

export async function getGenerationJobStatus(jobId: string): Promise<any> {
  return apiRequest(`/api/articles/generate/status/${jobId}`);
}

// Utility
export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
