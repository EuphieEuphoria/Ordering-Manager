/**
 * @file Index Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: index
 *   description: Index Routes
 */

// Import libraries
import express from "express";

// Create Express Router
const router = express.Router();

/**
 * Gets the index page for the application
 *
 * @param {Object} req - Express Request Object
 * @param {Object} res - Express Response Object
 * @param {Function} next - Express Next middleware function
 *
 * @swagger
 * /:
 *   get:
 *     summary: index page
 *     description: Gets the index page for the application
 *     tags: [index]
 *     responses:
 *       200:
 *         description: success
 */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

export default router;
