/**
 * @file Sends JSON Success Messages
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports sendSuccess a function to send JSON Success Messages
 */

/**
 * Send JSON Success Messages
 *
 * @param {string} message - the message to send
 * @param {integer} status - the HTTP status to use
 * @param {Object} res - Express response object
 *
 * @swagger
 * components:
 *   responses:
 *     Success:
 *       description: success
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - id
 *             properties:
 *               message:
 *                 type: string
 *                 description: the description of the successful operation
 *               id:
 *                 type: integer
 *                 description: the id of the saved or created item
 *             example:
 *               message: User successfully saved!
 */
function sendSuccess(message, id, status, res) {
  res.status(status).json({
    message: message,
    id: id,
  });
}

export default sendSuccess;
