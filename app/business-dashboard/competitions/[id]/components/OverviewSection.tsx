'use client'

import { Competition } from '@prisma/client'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  Users,
  Trophy,
  Calendar,
  Clock,
  Award,
  BarChart2,
  FileText,
  Hash,
  Layers,
  Edit,
  Share2,
  Download,
  AlertCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CircleDashed
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CountUp from 'react-countup'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ExtendedCompetition extends Competition {
  published?: boolean
  stats?: {
    totalParticipants: number
    roundsCount: number
    submissionsCount: number
  }
}

const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
}

const MotionButton = motion(Button)

export default function OverviewSection({
  competition,
}: {
  competition: ExtendedCompetition
}) {
  const today = new Date()
  const daysRemaining = differenceInDays(new Date(competition.endDate), today)
  const daysTotal = differenceInDays(new Date(competition.endDate), new Date(competition.startDate))
  const progressPercentage = Math.min(Math.max(0, (daysTotal - daysRemaining) / daysTotal * 100), 100)

  const stats = competition.stats || {
    totalParticipants: 0,
    roundsCount: 0,
    submissionsCount: 0
  }

  const daysElapsed = differenceInDays(today, new Date(competition.startDate))
  const registrationRate = daysElapsed > 0 ? (stats.totalParticipants / daysElapsed).toFixed(1) : stats.totalParticipants

  const participationRate = stats.totalParticipants > 0 
    ? Math.round((stats.submissionsCount / stats.totalParticipants) * 100)
    : 0

  return (
    <div className="space-y-6 relative">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {competition.title}
          </h1>
          <p className="text-gray-500 mt-2">
            Competition overview and analytics
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap gap-3">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1.5 px-3 py-1.5"
        >
          <Clock className="h-4 w-4" />
          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Completed'}
          {daysRemaining <= 7 && daysRemaining > 0 && (
            <span className="ml-1.5 flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </Badge>
        
        {'published' in competition && (
          <Badge 
            variant={competition.published ? 'default' : 'secondary'} 
            className="px-3 py-1.5"
          >
            {competition.published ? 'Live' : 'Draft'}
          </Badge>
        )}
        
        <Badge 
          variant="secondary" 
          className="px-3 py-1.5 capitalize"
        >
          {competition.participationType?.toLowerCase() || 'Individual'} competition
        </Badge>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Competition details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Competition Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {Math.round(progressPercentage)}% complete
                  </span>
                </div>
                
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span className="font-medium">
                    {format(new Date(competition.startDate), 'MMM d, yyyy')}
                  </span>
                  <span className="font-medium">
                    {format(new Date(competition.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Description
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-primary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {competition.description || 'No description provided. Add a compelling description to attract participants.'}
              </p>
              
              {!competition.description && (
                <Button 
                  variant="link" 
                  className="pl-0 mt-2 text-primary"
                >
                  Add description
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Key details card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Competition Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors">
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(competition.startDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors">
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4" />
                      Prize Pool
                    </p>
                    <p className="font-medium">
                      {competition.prize ? (
                        <span className="text-secondary">{competition.prize}</span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <AlertCircle className="h-4 w-4" />
                          Not specified
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors">
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(competition.endDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors">
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4" />
                      Participation
                    </p>
                    <p className="font-medium text-success">
                      {competition.participationType?.toLowerCase() || 'Individual'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Stats */}
        <div className="space-y-6">
          {/* Stats card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <CountUp
                        end={stats.totalParticipants}
                        duration={1.5}
                      />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ~{registrationRate} signups per day
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-500">Rounds</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <CountUp
                        end={stats.roundsCount}
                        duration={1.5}
                      />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.roundsCount > 0 ? 'Active' : 'Not started'}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-500">Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <CountUp
                        end={stats.submissionsCount}
                        duration={1.5}
                      />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {participationRate}% participation rate
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CircleDashed className="h-4 w-4" />
                  <span>Last updated: {format(new Date(), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Participation rate card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Participation Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Submissions / Participants
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {participationRate}%
                  </span>
                </div>
                
                <Progress 
                  value={participationRate} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span className="font-medium">
                    {stats.submissionsCount} submissions
                  </span>
                  <span className="font-medium">
                    {stats.totalParticipants} participants
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}