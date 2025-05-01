import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, PieController, ArcElement, TimeScale, Tooltip,
} from 'chart.js';
import 'chartjs-adapter-moment';

Chart.register(PieController, ArcElement, TimeScale, Tooltip);

// Stacatruc color palette
const stacatrucColors = {
  green: '#36A501',
  darkGrey: '#474747',
  lightGrey: '#E4E4E4',
  medGrey: '#707070',
  clarkGreen: '#BCD230',
  blue: '#3985AE',
  white: '#FFFFFF', // Added white for 25% in dark mode
};

// Chart colors with dark mode variants
const chartColorScheme = {
  light: [
    stacatrucColors.green,
    stacatrucColors.blue,
    stacatrucColors.clarkGreen,
    stacatrucColors.darkGrey,
    stacatrucColors.medGrey,
    stacatrucColors.lightGrey,
  ],
  dark: [
    stacatrucColors.green,
    stacatrucColors.blue,
    stacatrucColors.clarkGreen,
    stacatrucColors.lightGrey,
    stacatrucColors.medGrey,
    stacatrucColors.darkGrey,
  ]
};

// Custom tooltip colors that match the Stacatruc theme
const stacatrucTooltipColors = {
  titleColor: {
    light: stacatrucColors.darkGrey,
    dark: stacatrucColors.lightGrey,
  },
  bodyColor: {
    light: stacatrucColors.medGrey,
    dark: stacatrucColors.lightGrey,
  },
  backgroundColor: {
    light: '#FFFFFF',
    dark: stacatrucColors.darkGrey,
  },
  borderColor: {
    light: stacatrucColors.lightGrey,
    dark: stacatrucColors.medGrey,
  },
};

function PieChart({
  data,
  width,
  height,
  onSegmentClick // Add new prop for click handler
}) {

  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const legend = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

 // Prepare the chart data with Stacatruc colors
 const prepareChartData = (sourceData) => {
  if (!sourceData) return null;
  
  // Create a custom color mapping for probability labels
  const probabilityColorMap = {
    '25% Probability': darkMode ? stacatrucColors.white : stacatrucColors.darkGrey, // Changed to white in dark mode
    '50% Probability': darkMode ? stacatrucColors.clarkGreen : stacatrucColors.clarkGreen, // Warning - clark green
    '75% Probability': darkMode ? stacatrucColors.blue : stacatrucColors.blue, // Secondary - blue
    '90% Probability': darkMode ? stacatrucColors.green : stacatrucColors.green, // Success - green
  };
  
  return {
    ...sourceData,
    datasets: sourceData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: sourceData.labels.map(label => probabilityColorMap[label] || stacatrucColors.medGrey),
      hoverBackgroundColor: sourceData.labels.map(label => probabilityColorMap[label] || stacatrucColors.medGrey),
      borderWidth: 0,
    }))
  };
};

  useEffect(() => {
    const ctx = canvas.current;
    // Create chart with Stacatruc colors
    const chartData = prepareChartData(data);
    
    const newChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleColor: darkMode ? stacatrucTooltipColors.titleColor.dark : stacatrucTooltipColors.titleColor.light,
            bodyColor: darkMode ? stacatrucTooltipColors.bodyColor.dark : stacatrucTooltipColors.bodyColor.light,
            backgroundColor: darkMode ? stacatrucTooltipColors.backgroundColor.dark : stacatrucTooltipColors.backgroundColor.light,
            borderColor: darkMode ? stacatrucTooltipColors.borderColor.dark : stacatrucTooltipColors.borderColor.light,
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
                const dataset = context.chart.data.datasets[0];
                const index = context.dataIndex;
                const original = dataset.tooltipData?.[index];
                if (original) {
                  return `${original.label}: ${original.count}`;
                }
                return context.label || '';
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
        onClick: (event, elements) => {
          if (elements.length > 0 && onSegmentClick) {
            const index = elements[0].index;
            onSegmentClick(index, data.labels[index]);
          }
        },
      },
      plugins: [
        {
          id: 'htmlLegend',
          afterUpdate(c, args, options) {
            const ul = legend.current;
            if (!ul) return;
            // Remove old legend items
            while (ul.firstChild) {
              ul.firstChild.remove();
            }
            // Reuse the built-in legendItems generator
            const items = c.options.plugins.legend.labels.generateLabels(c);
            items.forEach((item) => {
              const li = document.createElement('li');
              li.style.margin = '4px';
              // Button element
              const button = document.createElement('button');
              button.classList.add('btn-xs', 'bg-white', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400', 'shadow-xs', 'shadow-black/[0.08]', 'rounded-full');
              button.style.opacity = item.hidden ? '.3' : '';
              button.onclick = () => {
                c.toggleDataVisibility(item.index);
                c.update();
              };
              // Color box
              const box = document.createElement('span');
              box.style.display = 'block';
              box.style.width = '8px';
              box.style.height = '8px';
              box.style.backgroundColor = item.fillStyle;
              box.style.borderRadius = '4px';
              box.style.marginRight = '4px';
              box.style.pointerEvents = 'none';
              // Label
              const label = document.createElement('span');
              label.style.display = 'flex';
              label.style.alignItems = 'center';
              const labelText = document.createTextNode(item.text);
              label.appendChild(labelText);
              li.appendChild(button);
              button.appendChild(box);
              button.appendChild(label);
              ul.appendChild(li);
            });
          },
        },
      ],
    });
    setChart(newChart);
    return () => newChart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chart when data changes
  useEffect(() => {
    if (!chart || !data) return;
    
    // Create a custom color mapping for probability labels
    const probabilityColorMap = {
      '25% Probability': darkMode ? stacatrucColors.white : stacatrucColors.darkGrey, // Changed to white in dark mode
      '50% Probability': darkMode ? stacatrucColors.clarkGreen : stacatrucColors.clarkGreen, // Warning - clark green
      '75% Probability': darkMode ? stacatrucColors.blue : stacatrucColors.blue, // Secondary - blue
      '90% Probability': darkMode ? stacatrucColors.green : stacatrucColors.green, // Success - green
    };
    
    // Update data values if they changed
    chart.data.labels = data.labels;
    chart.data.datasets.forEach((dataset, i) => {
      dataset.data = data.datasets[i].data;
      dataset.backgroundColor = data.labels.map(label => probabilityColorMap[label] || stacatrucColors.medGrey);
      dataset.hoverBackgroundColor = data.labels.map(label => probabilityColorMap[label] || stacatrucColors.medGrey);
    });
    
    chart.update();
  }, [data, chart, darkMode]);

  return (
    <div className="grow flex flex-col justify-center cursor-pointer">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
      <div className="px-5 pt-2 pb-6">
        <ul ref={legend} className="flex flex-wrap justify-center -m-1"></ul>
      </div>
    </div>
  );
}

export default PieChart;