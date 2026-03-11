/**
 * @file Metadata Router
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router an Express Router
 *
 * @swagger
 * tags:
 *   name: metadata
 *   description: Metadata Routes
 */

// Import libraries
import express from "express";
import { ValidationError } from "sequelize";

// Create Express Router
const router = express.Router();

// Import models
import {
  Metadata,
  User,
  Document,
  Community,
  County,
} from "../../../models/models.js";

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
 * Gets the list of metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata:
 *   get:
 *     summary: metadata list page
 *     description: Gets the list of all metadata in the application
 *     tags: [metadata]
 *     security:
 *       - bearerAuth:
 *         - 'view_documents'
 *         - 'manage_documents'
 *         - 'add_documents'
 *     responses:
 *       200:
 *         description: the list of metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Metadata'
 */
router.get(
  "/",
  roleBasedAuth("view_documents", "manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata_plural = await Metadata.findAll({
        attributes: [
          "id",
          "title",
          "author",
          "publisher",
          "date",
          "abstract",
          "citation",
          "copyright_id",
          "keywords",
        ],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username"],
          },
          {
            model: Document,
            as: "documents",
            attributes: [
              "id",
              "display_name",
              "filename",
              "size",
              "type",
              "createdAt",
              "updatedAt",
            ],
          },
          {
            model: Community,
            as: "communities",
            include: [
              {
                model: County,
                as: "county",
                attributes: ["id", "name", "code"],
              },
            ],
          },
        ],
      });
      res.json(metadata_plural);
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Gets a single metadata by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}:
 *   get:
 *     summary: get single metadata
 *     description: Gets a single metadata from the application
 *     tags: [metadata]
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
 *         description: metadata ID
 *     responses:
 *       200:
 *         description: a metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metadata'
 */
router.get(
  "/:id",
  roleBasedAuth("view_documents", "manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id, {
        attributes: [
          "id",
          "title",
          "author",
          "publisher",
          "date",
          "abstract",
          "citation",
          "copyright_id",
          "keywords",
        ],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username"],
          },
          {
            model: Document,
            as: "documents",
            attributes: [
              "id",
              "display_name",
              "filename",
              "size",
              "type",
              "createdAt",
              "updatedAt",
            ],
          },
          {
            model: Community,
            as: "communities",
            include: [
              {
                model: County,
                as: "county",
                attributes: ["id", "name", "code"],
              },
            ],
          },
        ],
      });
      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        res.json(metadata);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Create a new metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata:
 *   post:
 *     summary: create metadata
 *     tags: [metadata]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *         - 'add_documents'
 *     requestBody:
 *       description: metadata
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Metadata'
 *           example:
 *             title: New Metadata
 *             author: Lastname, Firstname
 *             publisher: Kansas State University, The Chapman Center for Rural Studies
 *             date: 2025-02-01T00:00:00.000Z
 *             abstract: This paper has an abstract
 *             citation: Firstname Lastname, New Metadata, 2025-02, ...
 *             copyright_id: 1
 *             keywords: Keyword1 Keyword2 Keyword3
 *
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
        const metadata = await Metadata.create(
          // Build the metadata object using body attributes
          {
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            date: req.body.date,
            abstract: req.body.abstract,
            citation: req.body.citation,
            copyright_id: req.body.copyright_id,
            keywords: req.body.keywords,
            owner_user_id: req.token.id,
          },
          // Assign to a database transaction
          {
            transaction: t,
          },
        );

        // Send the success message
        sendSuccess("Metadata saved!", metadata.id, 201, res);
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
 * Update a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}:
 *   put:
 *     summary: update metadata
 *     tags: [metadata]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: metadata ID
 *     requestBody:
 *       description: metadata
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Metadata'
 *           example:
 *             title: New Metadata
 *             author: Lastname, Firstname
 *             publisher: Kansas State University, The Chapman Center for Rural Studies
 *             date: 2025-02-01T00:00:00.000Z
 *             abstract: This paper has an abstract
 *             citation: Firstname Lastname, New Metadata, 2025-02, ...
 *             copyright_id: 1
 *             keywords: Keyword1 Keyword2 Keyword3
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
      const metadata = await Metadata.findByPk(req.params.id);

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await metadata.update(
            // Update the metadata object using body attributes
            {
              title: req.body.title,
              author: req.body.author,
              publisher: req.body.publisher,
              date: req.body.date,
              abstract: req.body.abstract,
              citation: req.body.citation,
              copyright_id: req.body.copyright_id,
              keywords: req.body.keywords,
            },
            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess("Metadata saved!", metadata.id, 201, res);
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
 * Delete a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}:
 *   delete:
 *     summary: delete metadata
 *     tags: [metadata]
 *     security:
 *       - bearerAuth:
 *         - 'manage_documents'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: metadata ID
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.delete(
  "/:id",
  roleBasedAuth("manage_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id);

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await metadata.destroy();

        // Send the success message
        sendSuccess("Metadata deleted!", req.params.id, 200, res);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).end();
    }
  },
);

