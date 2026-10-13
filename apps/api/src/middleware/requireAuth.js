// This middleware verifies the JWT and checks that its user still exists and is active.

import { verifyAccessToken } from "../modules/auth/auth.tokens.js";
import User from "../models/User.js";


export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Please provide a valid access token.",
      },
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Please provide a valid access token.",
      },
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (
      typeof payload.sub !== "string" ||
      !["candidate", "recruiter"].includes(payload.role)
    ) {
      return res.status(401).json({
        error: {
          code: "INVALID_ACCESS_TOKEN",
          message: "The access token is invalid.",
        },
      });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.status !== "active" || user.role !== payload.role) {
      return res.status(401).json({
        error: {
          code: "INVALID_ACCESS_TOKEN",
          message: "The account is unavailable or the token is invalid.",
        },
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        error: {
          code: "INVALID_ACCESS_TOKEN",
          message: "The access token is invalid or expired.",
        },
      });
    }

    next(error);
  }
}
