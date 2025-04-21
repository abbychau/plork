'use client';

import TagCloud from '@/components/tag-cloud';

interface TagsPageContentProps {
  selectedTag?: string;
}

export default function TagsPageContent({ selectedTag }: TagsPageContentProps) {
  if (selectedTag) {
    return null; // Don't show anything when a tag is selected
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Discover Topics</h2>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Trending Now</h3>
          <TagCloud maxTags={30} showTitle={false} className="bg-transparent p-0" />
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Click on any tag to see related posts</p>
        </div>
      </div>
    </div>
  );
}
