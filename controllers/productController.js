import prisma from '../prisma/client.js';
import { createError } from '../middleware/errorHandler.js';

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, tags, images } = req.body;
    if (!name || !description || price == null) {
      throw createError(400, 'name, description, price는 필수입니다.');
    }
    const product = await prisma.product.create({
      data: { name, description, price, tags: tags || [], images: images || [], ownerId: req.user.userId },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    const orderBy = req.query.orderBy === 'like' ? { likeCount: 'desc' } : { createdAt: 'desc' };

    const where = keyword
      ? { OR: [{ name: { contains: keyword, mode: 'insensitive' } }, { description: { contains: keyword, mode: 'insensitive' } }] }
      : {};

    const userId = req.user?.userId;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, price: true, images: true, likeCount: true, createdAt: true,
          ...(userId && { likes: { where: { userId }, select: { userId: true } } }),
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const list = products.map(({ likes, ...p }) => ({
      ...p,
      isLiked: userId ? (likes?.length > 0) : false,
    }));

    res.status(200).json({ list, totalCount });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        owner: { select: { id: true, nickname: true, image: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, updatedAt: true, author: { select: { id: true, nickname: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const isLiked = req.user
      ? !!(await prisma.productLike.findUnique({
          where: { userId_productId: { userId: req.user.userId, productId: product.id } },
        }))
      : false;

    res.status(200).json({ ...product, isLiked });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');
    if (product.ownerId !== req.user.userId) throw createError(403, '수정 권한이 없습니다.');

    const updated = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');
    if (product.ownerId !== req.user.userId) throw createError(403, '삭제 권한이 없습니다.');

    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: '삭제 완료' });
  } catch (err) {
    next(err);
  }
}

export async function likeProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const existing = await prisma.productLike.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw createError(409, '이미 좋아요한 상품입니다.');

    const [, updated] = await prisma.$transaction([
      prisma.productLike.create({ data: { userId, productId } }),
      prisma.product.update({
        where: { id: productId },
        data: { likeCount: { increment: 1 } },
        select: { id: true, likeCount: true },
      }),
    ]);

    res.status(200).json({ ...updated, isLiked: true });
  } catch (err) {
    next(err);
  }
}

export async function unlikeProduct(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError(404, '상품을 찾을 수 없습니다.');

    const existing = await prisma.productLike.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) throw createError(409, '좋아요하지 않은 상품입니다.');

    const [, updated] = await prisma.$transaction([
      prisma.productLike.delete({ where: { userId_productId: { userId, productId } } }),
      prisma.product.update({
        where: { id: productId },
        data: { likeCount: { decrement: 1 } },
        select: { id: true, likeCount: true },
      }),
    ]);

    res.status(200).json({ ...updated, isLiked: false });
  } catch (err) {
    next(err);
  }
}
