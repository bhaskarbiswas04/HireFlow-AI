import {
  createCompany,
  listMyCompanies,
  getCompanyById,
} from "./company.service.js";

export async function createCompanyController(req, res, next) {
  try {
    const company = await createCompany(req.body, req.user);

    res.status(201).json({
      data: { company },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyCompaniesController(req, res, next) {
  try {
    const companies = await listMyCompanies(req.user);

    res.status(200).json({
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyController(req, res, next) {
  try {
    const company = await getCompanyById(req.params.companyId, req.user);

    res.status(200).json({
      data: { company },
    });
  } catch (error) {
    next(error);
  }
}