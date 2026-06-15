import { useState, useEffect } from 'react';
import { Flame, ArrowUpRight } from 'lucide-react';
import { TrendingTopic } from '../types';
import { getTrendingTopics } from '../lib/api';
import { Link } from 'react-router-dom';

export default function TrendingSidebar() {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await getTrendingTopics();
        setTrends(data || []);
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  const uniqueTrends = trends.reduce((acc, trend) => {
    if (!acc.find(t => t.keyword === trend.keyword)) {
      acc.push(trend);
    }
    return acc;
  }, [] as TrendingTopic[]).slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-gray-900">Trending Now</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : uniqueTrends.length > 0 ? (
        <ul className="space-y-3">
          {uniqueTrends.map((trend, idx) => (
            <li key={trend.id}>
              <Link
                to={`/search?q=${encodeURIComponent(trend.keyword)}`}
                className="group flex items-start gap-2"
              >
                <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    {trend.keyword}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  {trend.region && (
                    <span className="text-xs text-gray-500">{trend.region}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No trending topics at the moment</p>
      )}
    </div>
  );
}
