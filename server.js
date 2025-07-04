import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from './src/db.js';
import CreditCard from './src/models/CreditCard.js';
import Referral from './src/models/Referral.js';
import Lead from './src/models/Lead.js';
import EmailEvent from './src/models/EmailEvent.js';
import { getMinimumAnnualFee, formatPercent, formatMoney } from './src/utils.js';
import { requestLogger } from './src/middleware/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

const engagements = {};

const normalizeCard = (card) => {
  const interestRateRaw = card.feesAndPricing?.interestRates?.[0]?.rate;
  const interestRate = interestRateRaw ? formatPercent(parseFloat(interestRateRaw)) : null;
  const comparisonRateRaw = card.lendingRates?.[0]?.comparisonRate;
  const comparisonRate = comparisonRateRaw ? formatPercent(parseFloat(comparisonRateRaw)) : null;
  const annualFee = getMinimumAnnualFee(card);

  const eligibility = card.eligibility?.length
    ? `${card.eligibility[0].value}${card.eligibility[0].unit || ''}`
    : null;

  const productImageUrl = card.cardArt?.[0]?.imageUri || null;

  const hasRequired = !!(productImageUrl && card.applicationUri);

  return {
    ...card,
    brand: card.brand || card.brandName || 'Unknown',
    interestRate: interestRate || null,
    interestFree: card.feesAndPricing?.interestFreePeriod || null,
    comparisonRate: comparisonRate || null,
    annualFee: annualFee !== null ? formatMoney(annualFee) : null,
    eligibilityCriteria: eligibility,
    applicationUrl: card.applicationUri || null,
    productImageUrl,
    status: hasRequired ? 'complete' : 'incomplete',
  };
};

app.get('/api/credit-cards', async (req, res) => {
  try {
    const cards = await CreditCard.find({})
      .sort({ isSponsored: -1, sponsorRank: 1 })
      .lean();
    res.json(cards.map(normalizeCard));
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
    res.json(normalizeCard(card));
  } catch (err) {
    console.error('Error fetching card:', err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/referrals', async (req, res) => {
  try {
    const { cardId, partnerId, redirectUrl } = req.body;
    await Referral.create({ cardId, partnerId, redirectUrl });
    res.json({ success: true });
  } catch (err) {
    console.error('Error logging referral:', err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    if (process.env.CRM_WEBHOOK_URL) {
      fetch(process.env.CRM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      }).catch((err) => {
        console.error('CRM webhook error:', err.message);
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving lead:', err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/email-events', async (req, res) => {
  try {
    await EmailEvent.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving email event:', err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/products/:id/engagement', (req, res) => {
  const { id } = req.params;
  if (!engagements[id]) {
    engagements[id] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  }
  res.json(engagements[id]);
});

app.post('/api/products/:id/like', (req, res) => {
  const { id } = req.params;
  if (!engagements[id]) engagements[id] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  engagements[id].likes += 1;
  res.json(engagements[id]);
});

app.post('/api/products/:id/share', (req, res) => {
  const { id } = req.params;
  if (!engagements[id]) engagements[id] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  engagements[id].shares += 1;
  res.json(engagements[id]);
});

app.post('/api/products/:id/review', (req, res) => {
  const { id } = req.params;
  const review = req.body;
  if (!engagements[id]) engagements[id] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  engagements[id].reviews.push(review);
  engagements[id].comments = engagements[id].reviews.length;
  const avg = engagements[id].reviews.reduce((a, r) => a + (r.stars || 0), 0) / engagements[id].reviews.length;
  engagements[id].rating = Number(avg.toFixed(2));
  res.json(engagements[id]);
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