/**
 * Add a Document to a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}/add_document:
 *   post:
 *     summary: Add a Document to a metadata
 *     tags: [metadata]
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
 *         description: metadata ID
 *     requestBody:
 *       description: Document ID to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Document ID
 *             required:
 *               - id
 *           example:
 *             id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:id/add_document",
  roleBasedAuth("manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id);
      const documentId = req.body.id;
      // Check if documentId is provided
      if (!documentId) {
        const newError = new ValidationError("Validation Failed", [
          { message: "document_Id is required", path: "document_Id" },
        ]);
        throw newError;
      }
      // Check if documentId is valid
      const document = await Document.findByPk(documentId);
      if (!document) {
        const newError = new ValidationError("Validation Failed", [
          { message: "document_Id is invalid", path: "document_Id" },
        ]);
        throw newError;
      }

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await metadata.addDocument(
            // Update the metadata object using body attributes

            documentId,

            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess("Document added to Metadata!", metadata.id, 201, res);
        });
      }
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
 * Add a community to a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}/add_community:
 *   post:
 *     summary: Add a community to a metadata
 *     tags: [metadata]
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
 *         description: metadata ID
 *     requestBody:
 *       description: community ID to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: community ID
 *             required:
 *               - id
 *           example:
 *             id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:id/add_community",
  roleBasedAuth("manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id);
      const communityId = req.body.id;
      // Check if communityId is provided
      if (!communityId) {
        const newError = new ValidationError("Validation Failed", [
          { message: "community_Id is required", path: "community_Id" },
        ]);
        throw newError;
      }
      // Check if communityId is valid
      const community = await Community.findByPk(communityId);
      if (!community) {
        const newError = new ValidationError("Validation Failed", [
          { message: "community_Id is invalid", path: "community_Id" },
        ]);
        throw newError;
      }

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await metadata.addCommunity(
            // Update the metadata object using body attributes

            communityId,

            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess("community added to Metadata!", metadata.id, 201, res);
        });
      }
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
 * Remove a Community from a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}/remove_community:
 *   post:
 *     summary: Remove a Community from a metadata
 *     tags: [metadata]
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
 *         description: metadata ID
 *     requestBody:
 *       description: Community ID to remove
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Community ID
 *             required:
 *               - id
 *           example:
 *             id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:id/remove_community",
  roleBasedAuth("manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id);
      const communityId = req.body.id;
      // Check if communityId is provided
      if (!communityId) {
        const newError = new ValidationError("Validation Failed", [
          { message: "community_Id is required", path: "community_Id" },
        ]);
        throw newError;
      }
      // Check if communityId is valid
      const community = await Community.findByPk(communityId);
      if (!community) {
        const newError = new ValidationError("Validation Failed", [
          { message: "community_Id is invalid", path: "community_Id" },
        ]);
        throw newError;
      }

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await metadata.removeCommunity(
            // Update the metadata object using body attributes

            communityId,

            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess(
            "Community removed from Metadata!",
            metadata.id,
            201,
            res,
          );
        });
      }
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
 * Remove a Document from a metadata
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/metadata/{id}/remove_document:
 *   post:
 *     summary: Remove a Document from a metadata
 *     tags: [metadata]
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
 *         description: metadata ID
 *     requestBody:
 *       description: Document ID to remove
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Document ID
 *             required:
 *               - id
 *           example:
 *             id: 1
 *
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Success'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:id/remove_document",
  roleBasedAuth("manage_documents", "add_documents"),
  async function (req, res, next) {
    try {
      const metadata = await Metadata.findByPk(req.params.id);
      const documentId = req.body.id;
      // Check if documentId is provided
      if (!documentId) {
        const newError = new ValidationError("Validation Failed", [
          { message: "document_Id is required", path: "document_Id" },
        ]);
        throw newError;
      }
      // Check if documentId is valid
      const document = await Document.findByPk(documentId);
      if (!document) {
        const newError = new ValidationError("Validation Failed", [
          { message: "document_Id is invalid", path: "document_Id" },
        ]);
        throw newError;
      }

      // if the metadata is not found, return 404
      if (metadata === null) {
        res.status(404).end();
      } else {
        await database.transaction(async (t) => {
          await metadata.removeDocument(
            // Update the metadata object using body attributes

            documentId,

            // Assign to a database transaction
            {
              transaction: t,
            },
          );
          // Send the success message
          sendSuccess("Document removed from Metadata!", metadata.id, 201, res);
        });
      }
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

export default router;
