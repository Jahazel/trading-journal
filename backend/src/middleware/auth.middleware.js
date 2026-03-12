const jsonwebtoken = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(403).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
}

module.exports = authMiddleware;
