// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  swiftCode: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  description: { 
    type: String, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ["credit_card", "debit_card", "bank_transfer", "paypal"]
  },
  recipientName: { 
    type: String, 
    required: false 
  },
  recipientBank: { 
    type: String, 
    required: false 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);