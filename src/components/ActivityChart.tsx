import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SportYearlyStats, YAxisType } from '../types';
import { metersToKilometers, secondsToHours } from '../utils/dataProcessing';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityChartProps {
  sportStats: SportYearlyStats[];
  selectedSports: string[];
  yAxisType: YAxisType;
}

export function ActivityChart({ sportStats, selectedSports, yAxisType }: ActivityChartProps) {
  const chartData = useMemo(() => {
    // Get all unique years across all sports
    const allYears = new Set<number>();
    sportStats.forEach(({ yearlyStats }) => {
      yearlyStats.forEach(({ year }) => allYears.add(year));
    });
    const sortedYears = Array.from(allYears).sort();

    // Filter to selected sports
    const filteredStats = sportStats.filter(({ sport }) => selectedSports.includes(sport));

    // Calculate total line by combining selected sports
    const combinedYearlyStats = new Map<number, { distance: number; time: number }>();
    filteredStats.forEach(({ yearlyStats }) => {
      yearlyStats.forEach(({ year, distance, time }) => {
        const existing = combinedYearlyStats.get(year) || { distance: 0, time: 0 };
        combinedYearlyStats.set(year, {
          distance: existing.distance + distance,
          time: existing.time + time,
        });
      });
    });

    // Create total dataset
    const totalData = sortedYears.map((year) => {
      const yearStat = combinedYearlyStats.get(year);
      if (!yearStat) return null;

      if (yAxisType === 'distance') {
        return metersToKilometers(yearStat.distance);
      } else {
        return secondsToHours(yearStat.time);
      }
    });

    // Create datasets for each selected sport
    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
    ];

    const sportDatasets = filteredStats.map(({ sport, yearlyStats }, index) => {
      const data = sortedYears.map((year) => {
        const yearStat = yearlyStats.find((ys) => ys.year === year);
        if (!yearStat) return null;

        if (yAxisType === 'distance') {
          return metersToKilometers(yearStat.distance);
        } else {
          return secondsToHours(yearStat.time);
        }
      });

      return {
        label: sport,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '40',
        tension: 0.1,
      };
    });

    // Combine total line (first) with individual sport lines
    const datasets = [
      {
        label: 'Total',
        data: totalData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgb(34, 197, 94)40',
        borderWidth: 3,
        borderDash: [],
        tension: 0.1,
      },
      ...sportDatasets,
    ];

    return {
      labels: sortedYears.map((y) => y.toString()),
      datasets,
    };
  }, [sportStats, selectedSports, yAxisType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: yAxisType === 'distance' 
          ? 'Total Distance by Year (km)' 
          : 'Total Time by Year (hours)',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (value === null) return '';
            if (yAxisType === 'distance') {
              return `${context.dataset.label}: ${value.toFixed(2)} km`;
            } else {
              return `${context.dataset.label}: ${value.toFixed(2)} hours`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisType === 'distance' ? 'Distance (km)' : 'Time (hours)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
    },
  };

  return (
    <div className="w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
