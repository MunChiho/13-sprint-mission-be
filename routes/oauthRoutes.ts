import express from "express";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import passport from "../config/passport";
import prisma from "../prisma/client";
import { env } from "../config/env";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/signin" }),
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      res.redirect("/signin");
      return;
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: user.id, email: user.email }, env.jwtRefreshSecret, {
      expiresIn: "7d",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.redirect(`${env.frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  },
);

export default router;