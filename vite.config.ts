import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { ROBOTS_DISALLOW } from './shared/seo-routes.ts'
import {
  categorySitemapUrls,
  contentSitemapUrls,
  sitemapIndexFiles,
  sitemapIndexXml,
  staticSitemapUrls,
  urlsetXml,
} from './shared/sitemaps.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function writeSeoFiles(outDir: string, origin: string) {
  const disallow = ROBOTS_DISALLOW.map((item) => `Disallow: ${item}`).join('\n')
  const sitemapLine = origin ? `\nSitemap: ${origin}/sitemap.xml\n` : '\n'
  const robots = `# robots.txt stuurt crawlers; het is geen beveiliging.\nUser-agent: *\nAllow: /\n${disallow}\n${sitemapLine}`
  const locOrigin = origin || 'https://www.allrounddirect.nl'

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'robots.txt'), robots)
  fs.writeFileSync(
    path.join(outDir, 'sitemap.xml'),
    sitemapIndexXml(locOrigin, sitemapIndexFiles(1)),
  )
  fs.writeFileSync(
    path.join(outDir, 'sitemap-static.xml'),
    urlsetXml(locOrigin, staticSitemapUrls()),
  )
  fs.writeFileSync(
    path.join(outDir, 'sitemap-categories.xml'),
    urlsetXml(locOrigin, categorySitemapUrls()),
  )
  fs.writeFileSync(
    path.join(outDir, 'sitemap-content.xml'),
    urlsetXml(locOrigin, contentSitemapUrls()),
  )
  fs.writeFileSync(path.join(outDir, 'sitemap-products.xml'), urlsetXml(locOrigin, []))
}

function seoFilesPlugin(origin: string): Plugin {
  return {
    name: 'allround-seo-files',
    buildStart() {
      writeSeoFiles(path.join(rootDir, 'public'), origin)
    },
    closeBundle() {
      const distDir = path.join(rootDir, 'dist')
      if (fs.existsSync(distDir)) writeSeoFiles(distDir, origin)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const origin = (env.VITE_SITE_URL ?? '').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss(), seoFilesPlugin(origin)],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
        '/media/products': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('/src/admin/')) return 'admin'
            if (id.includes('/src/pages/legal/')) return 'legal'
            if (id.includes('/src/pages/advies/')) return 'advies'
            return undefined
          },
        },
      },
    },
  }
})
