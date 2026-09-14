import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CONSENT_OPEN_EVENT } from '@/config/legal'
import {
  ALL_ACCEPTED,
  consentIsCurrent,
  DEFAULT_OPTIONAL_OFF,
  necessaryOnly,
  persistConsent,
  readStoredConsent,
  type ConsentCategories,
  type ConsentRecord,
} from '@/lib/consent'
import { CookieBanner } from './CookieBanner'
import { ConsentPreferences } from './ConsentPreferences'
import { ConsentScripts } from './ConsentScripts'

type ConsentContextValue = {
  record: ConsentRecord | null
  bannerVisible: boolean
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  acceptAll: () => void
  rejectOptional: () => void
  saveSelection: (categories: ConsentCategories) => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const value = useContext(ConsentContext)
  if (!value) throw new Error('useConsent moet binnen ConsentProvider')
  return value
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setRecord(readStoredConsent())
    setHydrated(true)
  }, [])

  const openPanel = useCallback(() => setPanelOpen(true), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])

  useEffect(() => {
    const onOpen = () => {
      setPanelOpen(true)
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen)
  }, [])

  const commit = useCallback((categories: ConsentCategories) => {
    const next = persistConsent(categories)
    setRecord(next)
    setPanelOpen(false)
  }, [])

  const value = useMemo<ConsentContextValue>(
    () => ({
      record,
      bannerVisible: hydrated && !consentIsCurrent(record),
      panelOpen,
      openPanel,
      closePanel,
      acceptAll: () => commit(ALL_ACCEPTED),
      rejectOptional: () => commit(necessaryOnly()),
      saveSelection: commit,
    }),
    [record, hydrated, panelOpen, openPanel, closePanel, commit],
  )

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <ConsentScripts record={consentIsCurrent(record) ? record : null} />
      {hydrated ? (
        <CookieBanner
          visible={value.bannerVisible && !value.panelOpen}
          onNecessary={value.rejectOptional}
          onPreferences={openPanel}
          onAcceptAll={value.acceptAll}
        />
      ) : null}
      {panelOpen ? (
        <ConsentPreferences
          initial={record?.categories ?? DEFAULT_OPTIONAL_OFF}
          onClose={closePanel}
          onSave={commit}
          onAcceptAll={() => commit(ALL_ACCEPTED)}
        />
      ) : null}
    </ConsentContext.Provider>
  )
}
