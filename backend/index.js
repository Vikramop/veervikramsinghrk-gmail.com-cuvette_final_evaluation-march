import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import storyRoutes from './routes/story.routes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json()); // middleware, parses req.body

app.use('/api/auth', authRoutes);
app.use('/api/story', storyRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log('Server is running on port ', PORT);
});
