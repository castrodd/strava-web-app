import type { StravaActivity } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/**
 * Fetches activities from Strava API
 * Note: You'll need to set up OAuth and get an access token
 * For now, this is a placeholder that shows the structure
 */
export async function fetchActivities(accessToken: string): Promise<StravaActivity[]> {
  const activities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  try {
    while (true) {
      const response = await fetch(
        `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
      }

      const pageActivities: StravaActivity[] = await response.json();
      
      if (pageActivities.length === 0) {
        break;
      }

      activities.push(...pageActivities);
      
      // If we got fewer than perPage, we've reached the end
      if (pageActivities.length < perPage) {
        break;
      }

      page++;
    }

    return activities;
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

/**
 * Get the current athlete's info
 */
export async function getAthlete(accessToken: string) {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
