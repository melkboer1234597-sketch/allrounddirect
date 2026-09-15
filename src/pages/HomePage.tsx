import { SeoHead } from '@/components/seo/SeoHead'
import { SITE } from '@/config/site'
import { Hero } from '@/components/home/Hero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustStrip } from '@/components/home/TrustStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FlooringServiceSection } from '@/components/home/FlooringServiceSection'
import { BusinessSection } from '@/components/home/BusinessSection'
import { DeliverySection } from '@/components/home/DeliverySection'
import { OutletSection } from '@/components/home/OutletSection'
import { AboutSection } from '@/components/home/AboutSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export function HomePage() {
  return (
    <>
      <SeoHead
        title={SITE.defaultTitle}
        description={SITE.defaultDescription}
        path="/"
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
        <DeliverySection />
        <OutletSection />
        <AboutSection />
        <NewsletterSection />
      </main>
    </>
  )
}
