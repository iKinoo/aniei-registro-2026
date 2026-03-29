'use server';
import { getAuthService } from '@/infrastructure/config/container';
import { redirect } from 'next/navigation';

export async function handleLogout() {
  const authService = getAuthService();
  await authService.signOut();
  redirect('/cpanel/login');
}
