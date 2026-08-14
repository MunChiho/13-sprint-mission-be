import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createProductComment,
  getProductComments,
  updateProductComment,
  deleteProductComment,
} from "../controllers/productCommentController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductComments
 *   description: 상품 댓글 API
 */

router
  .route("/products/:productId/comments")
  /**
   * @swagger
   * /products/{productId}/comments:
   *   post:
   *     summary: 상품 댓글 등록
   *     tags: [ProductComments]
   *     security:
   *       - bearerAuth: []
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
  .post(authenticate, createProductComment)
  /**
   * @swagger
   * /products/{productId}/comments:
   *   get:
   *     summary: 상품 댓글 목록 조회
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
  .get(getProductComments);

router
  .route("/products/comments/:id")
  /**
   * @swagger
   * /products/comments/{id}:
   *   patch:
   *     summary: 상품 댓글 수정
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
   *         description: 수정 성공
   */
  .patch(authenticate, updateProductComment)
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
   */
  .delete(authenticate, deleteProductComment);

export default router;