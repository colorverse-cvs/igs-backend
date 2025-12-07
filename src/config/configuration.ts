import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/giftshop',
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3600s',
  // stripe: {
  //   secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_xxx',
  //   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'YOUR_STRIPE_WEBHOOK_SECRET',
  // },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxx',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'supersecretrazorpay',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_RAZORPAY_WEBHOOK_SECRET',
  },
  prefix: process.env.API_PREFIX || 'api',
  version: process.env.API_VERSION || 'v1',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:4000',
}));
