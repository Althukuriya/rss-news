import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Newspaper, Rss, Trophy, Megaphone,
  Link2, Settings, LogOut, Menu, X, ChevronRight, Sparkles
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { clearAdminAuth } from '../../lib/api';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/articles', label: 'Articles', icon: FileText },
  { path: '/admin/generate', label: 'Generate', icon: Sparkles },
  { path: '/admin/rss', label: 'RSS Sources', icon: Rss },
  { path: '/admin/live-scores', label: 'Live Scores', icon: Trophy },
  { path: '/admin/ads', label: 'Ad Manager', icon: Megaphone },
  { path: '/admin/affiliates', label: 'Affiliates', icon: Link2 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 bg-gray-900 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isSidebarOpen && (
            <Link to="/admin" className="font-bold text-lg">
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:text-red-400 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Link to="/" className="text-blue-600 hover:text-blue-700">
                View Site
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">Admin</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{settings.site_name}</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
