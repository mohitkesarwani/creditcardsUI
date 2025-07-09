import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from './src/db.js';
import CreditCard from './src/models/CreditCard.js';
import Referral from './src/models/Referral.js';
import Lead from './src/models/Lead.js';
import EmailEvent from './src/models/EmailEvent.js';
import Comment from './src/models/Comment.js';
import Review from './src/models/Review.js';
import { getMinimumAnnualFee, formatPercent, formatMoney } from './src/utils.js';
import { requestLogger } from './src/middleware/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

const engagements = {};
// Placeholder datasets for other product types
const deposits = [];
const homeLoans = [];

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

const summarizeEngagement = (id, type = 'credit-cards') => {
  const key = type ? `${type}:${id}` : id;
  const e = engagements[key] || engagements[id] || { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  return {
    likes: e.likes || 0,
    comments: e.comments || 0,
    shares: e.shares || 0,
    averageRating: e.rating || 0,
  };
};

app.get('/api/credit-cards', async (req, res) => {
  try {
    const cards = await CreditCard.find({})
      .sort({ isSponsored: -1, sponsorRank: 1 })
      .lean();
    const withEngagement = cards.map((c) => ({
      ...normalizeCard(c),
      ...summarizeEngagement(String(c._id), 'credit-cards'),
    }));
    res.json(withEngagement);
  } catch (err) {
    console.error('Error fetching cards:', err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/deposits', async (_req, res) => {
  const result = deposits.map((d) => ({
    ...d,
    ...summarizeEngagement(d.id, 'deposits'),
  }));
  res.json(result);
});

app.get('/api/residential-mortgages', async (_req, res) => {
  const result = homeLoans.map((h) => ({
    ...h,
    ...summarizeEngagement(h.id, 'home-loans'),
  }));
  const rates = result
    .map((m) => parseFloat(m.lendingRates?.[0]?.rate))
    .filter((n) => !Number.isNaN(n));
  const minRate = rates.length ? Math.min(...rates) : 0;
  const maxRate = rates.length ? Math.max(...rates) : 0;
  res.json({ mortgages: result, total: result.length, minRate, maxRate });
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

// Generic engagement endpoints
app.get('/api/engagement/:id', (req, res) => {
  const { id } = req.params;
  const { entityType = 'generic' } = req.query;
  const key = `${entityType}:${id}`;
  if (!engagements[key]) engagements[key] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  res.json(engagements[key]);
});

app.post('/api/likes', (req, res) => {
  const { entityId, entityType = 'generic' } = req.body;
  const key = `${entityType}:${entityId}`;
  if (!engagements[key]) engagements[key] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  engagements[key].likes += 1;
  res.json(engagements[key]);
});

app.post('/api/shares', (req, res) => {
  const { entityId, entityType = 'generic' } = req.body;
  const key = `${entityType}:${entityId}`;
  if (!engagements[key]) engagements[key] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  engagements[key].shares += 1;
  res.json(engagements[key]);
});

// Comment & Review endpoints
app.post('/api/comments', async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.json(comment);
  } catch (err) {
    res.status(500).send('Error saving comment');
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('Error deleting comment');
  }
});

app.get('/api/comments/:entityId', async (req, res) => {
  try {
    const comments = await Comment.find({ entityId: req.params.entityId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).send('Error loading comments');
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, entityId, rating } = req.body;
    let reviewDoc = await Review.findOne({ userId, entityId });
    if (reviewDoc) {
      reviewDoc.rating = rating;
      await reviewDoc.save();
    } else {
      reviewDoc = await Review.create(req.body);
    }
    const key = `${req.body.entityType}:${entityId}`;
    if (!engagements[key]) engagements[key] = { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
    engagements[key].reviews.push({ stars: rating });
    engagements[key].comments = engagements[key].reviews.length;
    const avg = engagements[key].reviews.reduce((a, r) => a + (r.stars || 0), 0) / engagements[key].reviews.length;
    engagements[key].rating = Number(avg.toFixed(2));
    res.json(reviewDoc);
  } catch (err) {
    res.status(500).send('Error saving review');
  }
});

app.get('/api/reviews/:entityId', async (req, res) => {
  try {
    const reviews = await Review.find({ entityId: req.params.entityId });
    const avg = reviews.reduce((a, r) => a + (r.rating || 0), 0) / (reviews.length || 1);
    res.json({ average: reviews.length ? Number(avg.toFixed(2)) : 0, count: reviews.length });
  } catch (err) {
    res.status(500).send('Error loading reviews');
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
