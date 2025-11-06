// backend/controllers/adminController.js
const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");
const bcrypt = require("bcrypt");

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics and analytics
 */
const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard statistics...');

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    // Get transaction status counts
    const pendingTransactions = await Transaction.countDocuments({ status: "pending" });
    const completedTransactions = await Transaction.countDocuments({ status: "completed" });
    const failedTransactions = await Transaction.countDocuments({ status: "failed" });
    
    // Get user role counts
    const customerCount = await User.countDocuments({ role: "customer" });
    const employeeCount = await User.countDocuments({ role: "employee" });
    const adminCount = await User.countDocuments({ role: "admin" });

    // Calculate total volume and recent activity
    const volumeResult = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalVolume = volumeResult[0]?.total || 0;

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactionsCount = await Transaction.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get new users (last 30 days)
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      // Basic counts
      totalUsers,
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      
      // User breakdown
      customerCount,
      employeeCount,
      adminCount,
      
      // Financial metrics
      totalVolume: Math.round(totalVolume * 100) / 100,
      
      // Activity metrics
      recentTransactionsCount,
      newUsersCount,
      
      // Performance indicators
      successRate: totalTransactions > 0 ? 
        Math.round((completedTransactions / totalTransactions) * 100) : 0,
      
      pendingRate: totalTransactions > 0 ? 
        Math.round((pendingTransactions / totalTransactions) * 100) : 0
    };

    console.log('✅ Dashboard stats fetched successfully');
    res.json(stats);
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard statistics",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/users
 * Get all users with pagination, filtering, and search
 */
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = "",
      role = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    console.log('👥 Fetching users with filters:', { page, limit, search, role });

    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    // Role filter
    if (role && ["customer", "employee", "admin"].includes(role)) {
      query.role = role;
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password") // Exclude password field
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    const response = {
      users,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    console.log(`✅ Found ${total} users`);
    res.json(response);
  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({ 
      message: "Failed to fetch users",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/users/:id
 * Get specific user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching user with ID: ${id}`);

    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's recent transactions
    const recentTransactions = await Transaction.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10);

    const userData = {
      ...user.toObject(),
      recentTransactions
    };

    console.log('✅ User data fetched successfully');
    res.json(userData);
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ 
      message: "Failed to fetch user",
      error: error.message 
    });
  }
};

/**
 * POST /api/admin/users
 * Create new user (admin functionality)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    console.log('👤 Creating new user:', { name, email, role });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!["customer", "employee", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by the User model pre-save hook
      role
    });

    // Return user without password
    const userResponse = await User.findById(user._id).select("-password");

    console.log('✅ User created successfully:', userResponse._id);
    res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("❌ Create user error:", error);
    res.status(500).json({ 
      message: "Failed to create user",
      error: error.message 
    });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    console.log(`🔄 Updating user role for ${id} to ${role}`);

    // Validation
    if (!["customer", "employee", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User role updated successfully');
    res.json({
      message: "User role updated successfully",
      user
    });
  } catch (error) {
    console.error("❌ Update user role error:", error);
    res.status(500).json({ 
      message: "Failed to update user role",
      error: error.message 
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting user with ID: ${id}`);

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's transactions
    await Transaction.deleteMany({ userId: id });
    console.log(`✅ Deleted ${user.role} user: ${user.email}`);

    res.json({ 
      message: "User and associated transactions deleted successfully" 
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({ 
      message: "Failed to delete user",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/transactions
 * Get all transactions with advanced filtering
 */
const getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status = "",
      paymentMethod = "",
      startDate = "",
      endDate = "",
      minAmount = "",
      maxAmount = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    console.log('💳 Fetching transactions with filters:', req.query);

    // Build query
    let query = {};

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate("userId", "name email role")
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" }
        }
      }
    ]);

    const response = {
      transactions,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalTransactions: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary: stats[0] || {
        totalAmount: 0,
        avgAmount: 0,
        minAmount: 0,
        maxAmount: 0
      }
    };

    console.log(`✅ Found ${total} transactions`);
    res.json(response);
  } catch (error) {
    console.error("❌ Get transactions error:", error);
    res.status(500).json({ 
      message: "Failed to fetch transactions",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/transactions/:id
 * Get specific transaction by ID
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching transaction with ID: ${id}`);

    const transaction = await Transaction.findById(id)
      .populate("userId", "name email role");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log('✅ Transaction fetched successfully');
    res.json(transaction);
  } catch (error) {
    console.error("❌ Get transaction error:", error);
    res.status(500).json({ 
      message: "Failed to fetch transaction",
      error: error.message 
    });
  }
};

/**
 * PUT /api/admin/transactions/:id/status
 * Update transaction status
 */
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    console.log(`🔄 Updating transaction status for ${id} to ${status}`);

    // Validation
    const validStatuses = ["pending", "completed", "failed", "cancelled", "under_review"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status",
        validStatuses 
      });
    }

    const updateData = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = req.user.id;
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log('✅ Transaction status updated successfully');
    res.json({
      message: "Transaction status updated successfully",
      transaction
    });
  } catch (error) {
    console.error("❌ Update transaction status error:", error);
    res.status(500).json({ 
      message: "Failed to update transaction status",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/reports/:type
 * Generate system reports
 */
const getSystemReports = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, groupBy = "day" } = req.query;

    console.log(`📈 Generating ${type} report`);

    let reportData = {};

    switch (type) {
      case "transaction-volume":
        reportData = await generateTransactionVolumeReport(startDate, endDate, groupBy);
        break;
      
      case "user-activity":
        reportData = await generateUserActivityReport(startDate, endDate);
        break;
      
      case "revenue":
        reportData = await generateRevenueReport(startDate, endDate, groupBy);
        break;
      
      case "system-performance":
        reportData = await generateSystemPerformanceReport(startDate, endDate);
        break;
      
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    console.log('✅ Report generated successfully');
    res.json(reportData);
  } catch (error) {
    console.error("❌ Generate report error:", error);
    res.status(500).json({ 
      message: "Failed to generate report",
      error: error.message 
    });
  }
};

/**
 * GET /api/admin/export/:format
 * Export data in various formats
 */
const exportReportData = async (req, res) => {
  try {
    const { format } = req.params;
    const { dataType, startDate, endDate } = req.query;

    console.log(`📤 Exporting ${dataType} data in ${format} format`);

    // This would typically generate CSV, Excel, or PDF files
    // For now, we'll return JSON with export metadata
    
    const exportData = {
      format,
      dataType,
      exportedAt: new Date(),
      exportedBy: req.user.id,
      recordCount: 0,
      data: []
    };

    // Add actual export logic here based on dataType
    switch (dataType) {
      case "users":
        exportData.data = await User.find().select("-password");
        exportData.recordCount = exportData.data.length;
        break;
      
      case "transactions":
        exportData.data = await Transaction.find().populate("userId", "name email");
        exportData.recordCount = exportData.data.length;
        break;
      
      default:
        return res.status(400).json({ message: "Invalid data type for export" });
    }

    console.log(`✅ Exported ${exportData.recordCount} records`);
    res.json(exportData);
  } catch (error) {
    console.error("❌ Export data error:", error);
    res.status(500).json({ 
      message: "Failed to export data",
      error: error.message 
    });
  }
};

// Helper functions for report generation
const generateTransactionVolumeReport = async (startDate, endDate, groupBy) => {
  const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
  
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate || '2020-01-01'),
          $lte: new Date(endDate || new Date())
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$createdAt"
          }
        },
        transactionCount: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        avgAmount: { $avg: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ];

  // This would use MongoDB aggregation
  // For now, return mock data structure
  return {
    reportType: "transaction-volume",
    period: { startDate, endDate, groupBy },
    summary: {
      totalTransactions: 0,
      totalVolume: 0,
      averageTransaction: 0
    },
    data: []
  };
};

const generateUserActivityReport = async (startDate, endDate) => {
  // User activity report logic
  return {
    reportType: "user-activity",
    period: { startDate, endDate },
    newUsers: 0,
    activeUsers: 0,
    userGrowth: 0,
    data: []
  };
};

const generateRevenueReport = async (startDate, endDate, groupBy) => {
  // Revenue report logic
  return {
    reportType: "revenue",
    period: { startDate, endDate, groupBy },
    totalRevenue: 0,
    revenueGrowth: 0,
    data: []
  };
};

const generateSystemPerformanceReport = async (startDate, endDate) => {
  // System performance report logic
  return {
    reportType: "system-performance",
    period: { startDate, endDate },
    uptime: "99.9%",
    averageResponseTime: "150ms",
    errorRate: "0.1%",
    data: []
  };
};

module.exports = {
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
};