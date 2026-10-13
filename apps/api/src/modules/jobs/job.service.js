import mongoose from "mongoose";
import Company from "../../models/Company.js";
import Job from "../../models/Job.js";

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validateId(id, label) {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(
      400,
      `INVALID_${label.toUpperCase()}_ID`,
      `The ${label} ID is invalid.`,
    );
  }
}

async function getActiveCompanyMembership(companyId, userId) {
  const company = await Company.findOne({
    _id: companyId,
    status: "active",
    memberships: {
      $elemMatch: {
        user: userId,
        status: "active",
        role: { $in: ["owner", "admin", "recruiter"] },
      },
    },
  }).select("_id");

  if (!company) {
    throw httpError(
      404,
      "COMPANY_NOT_FOUND",
      "The company does not exist or is not accessible.",
    );
  }

  return company;
}

async function getManagedJob(jobId, user) {
  validateId(jobId, "job");

  const job = await Job.findById(jobId);

  if (!job) {
    throw httpError(404, "JOB_NOT_FOUND", "The job was not found.");
  }

  await getActiveCompanyMembership(job.company, user.id);

  return job;
}

function normalizeJobInput(input) {
  const output = { ...input };

  if (output.closesAt !== undefined) {
    output.closesAt = output.closesAt ? new Date(output.closesAt) : null;
  }

  return output;
}

function validateSalaryAndExperience(job) {
  if (
    job.salary?.min !== undefined &&
    job.salary?.max !== undefined &&
    job.salary.min > job.salary.max
  ) {
    throw httpError(
      400,
      "INVALID_SALARY_RANGE",
      "Maximum salary must be greater than or equal to minimum salary.",
    );
  }

  if (job.experience?.minYears > job.experience?.maxYears) {
    throw httpError(
      400,
      "INVALID_EXPERIENCE_RANGE",
      "Maximum experience must be greater than or equal to minimum experience.",
    );
  }

  if (job.closesAt && job.closesAt <= new Date()) {
    throw httpError(
      400,
      "INVALID_CLOSING_DATE",
      "The closing date must be in the future.",
    );
  }
}

function toJobResponse(job) {
  return {
    id: job._id.toString(),
    company: job.company.toString(),
    createdBy: job.createdBy.toString(),
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    skills: job.skills,
    employmentType: job.employmentType,
    workplace: job.workplace,
    location: job.location,
    salary: job.salary,
    experience: job.experience,
    status: job.status,
    publishedAt: job.publishedAt,
    closesAt: job.closesAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function createJob(companyId, input, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can create jobs.",
    );
  }

  validateId(companyId, "company");
  await getActiveCompanyMembership(companyId, user.id);

  const data = normalizeJobInput(input);

  const job = new Job({
    ...data,
    company: companyId,
    createdBy: user.id,
    status: "draft",
  });

  validateSalaryAndExperience(job);
  await job.save();

  return toJobResponse(job);
}

export async function listCompanyJobs(companyId, user, query) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can access this endpoint.",
    );
  }

  validateId(companyId, "company");
  await getActiveCompanyMembership(companyId, user.id);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  const filter = { company: companyId };

  if (query.status) {
    if (!["draft", "published", "closed", "archived"].includes(query.status)) {
      throw httpError(
        400,
        "INVALID_JOB_STATUS",
        "The requested job status is invalid.",
      );
    }

    filter.status = query.status;
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map(toJobResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getManagedJobById(jobId, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can access this endpoint.",
    );
  }

  const job = await getManagedJob(jobId, user);

  return toJobResponse(job);
}

export async function updateDraftJob(jobId, input, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can edit jobs.",
    );
  }

  const job = await getManagedJob(jobId, user);

  if (job.status !== "draft") {
    throw httpError(
      409,
      "JOB_NOT_EDITABLE",
      "Only draft jobs can be edited through this endpoint.",
    );
  }

  const data = normalizeJobInput(input);

  // Merge nested objects rather than replacing the whole salary or
  // experience object when only one nested field is supplied.
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      ["salary", "experience"].includes(key)
    ) {
      job[key] = { ...job[key].toObject(), ...value };
    } else {
      job[key] = value;
    }
  }

  validateSalaryAndExperience(job);
  await job.save();

  return toJobResponse(job);
}

export async function publishJob(jobId, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can publish jobs.",
    );
  }

  const job = await getManagedJob(jobId, user);

  if (job.status !== "draft") {
    throw httpError(
      409,
      "INVALID_JOB_TRANSITION",
      "Only draft jobs can be published.",
    );
  }

  validateSalaryAndExperience(job);

  job.status = "published";
  job.publishedAt = new Date();

  await job.save();

  return toJobResponse(job);
}

export async function closeJob(jobId, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can close jobs.",
    );
  }

  const job = await getManagedJob(jobId, user);

  if (job.status !== "published") {
    throw httpError(
      409,
      "INVALID_JOB_TRANSITION",
      "Only published jobs can be closed.",
    );
  }

  job.status = "closed";
  await job.save();

  return toJobResponse(job);
}

export async function archiveJob(jobId, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiters can archive jobs.",
    );
  }

  const job = await getManagedJob(jobId, user);

  if (!["draft", "closed"].includes(job.status)) {
    throw httpError(
      409,
      "INVALID_JOB_TRANSITION",
      "Only draft or closed jobs can be archived.",
    );
  }

  job.status = "archived";
  await job.save();

  return toJobResponse(job);
}