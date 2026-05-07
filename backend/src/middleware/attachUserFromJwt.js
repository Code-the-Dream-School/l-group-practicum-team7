const jwt = require("jsonwebtoken");
const User = require("../models/User");

const attachUserFromJwt = async (req, res, next) => {
  if (req.user) return next();

  const raw = req.headers.authorization || "";

  if (!raw.startsWith("Bearer ")) return next();
  const token = raw.slice("Bearer ".length).trim();
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.userId) return next();

    const user = await User.findById(payload.userId).select("_id email name");
    if (!user) return next();

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    console.log("REQ USER:", req.user);

    return next();
  } catch (err) {
    console.log("attachUserFromJwt error:", err.message);
    return next();
  }
};

module.exports = attachUserFromJwt;

