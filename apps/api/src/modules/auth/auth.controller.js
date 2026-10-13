import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body, req, res);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, req, res);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await refreshUserSession(req, res);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req, res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
