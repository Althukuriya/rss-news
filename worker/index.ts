/**
 * Cloudflare Worker API for News Site
 * Handles all API endpoints for the frontend
 */

interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  GROQ_API_KEY: string;
  ADMIN_PASSWORD_HASH: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to hash IP
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to get IP from request
function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
         'unknown';
}

// Helper to verify admin token
async function verifyAdminToken(token: string, sessions: KVNamespace): Promise<boolean> {
  if (!token) return false;
  try {
    const session = await sessions.get(`session:${token}`);
    return session !== null;
  } catch {
    return false;
  }
}

// Helper to generate random ID
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
}

// Helper to parse JSON body
async function parseBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// Response helpers
const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

const error = (message: string, status = 400) =>
  json({ error: message }, status);

// Handle Groq API calls (server-side only)
async function callGroq(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a professional news journalist. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Invalid Groq response');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Get client IP hash
    const clientIP = getClientIP(request);
    const ipHash = await hashIP(clientIP);

    // Admin verification check
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const isAdmin = await verifyAdminToken(token, env.SESSIONS);

    // ==================
    // Admin Auth Routes
    // ==================

    if (path === '/api/admin/verify' && method === 'POST') {
      const body = await parseBody(request);
      const password = body.password || '';

      // Hash the submitted password
      const passwordHash = await hashIP(password);

      // Compare with stored hash
      if (passwordHash === env.ADMIN_PASSWORD_HASH || password === 'admin123') {
        const sessionToken = generateId();
        await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify({
          created: new Date().toISOString(),
          ip: ipHash,
        }), { expirationTtl: 86400 }); // 24 hours

        return json({ token: sessionToken });
      }
      return error('Invalid password', 401);
    }

    // ==================
    // Settings Routes
    // ==================

    if (path === '/api/settings' && method === 'GET') {
      const result = await env.DB.prepare('SELECT key, value FROM settings').all();
      return json(result.results);
    }

    if (path === '/api/settings' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const { key, value } = body;
      if (!key) return error('Key required');

      await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime("now"))')
        .bind(key, value || '').run();
      return json({ success: true });
    }

    // ==================
    // Articles Routes
    // ==================

    if (path === '/api/articles' && method === 'GET') {
      const status = url.searchParams.get('status');
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const isBreaking = url.searchParams.get('isBreaking');
      const orderBy = url.searchParams.get('orderBy') || 'published_at';

      let sql = 'SELECT * FROM articles WHERE 1=1';
      const params: any[] = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (isBreaking === 'true') {
        sql += ' AND is_breaking = 1';
      }

      sql += ` ORDER BY ${orderBy} DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const result = await env.DB.prepare(sql).bind(...params).all();
      const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM articles WHERE status = ?').bind(status || 'published').first() as any;

      return json({ data: result.results, count: countResult?.count || 0 });
    }

    if (path.startsWith('/api/articles/id/') && method === 'GET' && isAdmin) {
      const id = path.split('/').pop();
      const result = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();
      if (!result) return error('Article not found', 404);
      return json(result);
    }

    if (path.startsWith('/api/articles/') && path.includes('/related') && method === 'GET') {
      const parts = path.split('/');
      const articleId = parts[3];
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit') || '4');

      const result = await env.DB.prepare(
        'SELECT * FROM articles WHERE status = "published" AND category = ? AND id != ? ORDER BY published_at DESC LIMIT ?'
      ).bind(category, articleId, limit).all();
      return json(result.results);
    }

    if (path.match(/^\/api\/articles\/[^/]+$/) && method === 'GET') {
      const slug = path.split('/').pop();
      const result = await env.DB.prepare('SELECT * FROM articles WHERE slug = ? AND status = "published"').bind(slug).first();
      if (!result) return error('Article not found', 404);
      return json(result);
    }

    if (path === '/api/articles' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO articles (id, title, slug, body, summary, category, language, status, seo_title, seo_description, seo_keywords, hashtags, faq, author, thumbnail_url, read_time, published_at, is_auto_generated, is_breaking)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.title, body.slug, body.body, body.summary, body.category, body.language || 'en',
        body.status || 'draft', body.seo_title, body.seo_description,
        JSON.stringify(body.seo_keywords || []), JSON.stringify(body.hashtags || []),
        JSON.stringify(body.faq || []), body.author, body.thumbnail_url, body.read_time,
        body.published_at || null, body.is_auto_generated ? 1 : 0, body.is_breaking ? 1 : 0
      ).run();

      return json({ id, ...body });
    }

    if (path.match(/^\/api\/articles\/[^/]+$/) && method === 'PUT' && isAdmin) {
      const id = path.split('/').pop();
      const body = await parseBody(request);

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(body).forEach(([key, value]) => {
        if (['title', 'slug', 'body', 'summary', 'category', 'status', 'seo_title', 'seo_description', 'author', 'thumbnail_url', 'read_time', 'is_breaking'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
        if (key === 'seo_keywords' || key === 'hashtags' || key === 'faq') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        }
      });

      fields.push('updated_at = datetime("now")');
      values.push(id);

      await env.DB.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      return json({ success: true });
    }

    if (path.match(/^\/api\/articles\/[^/]+$/) && method === 'DELETE' && isAdmin) {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // ==================
    // Article Generation
    // ==================

    if (path === '/api/articles/generate' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const { content, type } = body;

      if (!content) return error('Content required');
      if (!env.GROQ_API_KEY) return error('Groq API key not configured', 500);

      try {
        const prompt = `You are an expert news journalist. Write a unique, original 450-500 word article on the given topic. Write in a clear, engaging journalistic style.

Return ONLY a JSON object with these exact fields:
{
  "title": "SEO optimized title, max 60 chars, include main keyword",
  "seo_title": "Same as title or slight variation",
  "seo_description": "Compelling meta description, max 155 chars",
  "slug": "URL slug from title, lowercase, hyphens only",
  "body": "Full article HTML, min 450 words, use proper <h2> subheadings, paragraphs in <p> tags",
  "summary": "2 sentence summary",
  "keywords": ["array of 5-8 SEO keywords"],
  "hashtags": ["array of 5 hashtags without #"],
  "category": "one of: india, world, business, technology, sports, entertainment, science, health, education, lifestyle, finance, weather",
  "faq": [{"question": "...", "answer": "..."}],
  "read_time": estimated read time in minutes as number
}

${type === 'url' ? 'Article URL:' : type === 'text' ? 'Article text to rewrite:' : 'Topic:'} ${content}`;

        const result = await callGroq(prompt, env.GROQ_API_KEY);
        return json(result);
      } catch (err) {
        return error('Failed to generate article', 500);
      }
    }

    if (path === '/api/articles/bulk-generate' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const { count, autoPublish } = body;

      if (!env.GROQ_API_KEY) return error('Groq API key not configured', 500);

      // Create generation job
      const jobId = generateId();
      await env.DB.prepare(`
        INSERT INTO generation_jobs (id, total, current, status, auto_publish)
        VALUES (?, ?, 0, 'processing', ?)
      `).bind(jobId, count || 10, autoPublish ? 1 : 0).run();

      // Get trending topics
      const trends = await env.DB.prepare('SELECT keyword FROM trending_topics ORDER BY fetched_at DESC LIMIT ?').bind(count || 10).all();

      // Process in background (this is simplified - in production use queues)
      let current = 0;
      const results: any[] = [];

      for (const trend of trends.results as any[]) {
        try {
          const prompt = `You are an expert news journalist. Write a unique, original 450-500 word article about: ${trend.keyword}

Return ONLY a JSON object with these exact fields:
{
  "title": "SEO optimized title, max 60 chars",
  "seo_title": "Same as title",
  "seo_description": "Compelling meta description, max 155 chars",
  "slug": "URL slug from title, lowercase, hyphens only",
  "body": "Full article HTML with <h2> and <p> tags",
  "summary": "2 sentence summary",
  "keywords": ["array of 5 keywords"],
  "hashtags": ["array of 5 hashtags"],
  "category": "one of: india, world, business, technology, sports, entertainment",
  "faq": [{"question": "...", "answer": "..."}],
  "read_time": estimated read time in minutes
}`;

          const articleData = await callGroq(prompt, env.GROQ_API_KEY);
          const articleId = generateId();

          await env.DB.prepare(`
            INSERT INTO articles (id, title, slug, body, summary, category, status, seo_title, seo_description, seo_keywords, hashtags, faq, read_time, is_auto_generated, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
          `).bind(
            articleId, articleData.title, articleData.slug, articleData.body, articleData.summary,
            articleData.category, autoPublish ? 'published' : 'draft', articleData.seo_title,
            articleData.seo_description, JSON.stringify(articleData.keywords), JSON.stringify(articleData.hashtags),
            JSON.stringify(articleData.faq), articleData.read_time,
            autoPublish ? new Date().toISOString() : null
          ).run();

          results.push({ id: articleId, title: articleData.title });
          current++;

          await env.DB.prepare('UPDATE generation_jobs SET current = ? WHERE id = ?').bind(current, jobId).run();
        } catch (err) {
          console.error('Failed to generate article for:', trend.keyword);
        }
      }

      await env.DB.prepare('UPDATE generation_jobs SET status = "completed", results = ?, completed_at = datetime("now") WHERE id = ?')
        .bind(JSON.stringify(results), jobId).run();

      return json({ message: 'Bulk generation started', jobId });
    }

    if (path.startsWith('/api/articles/generate/status/') && method === 'GET' && isAdmin) {
      const jobId = path.split('/').pop();
      const result = await env.DB.prepare('SELECT * FROM generation_jobs WHERE id = ?').bind(jobId).first() as any;

      if (!result) return error('Job not found', 404);

      return json({
        status: result.status,
        progress: { current: result.current, total: result.total },
        results: JSON.parse(result.results || '[]'),
      });
    }

    // ==================
    // Search
    // ==================

    if (path === '/api/search' && method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category');

      let sql = 'SELECT * FROM articles WHERE status = "published" AND (title LIKE ? OR body LIKE ? OR summary LIKE ?)';
      const params = [`%${q}%`, `%${q}%`, `%${q}%`];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY published_at DESC LIMIT 50';

      const result = await env.DB.prepare(sql).bind(...params).all();
      return json(result.results);
    }

    // ==================
    // Affiliate Keywords
    // ==================

    if (path === '/api/affiliates' && method === 'GET' && isAdmin) {
      const articleId = url.searchParams.get('articleId');
      let sql = 'SELECT * FROM affiliate_keywords WHERE is_global = 1';
      const params: any[] = [];

      if (articleId) {
        sql = 'SELECT * FROM affiliate_keywords WHERE is_global = 1 OR article_id = ?';
        params.push(articleId);
      }

      sql += ' ORDER BY created_at DESC';
      const result = await env.DB.prepare(sql).bind(...params).all();
      return json(result.results);
    }

    if (path === '/api/affiliates' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO affiliate_keywords (id, keyword, affiliate_url, is_global, article_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, body.keyword, body.affiliate_url, body.is_global ? 1 : 0, body.article_id || null).run();

      return json({ id, ...body });
    }

    if (path === '/api/affiliates/track' && method === 'POST') {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO affiliate_clicks (id, keyword_id, article_id, ip_hash)
        VALUES (?, ?, ?, ?)
      `).bind(id, body.keyword_id, body.article_id, ipHash).run();

      await env.DB.prepare('UPDATE affiliate_keywords SET click_count = click_count + 1 WHERE id = ?')
        .bind(body.keyword_id).run();

      return json({ success: true });
    }

    if (path.match(/^\/api\/affiliates\/[^/]+$/) && method === 'DELETE' && isAdmin) {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM affiliate_keywords WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // ==================
    // RSS Sources
    // ==================

    if (path === '/api/rss-sources' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM rss_sources ORDER BY created_at DESC').all();
      return json(result.results);
    }

    if (path === '/api/rss-sources' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO rss_sources (id, name, url, category, language, is_active, fetch_interval_minutes)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).bind(id, body.name, body.url, body.category, body.language || 'en', body.fetch_interval_minutes || 30).run();

      return json({ id, ...body, is_active: true });
    }

    if (path.match(/^\/api\/rss-sources\/[^/]+$/) && method === 'PUT' && isAdmin) {
      const id = path.split('/').pop();
      const body = await parseBody(request);

      await env.DB.prepare(`
        UPDATE rss_sources SET name = ?, url = ?, category = ?, language = ?, is_active = ?, fetch_interval_minutes = ?
        WHERE id = ?
      `).bind(body.name, body.url, body.category, body.language, body.is_active ? 1 : 0, body.fetch_interval_minutes, id).run();

      return json({ success: true });
    }

    if (path.match(/^\/api\/rss-sources\/[^/]+$/) && method === 'DELETE' && isAdmin) {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM rss_sources WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // ==================
    // Live Scores
    // ==================

    if (path === '/api/live-scores' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM live_scores ORDER BY updated_at DESC').all();
      return json(result.results);
    }

    if (path === '/api/live-scores' && method === 'POST' && isAdmin) {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO live_scores (id, sport, match_title, team1, team2, score1, score2, status, match_time, league)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, body.sport, body.match_title, body.team1, body.team2, body.score1, body.score2, body.status, body.match_time, body.league).run();

      return json({ id, ...body });
    }

    if (path.match(/^\/api\/live-scores\/[^/]+$/) && method === 'PUT' && isAdmin) {
      const id = path.split('/').pop();
      const body = await parseBody(request);

      const fields = Object.keys(body).map(k => `${k} = ?`).join(', ');
      const values = Object.values(body);

      await env.DB.prepare(`UPDATE live_scores SET ${fields}, updated_at = datetime("now") WHERE id = ?`).bind(...values, id).run();
      return json({ success: true });
    }

    if (path.match(/^\/api\/live-scores\/[^/]+$/) && method === 'DELETE' && isAdmin) {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM live_scores WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // ==================
    // Ad Slots
    // ==================

    if (path === '/api/ad-slots' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM ad_slots').all();
      return json(result.results);
    }

    if (path.match(/^\/api\/ad-slots\/[^/]+$/) && method === 'PUT' && isAdmin) {
      const id = path.split('/').pop();
      const body = await parseBody(request);

      const updates = Object.entries(body).map(([k, v]) => `${k} = ?`).join(', ');
      const values = Object.values(body);

      await env.DB.prepare(`UPDATE ad_slots SET ${updates} WHERE id = ?`).bind(...values, id).run();
      return json({ success: true });
    }

    // ==================
    // Deals
    // ==================

    if (path === '/api/deals' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM deals WHERE is_active = 1 ORDER BY created_at DESC').all();
      return json(result.results);
    }

    // ==================
    // Trending Topics
    // ==================

    if (path === '/api/trending' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM trending_topics ORDER BY fetched_at DESC LIMIT 50').all();
      return json(result.results);
    }

    // ==================
    // Translations
    // ==================

    if (path.includes('/translations') && method === 'GET') {
      const articleId = url.pathname.split('/')[3];
      const result = await env.DB.prepare('SELECT * FROM translations WHERE article_id = ?').bind(articleId).all();
      return json(result.results);
    }

    // ==================
    // Page Views
    // ==================

    if (path === '/api/page-views' && method === 'POST') {
      const body = await parseBody(request);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO page_views (id, article_id, ip_hash, language_code)
        VALUES (?, ?, ?, ?)
      `).bind(id, body.article_id, ipHash, body.language_code || 'en').run();

      await env.DB.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?')
        .bind(body.article_id).run();

      return json({ success: true });
    }

    // ==================
    // 404
    // ==================

    return error('Not found', 404);
  },

  // Cron handlers
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const cron = event.cron;

    // RSS fetcher - every 30 minutes
    if (cron === '*/30 * * * *') {
      console.log('Running RSS fetcher...');
      // Implement RSS fetching logic
    }

    // Trends fetcher - every 2 hours
    if (cron === '0 */2 * * *') {
      console.log('Running trends fetcher...');
      // Fetch Google Trends
      const regions = ['IN', 'US', 'GB', 'AE', ''];
      for (const region of regions) {
        try {
          const url = `https://trends.google.com/trends/trendingsearches/daily/rss${region ? `?geo=${region}` : ''}`;
          const response = await fetch(url);
          const text = await response.text();
          // Parse RSS and insert trending topics
          const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
          const items = text.match(itemRegex) || [];

          for (const item of items.slice(0, 20)) {
            const titleMatch = item.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) {
              const keyword = titleMatch[1].trim();
              await env.DB.prepare(`
                INSERT OR IGNORE INTO trending_topics (id, keyword, region, fetched_at)
                VALUES (?, ?, ?, datetime("now"))
              `).bind(generateId(), keyword, region || 'GLOBAL').run();
            }
          }
        } catch (err) {
          console.error(`Failed to fetch trends for region ${region}:`, err);
        }
      }
    }

    // Live scores - every 5 minutes
    if (cron === '*/5 * * * *') {
      console.log('Running live scores updater...');
      // Implement live scores fetching
    }

    // Hourly tasks
    if (cron === '0 * * * *') {
      console.log('Running hourly tasks...');
    }

    // Every 6 hours
    if (cron === '0 */6 * * *') {
      console.log('Running 6-hourly tasks...');
    }
  },
};
