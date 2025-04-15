'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HashtagText from './hashtag-text';

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
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            />
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="rounded-md max-w-full h-auto my-4"
              loading="lazy"
            />
          ),
          p: ({ node, children, ...props }) => {
            // Get the text content from children
            // Ensure children is an array before using map
            const childrenArray = Array.isArray(children) ? children : [children];

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
          code: ({ node, inline, ...props }) => (
            inline ?
              <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" /> :
              <code {...props} className="block bg-muted p-4 rounded-md overflow-x-auto text-sm" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
