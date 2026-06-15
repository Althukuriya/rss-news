import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CATEGORIES, LANGUAGES } from '../types';

export default function Header() {
  const { settings } = useSettings();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(settings.theme_mode === 'dark');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const currentLang = new URLSearchParams(window.location.search).get('lang') || 'en';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NF</span>
              </div>
            )}
            <span className="font-bold text-xl text-gray-900 hidden sm:block">{settings.site_name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === `/category/${cat.slug}` ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1"
              >
                More <ChevronDown className="w-4 h-4" />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                  {CATEGORIES.slice(8).map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm hidden md:inline">{LANGUAGES.find(l => l.code === currentLang)?.name || 'EN'}</span>
              </button>
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border py-2 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <Link
                      key={lang.code}
                      to={`${location.pathname}?lang=${lang.code}`}
                      className={`block px-4 py-2 text-sm ${
                        currentLang === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsLangOpen(false)}
                    >
                      {lang.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
