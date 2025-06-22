import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RoundWithRelations } from '@/types/round'
import { Palette, Rocket, Save, PencilRuler, ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  round: RoundWithRelations
  onSave: (status: 'draft' | 'live') => void
  isSaving: boolean
}

export function PageHeader({ round, onSave, isSaving }: PageHeaderProps) {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  return (
    <div className="relative mb-8">
      {/* Creative background element */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl -z-10" />
      
      <div className="flex flex-col space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
        {/* Top navigation row */}
        <div className="flex justify-between items-start">
          <Button 
            variant="ghost"
            onClick={() => router.push(`/business-dashboard/competitions/${params.id}`)}
            className="hover:bg-purple-50 group transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2 text-purple-600 group-hover:text-purple-800 transition-colors" />
            <span className="text-purple-800">Back to Competition</span>
          </Button>
          
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
            <Palette className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Creator Mode</span>
          </div>
        </div>
        
        {/* Main header content */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <PencilRuler className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Crafting: <span className="text-purple-700">{round.name}</span>
            </h1>
          </div>
          
          <p className="text-gray-600 max-w-2xl">
            Shape an unforgettable challenge experience. Every detail matters.
          </p>
        </div>
        
        {/* Action buttons with creative touches */}
        <div className="flex space-x-3 pt-2">
          <Button 
            variant="outline"
            onClick={() => onSave('draft')}
            disabled={isSaving}
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-800 transition-colors group"
          >
            <Save className={`w-4 h-4 mr-2 ${isSaving ? 'text-gray-400' : 'text-purple-600 group-hover:text-purple-800'}`} />
            {isSaving ? 'Saving Draft...' : 'Save Draft'}
            <span className="ml-2 text-xs text-purple-400 group-hover:text-purple-600">
              Your creative sanctuary
            </span>
          </Button>
          
          <Button 
            onClick={() => onSave('live')}
            disabled={isSaving || round.status === 'live'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md group"
          >
            <Rocket className={`w-4 h-4 mr-2 ${(isSaving || round.status === 'live') ? 'text-white/70' : 'text-white group-hover:text-yellow-200'}`} />
            {isSaving ? 'Launching...' : round.status === 'live' ? 'Already Live' : 'Launch Round'}
            <span className="ml-2 text-xs text-white/80 group-hover:text-white">
              Share your creation
            </span>
          </Button>
        </div>
      </div>
      
      {/* Creative status indicator */}
      {round.status === 'live' && (
        <div className="absolute -top-3 -right-3 bg-green-100 px-3 py-1 rounded-full border border-green-200 flex items-center shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          <span className="text-sm font-medium text-green-800">Live</span>
        </div>
      )}
    </div>
  )
}