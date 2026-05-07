import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

const mockData = [];

for (let i = 1; i <= 51; i++) {
  mockData.push({
    name: `${i}진태`,
    description: `1일 ${i}진태입니다.`,
    price: i * 1000,
    tags: ["이진태", "챌린지"]
  });
}

const seedDatabase = async () => {
  try {
    // 1. DB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Seed: MongoDB 연결 성공!");

    // 2. 기존 데이터 삭제 (중복 방지)
    await Product.deleteMany({});
    console.log("🗑️ 기존 데이터 삭제 완료!");

    // 3. 새 데이터 삽입
    await Product.insertMany(mockData);
    console.log("🌱 샘플 데이터 삽입 완료!");

    // 4. 프로세스 종료
    mongoose.connection.close();
    console.log("👋 DB 연결 종료.");
    process.exit();
  } catch (error) {
    console.error("❌ Seed 작업 중 에러 발생:", error);
    process.exit(1);
  }
};

seedDatabase();