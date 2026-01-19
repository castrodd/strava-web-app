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

2. **Get your Strava Access Token**:
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Create an application if you haven't already
   - Generate an access token with `read` permissions
   - Copy the access token

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   - Navigate to `http://localhost:5173` (or the URL shown in the terminal)
   - Paste your Strava access token in the input field
   - Click "Load Activities" to fetch your data

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

To use this app, you need a Strava API access token:

1. Visit [Strava Developers](https://www.strava.com/settings/api)
2. Create a new application
3. Set the authorization callback domain (can be `localhost` for development)
4. Generate an access token with `read` scope
5. Copy the token and paste it into the app

**Note**: Access tokens expire. For a production app, you'd want to implement OAuth flow for automatic token refresh.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chart.js** - Chart visualization
- **Tailwind CSS** - Styling
- **Strava API v3** - Activity data

## License

MIT
