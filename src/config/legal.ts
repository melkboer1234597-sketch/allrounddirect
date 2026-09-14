/**
 * Bedrijfsgegevens en consent-versie.
 * Vul placeholders in vóór livegang. Teksten zijn concepten, geen juridische garantie.
 */

export const CONSENT_VERSION = 1

export const CONSENT_STORAGE_KEY = 'allround.consent'
export const CONSENT_COOKIE_NAME = 'allround_consent'
export const CONSENT_OPEN_EVENT = 'allround:open-consent'

/** Max-Age ~13 maanden. Geen device-fingerprint, alleen de keuze zelf. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 395

export const COMPANY = {
  tradingName: 'AllRound Direct',
  legalName: '[in te vullen: statutaire naam van de onderneming]',
  kvk: '[in te vullen: KVK-nummer]',
  vatId: '[in te vullen: btw-identificatienummer]',
  addressLine: '[in te vullen: vestigings- of postadres]',
  postalCodeCity: '[in te vullen: postcode en plaats]',
  country: 'Nederland',
  privacyEmail: '[in te vullen: privacy-e-mailadres]',
  supportEmail: '[in te vullen: klantenservice-e-mailadres]',
  phone: '[in te vullen: telefoonnummer]',
} as const

export const CONCEPT_NOTICE =
  'Deze tekst is een professioneel concept voor de webshop. De inhoud is nog niet juridisch vastgesteld. Definitieve algemene voorwaarden, privacytekst en cookieverklaring moeten vóór livegang juridisch worden gecontroleerd. U kunt aan dit concept geen rechten ontlenen alsof het een afgeronde wettelijke publicatie is.'

export const AP_URL = 'https://www.autoriteitpersoonsgegevens.nl/'

export type CookieCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing'

export type CookieInventoryRow = {
  name: string
  provider: string
  purpose: string
  category: CookieCategory
  duration: string
}

/**
 * Alleen cookies/storage die de applicatie nu daadwerkelijk gebruikt.
 * Geen analytics- of marketingcookies verzinnen.
 */
export const COOKIE_INVENTORY: CookieInventoryRow[] = [
  {
    name: 'better-auth.session_token',
    provider: COMPANY.tradingName,
    purpose: 'Inlogsessie van een account (HttpOnly).',
    category: 'necessary',
    duration: 'Tot het einde van de sessie of tot uitloggen, volgens de accountinstelling',
  },
  {
    name: CONSENT_COOKIE_NAME,
    provider: COMPANY.tradingName,
    purpose: 'Vastleggen van uw cookiekeuze (versie, tijdstip, categorieën).',
    category: 'necessary',
    duration: 'Tot ongeveer 13 maanden, of tot u de keuze wijzigt',
  },
  {
    name: CONSENT_STORAGE_KEY,
    provider: COMPANY.tradingName,
    purpose: 'Zelfde cookiekeuze in lokale opslag van de browser, zonder fingerprint.',
    category: 'necessary',
    duration: 'Tot u de gegevens wist of de keuze wijzigt',
  },
]

export const COOKIE_CATEGORY_COPY: Record<CookieCategory, { title: string; summary: string }> = {
  necessary: {
    title: 'Noodzakelijk',
    summary:
      'Nodig om de webshop te laten werken: sessie, winkelwagen, beveiliging en het onthouden van uw cookiekeuze. Deze categorie staat altijd aan.',
  },
  preferences: {
    title: 'Voorkeuren',
    summary:
      'Onthouden van keuzes die de site comfortabeler maken, bijvoorbeeld weergave. Alleen na toestemming.',
  },
  analytics: {
    title: 'Analytics',
    summary:
      'Helpt ons te begrijpen hoe de site wordt gebruikt, zodat we knelpunten kunnen verbeteren. Scripts worden niet geladen zonder toestemming. Er is nu geen analytics-script actief.',
  },
  marketing: {
    title: 'Marketing',
    summary:
      'Kan worden gebruikt voor gerichte uitingen of pixels van derden. Scripts worden niet geladen zonder toestemming. Er is nu geen marketingpixel actief.',
  },
}
