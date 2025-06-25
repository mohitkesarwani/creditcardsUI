import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from './src/db.js';
import CreditCard from './src/models/CreditCard.js';
import Referral from './src/models/Referral.js';
import Lead from './src/models/Lead.js';
import EmailEvent from './src/models/EmailEvent.js';
import { getMinimumAnnualFee, formatPercent, formatMoney } from './src/utils.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
