'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HashtagText from './hashtag-text';
import ImageLightbox from './image-lightbox';
import YouTubePreview from './youtube-preview';
import { isYouTubeLink } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override default components for custom styling
          a: ({ node, ...props }) => {
            const href = props.href || '';

            // Check if this is a YouTube link
            if (isYouTubeLink(href)) {
              // For YouTube links, we need to ensure we don't create invalid HTML
              // by having a div inside a p tag. We'll handle this by using a special
              // component that uses spans instead of divs.
              return (
                <YouTubePreview
                  url={href}
                  title={props.children?.toString() || 'YouTube Video'}
                />
              );
            }

            // Regular link
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            );
          },
          img: ({ node, ...props }) => {
            const src = typeof props.src === 'string' ? props.src : '';
            return (
              <ImageLightbox
                src={src}
                alt={props.alt || 'Image'}
              />
            );
          },
          p: ({ node, children, ...props }) => {
            // Get the text content from children
            // Ensure children is an array before using map
            const childrenArray = Array.isArray(children) ? children : [children];

            // Check if this paragraph contains a YouTube component
            // If so, we need to handle it specially to avoid invalid HTML nesting
            const hasYouTubeComponent = childrenArray.some(child =>
              child && typeof child === 'object' &&
              child.type && child.type.name === 'YouTubePreview'
            );

            if (hasYouTubeComponent) {
              // If there's a YouTube component, render without wrapping in a p tag
              // to avoid invalid HTML nesting
              return <>{children}</>;
            }

            const textContent = childrenArray
              .filter(child => child !== null && child !== undefined) // Filter out null/undefined
              .map(child => {
                if (typeof child === 'string') return child;
                if (child?.props?.children) {
                  return typeof child.props.children === 'string'
                    ? child.props.children
                    : '';
                }
                return '';
              })
              .join('');

            // Check if the paragraph contains hashtags
            if (textContent && textContent.includes('#')) {
              // Use a React Fragment to avoid nesting issues
              return (
                <p {...props} className="my-2">
                  <HashtagText text={textContent} />
                </p>
              );
            }

            // If children is a simple string, render it directly
            if (typeof children === 'string') {
              return <p {...props} className="my-2">{children}</p>;
            }

            // Regular paragraph without hashtags
            return <p {...props} className="my-2">{children}</p>;
          },
          code: ({ node, ...props }: any) => {
            const isInline = props.inline || false;
            return (
              isInline ?
                <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" /> :
                <code {...props} className="block bg-muted p-4 rounded-md overflow-x-auto text-sm" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
