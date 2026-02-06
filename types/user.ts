import type { User } from '@prisma/client';
export type AuthUser = Omit<
  User,
  'passwordHash' | 'passwordResetToken' | 'passwordResetExpires' | 'createdAt' | 'updatedAt'
>;

export type ImpersonateResponse = { success: boolean; authUser: AuthUser };
