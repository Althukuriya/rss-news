import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, ExternalLink, MousePointer } from 'lucide-react';
import { AffiliateKeyword } from '../../types';
import { showToast } from '../../components/ShareButtons';
import { getAffiliateKeywords, createAffiliateKeyword, deleteAffiliateKeyword } from '../../lib/api';

export default function AdminAffiliates() {
  const [keywords, setKeywords] = useState<AffiliateKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    affiliate_url: '',
    is_global: true
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAffiliateKeywords();
        setKeywords(data || []);
      } catch (error) {
        console.error('Error fetching keywords:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword || !newKeyword.affiliate_url) {
      showToast('Keyword and URL are required', 'error');
      return;
    }

    try {
      const data = await createAffiliateKeyword({
        ...newKeyword,
        link_all_occurrences: true
      });
      setKeywords([data, ...keywords]);
      setNewKeyword({ keyword: '', affiliate_url: '', is_global: true });
      setShowAddForm(false);
      showToast('Affiliate keyword added');
    } catch (error) {
      showToast('Failed to add keyword', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this affiliate keyword?')) return;
    try {
      await deleteAffiliateKeyword(id);
      setKeywords(keywords.filter(k => k.id !== id));
      showToast('Keyword deleted');
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['keyword', 'affiliate_url', 'is_global', 'click_count'],
      ...keywords.map(k => [k.keyword, k.affiliate_url, String(k.is_global), String(k.click_count)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'affiliate_keywords.csv';
    a.click();
  };

  const globalKeywords = keywords.filter(k => k.is_global);
  const articleKeywords = keywords.filter(k => !k.is_global);
  const totalClicks = keywords.reduce((sum, k) => sum + (k.click_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Keyword
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-900">{globalKeywords.length}</div>
          <p className="text-sm text-gray-600">Global Keywords</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-900">{articleKeywords.length}</div>
          <p className="text-sm text-gray-600">Article Keywords</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{totalClicks}</span>
          </div>
          <p className="text-sm text-gray-600">Total Clicks</p>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add Affiliate Keyword</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Keyword</label>
              <input
                type="text"
                value={newKeyword.keyword}
                onChange={e => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., iPhone 15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Affiliate URL</label>
              <input
                type="url"
                value={newKeyword.affiliate_url}
                onChange={e => setNewKeyword({ ...newKeyword, affiliate_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://affiliate-link..."
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newKeyword.is_global}
                  onChange={e => setNewKeyword({ ...newKeyword, is_global: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Global (all articles)</span>
              </label>
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Global Keywords</h2>
          <p className="text-sm text-gray-500">These keywords will be linked across all articles</p>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : globalKeywords.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No global keywords</td>
              </tr>
            ) : (
              globalKeywords.map(kw => (
                <tr key={kw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-amber-600">{kw.keyword}</td>
                  <td className="px-4 py-3">
                    <a
                      href={kw.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm truncate block max-w-xs"
                    >
                      {kw.affiliate_url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{kw.click_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={kw.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(kw.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
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

      {articleKeywords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Article-Specific Keywords</h2>
            <p className="text-sm text-gray-500">Keywords for specific articles only</p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articleKeywords.map(kw => (
                <tr key={kw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-amber-600">{kw.keyword}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{kw.affiliate_url}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{kw.article_id || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{kw.click_count || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(kw.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
