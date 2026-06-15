import { useState, useEffect } from 'react';
import { Clock, Radio, Calendar, Trophy } from 'lucide-react';
import { LiveScore } from '../types';
import { getLiveScores } from '../lib/api';
import SEOHead from '../components/SEOHead';

export default function LiveScoresPage() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLiveScores();
        setScores(data || []);
      } catch (error) {
        console.error('Error fetching live scores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();

    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  const sports = [...new Set(scores.map(s => s.sport))];
  const filteredScores = selectedSport
    ? scores.filter(s => s.sport === selectedSport)
    : scores;

  const liveScores = filteredScores.filter(s => s.status?.toLowerCase() === 'live');
  const upcomingScores = filteredScores.filter(s => s.status?.toLowerCase() === 'upcoming' || s.status?.toLowerCase() === 'scheduled');
  const finishedScores = filteredScores.filter(s => s.status?.toLowerCase() === 'finished' || s.status?.toLowerCase() === 'completed');

  const ScoreCard = ({ score }: { score: LiveScore }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase">{score.league || score.sport}</span>
        {score.status?.toLowerCase() === 'live' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        {score.status?.toLowerCase() === 'finished' && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Finished</span>
        )}
        {score.status?.toLowerCase() === 'upcoming' && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">Upcoming</span>
        )}
      </div>

      <div className="text-center mb-3">
        <h3 className="font-semibold text-gray-900">{score.match_title}</h3>
        {score.match_time && (
          <p className="text-xs text-gray-500 mt-1">{score.match_time}</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">{score.team1}</p>
          <p className="text-2xl font-bold text-gray-900">{score.score1 || '-'}</p>
        </div>
        <span className="text-gray-300 text-xl">vs</span>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">{score.team2}</p>
          <p className="text-2xl font-bold text-gray-900">{score.score2 || '-'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Live Scores" description="Live cricket and football scores" url="/live-scores" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Scores</h1>
            <p className="text-gray-600 mt-1">Real-time sports updates</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Auto-refresh: 60s</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSport('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              !selectedSport ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {sports.map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize ${
                selectedSport === sport ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-full mb-4" />
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="h-4 bg-gray-100 rounded w-20 mb-1" />
                    <div className="h-8 bg-gray-200 rounded w-12" />
                  </div>
                  <div className="text-center">
                    <div className="h-4 bg-gray-100 rounded w-20 mb-1" />
                    <div className="h-8 bg-gray-200 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {liveScores.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900">Live Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveScores.map(score => (
                    <ScoreCard key={score.id} score={score} />
                  ))}
                </div>
              </section>
            )}

            {upcomingScores.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-gray-900">Upcoming</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingScores.map(score => (
                    <ScoreCard key={score.id} score={score} />
                  ))}
                </div>
              </section>
            )}

            {finishedScores.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-gray-500" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finishedScores.map(score => (
                    <ScoreCard key={score.id} score={score} />
                  ))}
                </div>
              </section>
            )}

            {filteredScores.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No scores available at the moment</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
