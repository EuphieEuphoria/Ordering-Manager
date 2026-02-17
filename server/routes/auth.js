/**
 * @file Auth router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: auth
 *   description: Authentication Routes
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     AuthToken:
 *       description: authentication success
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: a JWT for the user
 *             example:
 *               token: abcdefg12345
 */

// Import libraries
import express from "express";
import passport from "passport";
import jsonwebtoken from "jsonwebtoken";

// Import configurations
import "../configs/auth.js";
import logger from "../configs/logger.js";

// Create Express router
const router = express.Router();

/**
 * Authentication Response Handler
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authSuccess = function (req, res, next) {
  res.redirect("/");
};

/**
 * Bypass authentication for testing
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /auth/bypass:
 *   get:
 *     summary: bypass authentication for testing
 *     description: Bypasses CAS authentication for testing purposes
 *     tags: [auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: username
 *     responses:
 *       200:
 *         description: success
 */
router.get("/bypass", passport.authenticate("token"), authSuccess);

/**
 * CAS Authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /auth/cas:
 *   get:
 *     summary: CAS authentication
 *     description:  CAS authentication for deployment
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: success
 */
router.get("/cas", passport.authenticate("cas"), authSuccess);

/**
 * Request JWT based on previous authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /auth/token:
 *   get:
 *     summary: request JWT
 *     description: request JWT based on previous authentication
 *     tags: [auth]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AuthToken'
 */
router.get("/token", function (req, res, next) {
  //if user is logged in
  if (req.user) {
    const token = jsonwebtoken.sign(req.user, process.env.JWT_SECRET_KEY, {
      expiresIn: "6h",
    });
    res.json({
      token: token,
    });
  } else {
    //send unauthorized response
    res.status(401).end();
  }
});

/**
 * Logout of a Passport.js session
 *
 * See https://www.initialapps.com/properly-logout-passportjs-express-session-for-single-page-app/
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout current user
 *     description:  logout current user and end session
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: success
 */
router.get("/logout", function (req, res, next) {
  res.clearCookie(process.env.SESSION_NAME || "connect.sid"); // clear the session cookie
  req.logout(function (err) {
    // logout of passport
    if (err) {
      logger.error(err);
    }
    req.session.destroy(function (err) {
      // destroy the session
      if (err) {
        logger.error(err);
      }
      const redirectURL =
        process.env.CAS_URL +
        "/logout?service=" +
        encodeURIComponent(process.env.CAS_SERVICE_URL);
      res.redirect(redirectURL);
    });
  });
});

export default router;
