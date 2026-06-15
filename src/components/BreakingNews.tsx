import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Article } from '../types';
import { getArticles } from '../lib/api';
import { Link } from 'react-router-dom';

export default function BreakingNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const { data } = await getArticles({ status: 'published', isBreaking: true, limit: 10 });
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching breaking news:', error);
      }
    };
    fetchBreaking();
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="animate-marquee whitespace-nowrap">
            {articles.map((article, idx) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="inline-block px-4 hover:underline"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
