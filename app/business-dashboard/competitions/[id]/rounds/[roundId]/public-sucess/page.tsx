'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { Rocket, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function PublishSuccessPage() {
  const router = useRouter()
  const params = useParams<{ id: string; roundId: string }>()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-purple-100">
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">Challenge Published Successfully!</h2>
          
          <p className="text-gray-600">
            Your creative challenge is now live and visible to participants. 
            You can manage submissions and track progress from your dashboard.
          </p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => router.push(`/business-dashboard/competitions/${params.id}`)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Back to Competition
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push(`/business-dashboard/competitions/${params.id}/rounds/${params.roundId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Editing
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}