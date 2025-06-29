'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Share2, 
  RefreshCw, 
  Settings, 
  Calendar,
  BarChart3,
  Camera,
  MessageSquare,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface DayData {
  day: number
  tasks: { task_id: number; title: string; completed: boolean }[]
  motivation: number
  reflection: string
  proof_upload_url: string
  difficulty_rating: number
  completion_rating: number
  timestamp: string
  status: 'neutral' | 'complete' | 'missed' | 'partial'
  hasProof: boolean
  hasReflection: boolean
}

interface ExportToolsProps {
  dayData: DayData[]
  challengeTitle: string
  challengeId: string
  onChallengeReset?: () => void
}

export default function ExportTools({ 
  dayData, 
  challengeTitle, 
  challengeId,
  onChallengeReset 
}: ExportToolsProps) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportOptions, setExportOptions] = useState({
    includeReflections: true,
    includeProofs: true,
    includeMetrics: true,
    includeTasks: true,
    dateRange: 'all'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  const supabase = createSupabaseClient()

  // Calculate statistics for export preview
  const stats = {
    totalDays: dayData.length,
    completedDays: dayData.filter(d => d.status === 'complete').length,
    daysWithProofs: dayData.filter(d => d.hasProof).length,
    daysWithReflections: dayData.filter(d => d.hasReflection).length,
    avgMotivation: Math.round((dayData.reduce((sum, d) => sum + d.motivation, 0) / dayData.length) * 10) / 10,
    totalTasks: dayData.reduce((sum, d) => sum + d.tasks.length, 0),
    completedTasks: dayData.reduce((sum, d) => sum + d.tasks.filter(t => t.completed).length, 0)
  }

  const getFilteredData = () => {
    let filtered = [...dayData]
    
    // Apply date range filter
    if (exportOptions.dateRange === 'last7') {
      filtered = filtered.slice(-7)
    } else if (exportOptions.dateRange === 'last14') {
      filtered = filtered.slice(-14)
    } else if (exportOptions.dateRange === 'completed') {
      filtered = filtered.filter(d => d.status === 'complete')
    }
    
    return filtered
  }

  const exportToCSV = () => {
    const filtered = getFilteredData()
    const headers = ['Day', 'Date', 'Status', 'Completed Tasks', 'Total Tasks']
    
    if (exportOptions.includeMetrics) {
      headers.push('Motivation', 'Difficulty Rating', 'Completion Rating')
    }
    
    if (exportOptions.includeProofs) {
      headers.push('Has Proof', 'Proof URL')
    }
    
    if (exportOptions.includeReflections) {
      headers.push('Reflection')
    }
    
    if (exportOptions.includeTasks) {
      headers.push('Task Details')
    }
    
    const rows = filtered.map(day => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - day.day))
      
      const row = [
        day.day,
        date.toLocaleDateString(),
        day.status,
        day.tasks.filter(t => t.completed).length,
        day.tasks.length
      ]
      
      if (exportOptions.includeMetrics) {
        row.push(day.motivation, day.difficulty_rating, day.completion_rating)
      }
      
      if (exportOptions.includeProofs) {
        row.push(day.hasProof ? 'Yes' : 'No', day.proof_upload_url || '')
      }
      
      if (exportOptions.includeReflections) {
        row.push(day.reflection || '')
      }
      
      if (exportOptions.includeTasks) {
        const taskDetails = day.tasks.map(t => `${t.title}: ${t.completed ? 'Done' : 'Pending'}`).join('; ')
        row.push(taskDetails)
      }
      
      return row
    })
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${challengeTitle.replace(/\s+/g, '_')}_export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const filtered = getFilteredData()
    const exportData = {
      challenge: {
        title: challengeTitle,
        id: challengeId,
        exportDate: new Date().toISOString(),
        totalDays: filtered.length
      },
      statistics: stats,
      days: filtered.map(day => {
        const dayExport: any = {
          day: day.day,
          status: day.status,
          timestamp: day.timestamp
        }
        
        if (exportOptions.includeTasks) {
          dayExport.tasks = day.tasks
        }
        
        if (exportOptions.includeMetrics) {
          dayExport.metrics = {
            motivation: day.motivation,
            difficulty_rating: day.difficulty_rating,
            completion_rating: day.completion_rating
          }
        }
        
        if (exportOptions.includeProofs && day.hasProof) {
          dayExport.proof_url = day.proof_upload_url
        }
        
        if (exportOptions.includeReflections && day.hasReflection) {
          dayExport.reflection = day.reflection
        }
        
        return dayExport
      })
    }
    
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${challengeTitle.replace(/\s+/g, '_')}_export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateShareableImage = async () => {
    // Create a simple SVG summary card
    const completionRate = Math.round((stats.completedDays / stats.totalDays) * 100)
    const taskCompletionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100)
    
    const svg = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="600" height="400" fill="url(#bg)" rx="20"/>
        
        <!-- Title -->
        <text x="300" y="60" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
          30-Day Challenge Progress
        </text>
        
        <!-- Challenge Title -->
        <text x="300" y="90" text-anchor="middle" fill="#E5E7EB" font-family="Arial, sans-serif" font-size="16">
          ${challengeTitle}
        </text>
        
        <!-- Stats -->
        <g transform="translate(50, 130)">
          <!-- Completion Rate -->
          <rect x="0" y="0" width="240" height="80" fill="rgba(255,255,255,0.1)" rx="10"/>
          <text x="120" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Days Completed</text>
          <text x="120" y="55" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${completionRate}%</text>
          
          <!-- Task Completion -->
          <rect x="260" y="0" width="240" height="80" fill="rgba(255,255,255,0.1)" rx="10"/>
          <text x="380" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Tasks Completed</text>
          <text x="380" y="55" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${taskCompletionRate}%</text>
          
          <!-- Motivation -->
          <rect x="0" y="100" width="240" height="80" fill="rgba(255,255,255,0.1)" rx="10"/>
          <text x="120" y="125" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Avg Motivation</text>
          <text x="120" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${stats.avgMotivation}/10</text>
          
          <!-- Proofs -->
          <rect x="260" y="100" width="240" height="80" fill="rgba(255,255,255,0.1)" rx="10"/>
          <text x="380" y="125" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Proofs Submitted</text>
          <text x="380" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${stats.daysWithProofs}</text>
        </g>
        
        <!-- Footer -->
        <text x="300" y="350" text-anchor="middle" fill="#E5E7EB" font-family="Arial, sans-serif" font-size="14">
          Generated on ${new Date().toLocaleDateString()}
        </text>
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${challengeTitle.replace(/\s+/g, '_')}_summary.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (exportFormat === 'csv') {
        exportToCSV()
      } else if (exportFormat === 'json') {
        exportToJSON()
      } else if (exportFormat === 'image') {
        await generateShareableImage()
      }
      toast.success('Export completed successfully!')
    } catch (error) {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleResetChallenge = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true)
      return
    }
    
    setIsResetting(true)
    try {
      // Reset daily progress in Supabase
      const { error } = await supabase
        .from('daily_progress')
        .delete()
        .eq('challenge_id', challengeId)
      
      if (error) throw error
      
      toast.success('Challenge reset successfully!')
      setShowResetConfirm(false)
      onChallengeReset?.()
    } catch (error) {
      toast.error('Failed to reset challenge. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Export & Tools</h2>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="share">Share Progress</TabsTrigger>
          <TabsTrigger value="tools">Challenge Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-6">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>CSV (Spreadsheet)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>JSON (Data)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Summary Image</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select 
                  value={exportOptions.dateRange} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days (1-30)</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last14">Last 14 Days</SelectItem>
                    <SelectItem value="completed">Completed Days Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Include Options */}
              {exportFormat !== 'image' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block">Include in Export</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tasks"
                        checked={exportOptions.includeTasks}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeTasks: !!checked }))
                        }
                      />
                      <label htmlFor="tasks" className="text-sm">Task Details</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="metrics"
                        checked={exportOptions.includeMetrics}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeMetrics: !!checked }))
                        }
                      />
                      <label htmlFor="metrics" className="text-sm">Ratings & Metrics</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="reflections"
                        checked={exportOptions.includeReflections}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeReflections: !!checked }))
                        }
                      />
                      <label htmlFor="reflections" className="text-sm">Reflections</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="proofs"
                        checked={exportOptions.includeProofs}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeProofs: !!checked }))
                        }
                      />
                      <label htmlFor="proofs" className="text-sm">Proof URLs</label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Export Button */}
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>
          
          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Export Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{getFilteredData().length}</p>
                  <p className="text-sm text-gray-600">Days to Export</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.completedDays}</p>
                  <p className="text-sm text-gray-600">Completed Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.daysWithReflections}</p>
                  <p className="text-sm text-gray-600">With Reflections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.daysWithProofs}</p>
                  <p className="text-sm text-gray-600">With Proofs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="share" className="space-y-6">
          {/* Share Options */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => generateShareableImage()}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <ImageIcon className="h-6 w-6 mb-2" />
                  <span>Generate Summary Image</span>
                </Button>
                
                <Button 
                  onClick={() => {
                    const text = `I'm ${Math.round((stats.completedDays / stats.totalDays) * 100)}% through my 30-day challenge: ${challengeTitle}! 🎯`
                    navigator.clipboard.writeText(text)
                    toast.success('Copied to clipboard!')
                  }}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Share2 className="h-6 w-6 mb-2" />
                  <span>Copy Progress Text</span>
                </Button>
              </div>
              
              {/* Progress Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Progress Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Challenge:</span>
                    <span className="font-medium">{challengeTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <Badge variant="default">{Math.round((stats.completedDays / stats.totalDays) * 100)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Completed:</span>
                    <span>{stats.completedDays}/{stats.totalDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Motivation:</span>
                    <span>{stats.avgMotivation}/10</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          {/* Challenge Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Challenge Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reset Challenge */}
              <div className="border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Reset Challenge</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete all your progress, reflections, and proofs. This action cannot be undone.
                    </p>
                    <div className="mt-3">
                      {!showResetConfirm ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setShowResetConfirm(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset Challenge
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-900">
                            Are you absolutely sure? Type "RESET" to confirm:
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleResetChallenge}
                              disabled={isResetting}
                            >
                              {isResetting ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              {isResetting ? 'Resetting...' : 'Confirm Reset'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowResetConfirm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex-col">
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-sm">Backup Data</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex-col">
                  <RefreshCw className="h-5 w-5 mb-1" />
                  <span className="text-sm">Sync Progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{stats.totalDays}</p>
                  <p className="text-xs text-blue-700">Total Days</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{stats.completedTasks}</p>
                  <p className="text-xs text-green-700">Tasks Done</p>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-600">{stats.daysWithReflections}</p>
                  <p className="text-xs text-purple-700">Reflections</p>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Camera className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-orange-600">{stats.daysWithProofs}</p>
                  <p className="text-xs text-orange-700">Proofs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}