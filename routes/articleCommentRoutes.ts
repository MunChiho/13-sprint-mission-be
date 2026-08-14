import express from "express";
import { authenticate } from "../middleware/authenticate";
import {
  createArticleComment,
  getArticleComments,
  updateArticleComment,
  deleteArticleComment,
} from "../controllers/articleCommentController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ArticleComments
 *   description: 게시글 댓글 API
 */

router
  .route("/articles/:articleId/comments")
  /**
   * @swagger
   * /articles/{articleId}/comments:
   *   post:
   *     summary: 게시글 댓글 등록
   *     tags: [ArticleComments]
   *     security:
   *       - bearerAuth: []
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
  .post(authenticate, createArticleComment)
  /**
   * @swagger
   * /articles/{articleId}/comments:
   *   get:
   *     summary: 게시글 댓글 목록 조회
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
  .get(getArticleComments);

router
  .route("/articles/comments/:id")
  /**
   * @swagger
   * /articles/comments/{id}:
   *   patch:
   *     summary: 게시글 댓글 수정
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
   *         description: 수정 성공
   */
  .patch(authenticate, updateArticleComment)
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
   */
  .delete(authenticate, deleteArticleComment);

export default router;