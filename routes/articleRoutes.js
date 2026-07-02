import express from 'express';
import prisma from '../prisma/client.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: 게시글 관련 API
 */

router
  .route('/articles')
  /**
   * @swagger
   * /articles:
   *   post:
   *     summary: 게시글 등록
   *     tags: [Articles]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, content]
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               image:
   *                 type: string
   *     responses:
   *       201:
   *         description: 게시글 등록 성공
   */
  .post(async (req, res, next) => {
    try {
      const { title, content, image } = req.body;
      if (!title || !content) throw createError(400, 'title, content는 필수입니다.');

      const article = await prisma.article.create({ data: { title, content, image } });
      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /articles:
   *   get:
   *     summary: 게시글 목록 조회
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: orderBy
   *         schema:
   *           type: string
   *           enum: [recent, like]
   *     responses:
   *       200:
   *         description: 게시글 목록
   */
  .get(async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const keyword = req.query.keyword || '';
      const orderBy = req.query.orderBy === 'like' ? { likeCount: 'desc' } : { createdAt: 'desc' };

      const where = keyword
        ? { OR: [{ title: { contains: keyword, mode: 'insensitive' } }, { content: { contains: keyword, mode: 'insensitive' } }] }
        : {};

      const [articles, totalCount] = await Promise.all([
        prisma.article.findMany({
          where,
          select: { id: true, title: true, content: true, image: true, likeCount: true, createdAt: true },
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.article.count({ where }),
      ]);

      res.status(200).json({ list: articles, totalCount });
    } catch (err) {
      next(err);
    }
  });

router
  .route('/articles/:id')
  /**
   * @swagger
   * /articles/{id}:
   *   get:
   *     summary: 게시글 상세 조회
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 게시글 상세
   *       404:
   *         description: 게시글 없음
   */
  .get(async (req, res, next) => {
    try {
      const article = await prisma.article.findUnique({
        where: { id: Number(req.params.id) },
        select: { id: true, title: true, content: true, image: true, likeCount: true, createdAt: true },
      });
      if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');
      res.status(200).json(article);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /articles/{id}:
   *   patch:
   *     summary: 게시글 수정
   *     tags: [Articles]
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
  .patch(async (req, res, next) => {
    try {
      const article = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
      if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

      const updated = await prisma.article.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /articles/{id}:
   *   delete:
   *     summary: 게시글 삭제
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 삭제 성공
   */
  .delete(async (req, res, next) => {
    try {
      const article = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
      if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

      await prisma.article.delete({ where: { id: Number(req.params.id) } });
      res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * /articles/{id}/like:
 *   post:
 *     summary: 게시글 좋아요
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 좋아요 성공
 */
router.post('/articles/:id/like', async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

    const updated = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: { likeCount: { increment: 1 } },
      select: { id: true, likeCount: true },
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
