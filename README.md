# Strava Activity Dashboard

A TypeScript web application that fetches and visualizes Strava activity data with interactive charts.

## Features

- 📊 **Line Chart Visualization**: Display yearly activity data with years on the x-axis
- 📏 **Flexible Y-Axis**: Switch between total distance (km) or total time (hours)
- 🏃 **Sport Filtering**: Select which sports to display using checkboxes
- 🎨 **Modern UI**: Clean, responsive design built with React and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Strava account with API access

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create a Strava Application**:
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Click "Create App" or use an existing application
   - Fill in the required fields:
     - **Application Name**: Your app name
     - **Category**: Choose appropriate category
     - **Website**: Your website (can be `http://localhost:5173` for development)
     - **Authorization Callback Domain**: Set to `localhost` (or your domain for production)
   - Save and note your **Client ID** and **Client Secret**

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Authenticate with Strava**:
   - Navigate to `http://localhost:5173` (or the URL shown in the terminal)
   - Enter your **Client ID** and **Client Secret** from step 2
   - Click "Connect to Strava"
   - You'll be redirected to Strava to authorize the application
   - After authorization, you'll be redirected back to the app
   - The app will automatically load your activities

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  ├── components/
  │   └── ActivityChart.tsx    # Chart component using Chart.js
  ├── services/
  │   └── stravaApi.ts         # Strava API integration
  ├── utils/
  │   └── dataProcessing.ts    # Data aggregation and processing
  ├── types.ts                 # TypeScript type definitions
  ├── App.tsx                  # Main application component
  ├── main.tsx                 # Application entry point
  └── index.css                # Global styles
```

## Strava API Setup

This app uses OAuth 2.0 authentication as recommended by Strava. The authentication flow:

1. **User Authorization**: When you click "Connect to Strava", you're redirected to Strava's authorization page
2. **Token Exchange**: After authorization, the app exchanges the authorization code for access and refresh tokens
3. **Automatic Token Refresh**: Access tokens expire after 6 hours. The app automatically refreshes tokens using the refresh token when needed

### OAuth Scopes

The app requests the `activity:read_all` scope, which allows reading all activity data including private activities.

### Security Notes

- **Client Secret Storage**: For this single-page app, the client secret is stored in browser localStorage. This is acceptable for personal use but not recommended for production applications that serve multiple users.
- **Token Storage**: Access tokens and refresh tokens are stored in browser localStorage
- **Production**: For a production app serving multiple users, you should implement a backend server to securely handle the client secret and token exchange

For more details, see the [Strava Authentication Documentation](https://developers.strava.com/docs/authentication/).

## Troubleshooting

### Common Errors

- **401 Unauthorized**: Your access token has expired. The app should automatically refresh it. If the error persists, try disconnecting and reconnecting.
- **403 Forbidden**: Your token doesn't have the required permissions. Make sure you granted the `activity:read_all` scope during authorization.
- **"Access denied"**: You declined to authorize the application. Try connecting again and make sure to grant all requested permissions.
- **"Client credentials not found"**: Make sure you've entered your Client ID and Client Secret before connecting.

### OAuth Callback Issues

If you're having trouble with the OAuth callback:

1. Make sure the **Authorization Callback Domain** in your Strava app settings matches your domain (e.g., `localhost` for development)
2. The redirect URI must match exactly - check the console for the redirect URI being used
3. Clear your browser's localStorage if you're having persistent issues: Open browser console and run `localStorage.clear()`

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chart.js** - Chart visualization
- **Tailwind CSS** - Styling
- **Strava API v3** - Activity data

## License

MIT
