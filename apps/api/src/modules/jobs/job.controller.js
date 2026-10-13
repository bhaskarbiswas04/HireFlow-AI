import {
  createJob,
  listCompanyJobs,
  getManagedJobById,
  updateDraftJob,
  publishJob,
  closeJob,
  archiveJob,
} from "./job.service.js";

export async function createJobController(req, res, next) {
  try {
    const job = await createJob(req.params.companyId, req.body, req.user);

    res.status(201).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

export async function listCompanyJobsController(req, res, next) {
  try {
    const result = await listCompanyJobs(
      req.params.companyId,
      req.user,
      req.query,
    );

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getManagedJobController(req, res, next) {
  try {
    const job = await getManagedJobById(req.params.jobId, req.user);

    res.status(200).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

export async function updateDraftJobController(req, res, next) {
  try {
    const job = await updateDraftJob(req.params.jobId, req.body, req.user);

    res.status(200).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

async function runTransition(res, next, action, jobId, user) {
  try {
    const job = await action(jobId, user);
    res.status(200).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

export function publishJobController(req, res, next) {
  return runTransition(res, next, publishJob, req.params.jobId, req.user);
}

export function closeJobController(req, res, next) {
  return runTransition(res, next, closeJob, req.params.jobId, req.user);
}

export function archiveJobController(req, res, next) {
  return runTransition(res, next, archiveJob, req.params.jobId, req.user);
}
