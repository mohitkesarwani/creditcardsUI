import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: String,
  entityId: String,
  entityType: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema, 'reviews');
