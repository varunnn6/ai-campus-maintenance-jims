import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectFirestore } from './config/firebase.js';
import apiRoutes from './routes/api.js';
import { seedDatabaseIfEmpty } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI-Driven Predictive Campus Maintenance & Facility Management System',
    institution: 'Jagan Institute of Management Studies (JIMS), Rohini Sector-5',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Optional: Serve client build if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/health')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send('JIMS Campus Maintenance API Server running on port ' + PORT);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start Server
const startServer = async () => {
  try {
    await connectFirestore();
    await seedDatabaseIfEmpty();

    app.listen(PORT, () => {
      console.log(`=============================================================`);
      console.log(`  JIMS Campus Maintenance & Facility Management Backend API  `);
      console.log(`  URL: http://localhost:${PORT}                             `);
      console.log(`  API Health: http://localhost:${PORT}/health                `);
      console.log(`=============================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
