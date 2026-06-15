import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, RefreshCw } from 'lucide-react';
import { LiveScore } from '../types';
import { getLiveScores } from '../lib/api';

export default function LiveScores() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await getLiveScores();
        setScores(data || []);
      } catch (error) {
        console.error('Error fetching live scores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();

    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-white">
        <div className="animate-pulse flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-blue-500/30 h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-white text-center">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm opacity-75">No live matches at the moment</p>
      </div>
    );
  }

  const groupedBySport = scores.reduce((acc, score) => {
    if (!acc[score.sport]) acc[score.sport] = [];
    acc[score.sport].push(score);
    return acc;
  }, {} as Record<string, LiveScore[]>);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <h3 className="font-semibold">Live Scores</h3>
        </div>
        <Link to="/live-scores" className="text-sm text-blue-100 hover:text-white">
          View All
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(groupedBySport).map(([sport, matches]) => (
          <div key={sport} className="flex gap-3">
            {matches.slice(0, 5).map((match) => (
              <div
                key={match.id}
                className="min-w-[200px] bg-white/10 backdrop-blur rounded-lg p-3 hover:bg-white/20 transition-colors"
              >
                <div className="text-xs text-blue-100 mb-2">{match.league || sport}</div>
                <div className="font-semibold text-sm truncate">{match.match_title}</div>
                <div className="text-lg font-bold mt-2">
                  <span className="text-white">{match.score1 || '0'}</span>
                  <span className="text-blue-200 mx-2">-</span>
                  <span className="text-white">{match.score2 || '0'}</span>
                </div>
                <div className="text-xs text-yellow-300 mt-1">
                  {match.status === 'live' && <span className="animate-pulse">LIVE</span>}
                  {match.status !== 'live' && match.match_time}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <RefreshCw className="w-4 h-4 text-blue-200 animate-spin" />
      </div>
    </div>
  );
}
