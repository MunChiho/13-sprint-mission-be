import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { env } from "../config/env";
import type { AuthTokens } from "../types/auth";
import { verifyAuthToken } from "../lib/authToken";

function generateTokens(userId: number, email: string): AuthTokens {
  const accessToken = jwt.sign({ userId, email }, env.jwtSecret, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId, email }, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

interface SignUpBody {
  email: string;
  nickname: string;
  password: string;
}

export async function signUp(
  req: Request<unknown, unknown, Partial<SignUpBody>>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, nickname, password } = req.body;
    if (!email || !nickname || !password) {
      return res
        .status(400)
        .json({ message: "email, nickname, password는 필수입니다." });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });

    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, nickname, encryptedPassword },
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

interface SignInBody {
  email: string;
  password: string;
}

export async function signIn(
  req: Request<unknown, unknown, Partial<SignInBody>>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email, password는 필수입니다." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

    const valid = await bcrypt.compare(password, user.encryptedPassword);
    if (!valid)
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        image: user.image,
      },
    });
  } catch (err) {
    next(err);
  }
}

interface RefreshBody {
  refreshToken: string;
}

export async function refresh(
  req: Request<unknown, unknown, Partial<RefreshBody>>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "refreshToken이 필요합니다." });
    }

    let payload;
    try {
      payload = verifyAuthToken(refreshToken, env.jwtRefreshSecret);
    } catch {
      return res
        .status(401)
        .json({ message: "유효하지 않거나 만료된 refreshToken입니다." });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "유효하지 않은 refreshToken입니다." });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    await prisma.user.update({
      where: { id: req.auth.userId },
      data: { refreshToken: null },
    });
    res.status(200).json({ message: "로그아웃 완료" });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
