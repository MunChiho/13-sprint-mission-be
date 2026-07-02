import prisma from '../prisma/client.js';
import { createError } from '../middleware/errorHandler.js';

export async function createArticle(req, res, next) {
  try {
    const { title, content, images } = req.body;
    if (!title || !content) throw createError(400, 'title, content는 필수입니다.');

    const article = await prisma.article.create({
      data: { title, content, images: images || [], ownerId: req.user.userId },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
}

export async function getArticles(req, res, next) {
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
        select: { id: true, title: true, content: true, images: true, likeCount: true, createdAt: true, owner: { select: { id: true, nickname: true, image: true } } },
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
}

export async function getArticle(req, res, next) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        owner: { select: { id: true, nickname: true, image: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, updatedAt: true, author: { select: { id: true, nickname: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

    const isLiked = req.user
      ? !!(await prisma.articleLike.findUnique({
          where: { userId_articleId: { userId: req.user.userId, articleId: article.id } },
        }))
      : false;

    res.status(200).json({ ...article, isLiked });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const article = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');
    if (article.ownerId !== req.user.userId) throw createError(403, '수정 권한이 없습니다.');

    const updated = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const article = await prisma.article.findUnique({ where: { id: Number(req.params.id) } });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');
    if (article.ownerId !== req.user.userId) throw createError(403, '삭제 권한이 없습니다.');

    await prisma.article.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: '삭제 완료' });
  } catch (err) {
    next(err);
  }
}

export async function likeArticle(req, res, next) {
  try {
    const articleId = Number(req.params.id);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

    const existing = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (existing) throw createError(409, '이미 좋아요한 게시글입니다.');

    const [, updated] = await prisma.$transaction([
      prisma.articleLike.create({ data: { userId, articleId } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likeCount: { increment: 1 } },
        select: { id: true, likeCount: true },
      }),
    ]);

    res.status(200).json({ ...updated, isLiked: true });
  } catch (err) {
    next(err);
  }
}

export async function unlikeArticle(req, res, next) {
  try {
    const articleId = Number(req.params.id);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw createError(404, '게시글을 찾을 수 없습니다.');

    const existing = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (!existing) throw createError(409, '좋아요하지 않은 게시글입니다.');

    const [, updated] = await prisma.$transaction([
      prisma.articleLike.delete({ where: { userId_articleId: { userId, articleId } } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likeCount: { decrement: 1 } },
        select: { id: true, likeCount: true },
      }),
    ]);

    res.status(200).json({ ...updated, isLiked: false });
  } catch (err) {
    next(err);
  }
}
