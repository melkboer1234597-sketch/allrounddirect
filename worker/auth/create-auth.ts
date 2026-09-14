import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { eq } from 'drizzle-orm'
import { createDb } from '../db'
import * as schema from '../db/schema'
import { createEmailService } from '../services/email'
import type { AppEnv } from '../types'
import { getSiteOrigin, getTrustedOrigins, newId } from '../lib/request'
import { customerProfiles } from '../db/schema'

const additionalUserFields = {
  firstName: {
    type: 'string' as const,
    required: true,
    input: true,
  },
  lastName: {
    type: 'string' as const,
    required: true,
    input: true,
  },
  marketingOptIn: {
    type: 'boolean' as const,
    required: false,
    defaultValue: false,
    input: true,
  },
  role: {
    type: 'string' as const,
    required: false,
    defaultValue: 'customer',
    input: false,
  },
}

export function createAuth(env: AppEnv['Bindings']) {
  const db = createDb(env)
  const email = createEmailService(env)
  const origin = getSiteOrigin(env)
  const secret = env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET ontbreekt.')
  }

  const production = env.ENVIRONMENT === 'production'

  return betterAuth({
    appName: 'AllRound Direct',
    secret,
    baseURL: origin,
    basePath: '/api/auth',
    trustedOrigins: getTrustedOrigins(env),
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 30,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await email.send({
          template: 'password_reset',
          to: user.email,
          data: { actionUrl: url },
          related: { type: 'user', id: user.id },
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24,
      sendVerificationEmail: async ({ user, url }) => {
        await email.send({
          template: 'email_verification',
          to: user.email,
          data: { actionUrl: url },
          related: { type: 'user', id: user.id },
        })
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: false,
      },
    },
    user: {
      additionalFields: additionalUserFields,
    },
    advanced: {
      useSecureCookies: production,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'lax',
        secure: production,
        path: '/',
      },
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 20,
      customRules: {
        '/sign-in/email': { window: 60, max: 8 },
        '/sign-up/email': { window: 60, max: 5 },
        '/request-password-reset': { window: 60, max: 4 },
        '/forget-password': { window: 60, max: 4 },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === '/sign-up/email' && ctx.body && typeof ctx.body === 'object') {
          delete (ctx.body as { role?: unknown }).role
        }
        if (ctx.path !== '/sign-up/email') return
        const body = ctx.body as {
          firstName?: string
          lastName?: string
          termsAccepted?: boolean
        }
        const accepted =
          body.termsAccepted === true || ctx.headers?.get('x-terms-accepted') === 'true'
        if (!accepted) {
          throw new APIError('BAD_REQUEST', {
            message: 'Ga akkoord met de algemene voorwaarden en privacyverklaring.',
          })
        }
        if (!body.firstName?.trim() || !body.lastName?.trim()) {
          throw new APIError('BAD_REQUEST', {
            message: 'Voornaam en achternaam zijn verplicht.',
          })
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (created) => {
            const extra = created as typeof created & {
              firstName?: string
              lastName?: string
              marketingOptIn?: boolean
            }
            const firstName = extra.firstName?.trim() || extra.name.split(' ')[0] || ''
            const lastName =
              extra.lastName?.trim() || extra.name.split(' ').slice(1).join(' ') || ''
            await db.insert(customerProfiles).values({
              id: newId(),
              userId: extra.id,
              firstName,
              lastName,
              marketingOptIn: Boolean(extra.marketingOptIn),
              termsAcceptedAt: new Date(),
              accountStatus: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            await db
              .update(schema.user)
              .set({ role: 'customer' })
              .where(eq(schema.user.id, extra.id))
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const profiles = await db
              .select()
              .from(customerProfiles)
              .where(eq(customerProfiles.userId, session.userId))
              .limit(1)
            const profile = profiles[0]
            if (profile && profile.accountStatus !== 'active') {
              throw new APIError('FORBIDDEN', {
                message: 'Dit account is niet beschikbaar.',
              })
            }
            return { data: session }
          },
        },
      },
    },
  })
}

export type AuthInstance = ReturnType<typeof createAuth>
