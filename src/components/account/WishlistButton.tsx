import { useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useAuthSession } from '@/hooks/useAccount'
import { addWishlistItem, getWishlist, removeWishlistItem } from '@/lib/account-api'
import {
  readGuestWishlist,
  subscribeGuestWishlist,
  toggleGuestWishlist,
} from '@/lib/guest-wishlist'
import { cn } from '@/lib/cn'

const EMPTY: string[] = []

export function WishlistButton({
  slug,
  name,
  className,
}: {
  slug: string
  name: string
  className?: string
}) {
  const session = useAuthSession()
  const client = useQueryClient()
  const loggedIn = Boolean(session.data?.user)
  const accountList = useQuery({
    queryKey: ['account', 'wishlist'],
    queryFn: getWishlist,
    enabled: loggedIn,
  })
  const guestSlugs = useSyncExternalStore(subscribeGuestWishlist, readGuestWishlist, () => EMPTY)
  const guestHas = guestSlugs.includes(slug)
  const accountHas = accountList.data?.items.some((item) => item.productSlug === slug) ?? false
  const active = loggedIn ? accountHas : guestHas

  const toggle = useMutation({
    mutationFn: async () => {
      if (loggedIn) {
        if (accountHas) await removeWishlistItem(slug)
        else await addWishlistItem(slug)
        return
      }
      toggleGuestWishlist(slug)
    },
    onSuccess: () => {
      if (loggedIn) void client.invalidateQueries({ queryKey: ['account', 'wishlist'] })
      else void client.invalidateQueries({ queryKey: ['guest-wishlist'] })
    },
  })

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle.mutate()
      }}
      aria-pressed={active}
      aria-label={active ? `${name} uit favorieten halen` : `${name} opslaan in favorieten`}
      className={cn(
        'absolute top-2 right-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/95 text-ink ring-1 ring-line/80 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        className,
      )}
    >
      <Heart
        className={cn('h-5 w-5', active && 'fill-brand text-brand')}
        strokeWidth={1.75}
      />
    </button>
  )
}
