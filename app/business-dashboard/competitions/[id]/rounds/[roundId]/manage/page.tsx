'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Round } from '@prisma/client'
import { 
  Sparkles, Lightbulb, Palette, Rocket, Save, 
  PencilRuler, ArrowLeft, Wand2, BookOpen, 
  Award, Eye, LayoutTemplate, Brush, 
  Code, Zap, Sword, ChevronRight
} from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BusinessSidebar from "@/components/BusinessSidebar"

// Custom components
import { RoundInfoTab } from '@/components/round-management/RoundInfoTab'
import { ChallengeContentTab } from '@/components/round-management/ChallengeContentTab'
import { SubmissionRulesTab } from '@/components/round-management/SubmissionRulesTab'
import { EvaluationTab } from '@/components/round-management/EvaluationTab'
import { PreviewTab } from '@/components/round-management/PreviewTab'

// Types
import { RoundWithRelations } from '@/types/round'

// Helpers
import { parseRoundFromAPI } from '@/helpers/roundHelpers'

export default function ManageRoundPage() {
  const router = useRouter()
  const params = useParams<{ id: string; roundId: string }>()
  const [round, setRound] = useState<RoundWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('round-info')
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchRound = async () => {
    try {
      if (!params?.id || !params?.roundId) return
      
      const response = await fetch(`/api/competitions/${params.id}/rounds/${params.roundId}`)
      if (!response.ok) throw new Error('Failed to fetch round')
      
      const data = await response.json()
      setRound(parseRoundFromAPI(data))
      setMarkdownContent(data.round.deliverables || '')
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading round:', error)
      toast.error('Failed to load competition rounds')
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchRound() }, [params?.id, params?.roundId])

  const handleSave = async (status: 'draft' | 'live') => {
    setIsSaving(true);
    try {
      if (!round) return;
      
      const response = await fetch(`/api/competitions/${params.id}/rounds/${params.roundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...round,
          deliverables: markdownContent,
          status
        }),
      });

      if (!response.ok) throw new Error('Failed to save round');
      
      const updatedRound = await response.json();
      setRound(parseRoundFromAPI(updatedRound));
      
      toast.success(status === 'draft' ? 'Draft saved successfully' : 'Round published!', {
        description: status === 'live' ? 'Your creative challenge is now live!' : 'Keep refining your masterpiece'
      });

      if (status === 'live') {
        router.push(`/business-dashboard/competitions/${params.id}/rounds/${params.roundId}/manage`);
      }
    } catch (error) {
      console.error('Error saving round:', error);
      toast.error('Failed to save round', {
        description: 'Please try again or check your connection'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (!round) return
    setRound({
      ...round,
      [field]: new Date(value)
    })
  }

  const handleResourceUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('competitionId', params.id);
      formData.append('roundId', params.roundId);

      const response = await fetch(`/api/competitions/${params.id}/rounds/${params.roundId}/resources`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const newResource = await response.json();
      
      setRound(prev => prev ? {
        ...prev,
        resources: [...prev.resources, newResource]
      } : null);

      toast.success('Resource added successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeResource = (index: number) => {
    if (!round) return
    setRound({
      ...round,
      resources: round.resources.filter((_, i) => i !== index)
    })
    toast('Resource removed', {
      description: 'This creative asset has been deleted'
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-offWhite">
        <BusinessSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-accent border-b-transparent animate-spin animation-delay-150"></div>
            </div>
            <p className="text-medium font-medium">Preparing your challenge...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!round) {
    return (
      <div className="flex min-h-screen bg-offWhite">
        <BusinessSidebar />
        <div className="flex-1 p-8">
          <div className="p-6 rounded-xl flex items-start bg-error/10 border-l-4 border-error">
            <div className="flex-shrink-0 mt-1 text-error">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-dark">Round not found</h3>
              <p className="text-medium">We couldn't find this creative challenge.</p>
              <button 
                className="mt-3 px-4 py-1.5 text-sm rounded-lg font-medium bg-error/20 text-dark"
                onClick={() => router.push(`/business-dashboard/competitions/${params.id}`)}
              >
                Back to Competition
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-offWhite">
      <BusinessSidebar />
      
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-primary shadow-lg">
                <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-dark">
                {round.name}
              </h1>
            </div>
            <p className="text-medium">Design your creative challenge</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={() => handleSave('live')}
              disabled={isSaving || round.status === 'live'}
              className="bg-primary text-white hover:bg-accent shadow-lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              {round.status === 'live' ? 'Live Now' : 'Publish Challenge'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-lg p-1 gap-1 shadow-soft">
            {[
              { id: 'round-info', icon: <LayoutTemplate className="w-4 h-4" />, label: 'Foundation' },
              { id: 'challenge-content', icon: <Brush className="w-4 h-4" />, label: 'Content' },
              { id: 'submission-rules', icon: <Code className="w-4 h-4" />, label: 'Rules' },
              { id: 'evaluation', icon: <Award className="w-4 h-4" />, label: 'Judging' },
              { id: 'preview', icon: <Eye className="w-4 h-4" />, label: 'Preview' }
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md py-2 transition-all flex items-center justify-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="round-info" className="m-0">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-dark">Challenge Foundation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <RoundInfoTab 
                    round={round} 
                    handleDateChange={handleDateChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="challenge-content" className="m-0">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Brush className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-dark">Challenge Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChallengeContentTab 
                    markdownContent={markdownContent}
                    setMarkdownContent={setMarkdownContent}
                    round={round}
                    setRound={setRound}
                    isUploading={isUploading}
                    removeResource={removeResource}
                    uploadProgress={uploadProgress}
                    handleResourceUpload={handleResourceUpload}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="submission-rules" className="m-0">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <Code className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-dark">Submission Rules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <SubmissionRulesTab 
                    round={round} 
                    setRound={setRound} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluation" className="m-0">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-dark">Judging Criteria</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <EvaluationTab 
                    round={round}
                    setRound={setRound}
                    competitionId={params.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="m-0">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Eye className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl text-dark">Challenge Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <PreviewTab 
                    round={round}
                    markdownContent={markdownContent}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}