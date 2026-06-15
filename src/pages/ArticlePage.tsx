import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Home, Clock, Eye, Calendar, User, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { Article, AffiliateKeyword, Article as ArticleType, CATEGORIES, LANGUAGES } from '../types';
import { getArticleBySlug, getRelatedArticles, getTranslations, getAffiliateKeywords, trackPageView, trackAffiliateClick } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import ArticleCard from '../components/ArticleCard';
import ShareButtons from '../components/ShareButtons';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
  const [translations, setTranslations] = useState<{ language_code: string; slug: string }[]>([]);
  const [affiliateKeywords, setAffiliateKeywords] = useState<AffiliateKeyword[]>([]);
  const [processedBody, setProcessedBody] = useState('');
  const [showBackTop, setShowBackTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const articleData = await getArticleBySlug(slug);
        if (!articleData) {
          setIsLoading(false);
          return;
        }
        setArticle(articleData);

        trackPageView(articleData.id, articleData.language);

        const [related, transData, keywords] = await Promise.all([
          getRelatedArticles(articleData.id, articleData.category, 4),
          getTranslations(articleData.id),
          getAffiliateKeywords(articleData.id)
        ]);

        setRelatedArticles(related);
        setTranslations(transData || []);
        setAffiliateKeywords(keywords || []);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [slug]);

  useEffect(() => {
    if (!article) return;

    let body = article.body;

    // Sort keywords by length (longest first) to avoid partial replacements
    const sortedKeywords = [...affiliateKeywords].sort((a, b) => b.keyword.length - a.keyword.length);

    for (const kw of sortedKeywords) {
      // Escape special regex characters in keyword
      const escapedKeyword = kw.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match keyword only in text content (not inside HTML tags)
      // This regex finds text between > and < that contains the keyword
      const regex = new RegExp(`(>[^<]*)(${escapedKeyword})([^<]*<)`, 'gi');

      body = body.replace(regex, (match, before, keyword, after) => {
        const escapedId = kw.id.replace(/'/g, "\\'");
        const escapedArticleId = article.id.replace(/'/g, "\\'");
        return `${before}<a href="${kw.affiliate_url}" target="_blank" rel="sponsored noopener" class="affiliate-link text-amber-600 underline decoration-dotted hover:text-amber-700" data-keyword-id="${kw.id}" onclick="event.preventDefault(); window.trackAffiliateLink('${escapedId}', '${escapedArticleId}'); window.open('${kw.affiliate_url}', '_blank');">${keyword}</a>${after}`;
      });
    }

    setProcessedBody(body);
  }, [article, affiliateKeywords]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    (window as any).trackAffiliateLink = async (keywordId: string, articleId: string) => {
      try {
        await trackAffiliateClick(keywordId, articleId);
      } catch (error) {
        console.error('Error tracking affiliate click:', error);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
        <Link to="/" className="text-blue-600 mt-4 inline-block">Go to Home</Link>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.slug === article.category);
  const publishedDate = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <>
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.summary || ''}
        keywords={article.seo_keywords || undefined}
        image={article.thumbnail_url || undefined}
        url={`/article/${article.slug}`}
        type="article"
        article={article}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: category?.name || article.category, url: `/category/${article.category}` },
          { name: article.title, url: `/article/${article.slug}` }
        ]}
        faq={article.faq}
      />

      {translations.length > 0 && (
        <Helmet>
          <link rel="alternate" hreflang={article.language || 'en'} href={`${settings.site_url}/article/${article.slug}`} />
          {translations.map(trans => (
            <link key={trans.language_code} rel="alternate" hreflang={trans.language_code} href={`${settings.site_url}/${trans.language_code}/${trans.slug}`} />
          ))}
        </Helmet>
      )}

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-gray-600 overflow-x-auto">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1 shrink-0">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
            <Link to={`/category/${article.category}`} className="hover:text-blue-600 shrink-0 capitalize">
              {category?.name || article.category}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <header className="mb-6">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full mb-4 capitalize">
                {category?.name || article.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {article.author && (
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {article.author}
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {publishedDate}
                  </span>
                )}
                {article.read_time && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {article.read_time} min read
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {article.view_count} views
                </span>
              </div>
              <ShareButtons
                title={article.title}
                url={`${settings.site_url}/article/${article.slug}`}
                summary={article.summary || ''}
              />
            </header>

            {article.thumbnail_url && (
              <div className="mb-8">
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-full rounded-xl object-cover"
                  loading="eager"
                />
              </div>
            )}

            <AdBanner position="header" className="h-20 mb-6" />

            <div
              className="prose prose-lg max-w-none article-body"
              dangerouslySetInnerHTML={{ __html: processedBody }}
            />

            <AdBanner position="in-article" className="h-20 my-6" />

            {article.faq && article.faq.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {article.faq.map((faq, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-left font-medium hover:bg-gray-100"
                      >
                        <span>{faq.question}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 py-3 bg-white text-gray-700">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {article.hashtags && article.hashtags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.hashtags.map(tag => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {relatedArticles.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.map(relArticle => (
                    <ArticleCard key={relArticle.id} article={relArticle} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {translations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <h3 className="font-bold mb-3">Available Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/article/${article.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      English
                    </Link>
                    {translations.map(trans => {
                      const lang = LANGUAGES.find(l => l.code === trans.language_code);
                      return (
                        <Link
                          key={trans.language_code}
                          to={`/${trans.language_code}/${trans.slug}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-50"
                        >
                          {lang?.name || trans.language_code}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <AdBanner position="sidebar" className="min-h-[300px] mb-6" />

              {settings.disqus_shortname && settings.comments_enabled === 'true' && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div id="disqus_thread" />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <AdBanner position="footer" className="h-24 mt-8" />

      {showBackTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
