import express from "express";
import Product from "../models/product.js";

const router = express.Router();

// [ ] 상품 등록 API
// POST /api/products
router.post("/products", async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const newProduct = new Product({ name, description, price, tags });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "상품 등록에 실패했습니다." });
  }
});

// [ ] 상품 목록 조회 API (페이지네이션, 검색, 정렬)
//  GET /api/products
router.get("/products", async (req, res) => {
  try {
    // 1. 주소창 주소 읽어오기 (기본값 설정)
    const page = Number(req.query.page) || 1;
    const pagesize = Number(req.query.pagesize) || 10;
    const keyword = req.query.keyword || "";

    // 2. 검색 조건 만들기
    let searchFilter = {};
    if (keyword) {
      searchFilter = {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(searchFilter)
      .select("name price createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pagesize)
      .limit(pagesize);

    const totalCount = await Product.countDocuments(searchFilter);  

    res.status(200).json({
      list: products,
      totalCount: totalCount
    });
  } catch (err) {
    res.status(500).json({ list: [], totalCount: 0, message: "목록 조회 실패!" });
  }
});

// [ ] 상품 상세 조회 API
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "상세 조회 실패!" });
  }
});

// [ ] 상품 수정 API
router.patch("/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "수정할 상품이 없습니다." });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "수정 실패!" });
  }
});

// [ ] 상품 삭제 API
router.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "삭제할 상품이 없습니다." });
    }

    res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패!" });
  }
});

export default router;
