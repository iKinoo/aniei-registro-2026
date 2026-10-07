'use server';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getAuthService } from '@/infrastructure/config/container';
import { redirect } from 'next/navigation';

export async function handleLogout() {
  await requireAdmin();
  const authService = getAuthService();
  await authService.signOut();
  redirect('/');
}
