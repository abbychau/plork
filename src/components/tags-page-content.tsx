'use client';

import TagCloud from '@/components/tag-cloud';
import { useCompactMode } from '@/hooks/use-compact-mode';

interface TagsPageContentProps {
  selectedTag?: string;
}

export default function TagsPageContent({ selectedTag }: TagsPageContentProps) {
  const isCompact = useCompactMode();

  if (selectedTag) {
    return null; // Don't show anything when a tag is selected
  }

  return (
    <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-4 px-2' : 'py-8 px-4'}`}>
      <div className="max-w-2xl w-full">
        <h2 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold mb-4 text-center`}>Discover Topics</h2>

        <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Trending Now</h3>
          <TagCloud
            maxTags={isCompact ? 20 : 30}
            showTitle={false}
            className="bg-transparent p-0"
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Click on any tag to see related posts</p>
        </div>
      </div>
    </div>
  );
}
