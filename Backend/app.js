const express = require('express');
const client = require('prom-client');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'devops-dashboard-api'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const businessMetrics = new client.Counter({
  name: 'business_operations_total',
  help: 'Total business operations',
  labelNames: ['operation_type'],
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
});

// Simulate active connections
let connections = 0;
app.use((req, res, next) => {
  connections++;
  activeConnections.set(connections);
  
  res.on('finish', () => {
    connections--;
    activeConnections.set(connections);
  });
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'DevOps Dashboard API', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  businessMetrics.inc({ operation_type: 'health_check' });
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
  businessMetrics.inc({ operation_type: 'user_fetch' });
  
  // Simulate some processing time
  setTimeout(() => {
    res.json({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    });
  }, Math.random() * 500); // Random delay 0-500ms
});

app.post('/api/users', (req, res) => {
  businessMetrics.inc({ operation_type: 'user_create' });
  
  // Simulate processing
  setTimeout(() => {
    res.status(201).json({ 
      id: Math.floor(Math.random() * 1000),
      ...req.body,
      created_at: new Date().toISOString()
    });
  }, Math.random() * 1000); // Random delay 0-1000ms
});

app.get('/api/slow', (req, res) => {
  businessMetrics.inc({ operation_type: 'slow_operation' });
  
  // Intentionally slow endpoint
  setTimeout(() => {
    res.json({ message: 'This was a slow operation', duration: '2-5 seconds' });
  }, 2000 + Math.random() * 3000); // 2-5 second delay
});

app.get('/api/error', (req, res) => {
  businessMetrics.inc({ operation_type: 'error_simulation' });
  
  // Randomly return errors
  if (Math.random() < 0.3) {
    res.status(500).json({ error: 'Simulated server error' });
  } else if (Math.random() < 0.5) {
    res.status(404).json({ error: 'Resource not found' });
  } else {
    res.json({ message: 'Operation successful' });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`DevOps Dashboard API running at http://localhost:${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
});