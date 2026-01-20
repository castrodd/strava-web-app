import { useState, useEffect, useMemo } from 'react';
import { ActivityChart } from './components/ActivityChart';
import { fetchActivities } from './services/stravaApi';
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getValidAccessToken,
  storeTokens,
  getStoredTokens,
  clearTokens,
  getClientCredentials,
  getRedirectUri,
} from './services/stravaOAuth';
import { calculateSportYearlyStats } from './utils/dataProcessing';
import type { StravaActivity, SportYearlyStats, YAxisType } from './types';

function App() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yAxisType, setYAxisType] = useState<YAxisType>('distance');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitializedSports, setHasInitializedSports] = useState(false);

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (errorParam === 'access_denied') {
      setError('Access denied. Please try again and grant the required permissions.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check if already authenticated
  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    setError(null);

    const credentials = getClientCredentials();
    if (!credentials) {
      setError('Client credentials not configured. Please set VITE_STRAVA_CLIENT_ID and VITE_STRAVA_CLIENT_SECRET environment variables.');
      setLoading(false);
      return;
    }

    try {
      const tokenResponse = await exchangeCodeForTokens(
        code,
        credentials.clientId,
        credentials.clientSecret
      );

      storeTokens({
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: tokenResponse.expires_at,
      });

      setIsAuthenticated(true);
      // Automatically load activities after successful auth
      await loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exchange authorization code');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const credentials = getClientCredentials();
    if (!credentials) {
      setError('Client credentials not configured. Please set VITE_STRAVA_CLIENT_ID and VITE_STRAVA_CLIENT_SECRET environment variables.');
      return;
    }

    // Redirect to Strava authorization
    const authUrl = getAuthorizationUrl(credentials.clientId);
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    clearTokens();
    setIsAuthenticated(false);
    setActivities([]);
    setSelectedSports([]);
    setHasInitializedSports(false);
  };

  const loadActivities = async () => {
    const credentials = getClientCredentials();
    if (!credentials) {
      setError('Client credentials not configured');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingPage(1);

    try {
      const accessToken = await getValidAccessToken(credentials.clientId, credentials.clientSecret);
      const data = await fetchActivities(accessToken, (page) => {
        setLoadingPage(page);
      });
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      if (err instanceof Error && err.message.includes('re-authenticate')) {
        setIsAuthenticated(false);
        clearTokens();
      }
    } finally {
      setLoading(false);
      setLoadingPage(null);
    }
  };

  // Calculate sport yearly stats
  const sportStats = useMemo<SportYearlyStats[]>(() => {
    if (activities.length === 0) return [];
    return calculateSportYearlyStats(activities);
  }, [activities]);

  // Initialize selected sports when sportStats change (only on initial load)
  useEffect(() => {
    if (sportStats.length > 0 && !hasInitializedSports) {
      setSelectedSports(sportStats.map((s) => s.sport));
      setHasInitializedSports(true);
    }
  }, [sportStats, hasInitializedSports]);

  // Get all available sports, sorted alphabetically
  const availableSports = useMemo(() => {
    return sportStats.map((s) => s.sport).sort();
  }, [sportStats]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Strava Summary</h1>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {!isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">Connect to Strava to view your activity summary</p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect to Strava'}
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Connected to Strava</p>
                <p className="text-xs text-gray-500">Redirect URI: <code>{getRedirectUri()}</code></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadActivities}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load Activities'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && loadingPage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            Loading athlete activities (page {loadingPage})...
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
                    Metric
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
                      Select Sports
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
