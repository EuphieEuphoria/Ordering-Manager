/**
 * @file Middleware for reading JWTs from the Bearer header and storing them in the request
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports tokenMiddleware the token middleware
 */

// Import Libraries
import jsonwebtoken from "jsonwebtoken";

// Import configurations
import logger from "../configs/logger.js";

async function tokenMiddleware(req, res, next) {
  // Retrieve the token from the headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If the token is null in the header, send 401 unauthorized
  if (token == null) {
    logger.debug("JWT in header is null");
    return res.status(401).end();
  }

  // Verify the token
  jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY, async (err, token) => {
    // Handle common errors
    if (err) {
      if (err.name === "TokenExpiredError") {
        // If the token is expired, send 401 unauthorized
        return res.status(401).end();
      } else {
        // If the token won't parse, send 403 forbidden
        logger.error("JWT Parsing Error!");
        logger.error(err);
        return res.sendStatus(403);
      }
    }

    // Attach token to request
    req.token = token;

    // Call next middleware
    next();
  });
}

export default tokenMiddleware;
