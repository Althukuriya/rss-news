import { useState, useEffect } from 'react';
import { Sparkles, Zap, FileText, Link2, RefreshCw, CheckCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { showToast } from '../../components/ShareButtons';
import { CATEGORIES } from '../../types';
import { generateArticle, bulkGenerateArticles, getGenerationJobStatus, createArticle } from '../../lib/api';

export default function AdminGenerate() {
  const { settings } = useSettings();
  const [mode, setMode] = useState<'url' | 'topic' | 'text' | 'bulk'>('topic');
  const [input, setInput] = useState('');
  const [bulkCount, setBulkCount] = useState(10);
  const [autoPublish, setAutoPublish] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const status = await getGenerationJobStatus(jobId);
        if (status.progress) {
          setProgress(status.progress);
        }
        if (status.status === 'completed') {
          setResults(status.results || []);
          setIsGenerating(false);
          setJobId(null);
          setProgress(null);
          showToast(`Generated ${status.results?.length || 0} articles successfully`);
        } else if (status.status === 'failed') {
          setIsGenerating(false);
          setJobId(null);
          setProgress(null);
          showToast('Generation failed', 'error');
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      showToast('Please enter content to generate from', 'error');
      return;
    }

    setIsGenerating(true);
    setResults([]);

    try {
      const result = await generateArticle(input, mode);
      setResults([result]);
      showToast('Article generated successfully');
    } catch (error) {
      console.error('Generation error:', error);
      showToast('Failed to generate article', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setProgress({ current: 0, total: bulkCount });

    try {
      const response = await bulkGenerateArticles(bulkCount, autoPublish);
      setJobId(response.jobId);
      showToast(`Generating ${bulkCount} articles...`);
    } catch (error) {
      console.error('Bulk generation error:', error);
      showToast('Failed to start bulk generation', 'error');
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleSaveGenerated = async (article: any) => {
    try {
      await createArticle({
        title: article.title,
        slug: article.slug,
        body: article.body,
        summary: article.summary,
        seo_title: article.seo_title,
        seo_description: article.seo_description,
        seo_keywords: article.keywords,
        hashtags: article.hashtags,
        category: article.category,
        faq: article.faq,
        read_time: article.read_time,
        status: autoPublish ? 'published' : 'draft',
        is_auto_generated: true,
        published_at: autoPublish ? new Date().toISOString() : undefined
      });
      showToast('Article saved');
    } catch (error) {
      showToast('Failed to save article', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Article Generator</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Auto-publish:</span>
          <button
            onClick={() => setAutoPublish(!autoPublish)}
            className={`w-10 h-6 rounded-full transition-colors ${autoPublish ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${autoPublish ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Mode</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { id: 'topic', label: 'From Topic', icon: Sparkles },
              { id: 'url', label: 'From URL', icon: Link2 },
              { id: 'text', label: 'From Text', icon: FileText },
              { id: 'bulk', label: 'Bulk Generate', icon: Zap }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id as any)}
                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  mode === opt.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          {mode === 'bulk' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Articles</label>
                <input
                  type="number"
                  value={bulkCount}
                  onChange={e => setBulkCount(parseInt(e.target.value) || 10)}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <p className="text-sm text-gray-500">
                Generates articles from trending topics. Articles will be saved as {autoPublish ? 'published' : 'drafts'}.
              </p>

              {progress && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Generating article {progress.current} of {progress.total}...</p>
                </div>
              )}

              <button
                onClick={handleBulkGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Generate {bulkCount} Articles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {mode === 'topic' && 'Topic / Keyword'}
                  {mode === 'url' && 'Article URL'}
                  {mode === 'text' && 'Article Text / News Content'}
                </label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    mode === 'topic' ? 'e.g., Latest developments in AI technology...'
                    : mode === 'url' ? 'https://example.com/news/article...'
                    : 'Paste the full article text here...'
                  }
                  rows={mode === 'text' ? 8 : 4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generate Article
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Generated Result</h2>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Generated articles will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((article, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-sm rounded">{article.category}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded">{article.read_time} min</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveGenerated(article)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Save {autoPublish ? '& Publish' : 'as Draft'}
                    </button>
                    <button
                      onClick={() => window.open(`/admin/articles/new`, '_blank')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Edit First
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Tip:</strong> For best results, provide specific topics with clear context. The AI will generate unique, SEO-optimized content with proper structure, FAQs, and metadata.
          </div>
        </div>
      </div>
    </div>
  );
}
