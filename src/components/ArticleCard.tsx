import { Link } from 'react-router-dom';
import { Clock, Eye, TrendingUp } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'horizontal' | 'compact';
  showCategory?: boolean;
}

export default function ArticleCard({ article, variant = 'default', showCategory = true }: ArticleCardProps) {
  const categoryColors: Record<string, string> = {
    india: 'bg-orange-100 text-orange-700',
    world: 'bg-blue-100 text-blue-700',
    business: 'bg-green-100 text-green-700',
    technology: 'bg-purple-100 text-purple-700',
    sports: 'bg-red-100 text-red-700',
    entertainment: 'bg-pink-100 text-pink-700',
    science: 'bg-cyan-100 text-cyan-700',
    health: 'bg-emerald-100 text-emerald-700',
    education: 'bg-indigo-100 text-indigo-700',
    lifestyle: 'bg-amber-100 text-amber-700',
    finance: 'bg-lime-100 text-lime-700',
    weather: 'bg-sky-100 text-sky-700'
  };

  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.slug}`} className="group block relative overflow-hidden rounded-2xl aspect-[16/9]">
        <img
          src={article.thumbnail_url || 'https://images.pexels.com/pexels/34231/f/news-pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {showCategory && (
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${categoryColors[article.category] || 'bg-gray-100 text-gray-700'}`}>
              {article.category.toUpperCase()}
            </span>
          )}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-300 text-sm line-clamp-2 hidden md:block">{article.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-gray-300 text-sm">
            {article.author && <span>By {article.author}</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.read_time || 5} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.view_count}
            </span>
          </div>
        </div>
        {article.is_breaking && (
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <TrendingUp className="w-3 h-3" /> BREAKING
            </span>
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start">
        <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden">
          <img
            src={article.thumbnail_url || 'https://images.pexels.com/pexels/34231/f/news-pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          {showCategory && (
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mb-1 ${categoryColors[article.category] || 'bg-gray-100 text-gray-700'}`}>
              {article.category}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>{article.read_time || 5} min</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="group block py-3 border-b border-gray-100 last:border-0">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Eye className="w-3 h-3" />
          <span>{article.view_count}</span>
          <span>•</span>
          <span>{article.category}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={article.thumbnail_url || 'https://images.pexels.com/pexels/34231/f/news-pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        {showCategory && (
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mb-2 ${categoryColors[article.category] || 'bg-gray-100 text-gray-700'}`}>
            {article.category}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.read_time || 5} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.view_count}
            </span>
          </div>
          {article.is_breaking && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <TrendingUp className="w-3 h-3" /> Breaking
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
