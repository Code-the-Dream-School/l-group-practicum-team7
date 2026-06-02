const express = require("express");
const passport = require("passport");

const {
  registerShow,
  registerDo,
  logoff,
  me,
  updateMe,
  updatePassword,
} = require("../controllers/sessionController");

const router = express.Router();

function sendAuthResponse(res, user) {
  return res.json({
    ok: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: user.createJWT(),
  });
}

router
  .route("/register")
  .get(registerShow)
  .post(registerDo);

router.post("/logon", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Auth failed",
      });
    }

    return sendAuthResponse(res, user);
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Auth failed",
      });
    }

    return sendAuthResponse(res, user);
  })(req, res, next);
});

router.post("/logoff", logoff);

router.get("/me", me);
router.patch("/me", updateMe);
router.patch("/me/password", updatePassword);

module.exports = router;