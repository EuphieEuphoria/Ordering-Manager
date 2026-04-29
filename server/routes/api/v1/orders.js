/**
 * @file Orders Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: Orders
 *   description: Orders Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import {
  Order,
  ProductOrder,
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
 * Gets the list of orders
 *
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: orders list page
 *     description: gets all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: A list of orders
 */
router.get("/", async function (req, res, next) {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: ProductOrder,
          as: "product_orders",
        },
      ],
    });

    res.json(orders);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});


/**
 * Create a order
 *
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: create a order
 *     tags: [Orders]
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
 *               - orders
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - orderType
 *                     - quantityOrdered
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     orderType:
 *                       type: integer
 *                     quantityOrdered:
 *                       type: integer
 *           example:
 *             orders:
 *               - productId: 1
 *                 quantityOrdered: 3
 *               - productId: 5
 *                 quantityOrdered: 10
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */

router.post("/", async function (req, res, next) {
  try {
    await database.transaction(async (t) => {
      const { orders } = req.body;

      if (!orders || orders.length === 0) {
        return res.status(422).json({ message: "No orders provided" });
      }

      const container = await Order.create(
        {
          applied: false,
        },
        { transaction: t },
      );

      const orderRows = orders.map((m) => ({
        orderID: container.id,
        productID: m.productId,
        quantityOrdered: m.quantityOrdered,
      }));

      await ProductOrder.bulkCreate(orderRows, {
        transaction: t,
      });

      sendSuccess("Order container saved!", container.id, 201, res);
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
