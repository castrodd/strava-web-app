import type { StravaTokenResponse, StravaTokens } from '../types';

const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

const STORAGE_KEY = 'strava_tokens';
const CLIENT_ID_KEY = 'strava_client_id';
const CLIENT_SECRET_KEY = 'strava_client_secret';

/**
 * Get the redirect URI for OAuth callback
 */
export function getRedirectUri(): string {
  return window.location.origin + window.location.pathname;
}

/**
 * Generate the Strava OAuth authorization URL
 * See: https://developers.strava.com/docs/authentication/
 */
export function getAuthorizationUrl(clientId: string, redirectUri?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || getRedirectUri(),
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
  });

  return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 * See: https://developers.strava.com/docs/authentication/#token-exchange
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<StravaTokenResponse> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
  });

  const response = await fetch(`${STRAVA_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 * See: https://developers.strava.com/docs/authentication/#refreshing-expired-access-tokens
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<StravaTokenResponse> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(`${STRAVA_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: StravaTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * Retrieve tokens from localStorage
 */
export function getStoredTokens(): StravaTokens | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if access token is expired or will expire soon (within 1 hour)
 */
export function isTokenExpired(tokens: StravaTokens): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = tokens.expires_at;
  // Consider expired if it expires within 1 hour (3600 seconds)
  return expiresAt - now < 3600;
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  let tokens = getStoredTokens();

  if (!tokens) {
    throw new Error('No stored tokens. Please authenticate with Strava.');
  }

  // Refresh token if expired or expiring soon
  if (isTokenExpired(tokens)) {
    try {
      const tokenResponse = await refreshAccessToken(tokens.refresh_token, clientId, clientSecret);
      tokens = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: tokenResponse.expires_at,
      };
      storeTokens(tokens);
    } catch (error) {
      clearTokens();
      throw new Error('Failed to refresh token. Please re-authenticate.');
    }
  }

  return tokens.access_token;
}

/**
 * Get client credentials from environment variables
 */
export function getClientCredentials(): { clientId: string; clientSecret: string } | null {
  // Vite exposes env variables via import.meta.env
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return null;
  }
  
  return { clientId, clientSecret };
}
