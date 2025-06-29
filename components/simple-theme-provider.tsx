'use client'

import * as React from 'react'

interface SimpleThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
}

export function SimpleThemeProvider({ 
  children, 
  defaultTheme = 'system' 
}: SimpleThemeProviderProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(defaultTheme === 'system' ? 'light' : defaultTheme)

  // Effect to handle system preference
  React.useEffect(() => {
    if (defaultTheme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')

      // Listen for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [defaultTheme])

  // Apply theme class to document
  React.useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <div className={theme}>
      {children}
    </div>
  )
}