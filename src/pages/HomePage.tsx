import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { Article } from '../types';
import { getArticles } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import ArticleCard from '../components/ArticleCard';
import BreakingNews from '../components/BreakingNews';
import LiveScores from '../components/LiveScores';
import TrendingSidebar from '../components/TrendingSidebar';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const CATEGORY_ORDER = ['india', 'world', 'business', 'technology', 'sports', 'entertainment'];

export default function HomePage() {
  const { settings } = useSettings();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);

        const [{ data: featured }] = await getArticles({ status: 'published', limit: 5, orderBy: 'published_at' });
        setFeaturedArticles(featured || []);

        const categoryData: Record<string, Article[]> = {};
        for (const cat of CATEGORY_ORDER) {
          const { data } = await getArticles({ status: 'published', category: cat, limit: 4 });
          categoryData[cat] = data || [];
        }
        setCategoryArticles(categoryData);
      } catch (error) {
        console.error('Error fetching homepage articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <SEOHead title="" description={settings.site_tagline} url="/" />

      {settings.breaking_news_ticker === 'true' && <BreakingNews />}

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 rounded-xl aspect-[16/9] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl h-48" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {featuredArticles[0] && (
                  <ArticleCard article={featuredArticles[0]} variant="featured" />
                )}

                <LiveScores />

                {featuredArticles.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredArticles.slice(1, 4).map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}

                <AdBanner position="header" className="h-24" />
              </div>

              <aside className="lg:col-span-1">
                <TrendingSidebar />
                <div className="mt-6">
                  <AdBanner position="sidebar" className="min-h-[300px]" />
                </div>
              </aside>
            </div>

            {CATEGORY_ORDER.map((cat, idx) => {
              const articles = categoryArticles[cat] || [];
              if (articles.length === 0) return null;

              return (
                <section key={cat} className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Flame className="w-6 h-6 text-orange-500" />
                      <span className="capitalize">{cat === 'india' ? 'India News' : cat}</span>
                    </h2>
                    <Link
                      to={`/category/${cat}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {articles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  {idx < CATEGORY_ORDER.length - 1 && (
                    <div className="mt-8">
                      <AdBanner position="between-articles" className="h-20" />
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}
      </main>

      <div className="max-w-7xl mx-auto px-4 my-8">
        <AdBanner position="footer" className="h-24" />
      </div>
    </>
  );
}
