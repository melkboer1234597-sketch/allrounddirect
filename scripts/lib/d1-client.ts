import { localQuery, localRun } from './d1-local.ts'

let useLocal = process.env.D1_TARGET === 'local'
let probed = process.env.D1_TARGET === 'local'

export async function probeD1() {
  if (probed) return !useLocal
  probed = true
  try {
    await d1QueryRemote("SELECT 1 as ok")
    useLocal = false
    return true
  } catch {
    useLocal = true
    return false
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} ontbreekt in .env.import.local`)
  return value
}

type D1Response = {
  success: boolean
  errors?: Array<{ message: string }>
  result?: Array<{
    results?: Array<Record<string, unknown>>
    success?: boolean
    error?: string
  }>
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (useLocal) return localQuery<T>(sql, params)
  return d1QueryRemote<T>(sql, params)
}

async function d1QueryRemote<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const token = required('CLOUDFLARE_API_TOKEN')
  const account = required('R2_ACCOUNT_ID')
  const dbId = required('D1_DATABASE_ID')
  let lastError = 'D1 query mislukt'
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${dbId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      },
    )
    const payload = (await response.json()) as D1Response
    if (response.ok && payload.success) {
      return (payload.result?.[0]?.results ?? []) as T[]
    }
    lastError = payload.errors?.[0]?.message || payload.result?.[0]?.error || `D1 HTTP ${response.status}`
    if (response.status === 429 || response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
      continue
    }
    throw new Error(lastError)
  }
  throw new Error(lastError)
}

export async function d1Run(sql: string, params: unknown[] = []) {
  if (useLocal) {
    localRun(sql, params)
    return
  }
  await d1QueryRemote(sql, params)
}

export async function d1Batch(statements: Array<{ sql: string; params?: unknown[] }>) {
  const token = required('CLOUDFLARE_API_TOKEN')
  const account = required('R2_ACCOUNT_ID')
  const dbId = required('D1_DATABASE_ID')
  for (let i = 0; i < statements.length; i += 25) {
    const chunk = statements.slice(i, i + 25)
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${dbId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk.length === 1 ? chunk[0] : { sql: chunk.map((item) => item.sql) }),
      },
    )
    // Cloudflare D1 HTTP expects one sql per request for parameterized queries.
    if (chunk.length !== 1) {
      for (const item of chunk) {
        await d1Run(item.sql, item.params ?? [])
      }
      continue
    }
    const payload = (await response.json()) as D1Response
    if (!response.ok || !payload.success) {
      throw new Error(payload.errors?.[0]?.message || `D1 batch HTTP ${response.status}`)
    }
  }
}
