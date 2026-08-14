import type { Request, Response } from "express";

export function uploadImage(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ message: "파일이 없습니다." });
    return;
  }
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}