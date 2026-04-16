/**
 * @file API main router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: api
 *   description: API routes
 */

// Import libraries
import express from "express";

// Import middleware
//import tokenMiddleware from "../middlewares/token.js";

//import logger
import logger from "../configs/logger.js";

// Import v1 routers
import rolesRouter from "./api/v1/roles.js";
import usersRouter from "./api/v1/users.js";
import productRouter from "./api/v1/products.js";
import productTypesRouter from "./api/v1/productTypes.js";
import productSizeRouter from "./api/v1/productSizes.js";
import supplierRouter from "./api/v1/suppliers.js";
import movementRouter from "./api/v1/movements.js";

// Create Express router
const router = express.Router();

/**
 * Gets the list of API versions
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/:
 *   get:
 *     summary: list API versions
 *     tags: [api]
 *     responses:
 *       200:
 *         description: the list of API versions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   version:
 *                     type: string
 *                   url:
 *                     type: string
 *             example:
 *               - version: "1.0"
 *                 url: /api/v1/
 */
router.get("/", function (req, res, next) {
  res.json([
    {
      version: "1.0",
      url: "/api/v1/",
    },
  ]);
});

// Use Token Middleware
// router.use(tokenMiddleware);
logger.error(
  "AUTHENTICATION OFF TURN THIS BACK ON LATER AUTHENTICATION OFF TURN THIS BACK ON LATER AUTHENTICATION OFF TURN THIS BACK ON LATER AUTHENTICATION OFF TURN THIS BACK ON LATER AUTHENTICATION OFF TURN THIS BACK ON LATER AUTHENTICATION OFF TURN THIS BACK ON LATER ",
);

// Use v1 routers after API route
router.use("/v1/roles", rolesRouter);
router.use("/v1/users", usersRouter);
router.use("/v1/products", productRouter);
router.use("/v1/product_types", productTypesRouter);
router.use("/v1/product_sizes", productSizeRouter);
router.use("/v1/suppliers", supplierRouter);
router.use("/v1/movements", movementRouter);
export default router;
