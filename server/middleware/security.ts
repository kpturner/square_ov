import logger from '../utils/logger';
import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const { secretKey, webhookSecret } = useRuntimeConfig().stripe;
  const url = getRequestURL(event);

  if (url.pathname === '/api/webhook/stripe') {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
    });

    try {
      const rawBody = await readRawBody(event); // Get raw request body
      if (rawBody) {
        const sig = getHeader(event, 'stripe-signature') as string;
        stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        throw createError({ statusCode: 401, statusMessage: 'Empty request body' });
      }
    } catch (err) {
      logger.error('Stripe Webhook Error:', err);
      throw createError({ statusCode: 401, statusMessage: 'Webhook signature verification failed' });
    }
  }

  if (url.pathname === '/api/subscription') {
    const authHeader = getRequestHeader(event, 'authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const key = authHeader.split(' ')[1];

    if (!key) {
      const error = `⚠️ Subscription enquiry arrived with no key: ${url.origin}`;
      logger.error(error);
      throw createError({ statusCode: 401, message: error });
    }

    if (key !== webhookSecret) {
      const error = `⚠️ Subscription enquiry received with invalid key: ${url.origin}`;
      logger.error(error);
      throw createError({ statusCode: 401, message: error });
    }
  }
});
