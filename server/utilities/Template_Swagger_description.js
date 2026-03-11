/**
 * Desc
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @swagger
 * /api/v1/route
 *   get:
 *     summary:
 *     description:
 *     tags: [thing]
 *     security:
 *       - bearerAuth:
 *         - 'permission_name'
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               type: array (use is array, if not remove)
 *               items:
 *                 $ref: '#/components/schemas/schema_name'
 */
