import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Inbox, Code, Globe, Mail, MessageSquare, Users, Key, Mailbox, Home, ArrowLeft } from 'lucide-react';
import logo from '@/app/favicon.svg';

export default function AboutPage() {
  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-4">
          <div className="md:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              <Image src={logo.src} alt="Plork Logo" width={48} height={48} className="dark:invert" />
              <h1 className="text-4xl font-bold">Plork</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">A modern social platform with a classic feel</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Plork combines the familiar mailbox-style interface with powerful open standards to create a seamless social experience that connects with the wider Fediverse.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <Tabs defaultValue="mailbox" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mailbox" className="gap-2">
              <Mailbox className="h-4 w-4" />
              Mailbox Design
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Code className="h-4 w-4" />
              Open API
            </TabsTrigger>
            <TabsTrigger value="activitypub" className="gap-2">
              <Globe className="h-4 w-4" />
              ActivityPub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mailbox" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Familiar Mailbox Interface</CardTitle>
                <CardDescription>
                  A clean, organized layout inspired by email clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Three-Column Layout</h3>
                    <p className="text-muted-foreground mb-4">
                      Plork features a three-column layout that makes navigation intuitive and content easily accessible:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">1</div>
                        <div>
                          <span className="font-medium">Navigation & Pinned Users</span>
                          <p className="text-sm text-muted-foreground">Quick access to your favorite sections and people</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">2</div>
                        <div>
                          <span className="font-medium">Content Feed</span>
                          <p className="text-sm text-muted-foreground">Browse posts with infinite scrolling</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">3</div>
                        <div>
                          <span className="font-medium">Detail View</span>
                          <p className="text-sm text-muted-foreground">See full posts and conversations</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Designed for Productivity</h3>
                    <p className="text-muted-foreground mb-4">
                      Our mailbox-inspired interface helps you stay focused and organized:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-primary" />
                        <span>Fixed headers with scrollable content</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Pin up to 5 users for quick access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>Unread counts for new content</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Notification system for interactions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Powerful Open API</CardTitle>
                <CardDescription>
                  Build integrations and automate your social experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">API Key Management</h3>
                    <p className="text-muted-foreground mb-4">
                      Create and manage API keys to authenticate your applications and scripts:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span>Generate personal API keys</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span>Set expiration dates for security</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span>Revoke keys when no longer needed</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Comprehensive Endpoints</h3>
                    <p className="text-muted-foreground mb-4">
                      Access all Plork features programmatically through our REST API:
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                      <div><span className="text-blue-600 dark:text-blue-400">GET</span> /api/posts</div>
                      <div><span className="text-green-600 dark:text-green-400">POST</span> /api/posts</div>
                      <div><span className="text-blue-600 dark:text-blue-400">GET</span> /api/users/{'{username}'}</div>
                      <div><span className="text-green-600 dark:text-green-400">POST</span> /api/comments</div>
                      <div><span className="text-red-600 dark:text-red-400">DELETE</span> /api/posts/{'{postId}'}/like</div>
                    </div>
                    <div className="mt-4">
                      <Link href="/api-docs">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Code className="h-4 w-4" />
                          View Full API Documentation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activitypub" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fediverse Compatible</CardTitle>
                <CardDescription>
                  Connect with users across the decentralized social web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">What is ActivityPub?</h3>
                    <p className="text-muted-foreground mb-4">
                      ActivityPub is an open, decentralized social networking protocol that powers the Fediverse - a network of interconnected servers that can communicate with each other.
                    </p>
                    <p className="text-muted-foreground">
                      With Plork's ActivityPub support, you can follow and interact with users on other platforms like Mastodon, Pleroma, and more - all from your Plork account. It's like being able to follow Instagram users from your Twitter account!
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Fediverse Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Follow users on other Fediverse platforms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>Comment on posts across the Fediverse</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Build a following across multiple platforms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Discover content from the entire Fediverse</span>
                      </li>
                    </ul>
                    <div className="mt-6 flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <span className="bg-green-500 rounded-full w-2 h-2"></span>
                        Mastodon
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                        Pleroma
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <span className="bg-purple-500 rounded-full w-2 h-2"></span>
                        Pixelfed
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <span className="bg-orange-500 rounded-full w-2 h-2"></span>
                        PeerTube
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Philosophy Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  Transparent Logic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clear, understandable systems that work the way you expect them to, with no hidden algorithms or confusing interfaces.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mailbox className="h-5 w-5 text-primary" />
                  </div>
                  Mailbox Like
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A familiar three-column layout inspired by email clients, making social networking feel intuitive and organized.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A powerful, open API that enables developers to build integrations and automate their social experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </ScrollArea>
  );
}
