import { Helmet } from 'react-helmet-async';
import { useSettings } from '../contexts/SettingsContext';
import { Article } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: Article;
  breadcrumbs?: { name: string; url: string }[];
  faq?: { question: string; answer: string }[];
}

export default function SEOHead({ title, description, keywords, image, url, type = 'website', article, breadcrumbs, faq }: SEOHeadProps) {
  const { settings } = useSettings();
  const siteUrl = settings.site_url || '';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image || settings.logo_url || '';
  const pageTitle = title ? `${title} | ${settings.site_name}` : settings.site_name;
  const pageDescription = description || settings.site_tagline || '';
  const pageKeywords = keywords?.join(', ') || '';

  const jsonLdBreadcrumb = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": `${siteUrl}${item.url}`
    }))
  } : null;

  const jsonLdArticle = article ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.seo_description || article.summary || '',
    "image": article.thumbnail_url || fullImage,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Person",
      "name": article.author || settings.author_name
    },
    "publisher": {
      "@type": "Organization",
      "name": settings.site_name,
      "logo": {
        "@type": "ImageObject",
        "url": settings.logo_url || ''
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    },
    "keywords": article.seo_keywords?.join(', ') || '',
    "articleSection": article.category
  } : null;

  const jsonLdFAQ = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta name="author" content={settings.author_name} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={settings.site_name} />

      {article && (
        <>
          <meta property="article:published_time" content={article.published_at || ''} />
          <meta property="article:modified_time" content={article.updated_at} />
          <meta property="article:section" content={article.category} />
          {article.hashtags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImage} />
      {settings.social_twitter && (
        <meta name="twitter:site" content={settings.social_twitter} />
      )}

      {jsonLdBreadcrumb && (
        <script type="application/ld+json">{JSON.stringify(jsonLdBreadcrumb)}</script>
      )}
      {jsonLdArticle && (
        <script type="application/ld+json">{JSON.stringify(jsonLdArticle)}</script>
      )}
      {jsonLdFAQ && (
        <script type="application/ld+json">{JSON.stringify(jsonLdFAQ)}</script>
      )}

      {settings.google_analytics_id && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
      )}

      {settings.google_search_console_code && (
        <meta name="google-site-verification" content={settings.google_search_console_code} />
      )}
    </Helmet>
  );
}
