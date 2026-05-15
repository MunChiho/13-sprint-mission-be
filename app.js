import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import productCommentRoutes from './routes/productCommentRoutes.js';
import articleCommentRoutes from './routes/articleCommentRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', productRoutes);
app.use('/', articleRoutes);
app.use('/', productCommentRoutes);
app.use('/', articleCommentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 시작: http://localhost:${PORT}`));
