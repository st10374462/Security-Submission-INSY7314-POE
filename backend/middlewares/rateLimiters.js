const rateLimit = require("express-rate-limit");

// ----------------------
// 🚦 GLOBAL API RATE LIMITER
// ----------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later." },
});

// ----------------------
// 🔐 LOGIN RATE LIMITER
// ----------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const email = req.body?.email?.toLowerCase() || "no-email";
    return `${ip}:${email}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many login attempts. Please try again in 15 minutes.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ----------------------
// 🔐 PASSWORD RESET LIMITER
// ----------------------
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  message: { message: "Too many password reset attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ----------------------
// 💳 TRANSACTION CREATION LIMITER
// ----------------------
const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  keyGenerator: (req) => req.user?.id || req.ip || "anonymous",
  handler: (req, res) => {
    res.status(429).json({
      message: "Transaction limit reached. Please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ----------------------
// 📦 EXPORT ALL LIMITERS
// ----------------------
module.exports = {
  apiLimiter,
  loginLimiter,
  passwordResetLimiter,
  transactionLimiter,
};