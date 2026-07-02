import prisma from '../prisma/client.js';
import { createError } from '../middleware/errorHandler.js';

export async function createProductComment(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const { content } = req.body;
    if (!content) throw createError(400, 'content는 필수입니다.');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const comment = await prisma.productComment.create({
      data: { content, productId, authorId: req.user.userId },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function getProductComments(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const comments = await prisma.productComment.findMany({
      where: { productId },
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
}

export async function updateProductComment(req, res, next) {
  try {
    const comment = await prisma.productComment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
    if (comment.authorId !== req.user.userId) throw createError(403, '수정 권한이 없습니다.');

    const updated = await prisma.productComment.update({
      where: { id: Number(req.params.id) },
      data: { content: req.body.content },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductComment(req, res, next) {
  try {
    const comment = await prisma.productComment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) throw createError(404, '댓글을 찾을 수 없습니다.');
    if (comment.authorId !== req.user.userId) throw createError(403, '삭제 권한이 없습니다.');

    await prisma.productComment.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: '삭제 완료' });
  } catch (err) {
    next(err);
  }
}
