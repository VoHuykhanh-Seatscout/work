'use client'

import { useQuery } from '@tanstack/react-query'

export const useSubmission = (id: string) => {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${id}`, {
        credentials: 'include' // This ensures cookies are sent
      })
      if (!res.ok) {
        throw new Error('Failed to fetch submission')
      }
      return res.json()
    },
  })
}