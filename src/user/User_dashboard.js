import React, { useState } from 'react';
import logo from '../Assets/logo.png';
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
  const [view, setView] = useState('weekly');

  const sessionDataSets = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [1, 0, 2, 1, 1, 2, 1],
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [3, 5, 2, 4],
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [12, 15, 9, 10, 11, 13],
    },
  };

  const currentData = sessionDataSets[view];

  const sessionData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Sessions',
        data: currentData.data,
        backgroundColor: '#ffffff',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Sessions (${view.charAt(0).toUpperCase() + view.slice(1)})`,
        color: '#fff',
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
    },
  };

  return (
    <div className="template-page">
      <div className="phone-container">
        <div className="phone-content">
        <div className="logo-wrapper">
        <img src={logo} alt="GymTrakr Logo" className="top-logo" />
        </div>

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

          <div className="chart-toggle-buttons">
            <button onClick={() => setView('daily')} className={view === 'daily' ? 'active' : ''}>
              Daily
            </button>
            <button onClick={() => setView('weekly')} className={view === 'weekly' ? 'active' : ''}>
              Weekly
            </button>
            <button onClick={() => setView('monthly')} className={view === 'monthly' ? 'active' : ''}>
              Monthly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
