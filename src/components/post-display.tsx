'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { formatDistanceToNow } from '@/lib/utils';
import { Loader2, ExternalLink } from 'lucide-react';

export default function PostDisplay() {
  const { user } = useAuth();
  const { selectedPost, isLoading, error, fetchPost } = usePost();
  const { addPinnedUser } = usePinnedUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Check if the current user has liked the post
  const checkIfLiked = () => {
    if (!user || !selectedPost?.likes) return false;
    return selectedPost.likes.some(like => like.userId === user.id);
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!selectedPost || !user) return;

    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await fetch(`/api/posts/${selectedPost.id}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} post`);
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : selectedPost ? (
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4 overflow-x-hidden">
            <div className="flex items-start gap-4 mb-4">
              <UserProfilePopover
                username={selectedPost.author.username}
                onPin={() => addPinnedUser({
                  id: selectedPost.author.id,
                  username: selectedPost.author.username,
                  displayName: selectedPost.author.displayName,
                  profileImage: selectedPost.author.profileImage
                })}
              >
                <div className="cursor-pointer">
                  <Avatar>
                    <AvatarImage src={selectedPost.author.profileImage} alt={selectedPost.author.username} />
                    <AvatarFallback>
                      {selectedPost.author.displayName?.[0] || selectedPost.author.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </UserProfilePopover>

              <div className="flex-1">
                <div className="flex flex-col">
                  <UserProfilePopover
                    username={selectedPost.author.username}
                    onPin={() => addPinnedUser({
                      id: selectedPost.author.id,
                      username: selectedPost.author.username,
                      displayName: selectedPost.author.displayName,
                      profileImage: selectedPost.author.profileImage
                    })}
                  >
                    <div className="font-semibold cursor-pointer hover:underline">
                      {selectedPost.author.displayName || selectedPost.author.username}
                    </div>
                  </UserProfilePopover>
                  <span className="text-xs text-muted-foreground">
                    @{selectedPost.author.username}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(selectedPost.createdAt))}
                </div>
              </div>
            </div>

            {isEditing ? (
              <EnhancedPostEditor
                mode="edit"
                initialContent={selectedPost.content}
                onEditSubmit={handleEditSubmit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="mb-4">
                <MarkdownContent content={selectedPost.content} />
              </div>
            )}

            <Separator className="my-4" />

            <CommentSection
              postId={selectedPost.id}
              initialComments={selectedPost.comments || []}
              compact={true}
            />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
          <p className="mb-2">No post selected</p>
        </div>
      )}
    </div>
  );
}
