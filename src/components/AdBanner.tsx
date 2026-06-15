import { useEffect, useState } from 'react';
import { AdSlot } from '../types';
import { getAdSlots } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';

interface AdBannerProps {
  position: 'header' | 'in-article' | 'sidebar' | 'footer' | 'between-articles';
  className?: string;
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const { settings } = useSettings();
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getAdSlots();
        setAdSlots(data || []);
      } catch (error) {
        console.error('Error fetching ad slots:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Render Google AdSense auto ads script
  useEffect(() => {
    if (settings.adsense_publisher_id && !document.querySelector(`script[src*="adsbygoogle"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsense_publisher_id}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, [settings.adsense_publisher_id]);

  if (isLoading) return null;

  const slot = adSlots.find(ad => ad.slot_position === position && ad.is_active);
  if (!slot) return null;

  if (slot.ad_network === 'adsense' && slot.ad_code) {
    return (
      <div className={`ad-container ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: slot.ad_code }} />
      </div>
    );
  }

  if (slot.ad_network === 'adsterra' && slot.ad_code) {
    return (
      <div className={`ad-container ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: slot.ad_code }} />
      </div>
    );
  }

  // Placeholder ad slot
  return (
    <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: position === 'header' ? '90px' : position === 'sidebar' ? '600px' : '250px' }}>
      <span className="text-gray-400 text-sm">Advertisement</span>
    </div>
  );
}
