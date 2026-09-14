import { auditLogs } from '../db/schema'
import { newId } from './request'
import type { Database } from '../db'
import type { StaffContext } from '../auth/rbac-guard'

export async function writeAudit(
  db: Database,
  staff: StaffContext,
  input: { action: string; entity: string; entityId?: string | null; summary: string },
) {
  await db.insert(auditLogs).values({
    id: newId(),
    actorUserId: staff.userId,
    actorEmail: staff.email,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    summary: input.summary.slice(0, 500),
    createdAt: new Date(),
  })
}
