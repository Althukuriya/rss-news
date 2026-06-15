import { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, Tag } from 'lucide-react';
import { Deal } from '../types';
import { getDeals } from '../lib/api';
import SEOHead from '../components/SEOHead';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDeals();
        setDeals(data || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = [...new Set(deals.filter(d => d.category).map(d => d.category as string))];
  const filteredDeals = selectedCategory
    ? deals.filter(d => d.category === selectedCategory)
    : deals;

  return (
    <>
      <SEOHead title="Deals & Offers" description="Best deals and offers on products" url="/deals" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Best Deals & Offers</h1>
          <p className="text-gray-600 mt-2">Exclusive deals curated for our readers</p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-square mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No deals available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <div key={deal.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden">
                  {deal.image_url ? (
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {deal.category && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded capitalize">
                      {deal.category}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.title}</h3>
                  {deal.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{deal.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {deal.price && (
                      <span className="text-lg font-bold text-green-600">{deal.price}</span>
                    )}
                    {deal.original_price && (
                      <span className="text-sm text-gray-400 line-through">{deal.original_price}</span>
                    )}
                  </div>

                  <a
                    href={deal.affiliate_url}
                    target="_blank"
                    rel="sponsored noopener"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Get Deal
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
