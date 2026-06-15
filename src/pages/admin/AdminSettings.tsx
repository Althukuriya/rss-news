import { useState, useEffect } from 'react';
import { Save, RefreshCw, Globe, Shield, Mail, CreditCard, TrendingUp } from 'lucide-react';
import { useSettings, defaultSettings } from '../../contexts/SettingsContext';
import { updateSetting } from '../../lib/api';
import { showToast } from '../../components/ShareButtons';
import { CATEGORIES, LANGUAGES } from '../../types';

export default function AdminSettings() {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({ ...defaultSettings, ...settings });
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(formData);
      for (const [key, value] of updates) {
        await updateSetting(key, value);
      }
      refreshSettings();
      showToast('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ label, keyName, type = 'text', placeholder = '' }: { label: string; keyName: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={formData[keyName] || ''}
        onChange={e => handleChange(keyName, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );

  const TextAreaField = ({ label, keyName, rows = 3 }: { label: string; keyName: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={formData[keyName] || ''}
        onChange={e => handleChange(keyName, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={rows}
      />
    </div>
  );

  const ToggleField = ({ label, keyName, description = '' }: { label: string; keyName: string; description?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="font-medium text-gray-900">{label}</span>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => handleChange(keyName, formData[keyName] === 'true' ? 'false' : 'true')}
        className={`w-12 h-6 rounded-full transition-colors ${formData[keyName] === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${formData[keyName] === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Site Information</h2>
          </div>
          <div className="space-y-4">
            <InputField label="Site Name" keyName="site_name" />
            <InputField label="Site Tagline" keyName="site_tagline" />
            <InputField label="Site URL" keyName="site_url" type="url" placeholder="https://yourdomain.com" />
            <InputField label="Logo URL" keyName="logo_url" type="url" />
            <InputField label="Favicon URL" keyName="favicon_url" type="url" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Contact & Author</h2>
          </div>
          <div className="space-y-4">
            <InputField label="Author Name" keyName="author_name" />
            <TextAreaField label="Author Bio" keyName="author_bio" rows={2} />
            <InputField label="Author Photo URL" keyName="author_photo_url" type="url" />
            <InputField label="Contact Email" keyName="contact_email" type="email" />
            <InputField label="Contact Phone" keyName="contact_phone" type="tel" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Social Links</h2>
          <div className="space-y-4">
            <InputField label="Twitter/X" keyName="social_twitter" type="url" />
            <InputField label="Facebook" keyName="social_facebook" type="url" />
            <InputField label="Instagram" keyName="social_instagram" type="url" />
            <InputField label="YouTube" keyName="social_youtube" type="url" />
            <InputField label="Telegram" keyName="social_telegram" type="url" />
            <InputField label="WhatsApp Channel" keyName="social_whatsapp" type="url" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Monetization</h2>
          </div>
          <div className="space-y-4">
            <InputField label="AdSense Publisher ID" keyName="adsense_publisher_id" placeholder="ca-pub-XXXXXXXXXX" />
            <InputField label="Adsterra Publisher ID" keyName="adsterra_publisher_id" />
            <ToggleField label="Enable Comments" keyName="comments_enabled" description="Disqus integration" />
            <InputField label="Disqus Shortname" keyName="disqus_shortname" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold">SEO & Analytics</h2>
          </div>
          <div className="space-y-4">
            <InputField label="Google Analytics ID" keyName="google_analytics_id" placeholder="G-XXXXXXXXXX" />
            <InputField label="Search Console Verification" keyName="google_search_console_code" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <InputField label="Admin Password" keyName="admin_password" type="password" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Auto-Publish Settings</h2>
        <div className="space-y-4">
          <ToggleField label="Auto-Publish Enabled" keyName="auto_publish" description="Automatically publish generated articles" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Articles per Hour Limit</label>
              <input
                type="number"
                value={formData.auto_publish_limit || '10'}
                onChange={e => handleChange('auto_publish_limit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Word Count</label>
              <input
                type="number"
                value={formData.min_word_count || '400'}
                onChange={e => handleChange('min_word_count', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min={100}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Publish Categories (comma-separated)</label>
            <input
              type="text"
              value={formData.auto_publish_categories || ''}
              onChange={e => handleChange('auto_publish_categories', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="india,world,business"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Translation Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages to Auto-Translate</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => {
              const current = (formData.translate_languages || '').split(',').filter(Boolean);
              const isSelected = current.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    const updated = isSelected
                      ? current.filter(c => c !== lang.code).join(',')
                      : [...current, lang.code].join(',');
                    handleChange('translate_languages', updated);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Breaking News</h3>
          <ToggleField label="Show Breaking Ticker" keyName="breaking_news_ticker" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Trending Topics</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fetch Interval (hours)</label>
            <input
              type="number"
              value={formData.trends_fetch_interval || '2'}
              onChange={e => handleChange('trends_fetch_interval', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min={1}
              max={24}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Theme</h3>
          <ToggleField label="Dark Mode Default" keyName="theme_mode" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <TextAreaField label="About Page Content" keyName="about_page" rows={4} />
        <TextAreaField label="Privacy Policy Content" keyName="privacy_policy" rows={4} />
        <TextAreaField label="Disclaimer Content" keyName="disclaimer" rows={4} />
      </div>
    </div>
  );
}
