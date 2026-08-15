import express from "express";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate";
import {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
} from "../controllers/articleController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: 게시글 관련 API
 */

router
  .route("/articles")
  /**
   * @swagger
   * /articles:
   *   post:
   *     summary: 게시글 등록
   *     tags: [Articles]
   *     security:
   *       - bearerAuth: []
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
   *                 nullable: true
   *     responses:
   *       201:
   *         description: 게시글 등록 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Article'
   *       401:
   *         description: 인증 필요
   */
  .post(authenticate, createArticle)
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
   *           default: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: orderBy
   *         schema:
   *           type: string
   *           enum: [recent, like]
   *           default: recent
   *     responses:
   *       200:
   *         description: 게시글 목록
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 list:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ArticleListItem'
   *                 totalCount:
   *                   type: integer
   */
  .get(optionalAuthenticate, getArticles);

router
  .route("/articles/:id")
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ArticleDetail'
   *       404:
   *         description: 게시글 없음
   */
  .get(optionalAuthenticate, getArticle)
  /**
   * @swagger
   * /articles/{id}:
   *   patch:
   *     summary: 게시글 수정
   *     tags: [Articles]
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
   *       403:
   *         description: 권한 없음
   */
  .patch(authenticate, updateArticle)
  /**
   * @swagger
   * /articles/{id}:
   *   delete:
   *     summary: 게시글 삭제
   *     tags: [Articles]
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
  .delete(authenticate, deleteArticle);

/**
 * @swagger
 * /articles/{id}/like:
 *   post:
 *     summary: 게시글 좋아요
 *     tags: [Articles]
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
router.post("/articles/:id/like", optionalAuthenticate, likeArticle);

/**
 * @swagger
 * /articles/{id}/like:
 *   delete:
 *     summary: 게시글 좋아요 취소
 *     tags: [Articles]
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
router.delete("/articles/:id/like", optionalAuthenticate, unlikeArticle);

export default router;
