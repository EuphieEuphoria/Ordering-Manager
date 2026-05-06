/**
 * @file Movement types router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: movement_types
 *   description: Movement types Routes
 */

// Import libraries
import express from "express";

// Create Express router
const router = express.Router();

// Import models
import { MovementType } from "../../../models/models.js";


// Import logger
import logger from "../../../configs/logger.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

/**
 * Gets the list of movement_types
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/movement_types:
 *   get:
 *     summary: movement_types list page
 *     description: Gets the list of all movement_types in the application
 *     tags: [movement_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: the list of movement_types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MovementType'
 */
router.get("/", roleBasedAuth("manage_users"), async function (req, res, next) {
  try {
    const movement_types = await MovementType.findAll();
    res.json(movement_types);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single movement_type by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/movement_types/{id}:
 *   get:
 *     summary: get single movement_type
 *     description: Gets a single movement_type from the application
 *     tags: [movement_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: movement_type ID
 *     responses:
 *       200:
 *         description: a movement_type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovementType'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const movementType = await MovementType.findByPk(req.params.id, {});
    if (movementType === null) {
      res.status(404).end();
    } else {
      res.json(movementType);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
