import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// 상품 댓글 등록 API
// POST /products/:productId/comments
router.post("/products/:productId/comments", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { content } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const comment = await prisma.productComment.create({
      data: { content, productId },
      select: { id: true, content: true, createdAt: true },
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: "댓글 등록에 실패했습니다." });
  }
});

// 상품 댓글 목록 조회 API (cursor 페이지네이션)
// GET /products/:productId/comments
router.get("/products/:productId/comments", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const comments = await prisma.productComment.findMany({
      where: { productId },
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

// 상품 댓글 수정 API
// PATCH /products/comments/:id
router.patch("/products/comments/:id", async (req, res) => {
  try {
    const comment = await prisma.productComment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!comment) {
      return res.status(404).json({ message: "수정할 댓글이 없습니다." });
    }

    const updated = await prisma.productComment.update({
      where: { id: Number(req.params.id) },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "댓글 수정 실패!" });
  }
});

// 상품 댓글 삭제 API
// DELETE /products/comments/:id
router.delete("/products/comments/:id", async (req, res) => {
  try {
    const comment = await prisma.productComment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!comment) {
      return res.status(404).json({ message: "삭제할 댓글이 없습니다." });
    }

    await prisma.productComment.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "댓글 삭제 실패!" });
  }
});

export default router;
