'use client'

import { Competition, Round } from '@prisma/client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { format, differenceInDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  ChevronDown,
  Plus,
  FileText,
  Calendar,
  BookOpen,
  Link as LinkIcon,
  Settings,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Award,
  Users,
  FileBarChart
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
}

export type RoundWithResources = Round & {
  resources?: Array<{ name: string; url: string }> | null
}

export interface RoundDescription {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  deliverables: string
  judgingMethod: string
  criteria: string
}

interface RoundsSectionProps {
  competition: {
    id: string
    startDate: Date
    endDate: Date
  }
  roundDescriptions: RoundDescription[]
}

export default function RoundsSection({ competition, roundDescriptions }: RoundsSectionProps) {
  const [rounds, setRounds] = useState<RoundWithResources[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    const loadRounds = async () => {
      try {
        const response = await fetch(`/api/competitions/${competition.id}/rounds`)
        if (!response.ok) throw new Error('Failed to fetch rounds')
        
        const data = await response.json()
        if (Array.isArray(data.rounds)) {
          const processedRounds = data.rounds.map((round: Round) => ({
            ...round,
            startDate: new Date(round.startDate),
            endDate: new Date(round.endDate),
          }))
          setRounds(processedRounds)
        }
      } catch (error) {
        console.error('Error loading rounds:', error)
        toast.error('Failed to load competition rounds')
      } finally {
        setIsLoading(false)
      }
    }

    loadRounds()
  }, [competition.id])

  const getResourceLinks = (resources: any): Array<{name: string, url: string}> => {
    if (!resources) return []
    
    try {
      if (Array.isArray(resources) && resources.every(r => r.name && r.url)) {
        return resources
      }

      const parsed = typeof resources === 'string' ? JSON.parse(resources) : resources
      
      if (Array.isArray(parsed)) {
        if (parsed.every(item => typeof item === 'string')) {
          return parsed.map((url, index) => ({
            name: `Resource ${index + 1}`,
            url
          }))
        }
        return parsed.filter((item: any) => item.url).map((item: any) => ({
          name: item.name || `Resource`,
          url: item.url
        }))
      } else if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed)
          .filter(([_, value]) => typeof value === 'string')
          .map(([name, url]) => ({
            name,
            url: url as string
          }))
      }
      return []
    } catch (error) {
      console.error('Error parsing resources:', error)
      return []
    }
  }

  const getRoundStatus = (startDate: Date, endDate: Date) => {
    if (today < startDate) {
      return {
        text: 'Upcoming',
        variant: 'secondary',
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-gray-200 text-gray-800'
      }
    } else if (today >= startDate && today <= endDate) {
      return {
        text: 'Active',
        variant: 'default',
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-green-100 text-green-800'
      }
    } else {
      return {
        text: 'Completed',
        variant: 'outline',
        icon: <XCircle className="h-4 w-4" />,
        color: 'bg-purple-100 text-purple-800'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-8 bg-white rounded-xl border border-dashed text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No rounds created yet</h3>
        <p className="text-gray-500 mb-6">Add rounds to structure your competition</p>
        <Button asChild>
          <Link href={`/business-dashboard/competitions/${competition.id}/rounds/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Round
          </Link>
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Competition Rounds</h2>
          <p className="text-muted-foreground">Manage the stages of your competition</p>
        </div>
        <Button asChild>
          <Link 
            href={`/business-dashboard/competitions/${competition.id}/rounds/new`}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Round
          </Link>
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="space-y-4"
      >
        {rounds.map((round) => {
          const resources = round.resources || []
          const status = getRoundStatus(round.startDate, round.endDate)
          const daysLeft = differenceInDays(round.endDate, today)
          const daysDuration = differenceInDays(round.endDate, round.startDate)
          
          return (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={`round-${round.id}`} className="border-b-0">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                    <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4 sm:gap-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className={cn(
                            "flex items-center justify-center h-12 w-12 rounded-xl",
                            status.color
                          )}
                        >
                          {status.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium group-hover:text-primary transition-colors text-lg">
                            {round.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.variant as any} className="gap-1.5 px-2 py-0.5">
                              {status.icon}
                              {status.text}
                            </Badge>
                            {status.text === 'Active' && daysLeft > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 sm:ml-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(round.startDate, 'MMM d')} - {format(round.endDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="w-full sm:w-32 bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, (
                                (today.getTime() - round.startDate.getTime()) / 
                                (round.endDate.getTime() - round.startDate.getTime()) * 100
                              )))}%`,
                              backgroundColor: status.text === 'Active' ? brandColors.success : 
                                            status.text === 'Completed' ? brandColors.creative : brandColors.secondary
                            }}
                          />
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6 pt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium flex items-center gap-2 mb-3 text-lg">
                            <FileText className="h-5 w-5" style={{ color: brandColors.primary }} />
                            Description
                          </h4>
                          <p className="text-gray-600">
                            {round.description || (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                No description provided
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium flex items-center gap-2 mb-3 text-lg">
                            <BookOpen className="h-5 w-5" style={{ color: brandColors.accent }} />
                            Assignment
                          </h4>
                          <p className="text-gray-600">
                            {round.deliverables || (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                No assignment details provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium flex items-center gap-2 mb-3 text-lg">
                            <LinkIcon className="h-5 w-5" style={{ color: brandColors.creative }} />
                            Resources
                            {resources.length > 0 && (
                              <span className="ml-auto text-xs font-normal text-muted-foreground">
                                {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
                              </span>
                            )}
                          </h4>
                          
                          {resources.length > 0 ? (
                            <div className="space-y-2">
                              {resources.map((resource, i) => (
                                <a
                                  key={i}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 transition-colors"
                                  style={{ color: brandColors.primary }}
                                >
                                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{resource.name}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              No resources provided
                            </p>
                          )}
                        </div>

                        <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium flex items-center gap-2 mb-3 text-lg">
                            <FileBarChart className="h-5 w-5" style={{ color: brandColors.secondary }} />
                            Judging Criteria
                          </h4>
                          <p className="text-gray-600">
                            {round.judgingMethod || (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                No judging criteria provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t flex justify-end">
                      <Link 
                        href={`/business-dashboard/competitions/${competition.id}/rounds/${round.id}/manage`}
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto gap-2">
                          <Settings className="h-4 w-4" />
                          Manage Round
                        </Button>
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}