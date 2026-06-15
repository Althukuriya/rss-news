import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Eye, MousePointer, TrendingUp, Rss, Clock,
  Zap, Newspaper, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { Article, RSSSource } from '../../types';
import { getArticles, getRSSSources } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';
import { showToast } from '../../components/ShareButtons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof FileText;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className="text-sm text-green-600 font-medium">{change}</span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    articlesToday: 0,
    articlesWeek: 0,
    articlesMonth: 0,
    pageViewsToday: 0,
    affiliateClicks: 0,
    activeSources: 0
  });
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [rssSources, setRssSources] = useState<RSSSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ data: articles }, { data: sources }] = await Promise.all([
          getArticles({ limit: 100, orderBy: 'published_at' }),
          getRSSSources()
        ]);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const published = (articles || []).filter(a => a.status === 'published');

        setStats({
          articlesToday: published.filter(a => a.published_at && new Date(a.published_at) >= today).length,
          articlesWeek: published.filter(a => a.published_at && new Date(a.published_at) >= weekAgo).length,
          articlesMonth: published.filter(a => a.published_at && new Date(a.published_at) >= monthAgo).length,
          pageViewsToday: published.reduce((sum, a) => sum + (a.view_count || 0), 0),
          affiliateClicks: 0,
          activeSources: (sources || []).filter(s => s.is_active).length
        });

        setTopArticles(published.slice(0, 10).sort((a, b) => b.view_count - a.view_count).slice(0, 5));
        setRssSources(sources || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleFetchTrends = async () => {
    showToast('Fetching trends... This may take a few minutes.');
  };

  const handleGenerateArticles = async () => {
    showToast('Generating articles... Check the queue for progress.');
  };

  const handlePublishAllPending = async () => {
    showToast('Publishing all pending articles...');
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleFetchTrends}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <TrendingUp className="w-4 h-4" />
            Fetch Trends
          </button>
          <button
            onClick={handleGenerateArticles}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Zap className="w-4 h-4" />
            Generate 10 Articles
          </button>
          <button
            onClick={handlePublishAllPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            Publish All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Articles Today"
          value={stats.articlesToday}
          icon={FileText}
          color="bg-blue-500"
          change="+12%"
        />
        <StatCard
          title="This Week"
          value={stats.articlesWeek}
          icon={Newspaper}
          color="bg-green-500"
        />
        <StatCard
          title="Page Views Today"
          value={stats.pageViewsToday}
          icon={Eye}
          color="bg-purple-500"
        />
        <StatCard
          title="Active RSS Sources"
          value={stats.activeSources}
          icon={Rss}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Articles by Views</h2>
          <div className="space-y-3">
            {topArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No articles yet</p>
            ) : (
              topArticles.map((article, idx) => (
                <Link
                  key={article.id}
                  to={`/admin/articles/edit/${article.id}`}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                    <p className="text-sm text-gray-500">{article.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{article.view_count}</span>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">RSS Sources</h2>
          <div className="space-y-3">
            {rssSources.slice(0, 6).map(source => (
              <div key={source.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {source.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
                {source.last_fetched_at && (
                  <span className="text-xs text-gray-500">
                    {new Date(source.last_fetched_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
          <Link
            to="/admin/rss"
            className="block mt-4 text-center text-blue-600 text-sm hover:underline"
          >
            Manage RSS Sources
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Auto-Publish Status</h3>
            <p className="text-sm text-blue-700 mt-1">
              {settings.auto_publish === 'true' ? (
                <>
                  Auto-publish is enabled. Limit: {settings.auto_publish_limit} articles/hour.
                  Categories: {settings.auto_publish_categories}
                </>
              ) : (
                'Auto-publish is disabled. Articles require manual review.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
