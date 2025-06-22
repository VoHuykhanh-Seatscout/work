"use client";

import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  FileText,
  File,
  Image,
  Link as LinkIcon,
  Download,
  Sparkles,
  Hammer,
  Gauge,
  Award,
  Star,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Bookmark,
  Flag,
  ExternalLink,
  User,
  MessageSquare,
  Sword
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { updateSubmissionStatus, updateSubmissionRound } from '@/actions/submissions'
import { toast } from 'sonner'
import type { SubmissionStatus } from '@prisma/client'
import { SubmissionEvaluation } from '@/components/submission-evaluation'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import BusinessSidebar from "@/components/BusinessSidebar"
import { useSubmission } from '@/api/submissions/[id]/client'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface SubmissionDetailPageProps {
  params: { id: string }
}

function isSubmissionStatus(status: string | null | undefined): status is SubmissionStatus {
  return status ? ['pending', 'approved', 'rejected'].includes(status) : false
}

interface FileContent {
  name: string;
  type: string;
  size: number;
  url: string;
  publicId?: string;
}

interface LinkMetadata {
  domain: string
  path: string
  isVideo: boolean
  isImage: boolean
  isDocument: boolean
}

interface SubmissionContent {
  files?: FileContent[]
  links?: string[]
  notes?: string
  description?: string
}

export default function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const router = useRouter()
  const { data: submission, isLoading, error } = useSubmission(params.id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-offWhite">
        <BusinessSidebar />
        <div className="flex-1 p-6 md:p-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return notFound()
  }

  const status = submission.status || 'pending';
  const isAdvanced = !!submission.nextRound;

  const getSubmissionContent = (): SubmissionContent => {
    try {
      if (!submission.content) return {}
     
      const rawContent = typeof submission.content === 'string'
        ? JSON.parse(submission.content)
        : submission.content
     
      const result: SubmissionContent = {
        ...rawContent,
        notes: rawContent.description || rawContent.notes || ''
      }

      if (rawContent.files && Array.isArray(rawContent.files)) {
        result.files = rawContent.files.map((file: any) => ({
          name: file.name || file.publicId?.split('/').pop() || 'document',
          type: file.type || file.url?.split('.').pop() || 'application/octet-stream',
          size: file.size || 0,
          url: file.url
        }))
      }

      if (rawContent.links && Array.isArray(rawContent.links)) {
        result.links = rawContent.links
      }
     
      return result
    } catch (error) {
      console.error('Error parsing submission content:', error)
      return {}
    }
  }

  const content = getSubmissionContent()
  const isLateSubmission = new Date(submission.submittedAt) > new Date(submission.round.endDate)
  const rounds = submission.competition.rounds;
