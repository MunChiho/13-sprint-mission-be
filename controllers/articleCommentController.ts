import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { createError } from "../middleware/errorHandler";

interface CommentBody {
  content: string;
}

export async function createArticleComment(
  req: Request<{ articleId: string }, unknown, Partial<CommentBody>>,
  res: Response,
  next: NextFunction,
) {
  try {
    const articleId = Number(req.params.articleId);
    const { content } = req.body;
    if (!content) throw createError(400, "content는 필수입니다.");

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw createError(404, "게시글을 찾을 수 없습니다.");

    const comment = await prisma.articleComment.create({
      data: { content, articleId, authorId: req.auth?.userId },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function getArticleComments(req: Request<{ articleId: string }>, res: Response, next: NextFunction) {
  try {
    const articleId = Number(req.params.articleId);
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw createError(404, "게시글을 찾을 수 없습니다.");

    const comments = await prisma.articleComment.findMany({
      where: { articleId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, nickname: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;
    res.status(200).json({ list: comments, nextCursor });
  } catch (err) {
    next(err);
  }
}

export async function updateArticleComment(
  req: Request<{ id: string }, unknown, Partial<CommentBody>>,
  res: Response,
  next: NextFunction,
) {
  try {
    const comment = await prisma.articleComment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) throw createError(404, "댓글을 찾을 수 없습니다.");
    if (comment.authorId !== req.auth?.userId) throw createError(403, "수정 권한이 없습니다.");

    const updated = await prisma.articleComment.update({
      where: { id: Number(req.params.id) },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteArticleComment(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const comment = await prisma.articleComment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) throw createError(404, "댓글을 찾을 수 없습니다.");
    if (comment.authorId !== req.auth?.userId) throw createError(403, "삭제 권한이 없습니다.");

    await prisma.articleComment.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    next(err);
  }
}