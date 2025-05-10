'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import GoogleLoginButton from '@/components/google-login-button';
import GithubLoginButton from '@/components/github-login-button';

interface LoginPopoverProps {
  children: React.ReactNode;
  className?: string;
}

export default function LoginPopover({ children, className }: LoginPopoverProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Wait for login to complete and get the user data
      const result = await login(usernameOrEmail, password);

      // If login was successful and we have a user, close the popover and redirect to timeline
      if (result && result.user) {
        setOpen(false);
        router.push('/timeline');
      }
    } catch (err) {
      setError('Invalid username/email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Sign in with your social account to access Plork
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground mb-2">
                Choose a sign in method:
              </p>
              <GoogleLoginButton onSuccess={() => {
                setOpen(false);
                router.push('/timeline');
              }} />
              <GithubLoginButton onSuccess={() => {
                setOpen(false);
                router.push('/timeline');
              }} />
              <p className="text-xs text-center text-muted-foreground mt-2">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                If you don't have an account, one will be created for you.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              Need help? <Link href="/about" className="text-primary hover:underline">Learn more</Link>
            </p>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
