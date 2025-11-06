const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require("../middlewares/authMiddleware.js");
const {
  getAllTransactions,
  updateTransactionStatus,
} = require("../controllers/employeeController");

// Employee/Admin routes
router.get("/transactions", verifyToken, authorize("employee", "admin"), getAllTransactions);
router.patch("/transactions/:id/status", verifyToken, authorize("employee", "admin"), updateTransactionStatus);

module.exports = router;
