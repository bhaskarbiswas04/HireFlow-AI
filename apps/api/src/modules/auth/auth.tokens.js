// This file signs and verifies short-lived access tokens.


import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: "hireflow-api",
      audience: "hireflow-web",
    },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "hireflow-api",
    audience: "hireflow-web",
    algorithms: ["HS256"],
  });
}
