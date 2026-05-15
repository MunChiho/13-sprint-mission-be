import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedDatabase = async () => {
  try {
    // 기존 데이터 삭제 (순서 중요: 댓글 먼저, 부모 나중에)
    await prisma.productComment.deleteMany({});
    await prisma.articleComment.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.article.deleteMany({});
    console.log("🗑️ 기존 데이터 삭제 완료!");

    // 상품 데이터 삽입
    let firstProductId;
    for (let i = 1; i <= 51; i++) {
      const product = await prisma.product.create({
        data: {
          name: `${i}진태`,
          description: `1일 ${i}진태입니다.`,
          price: i * 1000,
          tags: ["이진태", "챌린지"],
        },
      });
      if (i === 1) firstProductId = product.id;
    }
    console.log("🌱 상품 데이터 51개 삽입 완료!");

    // 게시글 데이터 삽입
    let firstArticleId;
    for (let i = 1; i <= 10; i++) {
      const article = await prisma.article.create({
        data: {
          title: `게시글 제목 ${i}`,
          content: `게시글 내용입니다. ${i}번째 글이에요.`,
        },
      });
      if (i === 1) firstArticleId = article.id;
    }
    console.log("🌱 게시글 데이터 10개 삽입 완료!");

    // 상품 댓글 삽입
    await prisma.productComment.create({
      data: { content: "좋은 상품이네요!", productId: firstProductId },
    });
    await prisma.productComment.create({
      data: { content: "가격이 저렴해요.", productId: firstProductId },
    });
    console.log("🌱 상품 댓글 데이터 삽입 완료!");

    // 게시글 댓글 삽입
    await prisma.articleComment.create({
      data: { content: "좋은 글이에요!", articleId: firstArticleId },
    });
    await prisma.articleComment.create({
      data: { content: "잘 읽었습니다.", articleId: firstArticleId },
    });
    console.log("🌱 게시글 댓글 데이터 삽입 완료!");

    console.log("✅ 시딩 완료!");
  } catch (error) {
    console.error("❌ 시딩 중 에러 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
