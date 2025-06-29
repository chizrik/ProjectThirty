'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, FileText, Search, Filter, Calendar, Star, Download, Eye, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { DayProgress, DayData } from '@/types/challenge'

interface ProofsReflectionsProps {
  dayData: DayData[]
  challengeTitle: string
}

export default function ProofsReflections({ dayData, challengeTitle }: ProofsReflectionsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('day')
  const [selectedProof, setSelectedProof] = useState<string | null>(null)

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = dayData.filter(day => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        day.reflection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        day.day.toString().includes(searchTerm)
      
      // Type filter
      const matchesType = 
        filterType === 'all' ||
        (filterType === 'proofs' && day.hasProof) ||
        (filterType === 'reflections' && day.hasReflection) ||
        (filterType === 'both' && day.hasProof && day.hasReflection) ||
        (filterType === 'complete' && day.status === 'completed') ||
        (filterType === 'high-motivation' && (day.motivation || 0) >= 8)
      
      return matchesSearch && matchesType && (day.hasProof || day.hasReflection)
    })

    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'day':
          return b.day - a.day // Most recent first
        case 'motivation':
          return (b.motivation || 0) - (a.motivation || 0)
        case 'completion':
          return (b.completion_rating || 0) - (a.completion_rating || 0)
        case 'difficulty':
          return (b.difficulty_rating || 0) - (a.difficulty_rating || 0)
        default:
          return b.day - a.day
      }
    })

    return filtered
  }, [dayData, searchTerm, filterType, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const totalDays = dayData.length
    const daysWithProofs = dayData.filter(d => d.hasProof).length
    const daysWithReflections = dayData.filter(d => d.hasReflection).length
    const daysWithBoth = dayData.filter(d => d.hasProof && d.hasReflection).length
    const avgMotivation = dayData.filter(d => (d.motivation || 0) > 0).reduce((sum, d) => sum + (d.motivation || 0), 0) / dayData.filter(d => (d.motivation || 0) > 0).length || 0
    const totalReflectionWords = dayData.reduce((sum, d) => sum + (d.reflection ? d.reflection.split(' ').length : 0), 0)
    
    return {
      totalDays,
      daysWithProofs,
      daysWithReflections,
      daysWithBoth,
      avgMotivation: Math.round(avgMotivation * 10) / 10,
      totalReflectionWords,
      proofRate: Math.round((daysWithProofs / totalDays) * 100),
      reflectionRate: Math.round((daysWithReflections / totalDays) * 100)
    }
  }, [dayData])

  const formatDate = (day: number) => {
    const date = new Date()
    date.setDate(date.getDate() - (30 - day))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMotivationColor = (motivation: number) => {
    if (motivation >= 8) return 'text-green-600 bg-green-100'
    if (motivation >= 6) return 'text-yellow-600 bg-yellow-100'
    if (motivation >= 4) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case 'missed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Missed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const exportData = () => {
    const exportData = filteredData.map(day => ({
      Day: day.day,
      Date: formatDate(day.day),
      Status: day.status,
      'Completed Tasks': day.tasks.filter(t => t.completed).length,
      'Total Tasks': day.tasks.length,
      Motivation: day.motivation,
      'Difficulty Rating': day.difficulty_rating,
      'Completion Rating': day.completion_rating,
      'Has Proof': day.hasProof ? 'Yes' : 'No',
      'Has Reflection': day.hasReflection ? 'Yes' : 'No',
      Reflection: day.reflection,
      'Proof URL': day.proof_file
    }))

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${challengeTitle.replace(/\s+/g, '_')}_proofs_reflections.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Proofs & Reflections</h2>
        </div>
        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Proof Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.proofRate}%</p>
                <p className="text-xs text-gray-500">{stats.daysWithProofs}/{stats.totalDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Reflection Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.reflectionRate}%</p>
                <p className="text-xs text-gray-500">{stats.daysWithReflections}/{stats.totalDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Motivation</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.avgMotivation}</p>
                <p className="text-xs text-gray-500">out of 10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalReflectionWords}</p>
                <p className="text-xs text-gray-500">in reflections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reflections or day number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="proofs">With Proofs</SelectItem>
                <SelectItem value="reflections">With Reflections</SelectItem>
                <SelectItem value="both">Proofs & Reflections</SelectItem>
                <SelectItem value="complete">Complete Days</SelectItem>
                <SelectItem value="high-motivation">High Motivation (8+)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Most Recent</SelectItem>
                <SelectItem value="motivation">Highest Motivation</SelectItem>
                <SelectItem value="completion">Completion Rating</SelectItem>
                <SelectItem value="difficulty">Difficulty Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((day) => (
              <Card key={day.day} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Day {day.day}</CardTitle>
                    {day.status && getStatusBadge(day.status)}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(day.day)}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Proof Section */}
                  {day.hasProof && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Proof Submitted</span>
                      </div>
                      {day.proof_file && (
                        <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={day.proof_file}
                            alt={`Day ${day.day} proof`}
                            fill
                            className="object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedProof(day.proof_file || '')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Reflection Section */}
                  {day.hasReflection && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Reflection</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {day.reflection}
                      </p>
                    </div>
                  )}
                  
                  {/* Metrics */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Motivation:</span>
                      <Badge variant="outline" className={`text-xs ${getMotivationColor(day.motivation || 0)}`}>
                        {day.motivation}/10
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.tasks.filter(t => t.completed).length}/{day.tasks.length} tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {filteredData.map((day) => (
              <Card key={day.day}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{day.day}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">Day {day.day}</h3>
                          <span className="text-sm text-gray-500">{formatDate(day.day)}</span>
                          {day.status && getStatusBadge(day.status)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {day.hasProof && <Camera className="h-4 w-4 text-blue-600" />}
                          {day.hasReflection && <FileText className="h-4 w-4 text-green-600" />}
                        </div>
                      </div>
                      
                      {day.hasReflection && (
                        <p className="text-sm text-gray-700">{day.reflection}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Motivation: {day.motivation}/10</span>
                          <span>Tasks: {day.tasks.filter(t => t.completed).length}/{day.tasks.length}</span>
                          {(day.difficulty_rating || 0) > 0 && <span>Difficulty: {day.difficulty_rating}/10</span>}
                          {(day.completion_rating || 0) > 0 && <span>Satisfaction: {day.completion_rating}/10</span>}
                        </div>
                        {day.hasProof && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedProof(day.proof_file || '')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Proof Modal */}
      {selectedProof && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedProof}
              alt="Proof image"
              width={800}
              height={600}
              className="object-contain max-h-[80vh] rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedProof(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}