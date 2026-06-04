const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require('../errors');

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

const registerShow = (req, res) => {
  return res
    .status(StatusCodes.OK)
    .type("html")
    .send(
      "<html><body><h1>Register</h1><p>Use POST /api/auth/register</p></body></html>"
    );
};

const registerDo = async (req, res, next) => {
  const { name, email, password, password1 } = req.body;

  if (!name || !email || !password || !password1) {
    throw new BadRequestError(
      "Name, email, password, and password confirmation are required",
    );
  }

  if (password !== password1) {
    throw new BadRequestError("Passwords do not match");
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(StatusCodes.CREATED).json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: user.createJWT(),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new BadRequestError("Email already registered");
    }

    if (error.name === "ValidationError") {
      throw new BadRequestError(error.message);
    }

    return next(error);
  }
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
  }

  return res.status(StatusCodes.OK).json({
    id: req.user.userId,
    name: req.user.name,
    email: req.user.email,
  });
};

const updateMe = async (req, res, next) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
  }

  const { name, email } = req.body;

  const updates = {};

  if (name !== undefined) {
    updates.name = name;
  }

  if (email !== undefined) {
    updates.email = email;
  }

  try {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("_id name email");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.status(StatusCodes.OK).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new BadRequestError("Email already registered");
    }

    if (error.name === "ValidationError") {
      throw new BadRequestError(error.message);
    }

    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
  }

  const { currentPassword, newPassword, newPassword1 } = req.body;

  if (!currentPassword || !newPassword || !newPassword1) {
    throw new BadRequestError(
      "Current password, new password, and password confirmation are required",
    );
  }

  if (newPassword !== newPassword1) {
    throw new BadRequestError("Passwords do not match");
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (typeof user.comparePassword === "function") {
      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Current password is incorrect",
        });
      }
    }

    user.password = newPassword;

    await user.save();

    return res.status(StatusCodes.OK).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const logoff = (req, res) => {
  if (!req.session) {
    return res.status(StatusCodes.OK).json({
      ok: true,
    });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        ok: false,
        error: "Session destroy failed",
      });
    }

    res.clearCookie("connect.sid");

    return res.status(StatusCodes.OK).json({
      ok: true,
    });
  });
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  me,
  updateMe,
  updatePassword,
};