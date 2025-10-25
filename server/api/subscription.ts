import dbClient from '../utils/dbClient';
import { H3Event } from 'h3';
import logger from '../utils/logger';
import moment from 'moment';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);

  const { eventsPort, instance, unitType } = body;

  if (typeof eventsPort !== 'number' || typeof instance !== 'string' || typeof unitType !== 'string') {
    const err = 'eventsPort and/or instance and/or unitType are not the correct type';
    logger.error({ instance }, err);
    throw createError({ statusCode: 400, statusMessage: err });
  }

  // The only link between a subscription and a SquareEvents instances is the port number, since
  // each instance is set up to listen on a port number that matche the lodge/chapter number.
  // However, first see if we can already match the instance (it starts off blank in the database).

  let customers = await dbClient.customer.findMany({ where: { instance } });
  // We should find one or none or we are in trouble
  if (customers.length > 1) {
    const err = 'Multiple customers found for instance';
    logger.error({ instance }, err);
    throw createError({ statusCode: 400, statusMessage: err });
  }

  // If we have none then we need to find the customer by port number
  if (customers.length === 0) {
    customers = await dbClient.customer.findMany({ where: { lodgeNo: eventsPort, unitType } });
    if (customers.length === 0) {
      const warn = 'No customer found unit type with a lodge number matching events port';
      logger.warn({ unitType, eventsPort }, warn);
      return { subscribed: false };
    }
    logger.debug({ eventsPort }, `Found customer for lodge/chapter number`);
    const trial = moment().isBefore(customers[0].trialEnd);
    // Update the customer with the instance
    await dbClient.customer.update({
      where: { stripeCustomerId: customers[0].stripeCustomerId },
      data: { instance, trial },
    });
    logger.debug({ instance, lodgeNo: eventsPort, unitType, trial }, 'Updated customer with instance');
  } else {
    logger.debug({ instance }, 'Found customer for instance');
  }

  // Should now be able to return the subscription status
  const subscribed = customers[0].subscribed ?? false;

  return { subscribed };
});
