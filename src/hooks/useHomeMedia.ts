import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type HomeMedia = {
  hero: string | null
  bySlug: Record<string, string>
}

export function useHomeMedia() {
  return useQuery({
    queryKey: ['home-media'],
    queryFn: () => apiFetch<HomeMedia>('/home/media'),
    staleTime: 60_000,
  })
}
