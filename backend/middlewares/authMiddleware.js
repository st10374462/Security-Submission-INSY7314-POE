// middlewares/authMiddleware.js - STATELESS VERSION
const jwt = require("jsonwebtoken");

/**
 * Generate JWT token (stateless - no database storage)
 */
const generateToken = (user) => {
  console.log('🔐 Generating stateless token for user:', user.email);
  
  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  
  console.log('✅ Stateless token generated');
  return token;
};

/**
 * Verify JWT token middleware (stateless - no database check)
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log('🔐 Stateless token verification');
    console.log('Token present:', !!token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT signature and expiration only (no database check)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ JWT verification failed:', err.message);
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      
      console.log('✅ Stateless token verified for user:', decoded.email);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }
    
    next();
  };
};

/**
 * These become no-ops in stateless version
 */
const invalidateToken = async (token) => {
  console.log("🔓 Token invalidation not supported in stateless mode");
};

const invalidateAllUserTokens = async (userId) => {
  console.log("🔓 Bulk token invalidation not supported in stateless mode");
};

module.exports = {
  generateToken,
  verifyToken,
  authorize,
  invalidateToken,
  invalidateAllUserTokens
};