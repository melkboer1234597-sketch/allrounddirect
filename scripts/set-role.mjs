/**
 * Wijs een interne rol toe. Nooit via publieke registratie.
 * Voorbeeld: node scripts/set-role.mjs --email=iemand@allrounddirect.nl --role=super_admin --local
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).map((item) => {
    const [key, ...rest] = item.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const email = String(args.email ?? '').trim().toLowerCase()
const role = String(args.role ?? '').trim()
const local = 'local' in args || args.local === 'true'
const allowed = ['customer', 'admin', 'super_admin', 'catalog_manager', 'order_manager', 'support']

if (!email || !allowed.includes(role)) {
  console.error('Gebruik: node scripts/set-role.mjs --email=user@host --role=super_admin [--local]')
  process.exit(1)
}

const sql = `UPDATE user SET role = '${role.replace(/'/g, "''")}' WHERE email = '${email.replace(/'/g, "''")}';`
const file = join(process.cwd(), '.tmp-set-role.sql')
writeFileSync(file, sql, 'utf8')

const wranglerArgs = ['wrangler', 'd1', 'execute', 'allround-webshop-db', '--yes', '--file', file]
if (local) wranglerArgs.push('--local')

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
