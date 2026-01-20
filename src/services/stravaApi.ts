import type { StravaActivity } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/**
 * Fetches activities from Strava API
 * See: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
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
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorMessage = `Strava API error: ${response.status} ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired access token. Please re-authenticate.';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: Access denied. Check your token permissions.';
        }
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage += ` - ${errorJson.message}`;
          }
        } catch {
          // Not JSON, use the text as is
          if (errorText && errorText !== 'Unknown error') {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
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
 * See: https://developers.strava.com/docs/reference/#api-Athletes-getLoggedInAthlete
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
