# Stripe Integration Setup Guide

## Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRO_PRICE_ID="price_your_pro_plan_id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Stripe Setup Steps

### 1. Create Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the Stripe Dashboard

### 2. Create Product and Price
1. Go to Stripe Dashboard → Products
2. Create a new product called "JobSync Pro"
3. Add a recurring price of $19/month
4. Copy the price ID (starts with `price_`)

### 3. Set Up Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

### 4. Update Environment Variables
Replace the placeholder values in your `.env` file with your actual Stripe credentials.

## Features Implemented

### Free Plan (Default)
- Track up to 10 job applications
- Basic dashboard and analytics
- Manual job entry
- No AI features

### Pro Plan ($19/month)
- Unlimited job tracking
- AI-powered resume review
- AI job matching
- Advanced analytics
- Export functionality
- Chrome extension
- Resume parsing
- Interview tracking

## How It Works

1. **Pricing Page**: Users can see plans and click "Get Started" or "Upgrade to Pro"
2. **Authentication**: Users must be logged in to purchase
3. **Stripe Checkout**: Redirects to Stripe for payment
4. **Webhooks**: Updates user subscription status in database
5. **Access Control**: 
   - Job tracking limited to 10 for free users
   - AI features blocked for free users
   - Pro users get unlimited access

## Testing

### Test Mode
- Use Stripe test keys for development
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Production
- Switch to live keys when deploying
- Update webhook endpoint to production URL
- Test the complete flow

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**: Check webhook endpoint URL and secret
2. **Subscription not updating**: Verify webhook events are configured correctly
3. **Checkout not working**: Ensure price ID is correct and product is active

### Debug Mode
- Check Stripe Dashboard for webhook delivery logs
- Monitor application logs for subscription status updates
- Use Stripe CLI for local webhook testing 