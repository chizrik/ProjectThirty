'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add error handling and fallback
  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  } catch (error) {
    console.error('ThemeProvider error:', error)
    // Return children without theme provider as fallback
    return <>{children}</>
  }
}
