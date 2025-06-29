'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Bell, 
  Palette, 
  Target, 
  Clock, 
  Save,
  RefreshCw,
  Smartphone,
  Mail,
  Calendar,
  Zap,
  Shield,
  User
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface ChallengeSettingsProps {
  challengeId: string
  challengeTitle: string
  challengeDescription: string
  onChallengeUpdate?: (title: string, description: string) => void
}

interface NotificationSettings {
  dailyReminder: boolean
  reminderTime: string
  weeklyReport: boolean
  motivationalQuotes: boolean
  streakAlerts: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  compactMode: boolean
  showAnimations: boolean
  gridSize: 'small' | 'medium' | 'large'
}

interface ChallengePreferences {
  autoSaveProgress: boolean
  requireProofForCompletion: boolean
  allowPartialCompletion: boolean
  showMotivationPrompts: boolean
  difficultyAdjustment: boolean
  weekendMode: boolean
}

export default function ChallengeSettings({ 
  challengeId, 
  challengeTitle, 
  challengeDescription,
  onChallengeUpdate 
}: ChallengeSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Challenge Info
  const [title, setTitle] = useState(challengeTitle)
  const [description, setDescription] = useState(challengeDescription)
  
  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminder: true,
    reminderTime: '09:00',
    weeklyReport: true,
    motivationalQuotes: true,
    streakAlerts: true,
    emailNotifications: false,
    pushNotifications: true
  })
  
  // Appearance Settings
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    accentColor: 'blue',
    compactMode: false,
    showAnimations: true,
    gridSize: 'medium'
  })
  
  // Challenge Preferences
  const [preferences, setPreferences] = useState<ChallengePreferences>({
    autoSaveProgress: true,
    requireProofForCompletion: false,
    allowPartialCompletion: true,
    showMotivationPrompts: true,
    difficultyAdjustment: false,
    weekendMode: false
  })
  
  const supabase = createClient()
  
  useEffect(() => {
    loadSettings()
  }, [challengeId])
  
  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const { data: settings, error } = await supabase
        .from('challenge_settings')
        .select('*')
        .eq('challenge_id', challengeId)
        .single()
      
      if (settings && !error) {
        if (settings.notifications) setNotifications(settings.notifications)
        if (settings.appearance) setAppearance(settings.appearance)
        if (settings.preferences) setPreferences(settings.preferences)
      }
    } catch (error) {
      console.log('Settings not found, using defaults')
    } finally {
      setIsLoading(false)
    }
  }
  
  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const settingsData = {
        challenge_id: challengeId,
        notifications,
        appearance,
        preferences,
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('challenge_settings')
        .upsert(settingsData)
      
      if (error) throw error
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const updateChallengeInfo = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ 
          title: title.trim(), 
          description: description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
      
      if (error) throw error
      
      onChallengeUpdate?.(title.trim(), description.trim())
      toast.success('Challenge information updated!')
    } catch (error) {
      toast.error('Failed to update challenge. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const resetToDefaults = () => {
    setNotifications({
      dailyReminder: true,
      reminderTime: '09:00',
      weeklyReport: true,
      motivationalQuotes: true,
      streakAlerts: true,
      emailNotifications: false,
      pushNotifications: true
    })
    
    setAppearance({
      theme: 'system',
      accentColor: 'blue',
      compactMode: false,
      showAnimations: true,
      gridSize: 'medium'
    })
    
    setPreferences({
      autoSaveProgress: true,
      requireProofForCompletion: false,
      allowPartialCompletion: true,
      showMotivationPrompts: true,
      difficultyAdjustment: false,
      weekendMode: false
    })
    
    toast.success('Settings reset to defaults')
  }
  
  const accentColors = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
    { name: 'Red', value: 'red', color: 'bg-red-500' },
    { name: 'Teal', value: 'teal', color: 'bg-teal-500' }
  ]
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Challenge Settings</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="challenge" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenge">Challenge</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="challenge" className="space-y-6">
          {/* Challenge Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Challenge Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter challenge title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your challenge goals and motivation"
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={updateChallengeInfo} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update Challenge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          {/* Daily Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Daily Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reminder">Daily Reminder</Label>
                  <p className="text-sm text-gray-600">Get reminded to complete your daily tasks</p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={notifications.dailyReminder}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, dailyReminder: checked }))
                  }
                />
              </div>
              
              {notifications.dailyReminder && (
                <div>
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={notifications.reminderTime}
                    onChange={(e) => 
                      setNotifications(prev => ({ ...prev, reminderTime: e.target.value }))
                    }
                    className="mt-1 w-32"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="streak-alerts">Streak Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified about streak milestones</p>
                </div>
                <Switch
                  id="streak-alerts"
                  checked={notifications.streakAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, streakAlerts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="motivational-quotes">Motivational Messages</Label>
                  <p className="text-sm text-gray-600">Receive daily motivation and tips</p>
                </div>
                <Switch
                  id="motivational-quotes"
                  checked={notifications.motivationalQuotes}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, motivationalQuotes: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Reports & Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-report">Weekly Progress Report</Label>
                  <p className="text-sm text-gray-600">Get a summary of your weekly progress</p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive browser/app notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Theme & Colors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={appearance.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    setAppearance(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Accent Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance(prev => ({ ...prev, accentColor: color.value }))}
                      className={`
                        w-12 h-12 rounded-lg ${color.color} flex items-center justify-center
                        ${appearance.accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                      `}
                    >
                      {appearance.accentColor === color.value && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Layout & Display</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grid-size">Grid Size</Label>
                <Select 
                  value={appearance.gridSize} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => 
                    setAppearance(prev => ({ ...prev, gridSize: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (Compact)</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="large">Large (Spacious)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-gray-600">Reduce spacing and padding</p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => 
                    setAppearance(prev => ({ ...prev, compactMode: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-animations">Animations</Label>
                  <p className="text-sm text-gray-600">Enable smooth transitions and effects</p>
                </div>
                <Switch
                  id="show-animations"
                  checked={appearance.showAnimations}
                  onCheckedChange={(checked) => 
                    setAppearance(prev => ({ ...prev, showAnimations: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          {/* Progress Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Progress & Completion</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save Progress</Label>
                  <p className="text-sm text-gray-600">Automatically save changes as you make them</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={preferences.autoSaveProgress}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, autoSaveProgress: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-proof">Require Proof for Completion</Label>
                  <p className="text-sm text-gray-600">Must upload proof to mark day as complete</p>
                </div>
                <Switch
                  id="require-proof"
                  checked={preferences.requireProofForCompletion}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, requireProofForCompletion: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="partial-completion">Allow Partial Completion</Label>
                  <p className="text-sm text-gray-600">Mark days as partially complete</p>
                </div>
                <Switch
                  id="partial-completion"
                  checked={preferences.allowPartialCompletion}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, allowPartialCompletion: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Experience Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Experience & Motivation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="motivation-prompts">Show Motivation Prompts</Label>
                  <p className="text-sm text-gray-600">Display encouraging messages and tips</p>
                </div>
                <Switch
                  id="motivation-prompts"
                  checked={preferences.showMotivationPrompts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showMotivationPrompts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="difficulty-adjustment">Dynamic Difficulty</Label>
                  <p className="text-sm text-gray-600">Adjust challenge difficulty based on performance</p>
                </div>
                <Switch
                  id="difficulty-adjustment"
                  checked={preferences.difficultyAdjustment}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, difficultyAdjustment: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekend-mode">Weekend Mode</Label>
                  <p className="text-sm text-gray-600">Relaxed requirements on weekends</p>
                </div>
                <Switch
                  id="weekend-mode"
                  checked={preferences.weekendMode}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, weekendMode: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}