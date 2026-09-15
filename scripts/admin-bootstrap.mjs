/**
 * Bootstrap a staff/super_admin account using Better Auth password hashing.
 *
 * Security:
 * - Never logs or writes the plaintext password.
 * - Password only from ADMIN_BOOTSTRAP_PASSWORD (process env) or interactive prompt.
 * - Does not reset an existing password unless --reset-password is passed.
 *
 * Usage:
 *   ADMIN_BOOTSTRAP_EMAIL=admin@allrounddirect.com npm run admin:bootstrap -- --local
 *   ADMIN_BOOTSTRAP_EMAIL=admin@allrounddirect.com npm run admin:bootstrap -- --remote
 *   … --reset-password   # only when intentionally rotating the password
 *
 * After success, unset the env var:
 *   PowerShell: Remove-Item Env:ADMIN_BOOTSTRAP_PASSWORD
 *   bash:       unset ADMIN_BOOTSTRAP_PASSWORD
 */
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output, stderr } from 'node:process'
import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { hashPassword } from 'better-auth/crypto'

const DB_NAME = 'cloth'
const DEFAULT_EMAIL = 'admin@allrounddirect.com'
const ROLE = 'super_admin'
const MIN_PASSWORD = 10
const MAX_PASSWORD = 128

const args = new Set(process.argv.slice(2))
const remote = args.has('--remote')
const resetPassword = args.has('--reset-password')
const help = args.has('--help') || args.has('-h')

if (help) {
  console.log(`Bootstrap AllRound Direct staff account (Better Auth credentials).

Flags:
  --local             Write to local D1 (default if neither flag set)
  --remote            Write to remote production D1
  --reset-password    Update password hash when the user already exists
  --help              Show this help

Env:
  ADMIN_BOOTSTRAP_EMAIL      Default: ${DEFAULT_EMAIL}
  ADMIN_BOOTSTRAP_PASSWORD   Optional; if unset, prompts interactively (never logged)
`)
  process.exit(0)
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function d1Execute(sql, { remote: useRemote }) {
  const dir = mkdtempSync(join(tmpdir(), 'ard-admin-bootstrap-'))
  const file = join(dir, 'query.sql')
  writeFileSync(file, sql.endsWith(';') ? sql : `${sql};`, { encoding: 'utf8', mode: 0o600 })
  try {
    const wranglerArgs = ['wrangler', 'd1', 'execute', DB_NAME, '--yes', '--json', '--file', file]
    if (useRemote) wranglerArgs.push('--remote')
    else wranglerArgs.push('--local')
    const result = spawnSync('npx', wranglerArgs, {
      encoding: 'utf8',
      shell: process.platform === 'win32',
      env: process.env,
      windowsHide: true,
    })
    if (result.status !== 0) {
      const err = (result.stderr || result.stdout || '').trim()
      throw new Error(err || `wrangler d1 execute failed (exit ${result.status})`)
    }
    const raw = (result.stdout || '').trim()
    if (!raw) return []
    try {
      return JSON.parse(raw)
    } catch {
      return { ok: true, raw }
    }
  } finally {
    try {
      unlinkSync(file)
    } catch {
      /* ignore */
    }
  }
}

function firstResults(payload) {
  if (!Array.isArray(payload)) return []
  const block = payload[0]
  return Array.isArray(block?.results) ? block.results : []
}

function readHiddenPasswordWindows(prompt) {
  const ps = [
    `$ErrorActionPreference = 'Stop'`,
    `$p = Read-Host -AsSecureString -Prompt '${prompt.replace(/'/g, "''")}'`,
    `$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($p)`,
    `try { [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }`,
  ].join('; ')
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', ps], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: false,
  })
  if (result.status !== 0) {
    throw new Error('Password prompt cancelled or failed.')
  }
  return String(result.stdout || '').replace(/\r?\n$/, '')
}

async function readPassword() {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv
  }
  if (!input.isTTY) {
    throw new Error(
      'ADMIN_BOOTSTRAP_PASSWORD is not set and stdin is not interactive. Set the env var in this terminal session only, then re-run.',
    )
  }
  if (process.platform === 'win32') {
    stderr.write('Enter admin password (hidden). Min 10 characters.\n')
    const password = readHiddenPasswordWindows('Admin password')
    const confirm = readHiddenPasswordWindows('Confirm password')
    if (password !== confirm) throw new Error('Passwords do not match.')
    return password
  }
  const rl = createInterface({ input, output, terminal: true })
  try {
    stderr.write('Enter admin password (input may echo). Prefer ADMIN_BOOTSTRAP_PASSWORD env.\n')
    const password = await rl.question('Password: ')
    const confirm = await rl.question('Confirm password: ')
    if (password !== confirm) throw new Error('Passwords do not match.')
    return password
  } finally {
    rl.close()
  }
}

