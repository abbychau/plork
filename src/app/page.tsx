'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Timeline from '@/components/timeline';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user } = useAuth();

  // If user is logged in, show the timeline
  if (user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Timeline />
      </div>
    );
  }

  // Otherwise, show the landing page
  return (
    <div className="flex flex-col gap-8">
      <section className="py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 z-0"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10 z-0"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="inline-block p-1.5 px-3 bg-primary/10 rounded-full text-sm font-medium text-primary dark:bg-primary/20 mb-4 animate-fade-in">
              Connect with the Fediverse
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70 animate-fade-in-up">
                Welcome to Plork
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 animate-fade-in-up animation-delay-100">
                A minimal ActivityPub-compatible social network that connects with the Fediverse.
              </p>
            </div>
            <div className="space-x-4 pt-4 animate-fade-in-up animation-delay-200">
              <Link href="/register">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all duration-200">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/30 dark:to-muted/10 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70">Features</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover what makes Plork a great ActivityPub social network.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <Card className="border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors duration-300">ActivityPub Compatible</CardTitle>
                <CardDescription>
                  Connect with users on Mastodon, Pleroma, and other Fediverse platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Follow and interact with users across the Fediverse using the ActivityPub protocol.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors duration-300">Simple Interface</CardTitle>
                <CardDescription>
                  Clean and intuitive user interface for a great social experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Focus on content with a distraction-free, minimalist design that puts your posts first.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors duration-300">Self-Hosted</CardTitle>
                <CardDescription>
                  Run your own instance with complete control over your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Take ownership of your social presence with a platform you can host yourself.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
