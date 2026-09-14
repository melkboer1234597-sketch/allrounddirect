export type FolderMapping = {
  folder: string
  parentSlug: string
  categorySlug: string
  parentName: string
  categoryName: string
}

export const FOLDER_MAP: FolderMapping[] = [
  {
    folder: 'Banken',
    parentSlug: 'meubels',
    categorySlug: 'banken',
    parentName: 'Meubels',
    categoryName: 'Banken',
  },
  {
    folder: 'Fauteuils',
    parentSlug: 'meubels',
    categorySlug: 'fauteuils',
    parentName: 'Meubels',
    categoryName: 'Fauteuils',
  },
  {
    folder: 'Stoelen',
    parentSlug: 'meubels',
    categorySlug: 'stoelen',
    parentName: 'Meubels',
    categoryName: 'Stoelen',
  },
  {
    folder: 'Tafels',
    parentSlug: 'meubels',
    categorySlug: 'eettafels',
    parentName: 'Meubels',
    categoryName: 'Tafels',
  },
  {
    folder: 'Kasten',
    parentSlug: 'meubels',
    categorySlug: 'kasten',
    parentName: 'Meubels',
    categoryName: 'Kasten',
  },
  {
    folder: 'Bedden',
    parentSlug: 'meubels',
    categorySlug: 'bedden',
    parentName: 'Meubels',
    categoryName: 'Bedden',
  },
  {
    folder: 'Tuinmeubels',
    parentSlug: 'wonen',
    categorySlug: 'tuinmeubels',
    parentName: 'Wonen',
    categoryName: 'Tuinmeubels',
  },
  {
    folder: 'Vloeren',
    parentSlug: 'vloeren',
    categorySlug: 'vloeren',
    parentName: 'Vloeren',
    categoryName: 'Vloeren',
  },
  {
    folder: 'Tegels',
    parentSlug: 'vloeren',
    categorySlug: 'tegels',
    parentName: 'Vloeren',
    categoryName: 'Tegels',
  },
  {
    folder: 'Deuren',
    parentSlug: 'wonen',
    categorySlug: 'deuren',
    parentName: 'Wonen',
    categoryName: 'Deuren',
  },
  {
    folder: 'Keukens',
    parentSlug: 'keuken',
    categorySlug: 'keukenkasten',
    parentName: 'Keuken',
    categoryName: 'Keukens',
  },
  {
    folder: 'Ovens',
    parentSlug: 'keuken',
    categorySlug: 'keukenapparatuur',
    parentName: 'Keuken',
    categoryName: 'Ovens',
  },
  {
    folder: 'Magnetrons',
    parentSlug: 'keuken',
    categorySlug: 'keukenapparatuur',
    parentName: 'Keuken',
    categoryName: 'Magnetrons',
  },
  {
    folder: 'Koelkasten',
    parentSlug: 'koelen-vriezen',
    categorySlug: 'koelkasten',
    parentName: 'Koelen & Vriezen',
    categoryName: 'Koelkasten',
  },
  {
    folder: 'Wasmachines',
    parentSlug: 'huishouden',
    categorySlug: 'wasmachines',
    parentName: 'Huishouden',
    categoryName: 'Wasmachines',
  },
  {
    folder: 'Gastro',
    parentSlug: 'horeca',
    categorySlug: 'kookapparatuur',
    parentName: 'Horeca',
    categoryName: 'Gastro',
  },
]

export function mappingForFolder(folder: string): FolderMapping | undefined {
  return FOLDER_MAP.find((item) => item.folder === folder)
}

export function refineVloerenSlug(name: string): string {
  const hay = name.toLowerCase()
  if (hay.includes('tegel')) return 'tegels'
  if (hay.includes('laminaat') || hay.includes('laminat')) return 'laminaat'
  if (hay.includes('parket') || hay.includes('parkett')) return 'parket'
  if (hay.includes('plak') || hay.includes('klebe')) return 'plak-pvc'
  if (
    hay.includes('klik') ||
    hay.includes('klick') ||
    hay.includes('vinyl') ||
    hay.includes('pvc') ||
    hay.includes('designvloer')
  ) {
    return 'klik-pvc'
  }
  return 'vloeren'
}
