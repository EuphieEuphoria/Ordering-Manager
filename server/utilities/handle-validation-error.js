/**
 * @file Error handler for Sequelize Validation Errors
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports handleValidationError a handler for Sequelize validation errors
 */

/**
 * Gracefully handle Sequelize Validation Errors
 *
 * @param {SequelizeValidationError} error - Sequelize Validation Error
 * @param {Object} res - Express response object
 *
 * @swagger
 * components:
 *   responses:
 *     Success:
 *     ValidationError:
 *       description: model validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - error
 *             properties:
 *               error:
 *                 type: string
 *                 description: the description of the error
 *               errors:
 *                 type: array
 *                 items:
 *                    type: object
 *                    required:
 *                      - attribute
 *                      - message
 *                    properties:
 *                      attribute:
 *                        type: string
 *                        description: the attribute that caused the error
 *                      message:
 *                        type: string
 *                        description: the error associated with that attribute
 *             example:
 *               error: Validation Error
 *               errors:
 *                 - attribute: username
 *                   message: username must be unique
 */
function handleValidationError(error, res) {
  if (error.errors?.length > 0) {
    const errors = error.errors.map((e) => {
      return { attribute: e.path, message: e.message };
    });
    res.status(422).json({
      error: "Validation Error",
      errors: errors,
    });
  } else {
    res.status(422).json({
      error: error.parent.message,
    });
  }
}

export default handleValidationError;
