import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CATEGORIES } from '../types';

export default function Footer() {
  const { settings } = useSettings();

  const socialLinks = [
    { key: 'twitter', url: settings.social_twitter, icon: '𝕏' },
    { key: 'facebook', url: settings.social_facebook, icon: 'f' },
    { key: 'instagram', url: settings.social_instagram, icon: '📷' },
    { key: 'youtube', url: settings.social_youtube, icon: '▶' },
    { key: 'telegram', url: settings.social_telegram, icon: '✈' }
  ].filter(link => link.url);

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto" />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NF</span>
                </div>
              )}
              <span className="font-bold text-xl">{settings.site_name}</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">{settings.site_tagline}</p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/live-scores" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Live Scores
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {settings.contact_email && (
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-white transition-colors">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
