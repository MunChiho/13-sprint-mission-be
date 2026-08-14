import express from "express";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  unlikeProduct,
} from "../controllers/productController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: 상품 관련 API
 */

router
  .route("/products")
  /**
   * @swagger
   * /products:
   *   post:
   *     summary: 상품 등록
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
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
  .post(authenticate, createProduct)
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
  .get(optionalAuthenticate, getProducts);

router
  .route("/products/:id")
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
  .get(optionalAuthenticate, getProduct)
  /**
   * @swagger
   * /products/{id}:
   *   patch:
   *     summary: 상품 수정
   *     tags: [Products]
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
   *         description: 수정 성공
   *       404:
   *         description: 상품 없음
   */
  .patch(authenticate, updateProduct)
  /**
   * @swagger
   * /products/{id}:
   *   delete:
   *     summary: 상품 삭제
   *     tags: [Products]
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
   *       404:
   *         description: 상품 없음
   */
  .delete(authenticate, deleteProduct);

/**
 * @swagger
 * /products/{id}/like:
 *   post:
 *     summary: 상품 좋아요
 *     tags: [Products]
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
 *         description: 좋아요 성공
 */
router.post("/products/:id/like", optionalAuthenticate, likeProduct);

/**
 * @swagger
 * /products/{id}/like:
 *   delete:
 *     summary: 상품 좋아요 취소
 *     tags: [Products]
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
 *         description: 좋아요 취소 성공
 */
router.delete("/products/:id/like", optionalAuthenticate, unlikeProduct);

export default router;