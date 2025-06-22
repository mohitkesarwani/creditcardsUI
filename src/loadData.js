import mongoose from 'mongoose';
import { connectDb } from './db.js';
import CreditCard from './models/CreditCard.js';

const run = async () => {
  try {
    await connectDb();
    const cards = await CreditCard.find({}).lean();
    console.log(JSON.stringify(cards, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();
