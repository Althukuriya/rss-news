import { useState, useEffect } from 'react';
import { Mail, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { Article } from '../types';
import { getArticles } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import ArticleCard from '../components/ArticleCard';
import SEOHead from '../components/SEOHead';

export default function AuthorPage() {
  const { settings } = useSettings();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getArticles({ status: 'published', limit: 20 });
        const authorArticles = (data || []).filter(a => a.author === settings.author_name);
        setArticles(authorArticles);
      } catch (error) {
        console.error('Error fetching author articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [settings.author_name]);

  const socials = [
    { key: 'twitter', url: settings.social_twitter, icon: Twitter },
    { key: 'facebook', url: settings.social_facebook, icon: Facebook },
    { key: 'instagram', url: settings.social_instagram, icon: Instagram },
    { key: 'youtube', url: settings.social_youtube, icon: Youtube }
  ].filter(s => s.url);

  return (
    <>
      <SEOHead title={`About ${settings.author_name}`} description={settings.author_bio} url="/author" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mb-8">
            {settings.author_photo_url ? (
              <img
                src={settings.author_photo_url}
                alt={settings.author_name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {settings.author_name?.charAt(0) || 'A'}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{settings.author_name}</h1>
            <p className="text-gray-600 mb-4">{settings.author_bio}</p>

            {socials.length > 0 && (
              <div className="flex justify-center gap-3">
                {socials.map(social => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {settings.contact_email && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{settings.contact_email}</span>
              </div>
              <a
                href={`mailto:${settings.contact_email}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Contact
              </a>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Articles by {settings.author_name}</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No articles found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
