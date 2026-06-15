import { Share2, MessageCircle, Twitter, Facebook, Link2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-hot-toast';

interface ShareButtonsProps {
  title: string;
  url: string;
  summary?: string;
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
}

export default function ShareButtons({ title, url, summary }: ShareButtonsProps) {
  const { settings } = useSettings();
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedSummary = encodeURIComponent(summary || '');

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: Share2,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    }
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} text-white p-2 rounded-lg transition-colors`}
          title={`Share on ${link.name}`}
        >
          <link.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copyLink}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
        title="Copy link"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}
