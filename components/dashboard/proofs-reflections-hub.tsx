'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Image, ChevronDown, ChevronUp, ExternalLink, Calendar, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProofItem {
  day: number
  date: string
  proofUrl: string
  proofType: 'image' | 'video' | 'link'
  reflection?: string
  motivationRating?: number
}

interface ProofsReflectionsHubProps {
  proofs: ProofItem[]
}

export function ProofsReflectionsHub({ proofs }: ProofsReflectionsHubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOnlyWithMedia, setShowOnlyWithMedia] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null)
  
  const filteredProofs = showOnlyWithMedia 
    ? proofs.filter(proof => proof.proofUrl)
    : proofs
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-slate-900/10 border-0 shadow-md overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Proofs & Reflections
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {proofs.length} entries
                  </Badge>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pb-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Journey Documentation</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-media-only"
                    checked={showOnlyWithMedia}
                    onCheckedChange={setShowOnlyWithMedia}
                    className="data-[state=checked]:bg-purple-500"
                  />
                  <Label htmlFor="show-media-only" className="text-xs text-slate-600 dark:text-slate-400">Show Only With Media</Label>
                </div>
              </div>
              
              <Tabs defaultValue="grid">
                <TabsList className="grid grid-cols-2 mb-4 w-[200px]">
                  <TabsTrigger value="grid" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    List
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="grid" className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProofs.map((proof, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedProof(proof)}
                      >
                        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50">
                          <div className="aspect-square relative bg-slate-100 dark:bg-slate-700">
                            {proof.proofUrl ? (
                              proof.proofType === 'image' ? (
                                <div 
                                  className="w-full h-full bg-cover bg-center" 
                                  style={{ backgroundImage: `url(${proof.proofUrl})` }}
                                />
                              ) : proof.proofType === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                                  <Image className="w-8 h-8 text-slate-500" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                                  <ExternalLink className="w-8 h-8 text-slate-500" />
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                                <FileText className="w-8 h-8 text-slate-500" />
                              </div>
                            )}
                            <Badge className="absolute top-2 left-2 bg-slate-800/70 text-white">
                              Day {proof.day}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(proof.date).toLocaleDateString()}</div>
                              {proof.reflection && (
                                <Badge variant="outline" className="h-5 px-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Note
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="space-y-4">
                  <ScrollArea className="h-[400px] rounded-md border border-slate-200 dark:border-slate-700 p-4">
                    <div className="space-y-4">
                      {filteredProofs.map((proof, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="cursor-pointer"
                          onClick={() => setSelectedProof(proof)}
                        >
                          <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
                                  <Calendar className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium text-slate-900 dark:text-slate-100">Day {proof.day}</h5>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(proof.date).toLocaleDateString()}</div>
                                  </div>
                                  
                                  {proof.reflection && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                                      {proof.reflection}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                      {proof.proofUrl && (
                                        <Badge variant="outline" className="h-5 px-2 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                          <Image className="w-3 h-3 mr-1" />
                                          Proof
                                        </Badge>
                                      )}
                                      {proof.reflection && (
                                        <Badge variant="outline" className="h-5 px-2 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                          <FileText className="w-3 h-3 mr-1" />
                                          Reflection
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {proof.motivationRating && (
                                      <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        <span className="text-xs font-medium">{proof.motivationRating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              {/* Proof Detail Modal would be implemented here */}
              {selectedProof && (
                <Card className="mt-6 border-0 shadow-md overflow-hidden bg-white dark:bg-slate-800/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Day {selectedProof.day} Details</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProof(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedProof.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    
                    {selectedProof.proofUrl && (
                      <div className="rounded-md overflow-hidden">
                        {selectedProof.proofType === 'image' ? (
                          <img 
                            src={selectedProof.proofUrl} 
                            alt={`Proof for day ${selectedProof.day}`} 
                            className="w-full h-auto max-h-[300px] object-contain bg-slate-100 dark:bg-slate-700"
                          />
                        ) : selectedProof.proofType === 'video' ? (
                          <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <p className="text-slate-500">Video content</p>
                          </div>
                        ) : (
                          <Button variant="outline" className="w-full" asChild>
                            <a href={selectedProof.proofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Open Link
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {selectedProof.reflection && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          Reflection
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          {selectedProof.reflection}
                        </p>
                      </div>
                    )}
                    
                    {selectedProof.motivationRating && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          <Star className="w-3 h-3 mr-1 fill-amber-500" />
                          Motivation: {selectedProof.motivationRating}/10
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  )
}