const express = require("express");
const {
  register,
  login,
  getUserDetails,
  updateProfile,
} = require("../controllers/auth.js");
const {
  getEngineersBySkills,
  getAllEngineers,
  getEngineerById,
  updateEngineerProfile,
  getCurrentUserProfile,
} = require("../controllers/users.js");
const authenticateMiddleware = require("../middleware/authentication.js");

const router = express.Router();

// Auth routes (no authentication required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/profile", authenticateMiddleware, getUserDetails);
router.put("/profile", authenticateMiddleware, updateProfile);
router.get("/profile/current", authenticateMiddleware, getCurrentUserProfile);
router.get("/engineers", authenticateMiddleware, getAllEngineers);
router.get("/engineers/:id", authenticateMiddleware, getEngineerById);
router.put("/engineers/:id", authenticateMiddleware, updateEngineerProfile);
router.post("/engineers/search", authenticateMiddleware, getEngineersBySkills);

module.exports = router;
