const Transaction = require("../models/Transaction");

/**
 * Get all transactions
 * GET /api/employees/transactions
 * Role: employee/admin
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("customerId", "name email");
    res.json(transactions);
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

/**
 * Update transaction status (pending → approved/rejected)
 * PATCH /api/employees/transactions/:id/status
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

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.user.id },
      { new: true }
    );

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json(transaction);
  } catch (err) {
    console.error("updateTransactionStatus error:", err);
    res.status(500).json({ message: "Error updating transaction" });
  }
};
