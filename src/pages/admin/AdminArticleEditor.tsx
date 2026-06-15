import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Globe, Trash2, Plus, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Article, AffiliateKeyword, FAQItem, CATEGORIES, LANGUAGES } from '../../types';
import { getArticleById, createArticle, updateArticle, deleteArticle, getAffiliateKeywords, generateArticle } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';
import { showToast } from '../../components/ShareButtons';

const ARTICLE_PROMPT = `You are an expert news journalist. Write a unique, original 450-500 word article on the given topic. Write in a clear, engaging journalistic style.

Return ONLY a JSON object with these exact fields:
{
  "title": "SEO optimized title, max 60 chars, include main keyword",
  "seo_title": "Same as title or slight variation",
  "seo_description": "Compelling meta description, max 155 chars",
  "slug": "URL slug from title, lowercase, hyphens only",
  "body": "Full article HTML, min 450 words, use proper h2 subheadings, paragraphs wrapped in <p> tags",
  "summary": "2 sentence summary",
  "keywords": ["array of 5-8 SEO keywords"],
  "hashtags": ["array of 5 hashtags without #"],
  "category": "one of: india, world, business, technology, sports, entertainment, science, health, education, lifestyle, finance, weather",
  "faq": [{"question": "...", "answer": "..."}],
  "read_time": estimated read time in minutes as number
}

Topic: `;

