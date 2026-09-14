import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main" className="skip-link">
        Ga naar inhoud
      </a>
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
