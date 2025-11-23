const errorHandler = (err, req, res, next) => {
  // Log structured error info for debugging (server-side only)
  console.error(JSON.stringify({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  }, null, 2));

  if (res.headersSent) {
    return next(err);
  }

  // Handle common error shapes
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      details: err.details || null,
    });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized access' });
  }

  // Default to 500 for unhandled errors
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const exposeMessage = err.expose || status < 500;

  res.status(status).json({
    status: 'error',
    message: exposeMessage ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
