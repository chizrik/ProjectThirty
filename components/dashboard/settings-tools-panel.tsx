'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { Settings, RefreshCw, Download, Bell, Share2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

interface SettingsToolsPanelProps {
  challengeId: string
  onResetChallenge: () => void
  onExportProgress: () => void
  onShareSnapshot: () => void
}

export function SettingsToolsPanel({
  challengeId,
  onResetChallenge,
  onExportProgress,
  onShareSnapshot
}: SettingsToolsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    browser: true,
    email: false,
    push: false
  })
  const [showResetSuccess, setShowResetSuccess] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [showShareSuccess, setShowShareSuccess] = useState(false)
  
  const handleResetChallenge = () => {
    onResetChallenge()
    setShowResetSuccess(true)
    setTimeout(() => setShowResetSuccess(false), 3000)
  }
  
  const handleExportProgress = () => {
    onExportProgress()
    setShowExportSuccess(true)
    setTimeout(() => setShowExportSuccess(false), 3000)
  }
  
  const handleShareSnapshot = () => {
    onShareSnapshot()
    setShowShareSuccess(true)
    setTimeout(() => setShowShareSuccess(false), 3000)
  }
  
  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 z-50"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all border-slate-200 dark:border-slate-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Settings & Tools</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-12 right-0 w-80"
        >
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                Settings & Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Edit Plan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Challenge Plan</h4>
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    ID: {challengeId.slice(0, 8)}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-600 dark:text-slate-300"
                  onClick={() => window.location.href = `/challenge/${challengeId}/edit`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Edit Plan (Restart Challenge)
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              {/* Export & Share */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Export & Share</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start text-slate-600 dark:text-slate-300"
                    onClick={handleExportProgress}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-slate-600 dark:text-slate-300"
                    onClick={handleShareSnapshot}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Progress
                  </Button>
                </div>
                {showExportSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Progress exported successfully
                  </motion.div>
                )}
                {showShareSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Progress snapshot shared
                  </motion.div>
                )}
              </div>
              
              <Separator className="my-2" />
              
              {/* Notifications */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notif" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      Browser Notifications
                    </Label>
                    <Switch
                      id="browser-notif"
                      checked={notificationSettings.browser}
                      onCheckedChange={(checked) => updateNotificationSetting('browser', checked)}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notif" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      Email Reminders
                    </Label>
                    <Switch
                      id="email-notif"
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notif" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      Push Notifications
                    </Label>
                    <Switch
                      id="push-notif"
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Reset Challenge */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Danger Zone</h4>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset Challenge
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Reset Challenge
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all your progress, reflections, and proofs for this challenge. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetChallenge}>Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {showResetSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Challenge reset successfully
                  </motion.div>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}