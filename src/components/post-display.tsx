'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import { usePost } from '@/lib/post-context';
import UserProfilePopover from '@/components/user-profile-popover';
import MarkdownContent from '@/components/markdown-content';
import CommentSection from '@/components/comment-section';
import EnhancedPostEditor from '@/components/enhanced-post-editor';
import PostInteractionButtons from '@/components/post-interaction-buttons';
import PostTags from '@/components/post-tags';
import { formatDistanceToNow } from '@/lib/utils';
import { Loader2, ExternalLink } from 'lucide-react';
import type { CustomEmoji } from '@/components/custom-emoji-picker'; // Import the type

export default function PostDisplay() {
  const { user } = useAuth();
  const router = useRouter();
  const { selectedPost, isLoading, error, fetchPost, setSelectedPost, setSelectedPostId } = usePost();
  const { addPinnedUser } = usePinnedUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userEmojis, setUserEmojis] = useState<CustomEmoji[]>([]); // State for user emojis
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false); // Loading state for emojis

  // Fetch user emojis when user is available
  useEffect(() => {
    const fetchUserEmojis = async () => {
      if (!user) {
        setUserEmojis([]); // Clear emojis if no user
        return;
      }
      setIsLoadingEmojis(true);
      try {
        const response = await fetch('/api/emojis/collection');
        if (!response.ok) {
          throw new Error('Failed to fetch user emojis');
        }
        const data: CustomEmoji[] = await response.json();
        setUserEmojis(data);
      } catch (err) {
        console.error('Error fetching user emojis:', err);
        // Optionally show a toast or error message
      } finally {
        setIsLoadingEmojis(false);
      }
    };

    fetchUserEmojis();
  }, [user]); // Re-fetch if user changes

  // Check if the current user has liked the post
  const checkIfLiked = () => {
    if (!user || !selectedPost?.likes) return false;
    return selectedPost.likes.some(like => like.userId === user.id);
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!selectedPost || !user) return;

    try {
      // Use the correct API endpoint for likes
      const response = await fetch(`/api/posts/${selectedPost.id}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? 'unlike' : 'like'} post`);
      }

      setIsLiked(!isLiked);

      // Refresh the post to get updated likes
      fetchPost(selectedPost.id);
    } catch (error) {
      console.error(`Error ${isLiked ? 'unliking' : 'liking'} post:`, error);
    }
  };

  // Handle edit post
  const handleEditPost = () => {
    setIsEditing(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (content: string) => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      // Refresh the post
      fetchPost(selectedPost.id);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!selectedPost || !user || user.id !== selectedPost.author.id) return;

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        // Store the post ID before clearing it
        const deletedPostId = selectedPost.id;

        // Clear the selected post to show default view
        setSelectedPost(null);
        setSelectedPostId(null);

        // Trigger a refresh of the post list with deletion information
        if (typeof window !== 'undefined') {
          console.log('Dispatching refreshPostList event for deleted post:', deletedPostId);
          window.dispatchEvent(new CustomEvent('refreshPostList', {
            detail: {
              deletedPostId: deletedPostId,
              source: 'post-display-delete'
            }
          }));
        }
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Update isLiked when selectedPost changes
  useState(() => {
    setIsLiked(checkIfLiked());
  });

  // Also update isLiked when selectedPost or user changes
  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [selectedPost, user]);

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-background">
        {selectedPost ? (
          <>
            <div className="flex items-center p-2 h-[52px]">
              <div className="w-full flex items-center gap-2">
                <PostInteractionButtons
                  postId={selectedPost.id}
                  authorId={selectedPost.author.id}
                  isLiked={isLiked}
                  likesCount={selectedPost.likes?.length || 0}
                  commentsCount={selectedPost.comments?.length || 0}
                  onLike={handleLike}
                  onEdit={user && user.id === selectedPost.author.id && !isEditing ? handleEditPost : undefined}
                  hideViewFullPost={false}
                  onComment={() => {
                    // Scroll to comments section
                    const commentsSection = document.getElementById('comments');
                    if (commentsSection) {
                      commentsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  onDelete={user && user.id === selectedPost.author.id ? handleDeletePost : undefined}
                />
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Link
                  href={`/posts/${selectedPost.id}`}
                  className="text-muted-foreground hover:text-primary ml-auto"
                  target="_blank"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Open in new tab">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open in new tab</span>
                  </Button>
                </Link>
              </div>
            </div>
            <Separator />
          </>
        ) : (
          <>
            <div className="flex items-center p-2 h-[52px]"></div>
            <Separator />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-5" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : selectedPost ? (
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4 overflow-x-hidden">
            <div className="flex items-start gap-4 mb-4">


              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <UserProfilePopover
                    username={selectedPost.author.username}
                    onPin={() => addPinnedUser({
                      id: selectedPost.author.id,
                      username: selectedPost.author.username,
                      displayName: selectedPost.author.displayName,
                      profileImage: selectedPost.author.profileImage
                    })}
                  >
                    <div className="cursor-pointer flex items-center gap-2">
                      <Avatar className="h-12 w-12 mt-1.5 mr-2 flex-shrink-0">
                        <AvatarImage src={selectedPost.author.profileImage} alt={selectedPost.author.username} />
                        <AvatarFallback>
                          {selectedPost.author.displayName?.[0] || selectedPost.author.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <strong>
                          {selectedPost.author.displayName || selectedPost.author.username}
                        </strong>

                      </div>
                    </div>
                  </UserProfilePopover>
                        <span className="text-xs text-muted-foreground">
                          @{selectedPost.author.username}
                          <span className="text-muted-foreground text-xs ml-1 mr-1">·</span>
                          {formatDistanceToNow(new Date(selectedPost.createdAt))}
                        </span>
                </div>


                <div className="flex items-center gap-2 mx-1">
                {isEditing ? (
                  <EnhancedPostEditor
                    mode="edit"
                    initialContent={selectedPost.content}
                    isLoading={isLoading} // Use the actual loading state
                    onEditSubmit={handleEditSubmit}
                    onCancel={handleCancelEdit}
                    placeholder="Edit your post..."
                    compact // Keep compact if needed
                  />
                ) : (
                  <MarkdownContent content={selectedPost.content} userEmojis={userEmojis} />
                )}

                <PostTags hashtags={selectedPost.hashtags} className="mt-3" />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Comments Section */}
            <div id="comments">
              <CommentSection postId={selectedPost.id} initialComments={selectedPost.comments || []} userEmojis={userEmojis} />
            </div>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className='mt-5'>Select a post to view its details.</p>
        </div>
      )}
    </div>
  );
}
