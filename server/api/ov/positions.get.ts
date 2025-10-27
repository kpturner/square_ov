import { Position } from '@prisma/client';

export default defineEventHandler(() => {
  return Object.values(Position);
});
