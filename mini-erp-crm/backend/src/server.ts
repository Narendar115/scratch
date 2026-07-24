import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middlewares - allow cross-origin requests from frontend dev server
app.use(helmet({ crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mini ERP + CRM API Operations Portal',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Mini ERP + CRM Server running on http://localhost:${config.port}`);
});
