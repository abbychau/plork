'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleLoginButton from '@/components/google-login-button';
import GithubLoginButton from '@/components/github-login-button';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Wait for login to complete and get the user data
      const result = await login(usernameOrEmail, password);

      // If login was successful and we have a user, redirect to home page
      if (result && result.user) {
        router.push('/');
      }
    } catch {
      setError('Invalid username/email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in with your social account to access Plork
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground mb-2">
              Choose a sign in method:
            </p>
            <GoogleLoginButton />
            <GithubLoginButton />
            <p className="text-xs text-center text-muted-foreground mt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              If you don't have an account, one will be created for you.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need help? <Link href="/about" className="text-primary hover:underline">Learn more</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
