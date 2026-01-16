const express = require("express");
const passport = require("../middlewares/passport");

const router = express.Router();
const {
  index,
  bookDetails,
  category,
  read,
  login,
  setPassword,
  profile,
  editProfile,
  settings,
  ensureAuthenticated,
  signupSuccess,
  signupFailure,
  quiz,
  choosePayment,
  makePayment,
  makePayments,
  processPayment,
  initializePayment,
  paymentSuccess,
  categoryStats,
} = require("../controller/users/users");

const indexFectch = require("../apis/user/indexFetch");
const categoryFetch = require("../apis/user/categoryFetch");
const detailsFetch = require("../apis/user/detailsFetch");
const categoryStatsAPI = require("../apis/user/categoryStats");

// Profile Management APIs
const profileManage = require("../apis/user/profileManage");
const profileUpload = require("../apis/user/profileUpload");
const profileSessions = require("../apis/user/profileSessions");


// Public Routes - Google OAuth only
router.route("/login").get(login);
router.get("/success", signupSuccess);
router.get("/failure", signupFailure);

// Protected Routes
router.get("/", ensureAuthenticated, index);
router.get("/bookdetails", ensureAuthenticated, bookDetails);
router.get("/category", ensureAuthenticated, category);
router.get("/category-stats", ensureAuthenticated, categoryStats);
router.get("/read", ensureAuthenticated, read);
router.get("/profile", ensureAuthenticated, profile);
router.get("/edit-profile", ensureAuthenticated, editProfile);
router.get("/settings", ensureAuthenticated, settings);
router.get("/quiz", ensureAuthenticated, quiz);
router.get("/set-password", ensureAuthenticated, setPassword);
router.get("/choosePayment", ensureAuthenticated, choosePayment);
router.get("/makePayment", ensureAuthenticated, makePayments);
router.post("/process-payment", ensureAuthenticated, processPayment);
router.post("/initialize-payment", ensureAuthenticated, initializePayment);
router.get("/payment-success", paymentSuccess);

// API Routes
router.get("/indexFetch", indexFectch);
router.get("/categoryFetch", categoryFetch);
router.get("/detailsFetch", detailsFetch);

// Category Statistics API Routes
router.get("/api/category/stats", ensureAuthenticated, categoryStatsAPI.getCategoryStats);
router.get("/api/category/details/:category", ensureAuthenticated, categoryStatsAPI.getCategoryDetails);

// Profile Management API Routes
router.get("/api/profile", ensureAuthenticated, profileManage.getProfile);
router.put("/api/profile", ensureAuthenticated, profileManage.updateProfile);
router.put("/api/profile/settings", ensureAuthenticated, profileManage.updateSettings);
router.get("/api/profile/activity", ensureAuthenticated, profileManage.getActivityLog);
router.get("/api/profile/avatar", ensureAuthenticated, profileUpload.getAvatar);
router.post("/api/profile/avatar", ensureAuthenticated, profileUpload.uploadAvatar);
router.delete("/api/profile/avatar", ensureAuthenticated, profileUpload.deleteAvatar);

// Session Management API Routes
router.get("/api/profile/sessions", ensureAuthenticated, profileSessions.getActiveSessions);
router.delete("/api/profile/sessions/:sessionId", ensureAuthenticated, profileSessions.terminateSession);
router.delete("/api/profile/sessions", ensureAuthenticated, profileSessions.terminateAllOtherSessions);
router.post("/api/profile/sessions", ensureAuthenticated, profileSessions.createSession);
router.delete("/api/profile/sessions/cleanup", ensureAuthenticated, profileSessions.cleanupExpiredSessions);

// Account Management API Routes
router.delete("/api/profile/account", ensureAuthenticated, profileSessions.deleteAccount);

// Google OAuth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // After successful OAuth, redirect to main dashboard instead of set-password
    res.redirect("/");
  }
);

// Authentication Routes
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error during logout" });
    }
    res.redirect("/login");
  });
});

module.exports = router;
