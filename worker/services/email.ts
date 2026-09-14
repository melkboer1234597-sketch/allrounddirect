import { eq } from 'drizzle-orm'
import type { EmailTemplateId } from '../../shared/email-templates'
import type { AppEnv } from '../types'
import { createDb } from '../db'
import { devEmailOutbox, emailLogs } from '../db/schema'
import { getSiteOrigin, isDevelopment, newId, redactEmail } from '../lib/request'
import { renderEmailTemplate } from '../email/templates'

export type AuthEmailType = 'verification' | 'password_reset' | 'deletion_notice'
export type TransactionalEmailType = AuthEmailType | 'withdrawal_confirmation' | 'contact_ack'

export type SendEmailInput = {
  template: EmailTemplateId
  to: string
  data?: Record<string, string>
  related?: { type: string; id: string }
}

export type EmailService = {
  send: (input: SendEmailInput) => Promise<void>
  sendAuthEmail: (input: {
    to: string
    subject: string
    text: string
    html: string
    type: TransactionalEmailType
    actionUrl?: string
  }) => Promise<void>
}

const AUTH_TEMPLATE: Record<TransactionalEmailType, EmailTemplateId> = {
  verification: 'email_verification',
  password_reset: 'password_reset',
  deletion_notice: 'deletion_notice',
  withdrawal_confirmation: 'withdrawal_confirmation',
  contact_ack: 'contact_ack',
}

export function verificationEmail(origin: string, url: string) {
  const content = renderEmailTemplate('email_verification', origin, { actionUrl: url })
  return { ...content, type: 'verification' as const }
}

export function passwordResetEmail(url: string) {
  const content = renderEmailTemplate('password_reset', 'https://localhost', { actionUrl: url })
  return { ...content, type: 'password_reset' as const }
}

export function withdrawalConfirmationEmail(input: {
  confirmationCode: string
  orderNumber: string
  recordedAtLabel: string
  itemsLabel: string
}) {
  return {
    type: 'withdrawal_confirmation' as const,
    data: input,
  }
}

export function createEmailService(env: AppEnv['Bindings']): EmailService {
  const origin = getSiteOrigin(env)

  async function send(input: SendEmailInput): Promise<void> {
    const content = renderEmailTemplate(input.template, origin, input.data ?? {})
    const from = env.EMAIL_FROM?.trim() || 'AllRound Direct <noreply@localhost>'
    const replyTo = env.EMAIL_REPLY_TO?.trim()
    const resendKey = env.RESEND_API_KEY?.trim()
    const logId = newId()
    const db = createDb(env)

    await db.insert(emailLogs).values({
      id: logId,
      template: input.template,
      recipient: input.to.trim().toLowerCase(),
      relatedEntityType: input.related?.type ?? null,
      relatedEntityId: input.related?.id ?? null,
      status: 'queued',
      providerMessageId: null,
      errorCode: null,
      sentAt: null,
      createdAt: new Date(),
    })

    if (resendKey) {
      try {
        const payload: Record<string, unknown> = {
          from,
          to: [input.to],
          subject: content.subject,
          html: content.html,
          text: content.text,
        }
        if (replyTo) payload.reply_to = replyTo
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const body = (await response.json().catch(() => null)) as { id?: string } | null
        if (!response.ok) {
          await db
            .update(emailLogs)
            .set({ status: 'failed', errorCode: `resend_${response.status}` })
            .where(eq(emailLogs.id, logId))
          console.error('[email] Resend request failed', response.status)
          throw new Error('E-mail kon niet worden verzonden.')
        }
        await db
          .update(emailLogs)
          .set({
            status: 'sent',
            providerMessageId: body?.id ?? null,
            sentAt: new Date(),
          })
          .where(eq(emailLogs.id, logId))
      } catch (error) {
        await db
          .update(emailLogs)
          .set({ status: 'failed', errorCode: 'resend_error' })
          .where(eq(emailLogs.id, logId))
        throw error
      }
      return
    }

    if (!isDevelopment(env)) {
      await db
        .update(emailLogs)
        .set({ status: 'failed', errorCode: 'missing_resend_key' })
        .where(eq(emailLogs.id, logId))
      console.error('[email] RESEND_API_KEY ontbreekt in een niet-development omgeving.')
      throw new Error('E-mail is niet geconfigureerd.')
    }

    await db.insert(devEmailOutbox).values({
      id: newId(),
      toEmail: input.to.trim().toLowerCase(),
      subject: content.subject,
      type: input.template,
      actionUrl: content.actionUrl ?? null,
      createdAt: new Date(),
    })
    await db
      .update(emailLogs)
      .set({ status: 'sent', providerMessageId: 'dev-outbox', sentAt: new Date() })
      .where(eq(emailLogs.id, logId))
    console.info(
      `[email] DEVELOPMENT: ${input.template} in lokale preview voor ${redactEmail(input.to)}. Geen API-key gelogd.`,
    )
  }

  return {
    send,
    async sendAuthEmail(input) {
      await send({
        template: AUTH_TEMPLATE[input.type],
        to: input.to,
        data: {
          actionUrl: input.actionUrl ?? '',
        },
      })
    },
  }
}

export async function getLatestDevEmail(env: AppEnv['Bindings'], to: string) {
  if (!isDevelopment(env)) return null
  const db = createDb(env)
  const rows = await db
    .select()
    .from(devEmailOutbox)
    .where(eq(devEmailOutbox.toEmail, to.trim().toLowerCase()))
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
}
