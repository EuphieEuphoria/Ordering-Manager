/**
 * @file County Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: county
 *   description: County Routes
 */

// Import libraries
import express from "express";

// Create Express Router
const router = express.Router();

// Import models
import { Community, County } from "../../../models/models.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

/**
 * Gets the list of counties
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/counties:
 *   get:
 *     summary: county list page
 *     description: Gets the list of all county in the application
 *     tags: [county]
 *     security:
 *       - bearerAuth:
 *         - 'view_communities'
 *         - 'manage_communities'
 *         - 'add_communities'
 *     responses:
 *       200:
 *         description: the list of county
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/County'
 */
router.get(
  "/",
  roleBasedAuth("view_communities", "manage_communities", "add_communities"),
  async function (req, res, next) {
    try {
      const counties = await County.findAll({
        include: [
          {
            model: Community,
            as: "communities",
            attributes: ["id", "name", "lat", "long"],
          },
        ],
      });
      res.json(counties);
    } catch (error) {
      logger.error(error);
      res.status(500).end();
    }
  },
);

export default router;
