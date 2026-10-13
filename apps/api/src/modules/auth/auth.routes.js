import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { register, login, refresh, logout } from "./auth.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts. Try again later.",
    },
  },
});

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the submitted fields.",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    req.body = result.data;
    next();
  };
}

router.post("/register", authRateLimit, validateBody(registerSchema), register);
router.post("/login", authRateLimit, validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    data: {
      user: req.user,
    },
  });
});

export default router;
