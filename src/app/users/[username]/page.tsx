'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import MarkdownContent from '@/components/markdown-content';

// Import Mynaui icons
import {
  Heart,
  HeartSolid,
  MessageDots,
  Share
} from '@mynaui/icons-react';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    displayName?: string;
    profileImage?: string;
  };
  likes: any[];
  comments?: any[];
}

interface User {
  id: string;
  username: string;
  displayName?: string;
  summary?: string;
  profileImage?: string;
  actorUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const username = params.username as string;

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetch(`/api/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await userResponse.json();

      // Fetch user's posts
      const postsResponse = await fetch(`/api/posts?username=${username}`);
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts');
      }
      const postsData = await postsResponse.json();

      // Fetch follow status if user is logged in
      let followStatus = false;
      if (currentUser) {
        try {
          const followResponse = await fetch(`/api/users/${username}/follow-status`);
          if (followResponse.ok) {
            const followData = await followResponse.json();
            followStatus = followData.isFollowing;
          }
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }
      }

      // Set the data
      setUser({
        ...userData,
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
      });
      setPosts(postsData || []);
      setIsFollowing(followStatus);

      // Update liked posts
      if (currentUser) {
        const newLikedPosts = new Set<string>();
        postsData.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: any) => like.userId === currentUser.id)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      }
    } catch (err) {
      // If API fails, use sample data for demonstration
      console.error('Error fetching data, using sample data:', err);

      // Sample user data
      setUser({
        id: '1',
        username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        summary: 'This is a sample user profile for the ActivityPub SNS.',
        profileImage: undefined,
        actorUrl: `http://localhost:8080/users/${username}`,
        followersCount: 0,
        followingCount: 0,
      });

      // Sample posts data
      setPosts([]);
      setIsFollowing(false);
      setError('Failed to load user profile data from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      console.log('Follow button clicked, current state:', isFollowing);

      if (isFollowing) {
        // Unfollow - use DELETE with query parameter
        console.log('Attempting to unfollow user:', username);
        const response = await fetch(`/api/follow?username=${encodeURIComponent(username)}`, {
          method: 'DELETE',
        });

        const responseText = await response.text();
        console.log('Unfollow response:', response.status, responseText);

        try {
          const data = JSON.parse(responseText);
          if (response.ok) {
            console.log('Successfully unfollowed user');
            setIsFollowing(false);
            // Refresh user data to update follower count
            fetchUserProfile();
          } else {
            console.error('Unfollow error:', data.error);
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      } else {
        // Follow - use POST with JSON body
        console.log('Attempting to follow user:', username);
        const response = await fetch('/api/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        const responseText = await response.text();
        console.log('Follow response:', response.status, responseText);

        try {
          const data = JSON.parse(responseText);
          if (response.ok) {
            console.log('Successfully followed user');
            setIsFollowing(true);
            // Refresh user data to update follower count
            fetchUserProfile();
          } else {
            console.error('Follow error:', data.error);
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const isLiked = likedPosts.has(postId);
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(`/api/likes?postId=${postId}`, {
        method,
      });

      if (response.ok) {
        // Update local state
        const newLikedPosts = new Set(likedPosts);
        if (isLiked) {
          newLikedPosts.delete(postId);
        } else {
          newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);

        // Update post likes count
        setPosts(posts.map(post => {
          if (post.id === postId) {
            // Update likes array based on action
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((like: any) => like.userId !== currentUser.id)
                : [...post.likes, { userId: currentUser.id }]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleShare = (postId: string) => {
    // For now, just copy the URL to clipboard
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Post URL copied to clipboard!'))
      .catch(err => console.error('Failed to copy URL:', err));
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading profile...</div>;
  }

  if (error || !user) {
    return <div className="flex justify-center py-12 text-red-500">{error || 'User not found'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback className="text-2xl">
              {user.displayName?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>

            {user.summary && (
              <p className="mt-4">{user.summary}</p>
            )}

            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <div>
                <span className="font-bold">{user.postsCount || posts.length}</span>{' '}
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div>
                <span className="font-bold">{user.followersCount || 0}</span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div>
                <span className="font-bold">{user.followingCount || 0}</span>{' '}
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>

          <div>
            {currentUser && currentUser.username !== user.username && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Posts</h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.profileImage} alt={post.author.username} />
                    <AvatarFallback>
                      {post.author.displayName?.[0] || post.author.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author.displayName || post.author.username}</span>
                      <span className="text-muted-foreground">@{post.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2">
                      <MarkdownContent content={post.content} />
                      <Link
                        href={`/posts/${post.id}`}
                        className="block mt-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        View full post
                      </Link>
                    </div>

                    {/* Hashtags are now rendered directly in the MarkdownContent component */}

                    <div className="flex gap-4 mt-4 text-sm">
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200"
                      >
                        <MessageDots className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </Link>
                      <button
                        className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share className="w-4 h-4" />
                        <span>{0}</span>
                      </button>
                      <button
                        className={`flex items-center gap-1 transition-colors duration-200 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                        onClick={() => handleLike(post.id)}
                      >
                        {likedPosts.has(post.id) ?
                          <HeartSolid className="w-4 h-4" /> :
                          <Heart className="w-4 h-4" />
                        }
                        <span>{post.likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
