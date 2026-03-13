/**
 * @file Product types router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: product_types
 *   description: Product types Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express router
const router = express.Router();

// Import models
import { ProductType } from "../../../models/models.js";

// Import database
import database from "../../../configs/database.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

// Import utilities
import handleValidationError from "../../../utilities/handle-validation-error.js";
import sendSuccess from "../../../utilities/send-success.js";


/**
 * Gets the list of product_types
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_types:
 *   get:
 *     summary: product_types list page
 *     description: Gets the list of all product_types in the application
 *     tags: [product_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: the list of product_types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductType'
 */
router.get("/", roleBasedAuth("manage_users"), async function (req, res, next) {
  try {
    const product_types = await ProductType.findAll();
    res.json(product_types);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single product_type by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_types/{id}:
 *   get:
 *     summary: get single product_type
 *     description: Gets a single product_type from the application
 *     tags: [product_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: product_type ID
 *     responses:
 *       200:
 *         description: a product_type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductType'
 */
router.get("/:id", async function (req, res, next) {
    try {
        const productType = await ProductType.findByPk(req.params.id, {});
        if (productType === null) {
            res.status(404).end();
        } else {
            res.json(productType);
        }

    } catch (error) {
        logger.error(error);
        res.status(500).end();
    }
});

/**
 * Create a ProductType
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_types:
 *   post:
 *     summary: create product_type
 *     tags: [product_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       description: product_type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductType'
 *           example:
 *             type: Test Milk Type
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
      const product_type = await ProductType.create(
        // Build the product_type object using body attributes
        {
          type: req.body.type
        },
        // Assign to a database transaction
        {
          transaction: t,
        },
      );

      // Send the success message
      sendSuccess("ProductType saved!", product_type.id, 201, res);
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
 * Update a product_type
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_types/{id}:
 *   put:
 *     summary: update product_type
 *     tags: [product_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: product_type ID
 *     requestBody:
 *       description: product_type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductType'
 *           example:
 *             type: Updated Milk Type
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put("/:id", async function (req, res, next) {
  try {
    const product_type = await ProductType.findByPk(req.params.id);

    // if the product_type is not found, return an HTTP 404 not found status code
    if (product_type === null) {
      res.status(404).end();
    } else {
      await database.transaction(async (t) => {
        await product_type.update(
          // Update the product_type object using body attributes
          {
            type: req.body.type,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("ProductType saved!", product_type.id, 201, res);
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
 * Delete a product_type
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_types/{id}:
 *   delete:
 *     summary: delete product_type
 *     tags: [product_types]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: product_type ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const product_type = await ProductType.findByPk(req.params.id);

    // if the product_type is not found, return an HTTP 404 not found status code
    if (product_type === null) {
      res.status(404).end();
    } else {
      await product_type.destroy();

      // Send the success message
      sendSuccess("ProductType deleted!", req.params.id, 200, res);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
