'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system' | 'monokaipro' | 'monokaipro-light' | 'monokaipro-dark';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'plork-theme',
  ...props
}: ThemeProviderProps) {
  // Initialize with defaultTheme to prevent hydration mismatch
  // The actual saved theme will be loaded in useEffect
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(defaultTheme);
    }
    
    setIsInitialized(true);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    // Only apply theme changes after initialization to prevent hydration mismatch
    if (!isInitialized) return;
    
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'monokaipro');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    // For monokaipro themes
    if (theme === 'monokaipro') {
      root.classList.add('monokaipro');

      // Also add dark class if system prefers dark mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
      return;
    }

    if (theme === 'monokaipro-light') {
      root.classList.add('monokaipro');
      return;
    }

    if (theme === 'monokaipro-dark') {
      root.classList.add('monokaipro');
      root.classList.add('dark');
      return;
    }

    root.classList.add(theme);
  }, [theme, isInitialized]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
