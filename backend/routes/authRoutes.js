const express = require("express");
const router = express.Router(); // ✅ Correct - use Express to create router

// Import your controllers and middleware
const {
  register,
  login,
  logout,
  getProfile,
  updateUser,
  deleteUser,
  refreshToken
} = require("../controllers/authControllers.js");

const { verifyToken, authorize } = require("../middlewares/authMiddleware.js");
const { loginLimiter } = require("../middlewares/rateLimiters.js");
const { 
  validateUserInput, 
  validateLoginInput 
} = require("../middlewares/validationMiddleware.js");

// ✅ Define routes on the Express router
router.post("/register", validateUserInput, register);
router.post("/login", loginLimiter, validateLoginInput, login);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getProfile);
router.put("/update/:id", verifyToken, authorize("admin", "customer"), validateUserInput, updateUser);
router.delete("/delete/:id", verifyToken, authorize("admin"), deleteUser);

// ✅ Export the router instance
module.exports = router;