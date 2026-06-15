import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useEffect } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LiveScoresPage = lazy(() => import('./pages/LiveScoresPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const AuthorPage = lazy(() => import('./pages/AuthorPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
const AdminArticleEditor = lazy(() => import('./pages/admin/AdminArticleEditor'));
const AdminGenerate = lazy(() => import('./pages/admin/AdminGenerate'));
const AdminRSS = lazy(() => import('./pages/admin/AdminRSS'));
const AdminLiveScores = lazy(() => import('./pages/admin/AdminLiveScores'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));
const AdminAffiliates = lazy(() => import('./pages/admin/AdminAffiliates'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('adminToken');

  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  if (isAuthenticated && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <HelmetProvider>
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
              <Route path="/article/:slug" element={<Layout><ArticlePage /></Layout>} />
              <Route path="/:lang/:slug" element={<Layout><ArticlePage /></Layout>} />
              <Route path="/search" element={<Layout><SearchPage /></Layout>} />
              <Route path="/live-scores" element={<Layout><LiveScoresPage /></Layout>} />
              <Route path="/deals" element={<Layout><DealsPage /></Layout>} />
              <Route path="/author" element={<Layout><AuthorPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
              <Route path="/disclaimer" element={<Layout><DisclaimerPage /></Layout>} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminAuthGuard><AdminLayout /></AdminAuthGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="articles/new" element={<AdminArticleEditor />} />
                <Route path="articles/edit/:id" element={<AdminArticleEditor />} />
                <Route path="generate" element={<AdminGenerate />} />
                <Route path="rss" element={<AdminRSS />} />
                <Route path="live-scores" element={<AdminLiveScores />} />
                <Route path="ads" element={<AdminAds />} />
                <Route path="affiliates" element={<AdminAffiliates />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
