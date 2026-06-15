import { useSettings } from '../contexts/SettingsContext';
import SEOHead from '../components/SEOHead';

export default function DisclaimerPage() {
  const { settings, isLoading } = useSettings();

  return (
    <>
      <SEOHead title="Disclaimer" description="Our disclaimer" url="/disclaimer" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Disclaimer</h1>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {settings.disclaimer || 'Disclaimer content goes here. Configure this in the admin settings.'}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
