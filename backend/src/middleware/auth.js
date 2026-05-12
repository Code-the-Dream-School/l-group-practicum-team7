const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required",
    });
  }

  return next();
};

module.exports = authMiddleware;