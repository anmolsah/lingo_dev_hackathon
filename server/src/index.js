import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schemesRoutes from './routes/schemes.js';
import legalRoutes from './routes/legal.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Vaani API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/schemes', schemesRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'An unexpected error occurred'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Vaani server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
