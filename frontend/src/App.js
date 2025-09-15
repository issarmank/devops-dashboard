import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

function App() {
  const [apiHealth, setApiHealth] = useState({});
  const [apiData, setApiData] = useState({});
  const [metrics, setMetrics] = useState([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get API health
        const healthResponse = await axios.get('http://localhost:3001/health');
        setApiHealth(healthResponse.data);

        // Get API info
        const apiResponse = await axios.get('http://localhost:3001/');
        setApiData(apiResponse.data);
        setUptime(apiResponse.data.uptime);

        // Get users data (for testing)
        const usersResponse = await axios.get('http://localhost:3001/api/users');
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 DevOps Dashboard</h1>
        <p>Real-time Application Monitoring</p>
      </header>

      <div className="dashboard-grid">
        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card healthy">
            <h3>API Status</h3>
            <div className="status-indicator">
              <span className="status-dot green"></span>
              {apiHealth.status || 'Unknown'}
            </div>
            <small>Last checked: {new Date().toLocaleTimeString()}</small>
          </div>

          <div className="status-card">
            <h3>Uptime</h3>
            <div className="metric-value">
              {formatUptime(uptime)}
            </div>
            <small>Application uptime</small>
          </div>

          <div className="status-card">
            <h3>Environment</h3>
            <div className="metric-value">
              Production
            </div>
            <small>Current environment</small>
          </div>

          <div className="status-card">
            <h3>Version</h3>
            <div className="metric-value">
              v1.0.0
            </div>
            <small>Application version</small>
          </div>
        </div>

        {/* Links to Monitoring Tools */}
        <div className="monitoring-links">
          <h2>Monitoring Tools</h2>
          <div className="links-grid">
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="monitoring-link grafana">
              <h3>📊 Grafana Dashboards</h3>
              <p>View detailed metrics and performance charts</p>
            </a>

            <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" className="monitoring-link prometheus">
              <h3>🎯 Prometheus Metrics</h3>
              <p>Query raw metrics and set up alerts</p>
            </a>

            <a href="http://localhost:3001/metrics" target="_blank" rel="noopener noreferrer" className="monitoring-link api">
              <h3>🔧 API Metrics</h3>
              <p>Raw Prometheus metrics from the API</p>
            </a>

            <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer" className="monitoring-link cadvisor">
              <h3>🐳 Container Metrics</h3>
              <p>Docker container resource usage</p>
            </a>
          </div>
        </div>

        {/* Quick API Test */}
        <div className="api-test">
          <h2>Quick API Test</h2>
          <div className="api-buttons">
            <button onClick={() => axios.get('http://localhost:3001/health')} className="test-btn health">
              Test Health Endpoint
            </button>
            <button onClick={() => axios.get('http://localhost:3001/api/users')} className="test-btn users">
              Test Users Endpoint
            </button>
            <button onClick={() => axios.get('http://localhost:3001/api/slow')} className="test-btn slow">
              Test Slow Endpoint
            </button>
            <button onClick={() => axios.get('http://localhost:3001/api/error')} className="test-btn error">
              Test Error Endpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
