import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// 게시글 댓글 등록 API
// POST /articles/:articleId/comments
router.post("/articles/:articleId/comments", async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    const { content } = req.body;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comment = await prisma.articleComment.create({
      data: { content, articleId },
      select: { id: true, content: true, createdAt: true },
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: "댓글 등록에 실패했습니다." });
  }
});

// 게시글 댓글 목록 조회 API (cursor 페이지네이션)
// GET /articles/:articleId/comments
router.get("/articles/:articleId/comments", async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comments = await prisma.articleComment.findMany({
      where: { articleId },
      select: { id: true, content: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;

    res.status(200).json({ list: comments, nextCursor });
  } catch (err) {
    res.status(500).json({ message: "댓글 목록 조회 실패!" });
  }
});

// 게시글 댓글 수정 API
// PATCH /articles/comments/:id
router.patch("/articles/comments/:id", async (req, res) => {
  try {
    const comment = await prisma.articleComment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!comment) {
      return res.status(404).json({ message: "수정할 댓글이 없습니다." });
    }

    const updated = await prisma.articleComment.update({
      where: { id: Number(req.params.id) },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "댓글 수정 실패!" });
  }
});

// 게시글 댓글 삭제 API
// DELETE /articles/comments/:id
router.delete("/articles/comments/:id", async (req, res) => {
  try {
    const comment = await prisma.articleComment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!comment) {
      return res.status(404).json({ message: "삭제할 댓글이 없습니다." });
    }

    await prisma.articleComment.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "댓글 삭제 실패!" });
  }
});

export default router;
