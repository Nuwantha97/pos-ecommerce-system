import express from 'express';
import cors from 'cors';
import posRoutes from './routes/pos.js';
//import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors()); // tighten origin in production, see note below
app.use(express.json());

app.use('/api/pos', posRoutes);
//app.use('/api/shop', shopRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

//app.use(errorHandler);

export default app;