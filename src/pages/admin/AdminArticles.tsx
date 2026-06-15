import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { Article, CATEGORIES, LANGUAGES } from '../../types';
import { getArticles, deleteArticle, updateArticle } from '../../lib/api';
import { showToast } from '../../components/ShareButtons';

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700'
};

export default function AdminArticles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  const statusFilter = searchParams.get('status') || '';
  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data } = await getArticles({
          limit: 100,
          orderBy: 'created_at',
          status: statusFilter || undefined,
          category: categoryFilter || undefined
        });

        let filtered = data || [];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.summary?.toLowerCase().includes(query)
          );
        }

        setArticles(filtered);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(a => a.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedArticles(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async () => {
    try {
      for (const id of selectedArticles) {
        await updateArticle(id, { status: 'published', published_at: new Date().toISOString() });
      }
      showToast(`Published ${selectedArticles.length} articles`);
      setSelectedArticles([]);
      window.location.reload();
    } catch {
      showToast('Failed to publish articles', 'error');
    }
  };

  const handleBulkReject = async () => {
    try {
      for (const id of selectedArticles) {
        await updateArticle(id, { status: 'rejected' });
      }
      showToast(`Rejected ${selectedArticles.length} articles`);
      setSelectedArticles([]);
      window.location.reload();
    } catch {
      showToast('Failed to reject articles', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedArticles.length} articles?`)) return;
    try {
      for (const id of selectedArticles) {
        await deleteArticle(id);
      }
      showToast(`Deleted ${selectedArticles.length} articles`);
      setSelectedArticles([]);
      window.location.reload();
    } catch {
      showToast('Failed to delete articles', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateArticle(id, {
        status: status as 'published' | 'draft' | 'rejected',
        published_at: status === 'published' ? new Date().toISOString() : undefined
      });
      showToast(`Article ${status}`);
      window.location.reload();
    } catch {
      showToast('Failed to update article', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteArticle(id);
      showToast('Article deleted');
      window.location.reload();
    } catch {
      showToast('Failed to delete article', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchParams({ ...Object.fromEntries(searchParams), q: e.target.value })}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={e => setSearchParams({ ...Object.fromEntries(searchParams), status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setSearchParams({ ...Object.fromEntries(searchParams), category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">{selectedArticles.length} selected</span>
            <button
              onClick={handleBulkPublish}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <CheckCircle className="w-4 h-4" />
              Publish
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedArticles.length === articles.length && articles.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No articles found</td>
              </tr>
            ) : (
              articles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleSelect(article.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/articles/edit/${article.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {article.title}
                    </Link>
                    {article.is_breaking && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Breaking</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{article.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{article.view_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/article/${article.slug}`}
                        target="_blank"
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {article.status !== 'published' && (
                        <button
                          onClick={() => handleStatusChange(article.id, 'published')}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Publish"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