export default function AdminArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isNew = id === 'new';

  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    body: '',
    summary: '',
    category: 'india',
    language: 'en',
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    hashtags: [],
    faq: [],
    author: '',
    thumbnail_url: '',
    is_breaking: false
  });

  const [affiliateKeywords, setAffiliateKeywords] = useState<AffiliateKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState({ keyword: '', url: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateInput, setGenerateInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (!isNew && id) {
      const fetch = async () => {
        setIsLoading(true);
        try {
          const data = await getArticleById(id);
          setArticle(data || {});
          const keywords = await getAffiliateKeywords(id);
          setAffiliateKeywords(keywords.filter(k => !k.is_global));
        } catch (error) {
          console.error('Error fetching article:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }
  }, [id, isNew]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (field: string, value: any) => {
    setArticle(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleKeywordAdd = () => {
    const keywords = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
    handleChange('seo_keywords', [...(article.seo_keywords || []), ...keywords]);
    setKeywordInput('');
  };

  const handleHashtagAdd = () => {
    const tags = keywordInput.split(',').map(t => t.trim().replace('#', '')).filter(Boolean);
    handleChange('hashtags', [...(article.hashtags || []), ...tags]);
    setKeywordInput('');
  };

  const handleFaqAdd = () => {
    const faq = article.faq || [];
    handleChange('faq', [...faq, { question: '', answer: '' }]);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const faq = [...(article.faq || [])];
    faq[index] = { ...faq[index], [field]: value };
    handleChange('faq', faq);
  };

  const handleFaqRemove = (index: number) => {
    const faq = (article.faq || []).filter((_, i) => i !== index);
    handleChange('faq', faq);
  };

  const handleGenerate = async () => {
    if (!generateInput.trim()) {
      showToast('Enter a topic to generate from', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const parsed = await generateArticle(generateInput, 'topic');
      setArticle({
        ...article,
        title: parsed.title || '',
        slug: parsed.slug || generateSlug(parsed.title || ''),
        body: parsed.body || '',
        summary: parsed.summary || '',
        seo_title: parsed.seo_title || parsed.title,
        seo_description: parsed.seo_description || '',
        seo_keywords: parsed.keywords || [],
        hashtags: parsed.hashtags || [],
        category: parsed.category || 'india',
        faq: parsed.faq || [],
        read_time: parsed.read_time || 5,
        is_auto_generated: true
      });

      showToast('Article generated successfully');
    } catch (error) {
      console.error('Generation error:', error);
      showToast('Failed to generate article', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    if (!settings.groq_api_key) {
      showToast('Groq API key not configured', 'error');
      return;
    }

    showToast('Translation started...');
  };

  const handleSave = async (status: 'draft' | 'published' | 'rejected') => {
    if (!article.title || !article.body) {
      showToast('Title and body are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...article,
        status,
        published_at: status === 'published' ? new Date().toISOString() : undefined
      };

      if (isNew) {
        const created = await createArticle(payload);
        navigate(`/admin/articles/edit/${created.id}`);
      } else {
        await updateArticle(id!, payload);
      }

      showToast(`Article ${status === 'published' ? 'published' : 'saved'}`);
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save article', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteArticle(id!);
      showToast('Article deleted');
      navigate('/admin/articles');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const wordCount = article.body?.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/articles" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={generateInput}
            onChange={e => setGenerateInput(e.target.value)}
            placeholder="Enter topic, URL, or paste text to generate article..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !settings.groq_api_key}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate
          </button>
          <button
            onClick={handleTranslate}
            disabled={!article.body}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Globe className="w-4 h-4" />
            Translate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={article.title || ''}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xl font-semibold"
                  placeholder="Article title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    value={article.slug || ''}
                    onChange={e => handleChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={article.category || 'india'}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Body * (HTML supported)</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex gap-2 p-2 bg-gray-50 border-b">
                    <button className="px-2 py-1 text-sm hover:bg-gray-200 rounded">B</button>
                    <button className="px-2 py-1 text-sm hover:bg-gray-200 rounded italic">I</button>
                    <button className="px-2 py-1 text-sm hover:bg-gray-200 rounded underline">U</button>
                    <button className="px-2 py-1 text-sm hover:bg-gray-200 rounded">H2</button>
                    <button className="px-2 py-1 text-sm hover:bg-gray-200 rounded">Link</button>
                  </div>
                  <textarea
                    value={article.body || ''}
                    onChange={e => handleChange('body', e.target.value)}
                    className="w-full px-4 py-3 min-h-[400px] border-0 focus:ring-0 resize-none"
                    placeholder="Write your article content here..."
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{wordCount} words</span>
                  <span>{readTime} min read</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  value={article.summary || ''}
                  onChange={e => handleChange('summary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Brief summary for previews..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={article.thumbnail_url || ''}
                  onChange={e => handleChange('thumbnail_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">FAQ Section</h2>
            <div className="space-y-4">
              {(article.faq || []).map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Question {idx + 1}</span>
                    <button onClick={() => handleFaqRemove(idx)} className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.question}
                    onChange={e => handleFaqChange(idx, 'question', e.target.value)}
                    placeholder="Question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => handleFaqChange(idx, 'answer', e.target.value)}
                    placeholder="Answer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
              ))}
              <button
                onClick={handleFaqAdd}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Article Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Breaking News</span>
                <button
                  onClick={() => handleChange('is_breaking', !article.is_breaking)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    article.is_breaking ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                    article.is_breaking ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input
                  type="text"
                  value={article.author || ''}
                  onChange={e => handleChange('author', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={article.status || 'draft'}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SEO Title</label>
                <input
                  type="text"
                  value={article.seo_title || ''}
                  onChange={e => handleChange('seo_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">{(article.seo_title || '').length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={article.seo_description || ''}
                  onChange={e => handleChange('seo_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">{(article.seo_description || '').length}/155 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(article.seo_keywords || []).map((kw, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded">
                      {kw}
                      <button onClick={() => handleChange('seo_keywords', (article.seo_keywords || []).filter((_, i) => i !== idx))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleKeywordAdd}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(article.hashtags || []).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      #{tag}
                      <button onClick={() => handleChange('hashtags', (article.hashtags || []).filter((_, i) => i !== idx))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">SEO Preview</h3>
            <div className="border rounded-lg p-4">
              <div className="text-blue-700 text-lg mb-1 truncate">
                {article.seo_title || article.title || 'Title here'}
              </div>
              <div className="text-green-700 text-sm mb-1">
                {settings.site_url}/article/{article.slug || 'slug'}
              </div>
              <div className="text-gray-600 text-sm line-clamp-2">
                {article.seo_description || article.summary || 'Meta description will appear here...'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Affiliate Keywords</h3>
            <div className="space-y-2 mb-4">
              {affiliateKeywords.map(kw => (
                <div key={kw.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium text-amber-600">{kw.keyword}</span>
                  <a href={kw.affiliate_url} target="_blank" rel="noopener" className="text-gray-500 truncate max-w-[100px]">
                    {kw.affiliate_url}
                  </a>
                </div>
              ))}
            </div>
            <Link
              to={`/admin/affiliates?article=${id}`}
              className="text-blue-600 text-sm hover:underline"
            >
              Manage in Affiliate Manager
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
