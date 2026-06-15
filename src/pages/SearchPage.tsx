import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Article, CATEGORIES, LANGUAGES } from '../types';
import { searchArticles } from '../lib/api';
import ArticleCard from '../components/ArticleCard';
import SEOHead from '../components/SEOHead';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    const fetch = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchArticles(query, {
          category: selectedCategory || undefined,
          language: selectedLang || undefined
        });
        setResults(data || []);
      } catch (error) {
        console.error('Error searching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [query, selectedCategory, selectedLang]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLang('');
  };

  return (
    <>
      <SEOHead title={`Search: ${query}`} description={`Search results for "${query}"`} url="/search" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Articles</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search for news, topics, keywords..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {(selectedCategory || selectedLang) && (
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {CATEGORIES.find(c => c.slug === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="hover:text-blue-900">
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {selectedLang && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {LANGUAGES.find(l => l.code === selectedLang)?.name}
                <button onClick={() => setSelectedLang('')} className="hover:text-green-900">
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mb-4 mt-6">Language</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(selectedLang === lang.code ? '' : lang.code)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLang === lang.code
                        ? 'bg-green-100 text-green-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-video mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : query && results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No articles found for "{query}"</p>
                <p className="text-sm text-gray-400">Try different keywords or remove filters</p>
              </div>
            ) : !query ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter a search term to find articles</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Found {results.length} article{results.length !== 1 ? 's' : ''} for "{query}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
