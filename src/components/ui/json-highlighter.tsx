"use client";

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface JsonHighlighterProps {
  code: string;
  className?: string;
}

export function JsonHighlighter({ code, className = '' }: JsonHighlighterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Try to parse and format the JSON if it's valid
  let formattedCode = code;
  try {
    if (typeof code === 'string' && code.trim()) {
      const parsed = JSON.parse(code);
      formattedCode = JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // If parsing fails, use the original code
    console.log('JSON parsing failed, using original string');
  }

  return (
    <div className={`rounded-md overflow-hidden ${className}`}>
      <SyntaxHighlighter
        language="json"
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          borderRadius: '0.375rem',
        }}
      >
        {formattedCode}
      </SyntaxHighlighter>
    </div>
  );
}
