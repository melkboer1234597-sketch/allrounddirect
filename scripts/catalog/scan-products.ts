import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeCatalog, writeDryRunReports } from './analyze.ts'
import { logInfo } from '../lib/import-logger.ts'
import { defaultSourceDir } from '../lib/product-source-reader.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
config({ path: path.join(root, '.env.import.local') })

const { report } = analyzeCatalog(defaultSourceDir())
writeDryRunReports(report, root)
logInfo(`Gescand: ${report.productsFound} producten, ${report.imagesFound} afbeeldingen`)
logInfo(`Geldig: ${report.validProducts}, waarschuwingen: ${report.warningProducts}, ongeldig: ${report.invalidProducts}`)
