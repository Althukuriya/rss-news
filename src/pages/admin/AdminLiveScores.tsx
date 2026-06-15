import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Trophy } from 'lucide-react';
import { LiveScore } from '../../types';
import { getLiveScores, createLiveScore, updateLiveScore, deleteLiveScore } from '../../lib/api';
import { showToast } from '../../components/ShareButtons';

export default function AdminLiveScores() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newScore, setNewScore] = useState({
    sport: 'cricket',
    match_title: '',
    team1: '',
    team2: '',
    score1: '',
    score2: '',
    status: 'live',
    match_time: '',
    league: ''
  });

  const fetchScores = async () => {
    try {
      const data = await getLiveScores();
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddScore = async () => {
    if (!newScore.match_title) {
      showToast('Match title is required', 'error');
      return;
    }

    try {
      const data = await createLiveScore(newScore);
      setScores([data, ...scores]);
      setNewScore({
        sport: 'cricket',
        match_title: '',
        team1: '',
        team2: '',
        score1: '',
        score2: '',
        status: 'live',
        match_time: '',
        league: ''
      });
      setShowAddForm(false);
      showToast('Match added');
    } catch (error) {
      showToast('Failed to add match', 'error');
    }
  };

  const handleUpdateScore = async (id: string, updates: Partial<LiveScore>) => {
    try {
      await updateLiveScore(id, updates);
      setScores(scores.map(s => s.id === id ? { ...s, ...updates } : s));
      showToast('Score updated');
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this match?')) return;
    try {
      await deleteLiveScore(id);
      setScores(scores.filter(s => s.id !== id));
      showToast('Match deleted');
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    live: 'bg-red-100 text-red-700',
    upcoming: 'bg-blue-100 text-blue-700',
    finished: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Scores</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchScores}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Match
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Match</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sport</label>
              <select
                value={newScore.sport}
                onChange={e => setNewScore({ ...newScore, sport: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Match Title</label>
              <input
                type="text"
                value={newScore.match_title}
                onChange={e => setNewScore({ ...newScore, match_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="IND vs AUS - 3rd Test"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">League/Series</label>
              <input
                type="text"
                value={newScore.league}
                onChange={e => setNewScore({ ...newScore, league: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Border-Gavaskar Trophy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team 1</label>
              <input
                type="text"
                value={newScore.team1}
                onChange={e => setNewScore({ ...newScore, team1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Score 1</label>
              <input
                type="text"
                value={newScore.score1}
                onChange={e => setNewScore({ ...newScore, score1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="245/6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team 2</label>
              <input
                type="text"
                value={newScore.team2}
                onChange={e => setNewScore({ ...newScore, team2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Australia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Score 2</label>
              <input
                type="text"
                value={newScore.score2}
                onChange={e => setNewScore({ ...newScore, score2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="189/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={newScore.status}
                onChange={e => setNewScore({ ...newScore, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="live">Live</option>
                <option value="upcoming">Upcoming</option>
                <option value="finished">Finished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Match Time</label>
              <input
                type="text"
                value={newScore.match_time}
                onChange={e => setNewScore({ ...newScore, match_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Day 2, Session 2"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddScore}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Match
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 col-span-full">Loading...</div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8 text-gray-500 col-span-full">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No matches found</p>
          </div>
        ) : (
          scores.map(score => (
            <div key={score.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase">{score.sport}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[score.status || 'live']}`}>
                  {score.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{score.match_title}</h3>
              {score.league && <p className="text-xs text-gray-500 mb-2">{score.league}</p>}

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">{score.team1}</p>
                  <p className="text-lg font-bold">{score.score1 || '-'}</p>
                </div>
                <span className="text-gray-300">vs</span>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{score.team2}</p>
                  <p className="text-lg font-bold">{score.score2 || '-'}</p>
                </div>
              </div>

              {score.match_time && (
                <p className="text-xs text-gray-500 text-center mt-2">{score.match_time}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex gap-2">
                  <select
                    value={score.status || 'live'}
                    onChange={e => handleUpdateScore(score.id, { status: e.target.value })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="live">Live</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
                <button
                  onClick={() => handleDelete(score.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
