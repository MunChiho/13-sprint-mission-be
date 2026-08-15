/// <reference path="./types/express/index.d.ts" />
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import productRoutes from "./routes/productRoutes";
import articleRoutes from "./routes/articleRoutes";
import productCommentRoutes from "./routes/productCommentRoutes";
import articleCommentRoutes from "./routes/articleCommentRoutes";
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import oauthRoutes from "./routes/oauthRoutes";
import passport from "./config/passport";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { env } from "./config/env";

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/uploads", express.static("uploads"));

app.use("/", authRoutes);
app.use("/", oauthRoutes);
app.use("/", uploadRoutes);
app.use("/", productRoutes);
app.use("/", articleRoutes);
app.use("/", productCommentRoutes);
app.use("/", articleCommentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () =>
  console.log(`🚀 서버 시작: http://localhost:${env.port}`),
); // 테스트
// 테스트
