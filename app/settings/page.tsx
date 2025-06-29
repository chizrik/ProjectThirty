'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Supabase error fetching profile:', error.message)
          throw error
        }
        
        if (!data) {
          console.error('No profile found for user:', user.id)
          throw new Error('Profile not found')
        }
        
        setProfile(data)
      } catch (error: any) {
        console.error('Error in fetchProfile:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const updateSettings = async (key: string, value: any) => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updatedPreferences = {
        ...profile.preferences,
        [key]: value
      }

      const response = await fetch('/api/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          settings: updatedPreferences
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile?.name || ''}
              disabled
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              placeholder="Your email"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-gray-500">Receive email notifications</p>
            </div>
            <Switch
              checked={profile?.preferences?.notifications_enabled}
              onCheckedChange={(checked) => updateSettings('notifications_enabled', checked)}
              disabled={saving}
            />
          </div>


        </div>
      </CardContent>
    </Card>
  )
}