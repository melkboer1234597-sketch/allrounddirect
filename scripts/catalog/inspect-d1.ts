import { config } from 'dotenv'
import { d1Query } from '../lib/d1-client.ts'

config({ path: '.env.import.local' })

const rows = await d1Query<{ name: string }>(
  "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
)
console.log(rows.map((row) => row.name).join('\n'))
const cols = await d1Query<{ name: string }>('PRAGMA table_info(products)')
console.log('--- products columns ---')
console.log(cols.map((row) => row.name).join(', '))
