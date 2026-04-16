/**
 * @file Suppliers router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express router
 *
 * @swagger
 * tags:
 *   name: suppliers
 *   description: Suppliers Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express router
const router = express.Router();

// Import models
import { Product, Supplier } from "../../../models/models.js";

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
 * Gets the list of suppliers
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers:
 *   get:
 *     summary: suppliers list page
 *     description: Gets the list of all suppliers in the application
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     responses:
 *       200:
 *         description: the list of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 */
router.get("/", roleBasedAuth("manage_users"), async function (req, res, next) {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Gets a single supplier by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers/{id}:
 *   get:
 *     summary: get single supplier
 *     description: Gets a single supplier from the application
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: supplier ID
 *     responses:
 *       200:
 *         description: a supplier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 */
router.get("/:id", async function (req, res, next) {
  try {
    const productType = await Supplier.findByPk(req.params.id, {});
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
 * Create a Supplier
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers:
 *   post:
 *     summary: create supplier
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     requestBody:
 *       description: supplier
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *           example:
 *             name: created Supplier
 *             address: created address
 *             description: Created description
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
      const supplier = await Supplier.create(
        // Build the supplier object using body attributes
        {
          name: req.body.name,
          address: req.body.address,
          description: req.body.description,
        },
        // Assign to a database transaction
        {
          transaction: t,
        },
      );

      // Send the success message
      sendSuccess("Supplier saved!", supplier.id, 201, res);
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
 * Update a supplier
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers/{id}:
 *   put:
 *     summary: update supplier
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: supplier ID
 *     requestBody:
 *       description: supplier
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *           example:
 *             name: updated Supplier
 *             address: updated address
 *             description: updated description
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put("/:id", async function (req, res, next) {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    // if the supplier is not found, return an HTTP 404 not found status code
    if (supplier === null) {
      res.status(404).end();
    } else {
      await database.transaction(async (t) => {
        await supplier.update(
          // Update the supplier object using body attributes
          {
            name: req.body.name,
            address: req.body.address,
            description: req.body.description,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("Supplier saved!", supplier.id, 201, res);
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
 * Delete a supplier
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers/{id}:
 *   delete:
 *     summary: delete supplier
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: supplier ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete("/:id", async function (req, res, next) {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    // if the supplier is not found, return an HTTP 404 not found status code
    if (supplier === null) {
      res.status(404).end();
    } else {
      await supplier.destroy();

      // Send the success message
      sendSuccess("Supplier deleted!", req.params.id, 200, res);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).end();
  }
});

/**
 * Get a List of products by supplier
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/suppliers/{id}/products:
 *   get:
 *     summary: get single supplier
 *     description: Gets a single supplier from the application
 *     tags: [suppliers]
 *     security:
 *       - bearerAuth:
 *         - 'manage_users'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: supplier ID
 *     responses:
 *       200:
 *         description: a supplier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 */
router.get("/:id/products", async function (req, res, next) {
  try {
    const products = await Supplier.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
          where: {
            supplierId: req.params.id,
          },
          attributes: ["id", "description"],
        },
      ],
    });
    res.json(products);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

export default router;
