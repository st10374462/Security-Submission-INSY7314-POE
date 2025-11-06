// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const User = require("../models/User");


/**
 * Create a new transaction
 * POST /api/transactions
 * Role: customer
 * body: { amount, description, paymentMethod, swiftCode? }
 */
exports.createTransaction = async (req, res) => {
  try {
    const { swiftCode, amount, recipientName, recipientBank, description, paymentMethod } = req.body;

    // Validation is already done by middleware, so we can use the data directly
    const transaction = await Transaction.create({
      customerId: req.user.id,
      swiftCode,
      amount,
      recipientName: recipientName || "Not provided",
      recipientBank: recipientBank || "Not provided",
      description: description || `Payment transfer ${swiftCode}`,
      paymentMethod: paymentMethod || "bank_transfer",
      status: "pending",
    });

    // Populate customer info for response
    await transaction.populate("customerId", "name email");

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (err) {
    console.error("createTransaction error:", err);
    res.status(500).json({ message: "Error creating transaction" });
  }
};
/**
 * Get all transactions
 * GET /api/transactions
 * Role: employee/admin
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("customerId", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      message: "Transactions retrieved successfully",
      count: transactions.length,
      transactions
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

/**
 * Get transactions by customer
 * GET /api/transactions/my
 * Role: customer
 */
exports.getCustomerTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ customerId: req.user.id })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      message: "Your transactions retrieved successfully",
      count: transactions.length,
      transactions
    });
  } catch (err) {
    console.error("getCustomerTransactions error:", err);
    res.status(500).json({ message: "Error fetching your transactions" });
  }
};

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 * Role: employee/admin (or customer who owns it)
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("reviewedBy", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Allow only owner or staff/admin
    if (
      req.user.role === "customer" &&
      transaction.customerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      message: "Transaction retrieved successfully",
      transaction
    });
  } catch (err) {
    console.error("getTransactionById error:", err);
    res.status(500).json({ message: "Error fetching transaction" });
  }
};

/**
 * Update transaction status (pending → approved/rejected)
 * PUT /api/transactions/:id/status
 * Role: employee/admin
 * body: { status }
 */
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ 
        message: "Only pending transactions can be updated" 
      });
    }

    transaction.status = status;
    transaction.reviewedBy = req.user.id;
    await transaction.save();

    // Populate before sending response
    await transaction.populate("customerId", "name email");
    await transaction.populate("reviewedBy", "name email");

    res.json({
      message: `Transaction ${status} successfully`,
      transaction,
    });
  } catch (err) {
    console.error("updateTransactionStatus error:", err);
    res.status(500).json({ message: "Error updating transaction" });
  }
};

/**
 * Delete a transaction (Admin only)
 * DELETE /api/transactions/:id
 * Role: admin
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("deleteTransaction error:", err);
    res.status(500).json({ message: "Error deleting transaction" });
  }
};