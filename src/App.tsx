import { useState, useEffect, useMemo } from 'react';
import { ActivityChart } from './components/ActivityChart';
import { fetchActivities } from './services/stravaApi';
import { calculateSportYearlyStats } from './utils/dataProcessing';
import type { StravaActivity, SportYearlyStats, YAxisType } from './types';

function App() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [yAxisType, setYAxisType] = useState<YAxisType>('distance');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  // Calculate sport yearly stats
  const sportStats = useMemo<SportYearlyStats[]>(() => {
    if (activities.length === 0) return [];
    return calculateSportYearlyStats(activities);
  }, [activities]);

  // Initialize selected sports when sportStats change
  useEffect(() => {
    if (sportStats.length > 0 && selectedSports.length === 0) {
      setSelectedSports(sportStats.map((s) => s.sport));
    }
  }, [sportStats, selectedSports.length]);

  // Get all available sports
  const availableSports = useMemo(() => {
    return sportStats.map((s) => s.sport);
  }, [sportStats]);

  const handleLoadData = async () => {
    if (!accessToken.trim()) {
      setError('Please enter an access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchActivities(accessToken);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSportToggle = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport]
    );
  };

  const handleSelectAllSports = () => {
    setSelectedSports(availableSports);
  };

  const handleDeselectAllSports = () => {
    setSelectedSports([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Strava Activity Dashboard</h1>

        {/* Access Token Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                Strava Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your Strava access token"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleLoadData()}
              />
              <p className="mt-2 text-sm text-gray-500">
                Get your access token from{' '}
                <a
                  href="https://www.strava.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Strava API Settings
                </a>
              </p>
            </div>
            <button
              onClick={handleLoadData}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load Activities'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {activities.length > 0 && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Y-Axis Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y-Axis Metric
                  </label>
                  <select
                    value={yAxisType}
                    onChange={(e) => setYAxisType(e.target.value as YAxisType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="distance">Total Distance (km)</option>
                    <option value="time">Total Time (hours)</option>
                  </select>
                </div>

                {/* Sport Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sports to Display
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllSports}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAllSports}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {availableSports.map((sport) => (
                      <label
                        key={sport}
                        className="flex items-center py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSports.includes(sport)}
                          onChange={() => handleSportToggle(sport)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{sport}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <ActivityChart
                sportStats={sportStats}
                selectedSports={selectedSports}
                yAxisType={yAxisType}
              />
            </div>

            {/* Summary Stats */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{activities.length}</div>
                  <div className="text-sm text-blue-700">Total Activities</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {availableSports.length}
                  </div>
                  <div className="text-sm text-green-700">Sport Types</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {new Set(activities.map((a) => new Date(a.start_date).getFullYear())).size}
                  </div>
                  <div className="text-sm text-purple-700">Years</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
