'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Toaster } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [userName, setUserName] = useState<string>('')
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          setUserName(profile.name)
        }
      }
    }

    fetchUserProfile()
  }, [])

  // Don't show navigation for auth pages
  if (pathname?.startsWith('/auth/')) {
    return (
      <>
        <Toaster />
        {children}
      </>
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/dashboard" className="text-xl font-bold">
                    ProjectThirty
                  </Link>
                </div>
                
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === '/dashboard'
                        ? 'border-b-2 border-indigo-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/analytics"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === '/analytics'
                        ? 'border-b-2 border-indigo-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Analytics
                  </Link>
                  
                  <Link
                    href="/generate"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === '/generate'
                        ? 'border-b-2 border-indigo-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Generate Challenge
                  </Link>
                  
                  <Link
                    href="/progress"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === '/progress'
                        ? 'border-b-2 border-indigo-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Progress
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await supabase.auth.signOut()
                      window.location.href = '/auth/signin'
                    }}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}