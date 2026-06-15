import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// 게시글 등록 API
router.post("/articles", async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const article = await prisma.article.create({
      data: { title, content, image },
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: "게시글 등록에 실패했습니다." });
  }
});

// 게시글 목록 조회 API
router.get("/articles", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const keyword = req.query.keyword || "";
    const orderBy = req.query.orderBy === "like"
      ? { likeCount: "desc" }
      : { createdAt: "desc" };

    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        select: { id: true, title: true, content: true, image: true, likeCount: true, createdAt: true },
        orderBy: orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    res.status(200).json({ list: articles, totalCount });
  } catch (err) {
    res.status(500).json({ list: [], totalCount: 0, message: "목록 조회 실패!" });
  }
});

// 게시글 상세 조회 API
router.get("/articles/:id", async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, title: true, content: true, image: true, likeCount: true, createdAt: true },
    });

    if (!article) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ message: "상세 조회 실패!" });
  }
});

// 게시글 좋아요 API
router.post("/articles/:id/like", async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!article) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const updated = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: { likeCount: { increment: 1 } },
      select: { id: true, likeCount: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "좋아요 실패!" });
  }
});

// 게시글 수정 API
router.patch("/articles/:id", async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!article) {
      return res.status(404).json({ message: "수정할 게시글이 없습니다." });
    }

    const updated = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "수정 실패!" });
  }
});

// 게시글 삭제 API
router.delete("/articles/:id", async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!article) {
      return res.status(404).json({ message: "삭제할 게시글이 없습니다." });
    }

    await prisma.article.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패!" });
  }
});

export default router;