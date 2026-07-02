import express from 'express';
import prisma from '../prisma/client.js';
import { authenticate } from '../middleware/authenticate.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ArticleComments
 *   description: 게시글 댓글 API
 */

router
  .route('/articles/:articleId/comments')
  /**
   * @swagger
   * /articles/{articleId}/comments:
   *   post:
   *     summary: 게시글 댓글 등록
   *     tags: [ArticleComments]
   *     parameters:
   *       - in: path
   *         name: articleId
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
      const articleId = Number(req.params.articleId);
      const { content } = req.body;
      if (!content) throw createError(400, 'content는 필수입니다.');

      const article = await prisma.article.findUnique({ where: { id: articleId } });
      if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

      const comment = await prisma.articleComment.create({
        data: { content, articleId, authorId: req.user.userId },
        select: { id: true, content: true, createdAt: true, updatedAt: true },
      });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /articles/{articleId}/comments:
   *   get:
   *     summary: 게시글 댓글 목록 조회 (커서 페이지네이션)
   *     tags: [ArticleComments]
   *     parameters:
   *       - in: path
   *         name: articleId
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
      const articleId = Number(req.params.articleId);
      const limit = Number(req.query.limit) || 10;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

      const article = await prisma.article.findUnique({ where: { id: articleId } });
      if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

      const comments = await prisma.articleComment.findMany({
        where: { articleId },
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
  .route('/articles/comments/:id')
  /**
   * @swagger
   * /articles/comments/{id}:
   *   patch:
   *     summary: 게시글 댓글 수정
   *     tags: [ArticleComments]
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
      const comment = await prisma.articleComment.findUnique({ where: { id: Number(req.params.id) } });
      if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
      if (comment.authorId !== req.user.userId) throw createError(403, '수정 권한이 없습니다.');

      const updated = await prisma.articleComment.update({
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
   * /articles/comments/{id}:
   *   delete:
   *     summary: 게시글 댓글 삭제
   *     tags: [ArticleComments]
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
      const comment = await prisma.articleComment.findUnique({ where: { id: Number(req.params.id) } });
      if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
      if (comment.authorId !== req.user.userId) throw createError(403, '삭제 권한이 없습니다.');

      await prisma.articleComment.delete({ where: { id: Number(req.params.id) } });
      res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
      next(err);
    }
  });

export default router;
