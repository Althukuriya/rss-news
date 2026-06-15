import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings } from '../lib/api';

interface SettingsContextType {
  settings: Record<string, string>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

export const defaultSettings: Record<string, string> = {
  site_name: 'NewsFlow AI',
  site_tagline: 'AI-Powered News & Media Platform',
  site_url: 'https://newsflow.ai',
  logo_url: '',
  favicon_url: '',
  author_name: 'NewsFlow Team',
  author_bio: 'Dedicated to delivering the latest news with AI-powered insights.',
  author_photo_url: '',
  contact_email: 'contact@newsflow.ai',
  contact_phone: '',
  social_twitter: '',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_telegram: '',
  social_whatsapp: '',
  google_search_console_code: '',
  google_analytics_id: '',
  adsense_publisher_id: '',
  adsterra_publisher_id: '',
  groq_api_key: '',
  admin_password: 'admin123',
  auto_publish: 'true',
  auto_publish_limit: '10',
  auto_publish_categories: 'india,world,business,technology,sports,entertainment',
  min_word_count: '400',
  translate_languages: 'hi,ta,te,kn,ml,bn,mr,gu',
  trends_fetch_interval: '2',
  trending_regions: 'IN,US,GB,AE',
  breaking_news_ticker: 'true',
  comments_enabled: 'false',
  disqus_shortname: '',
  theme_mode: 'light',
  privacy_policy: 'Privacy Policy content goes here.',
  about_page: 'About Us content goes here.',
  disclaimer: 'Disclaimer content goes here.'
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: async () => {}
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    setIsLoading(true);
    try {
      const dbSettings = await getSettings();
      setSettings({ ...defaultSettings, ...dbSettings });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
