import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip);

function LineChart01({
  data,
  width,
  height
}) {
  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;
  
  // Determine if labels are dates or categories (like month names)
  const isTimeScale = data && data.labels && data.labels.length > 0 && 
                     /^\d{2}-\d{2}-\d{4}$/.test(data.labels[0]);

  useEffect(() => {
    const ctx = canvas.current;
    
    // Configure the options based on label type
    const scaleOptions = isTimeScale ? 
      {
        x: {
          type: 'time',
          time: {
            parser: 'MM-DD-YYYY',
            unit: 'month',
          },
          display: false,
        }
      } : 
      {
        x: {
          type: 'category',
          display: false,
        }
      };
    
    // Create chart with appropriate config
    const newChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
          },
          ...scaleOptions
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => formatValue(context.parsed.y),
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });
    
    setChart(newChart);
    return () => newChart.destroy();
  }, []); // Empty dependency array for initial setup

  // Update chart when data changes
  useEffect(() => {
    if (!chart) return;
    
    // Determine if new labels are dates or categories
    const newIsTimeScale = data && data.labels && data.labels.length > 0 && 
                          /^\d{2}-\d{2}-\d{4}$/.test(data.labels[0]);
    
    // Update scale type if needed
    if (newIsTimeScale) {
      chart.options.scales.x = {
        type: 'time',
        time: {
          parser: 'MM-DD-YYYY',
          unit: 'month',
        },
        display: false,
      };
    } else {
      chart.options.scales.x = {
        type: 'category',
        display: false,
      };
    }
    
    // Update chart data
    chart.data = data;
    chart.update();
  }, [data]);

  // Update theme
  useEffect(() => {
    if (!chart) return;

    if (darkMode) {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
    } else {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
    }
    chart.update('none');
  }, [currentTheme]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default LineChart01;