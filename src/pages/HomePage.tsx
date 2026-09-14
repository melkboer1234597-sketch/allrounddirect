import { SeoHead } from '@/components/seo/SeoHead'
import { SITE } from '@/config/site'
import { assets } from '@/lib/assets'
import { Hero } from '@/components/home/Hero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustStrip } from '@/components/home/TrustStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FlooringServiceSection } from '@/components/home/FlooringServiceSection'
import { BusinessSection } from '@/components/home/BusinessSection'
import { OutletSection } from '@/components/home/OutletSection'
import { DeliverySection } from '@/components/home/DeliverySection'
import { AboutSection } from '@/components/home/AboutSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export function HomePage() {
  return (
    <>
      <SeoHead
        title={SITE.defaultTitle}
        description={SITE.defaultDescription}
        path="/"
        image={assets.hero}
        imageAlt="Open woonkeuken met bank, eettafel, houten vloer en keuken"
        includeWebsiteSchema
        robots="index,follow"
      />
      <main id="main">
        <Hero />
        <CategoryGrid />
        <TrustStrip />
        <FeaturedProducts />
        <FlooringServiceSection />
        <BusinessSection />
        <OutletSection />
        <DeliverySection />
        <AboutSection />
        <NewsletterSection />
      </main>
    </>
  )
}
