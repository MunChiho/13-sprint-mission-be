import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🍃 MongoDB 연결 성공'))
  .catch(err => console.log('❌ 연결 실패:', err));

// 라우터 연결
app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 시작: http://localhost:${PORT}`));