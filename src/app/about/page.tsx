import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Inbox, Code, Globe, Mail, MessageSquare, Users, Key, Mailbox, Home, ArrowLeft } from 'lucide-react';
import logo from '@/app/favicon.svg';
import { SimpleThemeToggle } from '@/components/simple-theme-toggle';

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
          <SimpleThemeToggle className='absolute right-4 top-4' />
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
              Plork combines the familiarity of email with the power of modern social networking. Our mailbox-inspired design makes it easy to connect, share, and discover content in a clean, organized way.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <Tabs defaultValue="story" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">

            <TabsTrigger value="story" className="gap-2">
              <Home className="h-4 w-4" />
              Story
            </TabsTrigger>
              

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

          <TabsContent value="story" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>The Story</CardTitle>
                <CardDescription>
                  How Plork was born from the need for a better social platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2"></h3>
                    <p className="text-muted-foreground mb-4 font-serif">
I had been working on social platforms for some years. The reason why nearly all of them created a suggested feed is not only they want to make money and keep you on the platform by providing some juicy content, but also, it is nearly algorithmically impossible to show you all the content that is posted by people you follow. 
              <br />
              <br />
              For example, if you follow 100 people and each of them posts 10 times a day. Then when ever you request the API for your feed for 10 posts, the server has to fetch through all these 100 people's posts and then sort them by time, likes, comments, etc. This is not only a lot of work for the server, but also it is not possible to show you all the posts in a single request. 
              <br /><br />
              This method is called the "pull scheme". The time complexity of this is O(n*m) , where n is the number of people you follow and m is the number of posts needed.
              <br /><br />
              So here comes the "push scheme", it is much faster and being adopted by many social platforms like mastodon and Twitter(X). The idea is to push the posts to the people who follow you, so when you create a post, it is sent to all your followers immediately. This way, when you request your feed, you already have all the posts that are posted by people you follow. 
              <br /><br />
              However, you can see that publishing a post is much more expensive, and "Follow" is also expensive because the backend has to rearrange the existing timeline to include the new follower's posts. What will happen if someone needs to follow and unfollow just because he misclicked a button?
              <br /><br />
              Suggested feeds are a way to solve this problem, because the feed is no longer determined. It can have a pool of posts to push to you based on your interests(which is deduced by a graph algorithm). Now not only the server can care less about if 100% of the posts from your friends are shown, but also it can make money by showing you ads and sponsored posts.

              <br /><br />
              And I started to think of "newsgroups". For those who don't know, newsgroups are a way to share information and discuss topics in a decentralized manner. They were popular before the rise of social media platforms. Newsgroups are distributed by email, and you essentially subscribe and be liable for the storage and the cpu to sort the posts. Which is to me, a perfect stance for a social platform.
              <br /><br />

              However, newsgroups are not very user-friendly because there is a huge waste of space because the space complexity of the overall system is O(n*m) as well. So I thought, it would be great if we can have a social platform that is like a mailbox.

              <br /><br />

              How can we make this platform financially sustainable if we cannot pollute and rearrange your timeline? Simple, we can still put ads in the post list for free users. and also, we can charge you according to your inbox size for power users. Just like all the email providers do. 

              <br /><br />
              So the story of Plork is born.
              

                    </p>
                  </div>
                </div>
                </CardContent>
                </Card>
          </TabsContent>

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
