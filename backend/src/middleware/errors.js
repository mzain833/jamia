function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err && err.code === 11000) return res.status(409).json({ message: 'A record with this value already exists.' });
  if (err && err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err && err.name === 'CastError') return res.status(400).json({ message: 'Invalid record ID.' });
  const status = Number(err.statusCode || err.status) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'An unexpected server error occurred.' : err.message });
}
module.exports = { notFound, errorHandler };
