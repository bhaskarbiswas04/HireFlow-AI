import crypto from "node:crypto";
import argon2 from "argon2";
import mongoose from "mongoose";

import User from "../../models/User.js";
import RefreshSession from "../../models/RefreshSession.js";
import { createAccessToken } from "./auth.tokens.js";
import { env } from "../../config/env.js";

const REFRESH_COOKIE_NAME = "hireflow_refresh";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function getRefreshExpiry() {
  return new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/auth",
    expires: expiresAt,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/auth",
  });
}

async function issueSession(user, req, res, familyId = crypto.randomUUID()) {
  const refreshToken = createRefreshToken();
  const expiresAt = getRefreshExpiry();

  await RefreshSession.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt,
    userAgent: req.get("user-agent")?.slice(0, 500) ?? null,
  });

  setRefreshCookie(res, refreshToken, expiresAt);

  return {
    accessToken: createAccessToken(user),
    user: publicUser(user),
  };
}

export async function registerUser(input, req, res) {
  const existingUser = await User.findOne({ email: input.email }).select(
    "+passwordHash",
  );

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  let user;

  try {
    user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  } catch (error) {
    // The unique database index is the final protection against
    // simultaneous registrations with the same email.
    if (error.code === 11000) {
      const conflict = new Error("An account with this email already exists.");
      conflict.statusCode = 409;
      conflict.code = "EMAIL_ALREADY_EXISTS";
      throw conflict;
    }

    throw error;
  }

  try {
    return await issueSession(user, req, res);
  } catch (error) {
    // Don't leave an unusable account behind if session creation fails.
    await User.deleteOne({ _id: user._id });
    throw error;
  }
}

export async function loginUser(input, req, res) {
  const user = await User.findOne({ email: input.email }).select(
    "+passwordHash",
  );

  const passwordMatches =
    user &&
    (await argon2.verify(user.passwordHash, input.password).catch(() => false));

  if (!user || !passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  if (user.status !== "active") {
    const error = new Error("This account is not currently active.");
    error.statusCode = 403;
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  return issueSession(user, req, res);
}

export async function refreshUserSession(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!rawToken || typeof rawToken !== "string") {
    const error = new Error("A valid refresh session is required.");
    error.statusCode = 401;
    error.code = "REFRESH_SESSION_REQUIRED";
    throw error;
  }

  const tokenHash = hashToken(rawToken);

  // Atomically claim the old session so two concurrent refreshes
  // cannot both rotate the same token successfully.
  const session = await RefreshSession.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { revokedAt: new Date() } },
    { new: false },
  ).select("+tokenHash");

  if (!session) {
    // A revoked token may indicate replay. Revoke the remaining
    // sessions in that token family when the old session still exists.
    const oldSession = await RefreshSession.findOne({ tokenHash }).select(
      "+tokenHash",
    );

    if (oldSession?.revokedAt) {
      await RefreshSession.updateMany(
        { familyId: oldSession.familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    }

    clearRefreshCookie(res);

    const error = new Error("The refresh session is invalid or expired.");
    error.statusCode = 401;
    error.code = "INVALID_REFRESH_SESSION";
    throw error;
  }

  const user = await User.findById(session.user);

  if (!user || user.status !== "active") {
    clearRefreshCookie(res);

    const error = new Error("This account is not currently active.");
    error.statusCode = 401;
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  const nextToken = createRefreshToken();
  const nextTokenHash = hashToken(nextToken);
  const expiresAt = getRefreshExpiry();

  try {
    await RefreshSession.create({
      user: user._id,
      tokenHash: nextTokenHash,
      familyId: session.familyId,
      expiresAt,
      userAgent: req.get("user-agent")?.slice(0, 500) ?? null,
    });

    await RefreshSession.updateOne(
      { _id: session._id },
      { $set: { replacedByTokenHash: nextTokenHash } },
    );
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }

  setRefreshCookie(res, nextToken, expiresAt);

  return {
    accessToken: createAccessToken(user),
    user: publicUser(user),
  };
}

export async function logoutUser(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (rawToken && typeof rawToken === "string") {
    await RefreshSession.updateMany(
      { tokenHash: hashToken(rawToken), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  clearRefreshCookie(res);
}
