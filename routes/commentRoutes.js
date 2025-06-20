/**
 * @swagger
 * /comments/{resourceId}:
 *   post:
 *     summary: Add a comment to a resource
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */


const express = require('express');
const router = express.Router();
const { addComment, deleteComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:resourceId', auth, addComment);
router.delete('/:id', auth, deleteComment);



module.exports = router;
