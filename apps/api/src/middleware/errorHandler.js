export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) {
    return;
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled request error:", error);
  }

  res.status(statusCode).json({
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message:
        statusCode >= 500
          ? "An unexpected server error occurred."
          : error.message,
    },
  });
}
