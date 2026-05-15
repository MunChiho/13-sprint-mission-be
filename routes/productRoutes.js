import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

// 상품 등록 API
// POST /products
router.post("/products", async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, tags },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "상품 등록에 실패했습니다." });
  }
});

// 상품 목록 조회 API (페이지네이션, 검색, 정렬)
// GET /products
router.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const keyword = req.query.keyword || "";

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { id: true, name: true, price: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({ list: products, totalCount });
  } catch (err) {
    res.status(500).json({ list: [], totalCount: 0, message: "목록 조회 실패!" });
  }
});

// 상품 상세 조회 API
// GET /products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "상세 조회 실패!" });
  }
});

// 상품 수정 API
// PATCH /products/:id
router.patch("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ message: "수정할 상품이 없습니다." });
    }

    const updated = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "수정 실패!" });
  }
});

// 상품 삭제 API
// DELETE /products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ message: "삭제할 상품이 없습니다." });
    }

    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패!" });
  }
});

export default router;
