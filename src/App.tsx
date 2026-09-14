import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

const PLACEHOLDER_PATHS = [
  'meubels',
  'vloeren',
  'keuken',
  'koelen-vriezen',
  'horeca',
  'wonen',
  'zakelijk',
  'outlet',
  'over-ons',
  'contact',
  'klantenservice',
  'bezorgen',
  'retourneren',
  'veelgestelde-vragen',
  'privacy',
  'cookies',
  'algemene-voorwaarden',
  'disclaimer',
  'account',
  'favorieten',
  'winkelwagen',
  'offerte',
  'projecten',
  'montage',
  'bestelling-volgen',
  'zoeken',
  'assortiment',
] as const

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        {PLACEHOLDER_PATHS.map((path) => (
          <Route key={path} path={path} element={<PlaceholderPage />} />
        ))}
        <Route path="*" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  )
}
