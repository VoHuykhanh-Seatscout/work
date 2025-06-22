import { Competition } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function SettingsTab({ competition }: { competition: Competition }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Competition Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Registration</h3>
            <p className="text-sm text-gray-500">
              Allow new participants to register for this competition
            </p>
          </div>
          <Switch id="registration-toggle" defaultChecked />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Visibility</h3>
            <p className="text-sm text-gray-500">
              Make this competition public or private
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="visibility">Public</Label>
            <Switch id="visibility" defaultChecked={competition.visibility === 'public'} />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Danger Zone</h3>
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-red-600">Delete Competition</p>
                <p className="text-sm text-red-500">
                  Once deleted, this competition cannot be recovered
                </p>
              </div>
              <Button variant="destructive">Delete Competition</Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}