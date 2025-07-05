import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: String,
  entityId: String,
  entityType: String,
  commentText: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Comment', commentSchema, 'comments');
