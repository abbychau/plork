'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <p className="text-muted-foreground">Redirecting to sign in page...</p>
    </div>
  );
}
