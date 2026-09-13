import express from 'express';
import cors from 'cors';
import shopRoutes from './routes/shop.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/shop', shopRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

export default app;