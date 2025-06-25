import mongoose from 'mongoose';

const emailEventSchema = new mongoose.Schema({
  userId: String,
  emailType: String,
  campaign: String,
  sentAt: Date,
  openedAt: Date,
});

export default mongoose.model('EmailEvent', emailEventSchema, 'emailEvents');
