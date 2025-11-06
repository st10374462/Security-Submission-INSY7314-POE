// backend/routes/transactionRoutes.js
const express = require("express");
const Brute = require("express-brute");
const { verifyToken, authorize } = require("../middlewares/authMiddleware.js");
const {
  validateTransactionInput,
  validateStatusInput,
} = require("../middlewares/validationMiddleware.js");
const {
  createTransaction,
  getCustomerTransactions,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
} = require("../controllers/transactionController.js");

/**
 * transactionRoutes(bruteForce)
 * - bruteForce: optional express-brute instance (recommended to pass the same instance from app.js)
 */
module.exports = (bruteForce) => {
  const router = express.Router();

  // If no bruteForce instance provided, create a fallback local one
  const bf =
    bruteForce ||
    (() => {
      const store = new Brute.MemoryStore();
      return new Brute(store, {
        freeRetries: 5,
        minWait: 5 * 60 * 1000,
        maxWait: 60 * 60 * 1000,
        lifetime: 3600,
      });
    })();

  // --------------------
  // Customer Routes
  // --------------------
  router.post(
    "/",
    verifyToken,
    authorize("customer"),
    bf.prevent, // brute-force protection
    validateTransactionInput, // ✅ Added transaction validation
    createTransaction
  );

  router.get("/my", verifyToken, authorize("customer"), getCustomerTransactions);

  router.get(
    "/:id",
    verifyToken,
    authorize("customer", "employee", "admin"),
    getTransactionById
  );

  // --------------------
  // Employee/Admin Routes
  // --------------------
  router.get("/", verifyToken, authorize("employee", "admin"), getAllTransactions);

  router.put(
    "/:id/status",
    verifyToken,
    authorize("employee", "admin"),
    validateStatusInput, // ✅ Added status validation
    updateTransactionStatus
  );

  // --------------------
  // Admin-only Route
  // --------------------
  router.delete("/:id", verifyToken, authorize("admin"), deleteTransaction);

  return router;
};