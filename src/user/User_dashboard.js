import React from 'react';
import './User_dashboard.css';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function UserDashboard() {
  const sessionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Sessions',
        data: [3, 5, 2, 4],
        backgroundColor: '#ffffff',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Sessions',
        color: '#fff',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#fff',
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
    },
  };

  return (
    <div className="template-page">
      <div className="phone-container">
        <div className="phone-content">
          <h2 className="username">Welcome, John Doe</h2>

          <div className="objectives">
            <label>
              <input type="checkbox" />
              Build Muscle
            </label>
            <label>
              <input type="checkbox" />
              Lose Weight
            </label>
          </div>

          <div className="inputs">
            <input
              type="number"
              placeholder="Enter Height (cm)"
              className="input-box"
              min="0"
              inputMode="numeric"
            />
            <input
              type="number"
              placeholder="Enter Weight (kg)"
              className="input-box"
              min="0"
              inputMode="numeric"
            />
          </div>

          <div className="chart-container">
            <Bar data={sessionData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
