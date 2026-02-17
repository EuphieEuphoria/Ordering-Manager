/**
 * @file Documents Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: documents
 *   description: Documents Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";
import multer from "multer";

// Create Express Router
const router = express.Router();

// Configure Multer
const upload = multer({ dest: "./public/uploads" });

// Import models
import { Document } from "../../../models/models.js";

// Import logger
import logger from "../../../configs/logger.js";

// Import middlewares
import roleBasedAuth from "../../../middlewares/authorized-roles.js";

// Import database
import database from "../../../configs/database.js";

// Import utilities
import handleValidationError from "../../../utilities/handle-validation-error.js";
import sendSuccess from "../../../utilities/send-success.js";

/**
 * Gets the list of documents
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: documents list page
 *     description: Gets the list of all documents in the application
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'view_documents'
 *         - 'manage_documents'
 *         - 'add_documents'
 *     responses:
 *       200:
 *         description: the list of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 */
router.get(
  "/",
  roleBasedAuth("view_documents", "manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const documents = await Document.findAll();
      res.json(documents);
    } catch (error) {
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Gets a single document by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: get single document
 *     description: Gets a single document from the application
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'view_documents'
 *         - 'manage_documents'
 *         - 'add_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: document ID
 *     responses:
 *       200:
 *         description: a document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 */
router.get(
  "/:id",
  roleBasedAuth("view_documents", "manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const document = await Document.findByPk(req.params.id);
      // if the document is not found, return 404
      if (document === null) {
        res.status(404).end();
      } else {
        res.json(document);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Create a new document
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents:
 *   post:
 *     summary: create document
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *         - 'add_documents'
 *     requestBody:
 *       description: document
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *           example:
 *             display_name: new_document.jpg
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/",
  roleBasedAuth("manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      // Use a database transaction to roll back if any errors are thrown
      await database.transaction(async (t) => {
        const document = await Document.create(
          // Build the document object using body attributes
          {
            display_name: req.body.display_name,
            filename: "",
            size: 0,
            type: "",
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("Document saved!", document.id, 201, res);
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
 * Update a document
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: update document
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: document ID
 *     requestBody:
 *       description: document
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *           example:
 *             display_name: updated_document.jpg
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  "/:id",
  roleBasedAuth("manage_documents"),
  async function (req, res, next) {
    try {
      const document = await Document.findByPk(req.params.id);
      if (!req.body.display_name) {
        const newError = new ValidationError("Validation Failed", [
          { message: "Display name is required", path: "display_name" },
        ]);
        throw newError;
      }
      // if the document is not found, return 404
      if (document === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await document.update(
            // Update the document object using body attributes
            {
              display_name: req.body.display_name,
            },
            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess("Document saved!", document.id, 201, res);
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
 * Document existance check middleware
 */

async function documentExists(req, res, next) {
  const document = await Document.findByPk(req.params.id);
  // if the document is not found, return 404
  if (document === null) {
    res.status(404).json({ message: "Document not found." }).end();
  } else {
    req.document = document;
    next();
  }
}

/**
 * Upload a document
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents/{id}/upload:
 *   post:
 *     summary: upload a document
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *         - 'add_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: document ID
 *     requestBody:
 *       description: document
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:id/upload",
  roleBasedAuth("manage_documents", "add_documents"),
  documentExists,
  upload.single("file"),
  async function (req, res, next) {
    try {
      //check if the file exists
      if (!req.file) {
        const newError = new ValidationError("Validation Failed", [
          { message: "File is required", path: "file" },
        ]);
        throw newError;
      }
      await database.transaction(async (t) => {
        await req.document.update(
          // Update the document object using body attributes
          {
            filename: req.file.filename,
            size: req.file.size,
            type: req.file.mimetype,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );
        // Send the success message
        sendSuccess("Document saved!", req.document.id, 201, res);
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        handleValidationError(error, res);
      } else {
        console.log(error);
        logger.error(error);
        res.status(500).end();
      }
    }
  },
);

/**
 * Delete a document
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: delete document
 *     tags: [documents]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: document ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete(
  "/:id",
  roleBasedAuth("manage_documents"),
  async function (req, res, next) {
    try {
      const document = await Document.findByPk(req.params.id);

      // if the document is not found, return 404
      if (document === null) {
        res.status(404).end();
      } else {
        await document.destroy();

        // Send the success message
        sendSuccess("Document deleted!", req.params.id, 200, res);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).end();
    }
  },
);

export default router;
