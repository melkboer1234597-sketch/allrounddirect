/**
 * Wijs een interne rol toe. Nooit via publieke registratie.
 * Voorbeeld: node scripts/set-role.mjs --email=iemand@allrounddirect.com --role=super_admin --local
 * Remote:     node scripts/set-role.mjs --email=iemand@allrounddirect.com --role=super_admin --remote
 *
 * Voor nieuwe admin-accounts met wachtwoord: npm run admin:bootstrap
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const args = Object.fromEntries(
  process.argv.slice(2).map((item) => {
    const [key, ...rest] = item.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const email = String(args.email ?? '').trim().toLowerCase()
const role = String(args.role ?? '').trim()
const remote = 'remote' in args || args.remote === 'true'
const allowed = ['customer', 'admin', 'super_admin', 'catalog_manager', 'order_manager', 'support']

if (!email || !allowed.includes(role)) {
  console.error(
    'Gebruik: node scripts/set-role.mjs --email=user@host --role=super_admin [--local|--remote]',
  )
  process.exit(1)
}

const sql = `UPDATE user SET role = '${role.replace(/'/g, "''")}', updated_at = ${Date.now()} WHERE email = '${email.replace(/'/g, "''")}';`
const dir = mkdtempSync(join(tmpdir(), 'ard-set-role-'))
const file = join(dir, 'set-role.sql')
writeFileSync(file, sql, { encoding: 'utf8', mode: 0o600 })

const wranglerArgs = ['wrangler', 'd1', 'execute', 'cloth', '--yes', '--file', file]
if (remote) wranglerArgs.push('--remote')
else wranglerArgs.push('--local')

try {
  const result = spawnSync('npx', wranglerArgs, { stdio: 'inherit', shell: true })
  process.exit(result.status ?? 1)
} finally {
  try {
    unlinkSync(file)
  } catch {
    /* ignore */
  }
}