function validatePassword(password) {
  if (password.length < MIN_PASSWORD) {
    throw new Error(`Password must be at least ${MIN_PASSWORD} characters.`)
  }
  if (password.length > MAX_PASSWORD) {
    throw new Error(`Password must be at most ${MAX_PASSWORD} characters.`)
  }
}

async function main() {
  const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL || DEFAULT_EMAIL)
    .trim()
    .toLowerCase()
  if (!email.includes('@')) {
    throw new Error('ADMIN_BOOTSTRAP_EMAIL is invalid.')
  }

  const target = remote ? 'REMOTE production D1 (cloth)' : 'LOCAL D1 (cloth)'
  console.log(`Admin bootstrap → ${target}`)
  console.log(`Email: ${email}`)
  console.log(`Role: ${ROLE}`)

  const existing = firstResults(
    d1Execute(
      `SELECT id, email, role, email_verified AS emailVerified FROM user WHERE email = ${sqlString(email)} LIMIT 1`,
      { remote },
    ),
  )
  const row = existing[0]

  if (row) {
    console.log(`User exists (id=${row.id}). Confirming role + verified email.`)
    d1Execute(
      `UPDATE user SET role = ${sqlString(ROLE)}, email_verified = 1, updated_at = ${Date.now()} WHERE id = ${sqlString(row.id)}`,
      { remote },
    )

    const accounts = firstResults(
      d1Execute(
        `SELECT id FROM account WHERE user_id = ${sqlString(row.id)} AND provider_id = 'credential' LIMIT 1`,
        { remote },
      ),
    )

    if (!accounts[0]) {
      console.log('No credential account found; creating one (password required).')
      const password = await readPassword()
      validatePassword(password)
      const hash = await hashPassword(password)
      const now = Date.now()
      const accountId = randomUUID()
      d1Execute(
        `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         VALUES (${sqlString(accountId)}, ${sqlString(row.id)}, 'credential', ${sqlString(row.id)}, ${sqlString(hash)}, ${now}, ${now})`,
        { remote },
      )
      console.log('Credential account created. Password set once; plaintext not stored.')
    } else if (resetPassword) {
      console.log('--reset-password: updating credential hash.')
      const password = await readPassword()
      validatePassword(password)
      const hash = await hashPassword(password)
      d1Execute(
        `UPDATE account SET password = ${sqlString(hash)}, updated_at = ${Date.now()}
         WHERE user_id = ${sqlString(row.id)} AND provider_id = 'credential'`,
        { remote },
      )
      console.log('Password hash updated. Plaintext not stored.')
    } else {
      console.log('Password unchanged (pass --reset-password to rotate).')
    }

    const profiles = firstResults(
      d1Execute(
        `SELECT id FROM customer_profiles WHERE user_id = ${sqlString(row.id)} LIMIT 1`,
        { remote },
      ),
    )
    if (!profiles[0]) {
      const now = Date.now()
      d1Execute(
        `INSERT INTO customer_profiles (id, user_id, first_name, last_name, marketing_opt_in, terms_accepted_at, account_status, created_at, updated_at)
         VALUES (${sqlString(randomUUID())}, ${sqlString(row.id)}, 'Admin', 'AllRound', 0, ${now}, 'active', ${now}, ${now})`,
        { remote },
      )
      console.log('customer_profiles row created.')
    }

    console.log('DONE: existing admin confirmed.')
    console.log(`email=${email} role=${ROLE} target=${remote ? 'remote' : 'local'}`)
    return
  }

  console.log('User does not exist; creating super_admin with Better Auth credential hash.')
  const password = await readPassword()
  validatePassword(password)
  const hash = await hashPassword(password)
  const userId = randomUUID()
  const accountRowId = randomUUID()
  const profileId = randomUUID()
  const now = Date.now()
  const name = 'AllRound Admin'

  const sql = `
INSERT INTO user (id, name, email, email_verified, image, first_name, last_name, marketing_opt_in, role, created_at, updated_at)
VALUES (
  ${sqlString(userId)},
  ${sqlString(name)},
  ${sqlString(email)},
  1,
  NULL,
  'Admin',
  'AllRound',
  0,
  ${sqlString(ROLE)},
  ${now},
  ${now}
);

INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES (
  ${sqlString(accountRowId)},
  ${sqlString(userId)},
  'credential',
  ${sqlString(userId)},
  ${sqlString(hash)},
  ${now},
  ${now}
);

INSERT INTO customer_profiles (id, user_id, first_name, last_name, marketing_opt_in, terms_accepted_at, account_status, created_at, updated_at)
VALUES (
  ${sqlString(profileId)},
  ${sqlString(userId)},
  'Admin',
  'AllRound',
  0,
  ${now},
  'active',
  ${now},
  ${now}
);
`

  d1Execute(sql, { remote })
  console.log('DONE: admin user created.')
  console.log(`email=${email} role=${ROLE} target=${remote ? 'remote' : 'local'} userId=${userId}`)
  console.log('Unset ADMIN_BOOTSTRAP_PASSWORD in this shell when finished.')
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})
