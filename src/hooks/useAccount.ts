import { useQuery } from '@tanstack/react-query'
import { getAccountMe } from '@/lib/account-api'
import { authClient } from '@/lib/auth-client'

export function useAuthSession() {
  return authClient.useSession()
}

export function useAccount() {
  const session = authClient.useSession()
  const me = useQuery({
    queryKey: ['account', 'me'],
    queryFn: getAccountMe,
    enabled: Boolean(session.data?.user),
  })

  const user = me.data?.user ?? {
    id: session.data?.user.id ?? '',
    email: session.data?.user.email ?? '',
    emailVerified: session.data?.user.emailVerified ?? false,
    firstName: session.data?.user.firstName ?? session.data?.user.name?.split(' ')[0] ?? '',
    lastName: session.data?.user.lastName ?? '',
    name: session.data?.user.name ?? '',
    marketingOptIn: Boolean(session.data?.user.marketingOptIn),
    phone: null,
    companyName: null,
    kvk: null,
    vatNumber: null,
    accountStatus: 'active',
    twoFactorEnabled: false,
  }

  return {
    session,
    user,
    isPending: session.isPending || (Boolean(session.data) && me.isPending),
    refetch: me.refetch,
  }
}
