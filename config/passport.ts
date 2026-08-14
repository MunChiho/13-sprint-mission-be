import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../prisma/client.js";
import { env } from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nickname = profile.displayName;
        const image = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("구글 계정에서 이메일을 가져올 수 없습니다."));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              nickname,
              image,
              encryptedPassword: "",
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err instanceof Error ? err : new Error("구글 로그인 처리 중 오류가 발생했습니다."));
      }
    },
  ),
);

export default passport;