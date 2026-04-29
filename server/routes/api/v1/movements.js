/**
 * @file Movements Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: Movements
 *   description: Movements Routes
 */

// Import libraries
import express from "express";
import { Op, ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import {
  Movement,
  ProductMovement,
} from "../../../models/models.js";

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
 * Gets the list of movements
 *
 * @swagger
 * /api/v1/movements:
 *   get:
 *     summary: movements list page
 *     description: gets all movements
 *     tags: [Movements]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: A list of movements
 */
router.get("/", async function (req, res, next) {
  try {
    const movements = await Movement.findAll({
      include: [
        {
          model: ProductMovement,
          as: "product_movements",
        },
      ],
    });

    res.json(movements);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Get Movements between two dates
 *
 * @swagger
 * /api/v1/movements/between:
 *   get:
 *     summary: get movements between dates
 *     tags: [Movements]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start
 *               - end
 *             properties:
 *               start:
 *                 type: string
 *                 format: date-time
 *
 *               end:
 *                 type: string
 *                 format: date-time
 *           example:
 *             - start: 2025-01-01T00:00:00.000Z
 *             - end: 2025-01-31T23:59:59.000Z
 *     responses:
 *       200:
 *         description: A list of movements between the specified dates
 */
router.get("/between", async function (req, res, next) {
  try {
    const movements = await Movement.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(req.query.start), new Date(req.query.end)],
        },
      },
    });
    res.json(movements);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Create a movement
 *
 * @swagger
 * /api/v1/movements:
 *   post:
 *     summary: create a movement
 *     tags: [Movements]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movements
 *             properties:
 *               movements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - movementType
 *                     - amountChanged
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     movementType:
 *                       type: integer
 *                     amountChanged:
 *                       type: integer
 *           example:
 *             movements:
 *               - productId: 1
 *                 movementType: 2
 *                 amountChanged: -3
 *               - productId: 5
 *                 movementType: 1
 *                 amountChanged: -10
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */

router.post("/", async function (req, res, next) {
  try {
    await database.transaction(async (t) => {
      const { movements } = req.body;

      if (!movements || movements.length === 0) {
        return res.status(422).json({ message: "No movements provided" });
      }

      const container = await Movement.create(
        {
          applied: false,
        },
        { transaction: t },
      );

      const movementRows = movements.map((m) => ({
        movementID: container.id,
        productID: m.productId,
        movementType: m.movementType,
        amountChanged: m.amountChanged,
      }));

      await ProductMovement.bulkCreate(movementRows, {
        transaction: t,
      });

      sendSuccess("Movement container saved!", container.id, 201, res);
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

export default router;
