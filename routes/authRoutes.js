import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { signUp, signIn, getMe } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: 인증 API
 *   - name: Users
 *     description: 유저 API
 */

/**
 * @swagger
 * /auth/signUp:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nickname, password]
 *             properties:
 *               email:
 *                 type: string
 *               nickname:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       409:
 *         description: 이미 사용 중인 이메일
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post('/auth/signUp', signUp);

/**
 * @swagger
 * /auth/signIn:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공 (accessToken 반환)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: 이메일 또는 비밀번호 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post('/auth/signIn', signIn);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유저 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: 유저 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.get('/users/me', authenticate, getMe);

export default router;
