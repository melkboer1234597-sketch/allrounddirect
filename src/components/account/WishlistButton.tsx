import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useAuthSession } from '@/hooks/useAccount'
import { addWishlistItem, getWishlist, removeWishlistItem } from '@/lib/account-api'
import { readGuestWishlist, toggleGuestWishlist } from '@/lib/guest-wishlist'
import { cn } from '@/lib/cn'

export function WishlistButton({ slug, name }: { slug: string; name: string }) {
  const session = useAuthSession()
  const client = useQueryClient()
  const loggedIn = Boolean(session.data?.user)
  const accountList = useQuery({
    queryKey: ['account', 'wishlist'],
    queryFn: getWishlist,
    enabled: loggedIn,
  })
  const guestHas = typeof window !== 'undefined' && readGuestWishlist().includes(slug)
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
      else client.invalidateQueries({ queryKey: ['guest-wishlist'] })
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
      className="absolute top-2 right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-[4px] bg-white/95 text-ink ring-1 ring-line hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Heart
        className={cn('h-[18px] w-[18px]', active && 'fill-brand text-brand')}
        strokeWidth={1.75}
      />
    </button>
  )
}
