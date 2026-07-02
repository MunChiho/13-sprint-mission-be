import express from 'express';
import prisma from '../prisma/client.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: 상품 관련 API
 */

router
  .route('/products')
  /**
   * @swagger
   * /products:
   *   post:
   *     summary: 상품 등록
   *     tags: [Products]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, description, price]
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: integer
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: 상품 등록 성공
   *       400:
   *         description: 잘못된 요청
   */
  .post(async (req, res, next) => {
    try {
      const { name, description, price, tags, images } = req.body;
      if (!name || !description || price == null) {
        throw createError(400, 'name, description, price는 필수입니다.');
      }
      const product = await prisma.product.create({
        data: { name, description, price, tags: tags || [], images: images || [] },
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /products:
   *   get:
   *     summary: 상품 목록 조회
   *     tags: [Products]
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
   *         description: 상품 목록
   */
  .get(async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const keyword = req.query.keyword || '';
      const orderBy = req.query.orderBy === 'like' ? { likeCount: 'desc' } : { createdAt: 'desc' };

      const where = keyword
        ? { OR: [{ name: { contains: keyword, mode: 'insensitive' } }, { description: { contains: keyword, mode: 'insensitive' } }] }
        : {};

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          select: { id: true, name: true, price: true, images: true, likeCount: true, createdAt: true },
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.product.count({ where }),
      ]);

      res.status(200).json({ list: products, totalCount });
    } catch (err) {
      next(err);
    }
  });

router
  .route('/products/:id')
  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     summary: 상품 상세 조회
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 상품 상세
   *       404:
   *         description: 상품 없음
   */
  .get(async (req, res, next) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
      });
      if (!product) throw createError(404, '상품을 찾을 수 없습니다.');
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /products/{id}:
   *   patch:
   *     summary: 상품 수정
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 수정 성공
   *       404:
   *         description: 상품 없음
   */
  .patch(async (req, res, next) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
      if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

      const updated = await prisma.product.update({
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
   * /products/{id}:
   *   delete:
   *     summary: 상품 삭제
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 삭제 성공
   *       404:
   *         description: 상품 없음
   */
  .delete(async (req, res, next) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
      if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

      await prisma.product.delete({ where: { id: Number(req.params.id) } });
      res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * /products/{id}/like:
 *   post:
 *     summary: 상품 좋아요
 *     tags: [Products]
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
router.post('/products/:id/like', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const updated = await prisma.product.update({
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
