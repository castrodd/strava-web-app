import type { StravaActivity, YearlyStats, SportYearlyStats } from '../types';

/**
 * Groups activities by sport type
 */
export function groupActivitiesBySport(activities: StravaActivity[]): Record<string, StravaActivity[]> {
  return activities.reduce((acc, activity) => {
    const sport = activity.type || 'Unknown';
    if (!acc[sport]) {
      acc[sport] = [];
    }
    acc[sport].push(activity);
    return acc;
  }, {} as Record<string, StravaActivity[]>);
}

/**
 * Calculates yearly statistics for a set of activities
 */
export function calculateYearlyStats(activities: StravaActivity[]): YearlyStats[] {
  const yearMap = new Map<number, { distance: number; time: number }>();

  activities.forEach((activity) => {
    const year = new Date(activity.start_date).getFullYear();
    const existing = yearMap.get(year) || { distance: 0, time: 0 };
    
    yearMap.set(year, {
      distance: existing.distance + activity.distance,
      time: existing.time + activity.moving_time,
    });
  });

  return Array.from(yearMap.entries())
    .map(([year, stats]) => ({
      year,
      distance: stats.distance,
      time: stats.time,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Calculates yearly statistics grouped by sport
 */
export function calculateSportYearlyStats(activities: StravaActivity[]): SportYearlyStats[] {
  const sportGroups = groupActivitiesBySport(activities);
  
  return Object.entries(sportGroups).map(([sport, sportActivities]) => ({
    sport,
    yearlyStats: calculateYearlyStats(sportActivities),
  }));
}

/**
 * Converts meters to kilometers
 */
export function metersToKilometers(meters: number): number {
  return meters / 1000;
}

/**
 * Converts seconds to hours
 */
export function secondsToHours(seconds: number): number {
  return seconds / 3600;
}
