export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number;
  type: string; // sport type
  start_date: string; // ISO 8601 date string
  start_date_local: string;
  timezone: string;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}

export type YAxisType = 'distance' | 'time';

export interface YearlyStats {
  year: number;
  distance: number; // meters
  time: number; // seconds
}

export interface SportYearlyStats {
  sport: string;
  yearlyStats: YearlyStats[];
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}
