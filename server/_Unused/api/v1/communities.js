/**
 * @file Communities Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: communities
 *   description: Communities Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import { Community, User, County } from "../../../models/models.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import database
import database from "../../../configs/database.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

// Import utilities
import handleValidationError from "../../../utilities/handle-validation-error.js";
import sendSuccess from "../../../utilities/send-success.js";

/**
 * Gets the list of communities
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/communities:
 *   get:
 *     summary: communities list page
 *     description: Gets the list of all communities in the application
 *     tags: [communities]
 *     security:
 *       - bearerAuth:
 *         - 'view_communities'
 *         - 'manage_communities'
 *         - 'add_communities'
 *     responses:
 *       200:
 *         description: the list of communities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Community'
 */
router.get(
  "/",
  roleBasedAuth("view_communities", "manage_communities", "add_communities"),
  async function (req, res, next) {
    try {
      const communities = await Community.findAll({
        attributes: ["id", "name", "lat", "long", "createdAt", "updatedAt"],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username"],
          },
          {
            model: County,
            as: "county",
            attributes: ["id", "name", "code"],
          },
        ],
      });
      res.json(communities);
    } catch (error) {
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Gets a single community by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/communities/{id}:
 *   get:
 *     summary: get single community
 *     description: Gets a single community from the application
 *     tags: [communities]
 *     security:
 *       - bearerAuth:
 *         - 'view_communities'
 *         - 'manage_communities'
 *         - 'add_communities'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: community ID
 *     responses:
 *       200:
 *         description: a community
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Community'
 */
router.get(
  "/:id",
  roleBasedAuth("view_communities", "manage_communities", "add_communities"),
  async function (req, res, next) {
    try {
      const community = await Community.findByPk(req.params.id, {
        attributes: ["id", "name", "lat", "long", "createdAt", "updatedAt"],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username"],
          },
          {
            model: County,
            as: "county",
            attributes: ["id", "name", "code"],
          },
        ],
      });
      // if the community is not found, return an HTTP 404 not found status code
      if (community === null) {
        res.status(404).end();
      } else {
        res.json(community);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Create a new community
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/communities:
 *   post:
 *     summary: create community
 *     tags: [communities]
 *     security:
 *       - bearerAuth:
 *         - 'manage_communities'
 *         - 'add_communities'
 *     requestBody:
 *       description: community
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Community'
 *           example:
 *             name: new community
 *             lat: 35.1234567
 *             long: -96.1234567
 *             county:
 *               id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/",
  roleBasedAuth("manage_communities", "add_communities"),
  async function (req, res, next) {
    try {
      // Check if county is provided
      if (!req.body.county) {
        const newError = new ValidationError("Validation Failed", [
          { message: "county.id is required", path: "county" },
        ]);
        throw newError;
      }
      // Check if county is valid
      const county = await County.findByPk(req.body.county.id);
      if (!county) {
        const newError = new ValidationError("Validation Failed", [
          { message: "county.id is invalid", path: "county" },
        ]);
        throw newError;
      }
      // Use a database transaction to roll back if any errors are thrown
      await database.transaction(async (t) => {
        const community = await Community.create(
          // Build the community object using body attributes
          {
            name: req.body.name,
            lat: req.body.lat,
            long: req.body.long,
            owner_user_id: req.token.id,
            county_id: req.body.county.id,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("Community saved!", community.id, 201, res);
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        handleValidationError(error, res);
      } else {
        logger.error(error);
        res.status(500).end();
      }
    }
  },
);

/**
 * Update a community
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/communities/{id}:
 *   put:
 *     summary: update community
 *     tags: [communities]
 *     security:
 *       - bearerAuth:
 *         - 'manage_communities'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: community ID
 *     requestBody:
 *       description: community
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Community'
 *           example:
 *             name: updatedcommunity
 *             lat: 35.1234567
 *             long: -96.1234567
 *             county:
 *               id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  "/:id",
  roleBasedAuth("manage_communities"),
  async function (req, res, next) {
    try {
      const community = await Community.findByPk(req.params.id);

      // if the community is not found, return 404
      if (community === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await community.update(
            // Update the community object using body attributes
            {
              name: req.body.name,
              lat: req.body.lat,
              long: req.body.long,
            },
            // Assign to a database transaction
            {
              transaction: t,
            },
          );

          // If county is included in the body
          if (req.body.county) {
            const county = await County.findByPk(req.body.county.id);
            if (!county) {
              const newError = new ValidationError("Validation Failed", [
                { message: "county.id is invalid", path: "county" },
              ]);
              throw newError;
            }
            await community.setCounty(county, { transaction: t });
          }
          // Send the success message
          sendSuccess("Community saved!", community.id, 201, res);
        });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        handleValidationError(error, res);
      } else {
        logger.error(error);
        res.status(500).end();
      }
    }
  },
);

/**
 * Delete a community
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/communities/{id}:
 *   delete:
 *     summary: delete community
 *     tags: [communities]
 *     security:
 *       - bearerAuth:
 *         - 'manage_communities'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: community ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete(
  "/:id",
  roleBasedAuth("manage_communities"),
  async function (req, res, next) {
    try {
      const community = await Community.findByPk(req.params.id);

      // if the community is not found, return 404
      if (community === null) {
        res.status(404).end();
      } else {
        await community.destroy();

        // Send the success message
        sendSuccess("Community deleted!", req.params.id, 200, res);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).end();
    }
  },
);

export default router;
