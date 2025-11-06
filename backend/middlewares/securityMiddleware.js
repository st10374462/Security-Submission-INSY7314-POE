const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

// ----------------------
// 🛡️ CORS CONFIGURATION
// ----------------------
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ----------------------
// 🛡️ HELMET CONFIGURATION
// ----------------------
const helmetConfig = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "frame-ancestors": ["'none'"], // Prevent clickjacking
    },
  },
  hidePoweredBy: true,
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
});

// ----------------------
// 🧼 INPUT SANITIZATION
// ----------------------
/**
 * Basic input whitelisting to prevent injection attacks
 * Blocks common malicious characters
 */
const inputWhitelist = (req, res, next) => {
  // Check for dangerous characters in request body
  const dangerous = /<script|javascript:|onerror=|onclick=|<iframe/i;
  const body = JSON.stringify(req.body);
  
  if (dangerous.test(body)) {
    return res.status(400).json({ 
      message: "Invalid input detected. Request blocked for security reasons." 
    });
  }
  
  next();
};

// ----------------------
// 📦 EXPORT ALL MIDDLEWARES
// ----------------------
const setupSecurityMiddlewares = (app) => {
  app.use(helmetConfig);
  app.use(cors(corsOptions));
  app.use(inputWhitelist);
};

module.exports = {
  setupSecurityMiddlewares,
  corsOptions,
  helmetConfig,
  inputWhitelist,
};