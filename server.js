import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from './src/db.js';
import CreditCard from './src/models/CreditCard.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/credit-cards', async (req, res) => {
  try {
    const cards = await CreditCard.find({}).lean();
    res.json(cards);
  } catch (err) {
    console.error('Error fetching cards:', err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/credit-cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let card = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      card = await CreditCard.findById(id).lean();
    }
    if (!card) {
      card = await CreditCard.findOne({ productId: id }).lean();
    }
    if (!card) {
      return res.status(404).send('Card not found');
    }
    res.json(card);
  } catch (err) {
    console.error('Error fetching card:', err.message);
    res.status(500).send('Server error');
  }
});

const start = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
};

start();
