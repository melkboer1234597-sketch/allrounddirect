export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type LegalDoc = {
  path: string
  title: string
  description: string
  intro: string
  sections: LegalSection[]
}
