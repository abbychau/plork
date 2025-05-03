'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Mailbox, Code, Info, ArrowRight } from 'lucide-react';
import LoginPopover from '@/components/login-popover';
import logo from '@/app/favicon.svg';

export default function Home() {
  // The middleware will redirect authenticated users to /timeline
  // This component will only be shown to non-authenticated users

  // Otherwise, show the landing page
  return (
    <div className="flex flex-col overflow-y-auto w-full">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src={logo.src} alt="Plork" width={40} height={40} className="h-10 w-10" />
            <span className="font-bold text-xl">Plork</span>
          </div>
          <div className="flex items-center">
            <LoginPopover>
              <Button id="login-trigger" size="sm" className="bg-primary hover:bg-primary/90 text-white transition-colors">
                Sign In
              </Button>
            </LoginPopover>
          </div>
        </div>
      </header>

      <section className="py-10 md:py-10 lg:py-20 xl:py-28 relative overflow-hidden h-full professional-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 dark:from-primary/10 dark:via-secondary/10 dark:to-primary/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-20 z-0 animate-subtle-pulse"></div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-12">
            <div className="flex flex-col items-start space-y-6 text-left md:max-w-[50%]">
              <div className="inline-block p-1.5 px-3 bg-primary/10 rounded-full text-sm font-medium text-primary dark:bg-primary/20 mb-2 animate-fade-in">
                Connect with the Fediverse
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70 animate-fade-in-up">
                  Fediverse-ready<br /><span className="text-foreground">social platform</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 text-lg md:text-xl dark:text-gray-400 animate-fade-in-up animation-delay-100">
                  A modern, mailbox-style ActivityPub-compatible social network that seamlessly connects with Mastodon, Pleroma, and the entire Fediverse ecosystem. Take control of your social experience.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up animation-delay-200">
                <Link href="/about">
                  <Button size="lg" className="gap-2">
                    <Info className="h-5 w-5" />
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3-column mailbox-like interface mockup */}
            <div className="relative w-full md:w-1/2 h-[400px] rounded-lg overflow-hidden shadow-2xl animate-fade-in-up animation-delay-300 border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 z-10 m-2">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Mailbox className="h-3 w-3 mr-1" />
                  Mailbox Design
                </Badge>
              </div>
              <div className="flex h-full">
                {/* Left column - Navigation */}
                <div className="w-[20%] border-r bg-muted/30 flex flex-col">
                  <div className="p-3 border-b flex items-center space-x-2">
                    <Image src={logo.src} alt="Plork" width={24} height={24} className="h-6 w-6" />
                    <span className="font-bold text-sm">lork</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-2">
                      <div className="flex items-center space-x-2 p-2 bg-primary/10 rounded-md">
                        <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                        <span className="text-sm font-medium">Timeline</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 mt-1 hover:bg-muted rounded-md">
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/20"></div>
                        <span className="text-sm">Explore</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 mt-1 hover:bg-muted rounded-md">
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/20"></div>
                        <span className="text-sm">Tags</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 mt-1 hover:bg-muted rounded-md">
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/20"></div>
                        <span className="text-sm">My Posts</span>
                      </div>
                    </div>
                    <div className="p-2 mt-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">PINNED USERS</div>
                      <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">N</div>
                        <span className="text-sm">Nico</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">A</div>
                        <span className="text-sm">Abby</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle column - Posts list */}
                <div className="w-[35%] border-r flex flex-col">
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="font-medium">Timeline</div>
                    <Button size="sm" variant="outline" className="rounded-full h-8 px-2">
                      <span className="text-xs">+ New</span>
                    </Button>
                  </div>
                  <div className="p-2 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {/* Post 1 */}
                    <div className="p-3 border-b hover:bg-muted/20 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs">N</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium text-sm">Nico</div>
                            <div className="text-xs text-muted-foreground">2h</div>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                            Markdown is a lightweight markup language with plain-text formatting syntax...
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Post 2 - Selected */}
                    <div className="p-3 border-b bg-primary/5 border-l-2 border-l-primary">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs">A</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium text-sm">Abby</div>
                            <div className="text-xs text-muted-foreground">3h</div>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                            Check out this project on GitHub! #fediverse #activitypub
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Post 3 */}
                    <div className="p-3 border-b hover:bg-muted/20 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs">A</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium text-sm">Abby</div>
                            <div className="text-xs text-muted-foreground">17h</div>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                            Just testing out Plork, a new Fediverse platform!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Post detail */}
                <div className="w-[45%] flex flex-col">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">A</div>
                        <div>
                          <div className="font-medium text-sm">Abby</div>
                          <div className="text-xs text-muted-foreground">@abby@plork.social</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">3 hours ago</div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-sm mb-4">
                      Check out this amazing ActivityPub-compatible social network I've been working on! It connects with the entire <span className="text-primary">#Fediverse</span> ecosystem including Mastodon, Pleroma, and other platforms.
                    </div>
                    <div className="text-sm mb-4">
                      You can follow users across different instances and interact with content from the whole Fediverse network. <span className="text-primary">#ActivityPub</span> <span className="text-primary">#OpenProtocols</span>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/10 mb-4">
                      <div className="text-xs font-medium mb-1">Connected to the Fediverse</div>
                      <div className="text-xs text-muted-foreground">Interact with users on Mastodon, Pleroma, and other platforms</div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                      <div className="flex items-center space-x-4">
                        <span>♥ 12</span>
                        <span>💬 3</span>
                        <span>↗ 5</span>
                      </div>
                      <div>
                        <span className="text-primary text-xs">View on Fediverse</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
                      {/* Feature highlights */}
                      <div className="w-full mt-16 animate-fade-in-up animation-delay-400">
              <h2 className="text-2xl font-semibold mb-6 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-background/70 backdrop-blur-sm border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Mailbox className="h-5 w-5 text-primary" />
                      </div>
                      Mailbox Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      A clean, organized three-column layout inspired by email clients for intuitive navigation and content management.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur-sm border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      Open API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Build integrations and automate your social experience with our comprehensive API and key management system.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background/70 backdrop-blur-sm border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      ActivityPub
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Connect with users across the decentralized social web including Mastodon, Pleroma, and the entire Fediverse.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
        </div>
      </section>

    </div>
  );
}
