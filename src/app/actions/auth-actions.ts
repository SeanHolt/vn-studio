'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { signIn, signOut } from '@/auth';

export interface AuthActionResult {
  error?: string;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || 'Creator';

  if (!cleanEmail || password.length < 6) {
    return { error: 'Please provide a valid email and a password of at least 6 characters.' };
  }

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      planTier: 'FREE',
      maxProjects: 3,
    },
  });

  try {
    await signIn('credentials', {
      email: cleanEmail,
      password,
      redirectTo: '/dashboard',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Account created, but automatic sign-in failed. Please log in.' };
    }
    throw err;
  }

  return {};
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    await signIn('credentials', {
      email: cleanEmail,
      password,
      redirectTo: '/dashboard',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Invalid email or password.' };
    }
    throw err;
  }

  return {};
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
