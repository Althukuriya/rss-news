import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Play, Pause, ExternalLink } from 'lucide-react';
import { RSSSource } from '../../types';
import { getRSSSources, createRSSSource, updateRSSSource, deleteRSSSource } from '../../lib/api';
import { showToast } from '../../components/ShareButtons';
import { CATEGORIES } from '../../types';

export default function AdminRSS() {
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    category: 'india',
    language: 'en',
    fetch_interval_minutes: 30
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getRSSSources();
        setSources(data || []);
      } catch (error) {
        console.error('Error fetching RSS sources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      showToast('Name and URL are required', 'error');
      return;
    }

    try {
      const data = await createRSSSource({ ...newSource, is_active: true });
      setSources([...sources, data]);
      setNewSource({ name: '', url: '', category: 'india', language: 'en', fetch_interval_minutes: 30 });
      setShowAddForm(false);
      showToast('RSS source added');
    } catch (error) {
      console.error('Add error:', error);
      showToast('Failed to add RSS source', 'error');
    }
  };

  const handleToggle = async (source: RSSSource) => {
    try {
      await updateRSSSource(source.id, { is_active: !source.is_active });
      setSources(sources.map(s => s.id === source.id ? { ...s, is_active: !s.is_active } : s));
      showToast(`Source ${source.is_active ? 'paused' : 'activated'}`);
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this RSS source?')) return;

    try {
      await deleteRSSSource(id);
      setSources(sources.filter(s => s.id !== id));
      showToast('Source deleted');
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleFetchNow = async (source: RSSSource) => {
    showToast(`Fetching from ${source.name}...`);
  };

  const handleFetchAll = async () => {
    showToast('Fetching all active RSS feeds...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">RSS Sources</h1>
        <div className="flex gap-2">
          <button
            onClick={handleFetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4" />
            Fetch All
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add New RSS Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newSource.name}
                onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., BBC News"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RSS Feed URL</label>
              <input
                type="url"
                value={newSource.url}
                onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newSource.category}
                onChange={e => setNewSource({ ...newSource, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddSource}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Source
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interval</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Fetched</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No RSS sources</td>
              </tr>
            ) : (
              sources.map(source => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{source.name}</p>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Feed
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{source.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {source.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{source.fetch_interval_minutes}m</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {source.last_fetched_at
                      ? new Date(source.last_fetched_at).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFetchNow(source)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Fetch Now"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(source)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title={source.is_active ? 'Pause' : 'Activate'}
                      >
                        {source.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
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
