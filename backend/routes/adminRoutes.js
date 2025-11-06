// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require("../middlewares/authMiddleware.js");
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  deleteUser,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getSystemReports,
  exportReportData
} = require("../controllers/adminController.js");

// Apply admin middleware to all routes
router.use(verifyToken);
router.use(authorize("admin"));

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Transaction management routes
router.get("/transactions", getAllTransactions);
router.get("/transactions/:id", getTransactionById);
router.put("/transactions/:id/status", updateTransactionStatus);

// Reports and analytics routes
router.get("/reports/:type", getSystemReports);
router.get("/export/:format", exportReportData);

module.exports = router;