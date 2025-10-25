import { PrismaClient } from '@prisma/client';

const { user, pass, host, port, name } = useRuntimeConfig().database;

const databaseUrl = `mysql://${user}:${pass}@${host}:${port}/${name}`;

logger.trace(`Connecting to database: ${databaseUrl}`);

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});

export default prisma;
