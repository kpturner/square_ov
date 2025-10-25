import Stripe from 'stripe';
import { H3Event, readRawBody } from 'h3';
import logger from '../../utils/logger';
import dbClient from '../../utils/dbClient';
import { type Customer, Prisma } from '@prisma/client';
import moment from 'moment';
import sendEmail from '../../utils/brevo';
import config from 'config';
import type { Order } from '../../../types';

async function updateCustomer(customer: Prisma.CustomerCreateInput | Prisma.CustomerUpdateInput) {
  try {
    return dbClient.customer.upsert({
      where: { stripeCustomerId: (customer as Prisma.CustomerCreateInput).stripeCustomerId },
      update: customer,
      create: customer as Prisma.CustomerCreateInput,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      logger.error({ error: err, customer }, 'Unique constraint failed. Handling gracefully.');
      return;
    }
    logger.error({ error: err, customer }, 'Error cresting/updating customer');
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const { secretKey, webhookSecret } = useRuntimeConfig().stripe;

  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });

  let eventData: Stripe.Event;

  try {
    const rawBody = await readRawBody(event); // Get raw request body
    if (rawBody) {
      const sig = getHeader(event, 'stripe-signature') as string;
      eventData = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Empty request body' });
    }
  } catch (err) {
    logger.error('Stripe Webhook Error:', err);
    throw createError({ statusCode: 400, statusMessage: 'Webhook signature verification failed' });
  }

  logger.info({ type: eventData.type }, 'Stripe Webhook type received');
  logger.debug({ eventData }, 'Stripe Webhook data received');

  let customer: Prisma.CustomerCreateInput;
  const where = { stripeCustomerId: '' };
  let existingCustomer: Customer | null;
  // Handle different webhook events
  switch (eventData.type) {
    case 'checkout.session.completed':
      const unitTypeDesc = eventData.data.object.custom_fields?.find((field) => field?.key === 'unittype')?.dropdown
        ?.value;
      const lodgeName = eventData.data.object.custom_fields?.find(
        (field) => field?.key === 'lodgename' || field?.key === 'chaptername'
      )?.text?.value;
      const lodgeNo = eventData.data.object.custom_fields?.find(
        (field) => field?.key === 'lodgenumber' || field?.key === 'chapternumber'
      )?.numeric?.value;
      if (!unitTypeDesc) {
        logger.warn({ dcustom_fields: eventData.data.object.custom_fields }, 'unittype not found');
      }
      const unitType = config.get<Order[]>('orders')?.find((order) => order.desc === unitTypeDesc)?.code ?? '';
      if (!lodgeName) {
        logger.warn({ dcustom_fields: eventData.data.object.custom_fields }, 'lodgename not found');
      }
      if (!lodgeNo) {
        logger.warn({ dcustom_fields: eventData.data.object.custom_fields }, 'lodgenumber not found');
      }
      customer = {
        stripeCustomerId: eventData.data.object.customer as string,
        email: eventData.data.object.customer_details?.email as string,
        name: eventData.data.object.customer_details?.name as string | null,
        unitType: unitType ?? '',
        lodge: lodgeName ?? '',
        lodgeNo: parseInt(lodgeNo ?? '0'),
        subscribed: true,
        lastEvent: eventData.type,
        instance: null,
        createdAt: new Date(),
      };
      await updateCustomer(customer);
      logger.debug({ customer }, 'Checkout session completed');
      sendEmail('checkoutSessionCompleted', 'Checkout session completed', { customer });
      break;

    case 'customer.created':
      logger.debug('Customer created');
      break;

    case 'customer.updated':
      logger.debug('Customer updated');
      break;

    case 'customer.deleted':
      logger.debug('Customer deleted');
      break;

    case 'invoice.paid':
      where.stripeCustomerId = eventData.data.object.customer as string;
      existingCustomer = await dbClient.customer.findUnique({
        where,
      });
      if (existingCustomer === null) {
        logger.error(where, 'Customer not found');
        return { success: false };
      }
      const amountPaid = eventData.data.object.total;
      customer = {
        ...existingCustomer,
        unitPrice: amountPaid,
        trial: false,
      };
      await updateCustomer(customer);
      logger.debug({ customer }, 'Invoice paid');
      sendEmail('invoicePaid', 'Invoice Paid', { customer });
      break;

    case 'customer.subscription.created':
      where.stripeCustomerId = eventData.data.object.customer as string;
      existingCustomer = await dbClient.customer.findUnique({
        where,
      });
      if (existingCustomer === null) {
        logger.error(where, 'Customer not found');
        return { success: false };
      }
      const trialEnd = new Date((eventData.data.object.trial_end ?? 0) * 1000);
      const trial = moment().isBefore(trialEnd);
      const quantity = eventData.data.object.items?.data[0].quantity;
      const unitPrice = eventData.data.object.items?.data[0].price.unit_amount;
      customer = {
        ...existingCustomer,
        lastEvent: eventData.type,
        trialEnd,
        trial,
        quantity,
        unitPrice,
      };
      await updateCustomer(customer);
      logger.debug({ customer }, 'Subscription created');
      sendEmail('subscriptionCreated', 'Subscription Created', { customer });
      break;

    case 'customer.subscription.updated':
      logger.debug('Subscription updated');
      break;

    case 'customer.subscription.deleted':
      where.stripeCustomerId = eventData.data.object.customer as string;
      existingCustomer = await dbClient.customer.findUnique({
        where,
      });
      if (existingCustomer === null) {
        logger.error(where, 'Customer not found for subscription cancellation');
        return { success: false };
      }
      customer = {
        ...existingCustomer,
        lastEvent: eventData.type,
        cancelledAt: new Date((eventData.data.object.canceled_at ?? 0) * 1000),
        cancelledReason: eventData.data.object.cancellation_details?.reason ?? '',
        subscribed: false,
      };
      await updateCustomer(customer);
      logger.debug({ customer }, 'Subscription deleted');
      sendEmail('subscriptionCancelled', 'Subscription Cancelled', { customer });
      break;

    default:
      logger.debug(`Unhandled event type: ${eventData.type}`);
  }

  return { success: true };
});
