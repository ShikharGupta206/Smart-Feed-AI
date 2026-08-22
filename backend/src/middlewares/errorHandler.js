/**
 * Centralized error handler middleware.
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', req.method, req.originalUrl, err.stack || err)

  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}

/**
 * 404 Route Not Found handler.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` })
}
