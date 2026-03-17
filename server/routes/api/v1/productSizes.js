/**
 * @file Product types router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: product_sizes
 *   description: Product types Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express router
const router = express.Router();

// Import models
import { ProductSize } from "../../../models/models.js";

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
 * Gets the list of product_sizes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_sizes:
 *   get:
 *     summary: product_sizes list page
 *     description: Gets the list of all product_sizes in the application
 *     tags: [product_sizes]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: the list of product_sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductSize'
 */
router.get("/", roleBasedAuth("manage_users"), async function (req, res, next) {
  try {
    const product_sizes = await ProductSize.findAll();
    res.json(product_sizes);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single productsize by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_sizes/{id}:
 *   get:
 *     summary: get single productsize
 *     description: Gets a single productsize from the application
 *     tags: [product_sizes]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: productsize ID
 *     responses:
 *       200:
 *         description: a productsize
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductSize'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const productSize = await ProductSize.findByPk(req.params.id, {});
    if (productSize === null) {
      res.status(404).end();
    } else {
      res.json(productSize);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Create a ProductSize
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_sizes:
 *   post:
 *     summary: create productsize
 *     tags: [product_sizes]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       description: productsize
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductSize'
 *           example:
 *             ounces: 420
 *             commonName: createdSize
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
      const productsize = await ProductSize.create(
        // Build the productsize object using body attributes
        {
          ounces: req.body.ounces,
          commonName: req.body.commonName,
        },
        // Assign to a database transaction
        {
          transaction: t,
        },
      );

      // Send the success message
      sendSuccess("ProductSize saved!", productsize.id, 201, res);
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
 * Update a productsize
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_sizes/{id}:
 *   put:
 *     summary: update productsize
 *     tags: [product_sizes]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: productsize ID
 *     requestBody:
 *       description: productsize
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductSize'
 *           example:
 *             ounces: 999
 *             commonName: updatedSize
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put("/:id", async function (req, res, next) {
  try {
    const productsize = await ProductSize.findByPk(req.params.id);

    // if the productsize is not found, return an HTTP 404 not found status code
    if (productsize === null) {
      res.status(404).end();
    } else {
      await database.transaction(async (t) => {
        await productsize.update(
          // Update the productsize object using body attributes
          {
            ounces: req.body.ounces,
            commonName: req.body.commonName,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("ProductSize saved!", productsize.id, 201, res);
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
 * Delete a productsize
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/product_sizes/{id}:
 *   delete:
 *     summary: delete productsize
 *     tags: [product_sizes]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: productsize ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const productsize = await ProductSize.findByPk(req.params.id);

    // if the productsize is not found, return an HTTP 404 not found status code
    if (productsize === null) {
      res.status(404).end();
    } else {
      await productsize.destroy();

      // Send the success message
      sendSuccess("ProductSize deleted!", req.params.id, 200, res);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
