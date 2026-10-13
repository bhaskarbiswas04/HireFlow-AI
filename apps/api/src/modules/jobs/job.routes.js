import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { createJobSchema, updateJobSchema } from "./job.validation.js";

import {
  createJobController,
  listCompanyJobsController,
  getManagedJobController,
  updateDraftJobController,
  publishJobController,
  closeJobController,
  archiveJobController,
} from "./job.controller.js";

const router = Router();

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the submitted job details.",
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

router.use(requireAuth);

router.post(
  "/companies/:companyId/jobs",
  validateBody(createJobSchema),
  createJobController,
);

router.get("/companies/:companyId/jobs", listCompanyJobsController);

router.get("/:jobId", getManagedJobController);

router.patch(
  "/:jobId",
  validateBody(updateJobSchema),
  updateDraftJobController,
);

router.post("/:jobId/publish", publishJobController);
router.post("/:jobId/close", closeJobController);
router.post("/:jobId/archive", archiveJobController);

export default router;