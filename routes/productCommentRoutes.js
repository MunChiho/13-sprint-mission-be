import express from 'express';
import prisma from '../prisma/client.js';
import { authenticate } from '../middleware/authenticate.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductComments
 *   description: 상품 댓글 API
 */

router
  .route('/products/:productId/comments')
  /**
   * @swagger
   * /products/{productId}/comments:
   *   post:
   *     summary: 상품 댓글 등록
   *     tags: [ProductComments]
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [content]
   *             properties:
   *               content:
   *                 type: string
   *     responses:
   *       201:
   *         description: 댓글 등록 성공
   */
  .post(authenticate, async (req, res, next) => {
    try {
      const productId = Number(req.params.productId);
      const { content } = req.body;
      if (!content) throw createError(400, 'content는 필수입니다.');

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

      const comment = await prisma.productComment.create({
        data: { content, productId, authorId: req.user.userId },
        select: { id: true, content: true, createdAt: true, updatedAt: true },
      });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /products/{productId}/comments:
   *   get:
   *     summary: 상품 댓글 목록 조회 (커서 페이지네이션)
   *     tags: [ProductComments]
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: cursor
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 댓글 목록
   */
  .get(async (req, res, next) => {
    try {
      const productId = Number(req.params.productId);
      const limit = Number(req.query.limit) || 10;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

      const comments = await prisma.productComment.findMany({
        where: { productId },
        select: { id: true, content: true, createdAt: true, updatedAt: true, author: { select: { id: true, nickname: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;
      res.status(200).json({ list: comments, nextCursor });
    } catch (err) {
      next(err);
    }
  });

router
  .route('/products/comments/:id')
  /**
   * @swagger
   * /products/comments/{id}:
   *   patch:
   *     summary: 상품 댓글 수정
   *     tags: [ProductComments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 수정 성공
   */
  .patch(authenticate, async (req, res, next) => {
    try {
      const comment = await prisma.productComment.findUnique({ where: { id: Number(req.params.id) } });
      if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
      if (comment.authorId !== req.user.userId) throw createError(403, '수정 권한이 없습니다.');

      const updated = await prisma.productComment.update({
        where: { id: Number(req.params.id) },
        data: { content: req.body.content },
        select: { id: true, content: true, createdAt: true, updatedAt: true },
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /products/comments/{id}:
   *   delete:
   *     summary: 상품 댓글 삭제
   *     tags: [ProductComments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 삭제 성공
   *       403:
   *         description: 권한 없음
   */
  .delete(authenticate, async (req, res, next) => {
    try {
      const comment = await prisma.productComment.findUnique({ where: { id: Number(req.params.id) } });
      if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
      if (comment.authorId !== req.user.userId) throw createError(403, '삭제 권한이 없습니다.');

      await prisma.productComment.delete({ where: { id: Number(req.params.id) } });
      res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
      next(err);
    }
  });

export default router;
