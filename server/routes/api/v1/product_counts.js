/**
 * @file Inventories Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: inventories
 *   description: Inventories Routes
 */

//Import Libraries
import express from "express";
//import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import { ProductCount } from "../../../models/models.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import database
//import database from "../../../configs/database.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

// Import utilities
//import handleValidationError from "../../../utilities/handle-validation-error.js";
//import sendSuccess from "../../../utilities/send-success.js";

// Add Role Authorization to all routes
router.use(roleBasedAuth("manage_users"));

/**
 * Gets the list of productCounts
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/productcounts:
 *   get:
 *     summary: products list page
 *     description: gets the list of all products in the application
 *     tags: [products]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductCount'
 */
router.get("/", async function (req, res, next) {
  try {
    const productCounts = await ProductCount.findAll({});
    res.json(productCounts);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single product Count by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/productcounts/{id}:
 *   get:
 *     summary: get single product count
 *     description: Gets a single product count from the application
 *     tags: [products]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: product ID
 *     responses:
 *       200:
 *         description: a product count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCount'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const productCount = await ProductCount.findByPk(req.params.id, {});
    // if the product is not found, return an HTTP 404 not found status code
    if (productCount === null) {
      res.status(404).end();
    } else {
      res.json(productCount);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
