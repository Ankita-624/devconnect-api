const Comment = require('../models/Comment');

/**
 * @desc Add a new comment to a resource
 * @route POST /api/comments/:resourceId
 * @access Protected
 */
exports.addComment = async (req, res) => {
  try {
    const newComment = new Comment({
      text: req.body.text,
      resource: req.params.resourceId,
      postedBy: req.user.id,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('❌ Failed to add comment:', err.message);
    res.status(500).json({ message: 'Could not add comment' });
  }
};

/**
 * @desc Delete a comment (only author or admin)
 * @route DELETE /api/comments/:id
 * @access Protected
 */
exports.deleteComment = async (req, res) => {
  console.log('➡️ DELETE /comments/:id called');
  console.log('Comment ID:', req.params.id);
  console.log('User Info:', req.user);

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      console.log('❌ Comment not found!');
      return res.status(404).json({ message: 'Comment not found' });
    }

    console.log('Comment postedBy:', comment.postedBy.toString());
    console.log('Requesting user ID:', req.user.id);
    console.log('User role:', req.user.role);

    // Check if the requester is the author or an admin
    if (comment.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('❌ Unauthorized delete attempt');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await comment.deleteOne(); // better than deprecated .remove()
    console.log('✅ Comment deleted successfully');
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('❌ Server error while deleting comment:', err.message);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
