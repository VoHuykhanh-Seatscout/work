// components/PublishCompetitionButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PublishCompetitionButton({ 
  competitionId,
  disabled
}: {
  competitionId: string;
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/competitions/${competitionId}/publish`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish');
      }
      
      router.refresh(); // Refresh the page to update status
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Publishing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={disabled || isLoading}
      className={`px-4 py-2 rounded-md ${
        disabled ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'
      } text-white`}
    >
      {isLoading ? 'Publishing...' : 'Publish Competition'}
    </button>
  );
}