import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { AdSlot } from '../../types';
import { showToast } from '../../components/ShareButtons';
import { useSettings } from '../../contexts/SettingsContext';
import { getAdSlots, updateAdSlot } from '../../lib/api';

export default function AdminAds() {
  const { settings, refreshSettings } = useSettings();
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adsenseId, setAdsenseId] = useState('');
  const [adsterraId, setAdsterraId] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAdSlots();
        setAdSlots(data || []);
        setAdsenseId(settings.adsense_publisher_id || '');
        setAdsterraId(settings.adsterra_publisher_id || '');
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [settings.adsense_publisher_id, settings.adsterra_publisher_id]);

  const handleUpdateSlot = async (id: string, updates: Partial<AdSlot>) => {
    try {
      await updateAdSlot(id, updates);
      setAdSlots(adSlots.map(s => s.id === id ? { ...s, ...updates } : s));
      showToast('Ad slot updated');
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ad Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Google AdSense</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Publisher ID</label>
              <input
                type="text"
                value={adsenseId}
                onChange={e => setAdsenseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
            </div>
            <p className="text-sm text-gray-500">
              Enter your AdSense Publisher ID to enable auto ads across your site.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Adsterra</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Publisher ID</label>
              <input
                type="text"
                value={adsterraId}
                onChange={e => setAdsterraId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Your Adsterra ID"
              />
            </div>
            <p className="text-sm text-gray-500">
              Enter your Adsterra Publisher ID for popunder and native ads.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ad Slots</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : adSlots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No ad slots configured</td>
              </tr>
            ) : (
              adSlots.map(slot => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{slot.slot_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{slot.slot_position.replace('-', ' ')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={slot.ad_network}
                      onChange={e => handleUpdateSlot(slot.id, { ad_network: e.target.value as 'adsense' | 'adsterra' })}
                      className="text-sm px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="adsense">AdSense</option>
                      <option value="adsterra">Adsterra</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUpdateSlot(slot.id, { is_active: !slot.is_active })}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                        slot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {slot.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {slot.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <textarea
                        value={slot.ad_code || ''}
                        onChange={e => handleUpdateSlot(slot.id, { ad_code: e.target.value })}
                        placeholder="Paste ad code..."
                        className="w-48 px-2 py-1 text-xs border border-gray-300 rounded resize-none"
                        rows={2}
                      />
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
