import Company from "../../models/Company.js";

function createSlug(name) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return slug || "company";
}

function toCompanyResponse(company) {
  return {
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    description: company.description,
    website: company.website,
    logoUrl: company.logoUrl,
    industry: company.industry,
    status: company.status,
    createdBy: company.createdBy.toString(),
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export async function createCompany(input, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiter accounts can create companies.",
    );
  }

  const baseSlug = createSlug(input.name);
  let slug = baseSlug;

  // The unique MongoDB index remains the final protection against
  // simultaneous requests attempting to create the same slug.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const company = await Company.create({
        name: input.name,
        slug,
        description: input.description,
        website: input.website,
        industry: input.industry,
        createdBy: user.id,
        memberships: [
          {
            user: user.id,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        ],
      });

      return toCompanyResponse(company);
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      // If the duplicate key was not the slug, don't retry it as a slug.
      if (error.keyPattern && !error.keyPattern.slug) {
        throw error;
      }

      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  throw httpError(
    409,
    "COMPANY_SLUG_CONFLICT",
    "Could not generate a unique company slug. Please try again.",
  );
}

export async function listMyCompanies(user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiter accounts can access company workspaces.",
    );
  }

  const companies = await Company.find({
    status: "active",
    memberships: {
      $elemMatch: {
        user: user.id,
        status: "active",
      },
    },
  })
    .sort({ createdAt: -1 })
    .lean();

  return companies.map((company) => ({
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    industry: company.industry,
    logoUrl: company.logoUrl,
    membership: company.memberships.find(
      (membership) =>
        membership.user.toString() === user.id &&
        membership.status === "active",
    )?.role,
    createdAt: company.createdAt,
  }));
}

export async function getCompanyById(companyId, user) {
  if (user.role !== "recruiter") {
    throw httpError(
      403,
      "RECRUITER_REQUIRED",
      "Only recruiter accounts can access company workspaces.",
    );
  }

  if (!/^[a-f\d]{24}$/i.test(companyId)) {
    throw httpError(400, "INVALID_COMPANY_ID", "The company ID is invalid.");
  }

  const company = await Company.findOne({
    _id: companyId,
    status: "active",
    memberships: {
      $elemMatch: {
        user: user.id,
        status: "active",
      },
    },
  }).lean();

  // Use 404 for both nonexistent companies and companies the user
  // is not allowed to see.
  if (!company) {
    throw httpError(
      404,
      "COMPANY_NOT_FOUND",
      "The company does not exist or is not accessible.",
    );
  }

  return {
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    description: company.description,
    website: company.website,
    logoUrl: company.logoUrl,
    industry: company.industry,
    status: company.status,
    createdBy: company.createdBy.toString(),
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    membership: company.memberships.find(
      (membership) =>
        membership.user.toString() === user.id &&
        membership.status === "active",
    )?.role,
  };
}