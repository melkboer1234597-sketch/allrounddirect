import { LegalDocument, LegalHubLinks } from '@/components/legal/LegalDocument'
import { cookiesDoc } from '@/content/legal/cookies'
import { deliveryDoc } from '@/content/legal/delivery'
import { privacyDoc } from '@/content/legal/privacy'
import {
  businessTermsDoc,
  disclaimerDoc,
  paymentDoc,
  returnsDoc,
  warrantyDoc,
} from '@/content/legal/service'
import { termsDoc } from '@/content/legal/terms'

export function LegalPrivacyPage() {
  return <LegalDocument doc={privacyDoc} />
}

export function LegalCookiesPage() {
  return <LegalDocument doc={cookiesDoc} />
}

export function LegalTermsPage() {
  return <LegalDocument doc={termsDoc} extra={<LegalHubLinks />} />
}

export function LegalDeliveryPage() {
  return <LegalDocument doc={deliveryDoc} />
}

export function LegalReturnsPage() {
  return <LegalDocument doc={returnsDoc} extra={<LegalHubLinks />} />
}

export function LegalWarrantyPage() {
  return <LegalDocument doc={warrantyDoc} />
}

export function LegalPaymentPage() {
  return <LegalDocument doc={paymentDoc} />
}

export function LegalDisclaimerPage() {
  return <LegalDocument doc={disclaimerDoc} />
}

export function LegalBusinessTermsPage() {
  return <LegalDocument doc={businessTermsDoc} />
}