const sortedRounds = [...rounds].sort((a, b) => 
  new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
);
const isFinalRound = sortedRounds[sortedRounds.length - 1].id === submission.round.id;
const currentRoundIndex = rounds.findIndex(
  (r: { id: string }) => r.id === submission.round.id
);
  const roundEnded = new Date(submission.round.endDate) < new Date()

  const getLinkMetadata = (link: string): LinkMetadata => {
    try {
      const url = new URL(link)
      return {
        domain: url.hostname.replace('www.', ''),
        path: url.pathname,
        isVideo: /youtube\.com|vimeo\.com|youtu\.be|youtube-nocookie\.com/.test(url.hostname),
        isImage: /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname),
        isDocument: /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf)$/i.test(url.pathname)
      }
    } catch (e) {
      console.error('Error parsing link URL:', e)
      return {
        domain: 'unknown',
        path: '',
        isVideo: false,
        isImage: false,
        isDocument: false
      }
    }
  }

  const getVideoEmbedUrl = (link: string): string | null => {
    try {
      const url = new URL(link)
     
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.hostname.includes('youtu.be')
          ? url.pathname.slice(1)
          : url.searchParams.get('v')
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
      }
     
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop()
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null
      }
     
      return null
    } catch {
      return null
    }
  }

  const handleSelectWinner = () => {
    router.push(`/business-dashboard/competitions/${submission.competition.id}/select-winner?submissionId=${submission.id}`)
  }

  return (
    <div className="flex min-h-screen bg-offWhite">
      <BusinessSidebar />

      <TooltipProvider>
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <Link href={`/business-dashboard/competitions/${submission.competition.id}`}>
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Submissions
              </Button>
            </Link>
           
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-primary shadow-lg">
                    <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
                    {submission?.user?.name || 'User'}'s Heroic Submission
                  </h1>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {status === 'approved' ? <Star className="w-3 h-3" /> : 
                            status === 'rejected' ? <AlertTriangle className="w-3 h-3" /> : 
                            <Clock className="w-3 h-3" />}
                          {status}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {status === 'approved' ? 'This submission has been approved' : 
                          status === 'rejected' ? 'This submission needs revision' : 
                          'Awaiting evaluation'}
                      </TooltipContent>
                    </Tooltip>
                    {isLateSubmission && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Late
                      </Badge>
                    )}
                  </div>
                </div>
               
                <div className="flex items-center flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1 text-medium">
                    <CalendarDays className="w-4 h-4" />
                    {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-medium">
                    <Bookmark className="w-4 h-4" />
                    {submission.competition.title}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-medium">
                    <Flag className="w-4 h-4" />
                    {submission.round.name}
                  </div>
                </div>
              </div>
             
              <div className="flex gap-2">
                {content.files?.length ? (
                  <Button className="gap-2 bg-primary hover:bg-accent">
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-medium">
                <Tabs defaultValue="content">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <CardTitle className="flex items-center gap-2 text-dark">
                        <FileText className="w-5 h-5 text-primary" />
                        Submission Content
                      </CardTitle>
                      <TabsList className="grid grid-cols-3 w-full sm:w-auto h-10 bg-light">
                        <TabsTrigger value="content" className="gap-1">
                          <File className="w-4 h-4" />
                          {content.links?.length ? 'Links' : 'Files'}
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="gap-1">
                          <ClipboardCheck className="w-4 h-4" />
                          Notes
                        </TabsTrigger>
                        <TabsTrigger value="details" className="gap-1">
                          <Gauge className="w-4 h-4" />
                          Insights
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TabsContent value="content" className="p-6">
                      {content.files?.length ? (
                        <div className="space-y-3">
                          {content.files.map((file, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-all bg-white">
                              <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  {file.type?.includes('pdf') ? (
                                    <FileText className="w-10 h-10 text-red-500 flex-shrink-0" />
                                  ) : file.type?.startsWith('image/') ? (
                                    <Image className="w-10 h-10 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <File className="w-10 h-10 text-gray-500 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{file.name || 'Submission File'}</p>
                                    <p className="text-sm text-medium truncate">
                                      {file.type || 'file'} • {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <a href={file.url} download className="flex-shrink-0">
                                  <Button variant="outline" size="sm" className="gap-1">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : content.links?.length ? (
                        <div className="space-y-3">
                          {content.links.map((link, index) => {
                            const metadata = getLinkMetadata(link)
                            return (
                              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-all bg-white">
                                <div className="flex flex-col gap-4">
                                  <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                      <LinkIcon className="w-10 h-10 text-blue-500 flex-shrink-0" />
                                      <div>
                                        <p className="font-medium">External Link Submission</p>
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-sm break-all"
                                        >
                                          {link}
                                        </a>
                                      </div>
                                    </div>
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      <Button variant="outline" size="sm" className="gap-1">
                                        <ExternalLink className="w-4 h-4" />
                                        Visit
                                      </Button>
                                    </a>
                                  </div>

                                  {metadata.isVideo && (
                                    <div className="mt-2 border-t pt-3">
                                      <h4 className="text-sm font-medium mb-2">Video Preview</h4>
                                      <div className="aspect-video bg-black rounded overflow-hidden">
                                        {(() => {
                                          const embedUrl = getVideoEmbedUrl(link)
                                          return embedUrl ? (
                                            <iframe
                                              src={embedUrl}
                                              className="w-full h-full"
                                              frameBorder="0"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                            ></iframe>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                              Video preview not available
                                            </div>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <File className="w-12 h-12 mx-auto text-medium mb-4" />
                          <p className="text-medium">No submission content available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      {content.notes ? (
                        <div className="prose max-w-none p-4 bg-light rounded-lg">
                          {content.notes}
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <ClipboardCheck className="w-12 h-12 mx-auto text-medium mb-4" />
                          <p className="text-medium">No submission notes provided</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="details" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Creative Vision</h4>
                            <p className="text-sm text-medium">
                              {content.notes && content.notes.length > 100 ? 'Detailed concept' : 'Minimal description'}
                            </p>
                          </div>
                        </div>
                       
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50">
                          <Hammer className="w-5 h-5 text-amber-600" />
                          <div>
                            <h4 className="font-medium">Craftsmanship</h4>
                            <p className="text-sm text-medium">
                              {content.files?.some(f => f.type?.includes('image')) ||
                               content.links?.some(link => getLinkMetadata(link).isImage)
                                ? 'Visual assets included'
                                : 'No visual assets'}
                            </p>
                          </div>
                        </div>
                       
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Gauge className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium">Technical Execution</h4>
                          </div>
                          <Progress
                            value={
                              content.files?.length
                                ? Math.min(100, content.files.length * 25)
                                : content.links?.length
                                  ? 50
                                  : 10
                            }
                            className="h-2 bg-green-100"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              <Card className="border-0 shadow-medium">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-dark">
                    <User className="w-5 h-5 text-primary" />
                    About the Hero
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {submission?.user?.profileImage ? (
                      <img
                        src={submission?.user?.profileImage}
                        alt={submission?.user?.name || ''}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center border-2 border-primary">
                        <User className="w-8 h-8 text-medium" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-dark">{submission?.user?.name}</h3>
                      <p className="text-sm text-medium">{submission?.user?.email}</p>
                     
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <User className="w-4 h-4" />
                          Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {(process.env.NODE_ENV === 'development' || roundEnded) && (
                <Card className="border-0 shadow-medium">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2 text-dark">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                      Evaluation Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <SubmissionEvaluation
                      submissionId={submission.id}
                      isFinalRound={isFinalRound}
                      advanced={isAdvanced}
                      roundEnded={roundEnded}
                      status={status}
                    />
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-medium">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-dark">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Quest Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {submission.competition.rounds.map((round: { id: string, name: string, endDate: Date }, index: number) => (
                      <div key={round.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${
                            round.id === submission.round.id ? 
                              'bg-primary' : 
                              index < currentRoundIndex ? 
                              'bg-green-500' : 'bg-medium'
                          }`} />
                          {index < submission.competition.rounds.length - 1 && (
                            <div className={`w-px h-8 ${
                              index < currentRoundIndex ? 
                                'bg-green-500' : 'bg-medium'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-medium ${
                                round.id === submission.round.id ? 'text-primary' : 'text-dark'
                              }`}>
                                {round.name}
                              </p>
                              <p className="text-sm text-medium">
                                {format(new Date(round.endDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                            {isFinalRound && 
                             round.id === submission.round.id && 
                             status === 'approved' && (
                              <Button 
                                onClick={handleSelectWinner}
                                size="sm" 
                                className="gap-1 bg-primary hover:bg-accent ml-4"
                              >
                                <Award className="w-3 h-3" />
                                Select Winner
                              </Button>
                            )}
                          </div>
                          {isFinalRound && 
                           round.id === submission.round.id && 
                           status === 'approved' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              This is the final round - you can select this submission as the competition winner
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}

function formatFileSize(bytes: number = 0): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}