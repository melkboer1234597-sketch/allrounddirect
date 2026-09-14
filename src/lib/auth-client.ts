import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? 'http://localhost:5173' : window.location.origin,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        marketingOptIn: { type: 'boolean' },
      },
    }),
  ],
})
