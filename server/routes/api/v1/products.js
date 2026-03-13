/**
 * @file Products Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: products
 *   description: Products Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import { Product, ProductCount } from "../../../models/models.js";

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
 * Gets the list of products
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/products:
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
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", async function (req, res, next) {
  try {
    const products = await Product.findAll({
      include: {
        model: ProductCount,
        as: "product_counts",
        attributes: ["quantity"],
      }
    });
    res.json(products);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single product by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: get single product
 *     description: Gets a single product from the application
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
 *         description: a product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: {
        model: ProductCount,
        as: "product_counts",
        attributes: ["quantity"],
      }
    });
    // if the product is not found, return an HTTP 404 not found status code
    if (product === null) {
      res.status(404).end();
    } else {
      res.json(product);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Create a Product
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: create product
 *     tags: [products]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       description: product
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *           example:
 *             supplierId: 0
 *             typeId: 1
 *             sizeId: 2
 *             caseSize: 10
 *             description: Test Product from price chopper, 1%, 32oz
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
      const product = await Product.create(
        // Build the product object using body attributes
        {
          supplierId: req.body.supplierId,
          typeId: req.body.typeId,
          sizeId: req.body.sizeId,
          caseSize: req.body.caseSize,
          description: req.body.description,
        },
        // Assign to a database transaction
        {
          transaction: t,
        },
      );

      await ProductCount.create(
        {
          productId: product.id,
          quantity: 0,
        },
        {
          transaction: t,
        },
      );

      // Send the success message
      sendSuccess("Product saved!", product.id, 201, res);
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
 * Update a product
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: update product
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
 *     requestBody:
 *       description: product
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *           example:
 *             supplierId: 0
 *             typeId: 1
 *             sizeId: 2
 *             caseSize: 10
 *             description: Updated Product from price chopper, 1%, 32oz
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put("/:id", async function (req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);

    // if the product is not found, return an HTTP 404 not found status code
    if (product === null) {
      res.status(404).end();
    } else {
      await database.transaction(async (t) => {
        await product.update(
          // Update the product object using body attributes
          {
          supplierId: req.body.supplierId,
          typeId: req.body.typeId,
          sizeId: req.body.sizeId,
          caseSize: req.body.caseSize,
          description: req.body.description,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("Product saved!", product.id, 201, res);
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
 * Delete a product
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: delete product
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
 *         $ref: '#/components/responses/Success'
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);

    // if the product is not found, return an HTTP 404 not found status code
    if (product === null) {
      res.status(404).end();
    } else {
      await product.destroy();

      // Send the success message
      sendSuccess("Product deleted!", req.params.id, 200, res);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).end();
  }
});

export default router;