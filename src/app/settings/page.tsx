'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  // Redirect to home page
  useEffect(() => {
    router.push('/');
  }, [router]);

  // Return null as we're redirecting
  return null;
}
