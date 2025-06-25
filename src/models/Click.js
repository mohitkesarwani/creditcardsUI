import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  sessionId: String,
  productId: String,
  clickType: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Click', clickSchema, 'clicks');
