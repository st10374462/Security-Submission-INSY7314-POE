// backend/app.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const Brute = require("express-brute");
const connectDB = require("./config/db.js");
const { apiLimiter } = require("./middlewares/rateLimiters.js");
const https = require('https');
const fs = require('fs');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// ---------- Brute Force Protection Setup ----------
const store = new Brute.MemoryStore();
const bruteForce = new Brute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  lifetime: 3600, // 1 hour
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Rate limiting
app.use(apiLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy
app.set("trust proxy", 1);

// Basic health check
app.get("/", (req, res) => {
  res.json({ message: "🚀 API is running" });
});

// Test route to verify Express works
app.get("/test", (req, res) => {
  res.json({ message: "✅ Express is working!" });
});

// SIMPLE ROUTE MOUNTING
console.log("=== MOUNTING ROUTES ===");

try {
  // Mount auth routes
  const authRoutes = require("./routes/authRoutes.js");
  app.use("/api/auth", authRoutes);
  console.log("✅ authRoutes mounted at /api/auth");
} catch (error) {
  console.error("❌ Failed to mount authRoutes:", error.message);
}

try {
  // Mount transaction routes - PASS bruteForce to the factory function
  const transactionRoutes = require("./routes/transactionRoutes.js");
  const transactionRouter = transactionRoutes(bruteForce); // ✅ Pass bruteForce here
  app.use("/api/transactions", transactionRouter);
  console.log("✅ transactionRoutes mounted at /api/transactions");
} catch (error) {
  console.error("❌ Failed to mount transactionRoutes:", error.message);
}

try {
  // Mount employee routes
  const employeeRoutes = require("./routes/employeeRoutes.js");
  app.use("/api/employees", employeeRoutes);
  console.log("✅ employeeRoutes mounted at /api/employees");
} catch (error) {
  console.error("❌ Failed to mount employeeRoutes:", error.message);
}

try {
  // Mount admin routes
  const adminRoutes = require("./routes/adminRoutes.js");
  app.use("/api/admin", adminRoutes);
  console.log("✅ adminRoutes mounted at /api/admin");
} catch (error) {
  console.error("❌ Failed to mount adminRoutes:", error.message);
}

console.log("🎉 Route mounting completed!");

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server (HTTP or HTTPS depending on env)
const PORT = process.env.PORT || 5000;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || process.env.SSL_KEY || '';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || process.env.SSL_CERT || '';
const SSL_PORT = process.env.SSL_PORT || 5001;

function startHttp() {
  app.listen(PORT, () => {
    console.log(`✅ Server running (HTTP) on port ${PORT}`);
    console.log(`📍 Test the API: http://localhost:${PORT}/test`);
  });
}

if (SSL_KEY_PATH && SSL_CERT_PATH) {
  try {
    const key = fs.readFileSync(path.resolve(SSL_KEY_PATH));
    const cert = fs.readFileSync(path.resolve(SSL_CERT_PATH));
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(SSL_PORT, () => {
      console.log(`🔒 Server running (HTTPS) on port ${SSL_PORT}`);
      console.log(`📍 Test the API: https://localhost:${SSL_PORT}/test`);
    });
    // Optionally also start HTTP if explicitly allowed
    if (process.env.ALLOW_HTTP === 'true') {
      startHttp();
    }
  } catch (err) {
    console.error('❌ Failed to start HTTPS server:', err.message);
    console.error('➡️ Falling back to HTTP');
    startHttp();
  }
} else {
  startHttp();
}

module.exports = app;