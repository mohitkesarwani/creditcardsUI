import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  featureType: String,
  additionalValue: String,
}, { _id: false });

const creditCardSchema = new mongoose.Schema({
  name: String,
  description: String,
  brandName: String,
  brand: String,
  cardArt: [{ imageUri: String }],
  feesAndPricing: {
    interestFreePeriod: String,
    interestRates: [{ rate: String }],
  },
  lendingRates: [{ comparisonRate: String }],
  fees: [{ amount: String }],
  eligibility: [{ value: String, unit: String }],
  applicationUri: String,
  features: [featureSchema],
});

export default mongoose.model('CreditCard', creditCardSchema, 'creditcards');
