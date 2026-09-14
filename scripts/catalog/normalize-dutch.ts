/**
 * Idempotent Dutch storefront normalization against D1.
 * Usage:
 *   npx tsx scripts/catalog/normalize-dutch.ts           # dry-run report
 *   npx tsx scripts/catalog/normalize-dutch.ts --apply   # write remote D1
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  extractSpecifications,
  looksGerman,
  normalizeDescription,
  normalizeProductTitle,
  normalizeSpecLabels,
} from '../lib/catalog-quality.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reportsDir = path.join(rootDir, 'data', 'import-reports')
const apply = process.argv.includes('--apply')
const remote = !process.argv.includes('--local')

type ProductRow = {
  id: string
  name: string
  description: string | null
  short_description: string | null
  specifications_json: string | null
  original_source_name: string | null
  seo_title: string | null
  seo_description: string | null
  quality_flags: string | null
  review_status: string | null
}

function sqlString(value: string | null | undefined) {
  if (value == null) return 'NULL'
  return `'${value.replaceAll("'", "''")}'`
}

function wranglerBin() {
  return path.join(rootDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
}

function d1Json<T>(sql: string): T[] {
  const raw = execFileSync(
    process.execPath,
    [
      wranglerBin(),
      'd1',
      'execute',
      'cloth',
      ...(remote ? ['--remote'] : ['--local']),
      '--json',
      '--command',
      sql,
    ],
    {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    },
  )
  const parsed = JSON.parse(raw) as Array<{ results: T[] }> | { results: T[] }
  return Array.isArray(parsed) ? parsed[0]?.results ?? [] : parsed.results ?? []
}

function d1ExecFile(filePath: string) {
  execFileSync(
    process.execPath,
    [
      wranglerBin(),
      'd1',
      'execute',
      'cloth',
      ...(remote ? ['--remote'] : ['--local']),
      '--file',
      filePath,
    ],
    { cwd: rootDir, encoding: 'utf8', stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 },
  )
}

function parseFlags(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function parseSpecs(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function main() {
  mkdirSync(reportsDir, { recursive: true })
  const products = d1Json<ProductRow>(
    `SELECT id, name, description, short_description, specifications_json, original_source_name, seo_title, seo_description, quality_flags, review_status FROM products`,
  )

  let titles = 0
  let descriptions = 0
  let specsNormalized = 0
  let needsReview = 0
  let unchanged = 0
  const remainingGerman: Array<{ id: string; name: string }> = []
  const updates: string[] = []

  for (const product of products) {
    const originalName = product.original_source_name || product.name
    const nextName = normalizeProductTitle(product.name)
    const descNorm = normalizeDescription(product.description ?? product.short_description)
    const existingSpecs = normalizeSpecLabels(parseSpecs(product.specifications_json))
    const extracted = extractSpecifications(
      `${product.description ?? ''} ${product.short_description ?? ''}`,
    )
    const mergedSpecs = { ...extracted, ...existingSpecs }
    const flags = new Set(parseFlags(product.quality_flags))
    flags.delete('translation_needs_review')
    flags.delete('translated')

    const stillGerman =
      looksGerman(nextName) ||
      looksGerman(descNorm.description ?? '') ||
      looksGerman(descNorm.shortDescription ?? '')
    if (stillGerman || descNorm.needsReview) {
      flags.add('translation_needs_review')
      needsReview += 1
      remainingGerman.push({ id: product.id, name: nextName })
    } else {
      flags.add('translated')
    }

    const seoTitle = nextName.slice(0, 70)
    const seoDescription = (descNorm.shortDescription ?? nextName).slice(0, 155)

    const changed =
      nextName !== product.name ||
      (descNorm.description ?? null) !== (product.description ?? null) ||
      (descNorm.shortDescription ?? null) !== (product.short_description ?? null) ||
      JSON.stringify(mergedSpecs) !== JSON.stringify(parseSpecs(product.specifications_json)) ||
      (product.original_source_name ?? null) !== originalName ||
      seoTitle !== (product.seo_title ?? '') ||
      seoDescription !== (product.seo_description ?? '')

    if (!changed) {
      unchanged += 1
      continue
    }

    if (nextName !== product.name) titles += 1
    if (
      (descNorm.description ?? null) !== (product.description ?? null) ||
      (descNorm.shortDescription ?? null) !== (product.short_description ?? null)
    ) {
      descriptions += 1
    }
    if (Object.keys(mergedSpecs).length) specsNormalized += 1

    updates.push(
      `UPDATE products SET name = ${sqlString(nextName)}, original_source_name = ${sqlString(originalName)}, short_description = ${sqlString(descNorm.shortDescription)}, description = ${sqlString(descNorm.description)}, specifications_json = ${sqlString(JSON.stringify(mergedSpecs))}, seo_title = ${sqlString(seoTitle)}, seo_description = ${sqlString(seoDescription)}, quality_flags = ${sqlString(JSON.stringify([...flags]))}, review_status = ${sqlString(stillGerman ? 'needs_review' : product.review_status === 'needs_review' ? 'ok' : product.review_status ?? 'ok')}, lead_time_min_days = 1, lead_time_max_days = 3, updated_at = ${Date.now()} WHERE id = ${sqlString(product.id)};`,
    )
  }

  const report = {
    processed: products.length,
    titlesNormalized: titles,
    descriptionsNormalized: descriptions,
    specificationSetsTouched: specsNormalized,
    productsNeedingReview: needsReview,
    unchanged,
    updatesPrepared: updates.length,
    remainingGermanCandidates: remainingGerman.slice(0, 40),
    applied: false,
  }

  writeFileSync(
    path.join(reportsDir, 'dutch-normalization-report.json'),
    JSON.stringify(report, null, 2),
  )
  writeFileSync(path.join(reportsDir, 'dutch-normalization.sql'), updates.join('\n'))

  if (apply && updates.length) {
    const chunkSize = 20
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize).join('\n')
      const chunkFile = path.join(reportsDir, `_dutch-chunk-${i}.sql`)
      writeFileSync(chunkFile, chunk)
      d1ExecFile(chunkFile)
      console.log(`Applied ${Math.min(i + chunkSize, updates.length)} / ${updates.length}`)
    }
    report.applied = true
    writeFileSync(
      path.join(reportsDir, 'dutch-normalization-report.json'),
      JSON.stringify(report, null, 2),
    )
  }

  writeFileSync(
    path.join(rootDir, 'CATALOG-DUTCH-NORMALIZATION-REPORT.md'),
    `# Catalog Dutch normalization report

- Products processed: **${report.processed}**
- Titles normalized: **${report.titlesNormalized}**
- Descriptions translated/normalized: **${report.descriptionsNormalized}**
- Specification sets touched: **${report.specificationSetsTouched}**
- Products needing manual review: **${report.productsNeedingReview}**
- Unchanged: **${report.unchanged}**
- Updates prepared: **${report.updatesPrepared}**
- Applied to D1: **${report.applied ? 'yes' : 'no (dry-run)'}**

## Remaining German candidates (sample)

${remainingGerman
  .slice(0, 25)
  .map((item) => `- \`${item.id}\` — ${item.name}`)
  .join('\n') || '_None flagged_'}

## Notes

- Original scraped titles preserved in \`original_source_name\` when missing.
- Official delivery policy fields forced to 1–3 business days.
- Brand/model tokens are not intentionally altered beyond known German ecommerce phrases.
- Products still matching German remnant detectors are flagged \`translation_needs_review\`.
`,
  )

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
