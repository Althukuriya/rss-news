import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, Loader } from 'lucide-react';
import { Article, CATEGORIES } from '../types';
import { getArticles } from '../lib/api';
import ArticleCard from '../components/ArticleCard';
import TrendingSidebar from '../components/TrendingSidebar';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const category = CATEGORIES.find(c => c.slug === slug);
  const articlesPerPage = 20;

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const offset = (page - 1) * articlesPerPage;
        const { data, count } = await getArticles({
          status: 'published',
          category: slug,
          limit: articlesPerPage,
          offset
        });
        setArticles(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching category articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [slug, page]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        <Link to="/" className="text-blue-600 mt-4 inline-block">Go to Home</Link>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / articlesPerPage);

  return (
    <>
      <SEOHead
        title={category.name}
        description={`Latest ${category.name} news and updates`}
        url={`/category/${slug}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: category.name, url: `/category/${slug}` }
        ]}
      />

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <span className="text-gray-500 text-sm">{totalCount} articles</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AdBanner position="header" className="h-20 mb-6" />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles found in this category</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-8">
              <AdBanner position="footer" className="h-20" />
            </div>
          </div>

          <aside>
            <TrendingSidebar />
            <div className="mt-6">
              <AdBanner position="sidebar" className="min-h-[300px]" />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
