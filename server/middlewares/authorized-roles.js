/**
 * @file Middleware for role-based authorization
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports roleBasedAuth middleware
 */

// Import configurations
import logger from "../configs/logger.js";

/**
 * Build a middleware function to validate a user has one of a list of roles
 *
 * @param  {...any} roles a list of roles that are valid for this operation
 * @returns a middleware function for those roles.
 */
const roleBasedAuth = (...roles) => {
  return function roleAuthMiddleware(req, res, next) {
    logger.error("------------------------------ROLE BASED AUTH IS DISABLED------------------------------")
    roles;
    return next();
    // logger.debug("Route requires roles: " + roles);
    // logger.debug(
    //   "User " +
    //     req.token.username +
    //     " has roles: " +
    //     req.token.roles.map((r) => r.role).join(","),
    // );
    // logger.debug(req.token);
    // let match = false;
    // // loop through each role given
    // roles.forEach((role) => {
    //   // if the user has that role, then they can proceed
    //   if (req.token.roles.some((r) => r.role === role)) {
    //     logger.debug("Role match!");
    //     match = true;
    //     return next();
    //   }
    // });
    // if (!match) {
    //   // if no roles match, send an unauthenticated response
    //   logger.debug("No role match!");
    //   return res.status(401).send();
    // }
  };
};

export default roleBasedAuth;
