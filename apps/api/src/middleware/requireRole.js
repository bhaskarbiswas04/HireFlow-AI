export function requireRole(...allowedRoles) {
  return function roleAuthorization(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Please authenticate before accessing this resource.",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        },
      });
    }

    next();
  };
}
