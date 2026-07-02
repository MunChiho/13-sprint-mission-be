import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import productRoutes from './routes/productRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import productCommentRoutes from './routes/productCommentRoutes.js';
import articleCommentRoutes from './routes/articleCommentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', articleRoutes);
app.use('/', productCommentRoutes);
app.use('/', articleCommentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 시작: http://localhost:${PORT}`));
