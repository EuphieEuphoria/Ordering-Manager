/**
 * @file Users Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: users
 *   description: Users Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import { User, Role } from "../../../models/models.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import database
import database from "../../../configs/database.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

// Import utilities
import handleValidationError from "../../../utilities/handle-validation-error.js";
import sendSuccess from "../../../utilities/send-success.js";

// Add Role Authorization to all routes
router.use(roleBasedAuth("manage_users"));
/**
 * Gets the list of users
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: users list page
 *     description: Gets the list of all users in the application
 *     tags: [users]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: the list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: "roles",
        attributes: ["id", "role"],
        through: {
          attributes: [],
        },
      },
    });
    res.json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single user by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: get single user
 *     description: Gets a single user from the application
 *     tags: [users]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: user ID
 *     responses:
 *       200:
 *         description: a user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      include: {
        model: Role,
        as: "roles",
        attributes: ["id", "role"],
        through: {
          attributes: [],
        },
      },
    });
    // if the user is not found, return an HTTP 404 not found status code
    if (user === null) {
      res.status(404).end();
    } else {
      res.json(user);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Create a new user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: create user
 *     tags: [users]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       description: user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             username: newuser
 *             roles:
 *               - id: 6
 *               - id: 7
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/", async function (req, res, next) {
  try {
    // Use a database transaction to roll back if any errors are thrown
    await database.transaction(async (t) => {
      const user = await User.create(
        // Build the user object using body attributes
        {
          username: req.body.username,
        },
        // Assign to a database transaction
        {
          transaction: t,
        },
      );

      // If roles are included in the body
      if (req.body.roles) {
        // Find all roles listed
        const roles = await Promise.all(
          req.body.roles.map(({ id, ...next }) => {
            return Role.findByPk(id);
          }),
        );

        // Attach roles to user
        await user.setRoles(roles, { transaction: t });
      }

      // Send the success message
      sendSuccess("User saved!", user.id, 201, res);
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      handleValidationError(error, res);
    } else {
      logger.error(error);
      res.status(500).end();
    }
  }
});

/**
 * Update a user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: update user
 *     tags: [users]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: user ID
 *     requestBody:
 *       description: user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             username: updateduser
 *             roles:
 *               - id: 6
 *               - id: 7
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put("/:id", async function (req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);

    // if the user is not found, return an HTTP 404 not found status code
    if (user === null) {
      res.status(404).end();
    } else {
      await database.transaction(async (t) => {
        await user.update(
          // Update the user object using body attributes
          {
            username: req.body.username,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // If roles are included in the body
        if (req.body.roles) {
          // Find all roles listed
          const roles = await Promise.all(
            req.body.roles.map(({ id, ...next }) => {
              return Role.findByPk(id);
            }),
          );

          // Attach roles to user
          await user.setRoles(roles, { transaction: t });
        } else {
          // Remove all roles
          await user.setRoles([], { transaction: t });
        }

        // Send the success message
        sendSuccess("User saved!", user.id, 201, res);
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
});

/**
 * Delete a user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: delete user
 *     tags: [users]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: user ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);

    // if the user is not found, return an HTTP 404 not found status code
    if (user === null) {
      res.status(404).end();
    } else {
      await user.destroy();

      // Send the success message
      sendSuccess("User deleted!", req.params.id, 200, res);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
