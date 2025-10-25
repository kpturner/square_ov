import dbClient from '../utils/dbClient';
import { H3Event } from 'h3';
import logger from '../utils/logger';

export default defineEventHandler(async (event: H3Event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    const { where }: { where: string } = getQuery(event);
    const customers = await dbClient.customer.findMany({
      where: where ? JSON.parse(where) : {},
      orderBy: {
        instance: 'asc',
      },
    });
    return customers;
  }

  if (method === 'DELETE') {
    const body = await readBody(event);
    if (!body.id) {
      throw createError({ statusCode: 400, statusMessage: 'ID is required' });
    }
    logger.debug({ body }, 'Deleting customer');
    return await dbClient.customer.delete({ where: { id: Number(body.id) } });
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body.id) {
      throw createError({ statusCode: 400, statusMessage: 'ID is required' });
    }
    logger.debug({ body }, 'Updating customer');
    return await dbClient.customer.update({
      where: { id: Number(body.id) },
      data: body,
    });
  }

  if (method === 'POST') {
    const body = await readBody(event);
    logger.debug({ body }, 'Creating new customer');
    return await dbClient.customer.create({ data: body });
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});
