import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { createCompanySchema } from "./company.validation.js";

import {
  createCompanyController,
  listMyCompaniesController,
  getCompanyController,
} from "./company.controller.js";

const router = Router();

function validateCreateCompany(req, res, next) {
  const result = createCompanySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the submitted company details.",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  req.body = result.data;
  next();
}

router.use(requireAuth);

router.post("/", validateCreateCompany, createCompanyController);
router.get("/mine", listMyCompaniesController);
router.get("/:companyId", getCompanyController);

export default router;
