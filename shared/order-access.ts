/**
 * Authorization matrix for customer order detail (account / guest).
 * Order number alone is never enough.
 */
export function canAccessOrderDetail(input: {
  orderUserId: string | null
  orderGuestEmail: string
  orderConfirmationToken: string
  requesterUserId?: string | null
  requesterEmail?: string | null
  confirmationToken?: string | null
}): boolean {
  const byUser = Boolean(
    input.requesterUserId && input.orderUserId && input.requesterUserId === input.orderUserId,
  )
  const byEmail =
    Boolean(input.requesterEmail) &&
    input.orderGuestEmail.trim().toLowerCase() === input.requesterEmail!.trim().toLowerCase()
  const byToken =
    Boolean(input.confirmationToken) &&
    input.confirmationToken!.length >= 8 &&
    input.orderConfirmationToken === input.confirmationToken
  return byUser || byEmail || byToken
}
