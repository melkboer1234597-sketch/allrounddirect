export type FilterControl = 'enum' | 'range' | 'boolean'

export type FilterOption = {
  value: string
  label: string
}

export type FilterDefinition = {
  id: string
  label: string
  type: FilterControl
  unit?: string
  options?: FilterOption[]
}

export const FILTER_SCHEMAS: Record<string, FilterDefinition[]> = {
  generic: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    {
      id: 'brand',
      label: 'Merk',
      type: 'enum',
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'backorder', label: 'Nalevering' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
    {
      id: 'leadTime',
      label: 'Levertijd',
      type: 'enum',
      options: [{ value: '1-3 werkdagen', label: '1-3 werkdagen' }],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
  furniture: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'color',
      label: 'Kleur',
      type: 'enum',
      options: [
        { value: 'beige', label: 'Beige' },
        { value: 'grijs', label: 'Grijs' },
        { value: 'zwart', label: 'Zwart' },
        { value: 'groen', label: 'Groen' },
        { value: 'bruin', label: 'Bruin' },
      ],
    },
    {
      id: 'material',
      label: 'Materiaal',
      type: 'enum',
      options: [
        { value: 'stof', label: 'Stof' },
        { value: 'leerlook', label: 'Leerlook' },
        { value: 'hout', label: 'Hout' },
        { value: 'metaal', label: 'Metaal' },
      ],
    },
    { id: 'width', label: 'Breedte (cm)', type: 'range' },
    { id: 'height', label: 'Hoogte (cm)', type: 'range' },
    { id: 'depth', label: 'Diepte (cm)', type: 'range' },
    {
      id: 'seats',
      label: 'Zitplaatsen',
      type: 'enum',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4+' },
      ],
    },
    {
      id: 'style',
      label: 'Stijl',
      type: 'enum',
      options: [
        { value: 'modern', label: 'Modern' },
        { value: 'landelijk', label: 'Landelijk' },
        { value: 'industrieel', label: 'Industrieel' },
      ],
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'backorder', label: 'Nalevering' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
    {
      id: 'leadTime',
      label: 'Levertijd',
      type: 'enum',
      options: [{ value: '1-3 werkdagen', label: '1-3 werkdagen' }],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
  flooring: [
    { id: 'price', label: 'Prijs per m²', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'floorType',
      label: 'Type',
      type: 'enum',
      options: [
        { value: 'pvc', label: 'PVC' },
        { value: 'laminaat', label: 'Laminaat' },
        { value: 'parket', label: 'Parket' },
        { value: 'tegel', label: 'Tegel' },
        { value: 'accessoire', label: 'Accessoire' },
      ],
    },
    {
      id: 'color',
      label: 'Kleur',
      type: 'enum',
      options: [
        { value: 'eiken', label: 'Eiken' },
        { value: 'grijs', label: 'Grijs' },
        { value: 'wit', label: 'Wit' },
        { value: 'donker', label: 'Donker' },
      ],
    },
    {
      id: 'material',
      label: 'Materiaal',
      type: 'enum',
      options: [
        { value: 'pvc', label: 'PVC' },
        { value: 'hdf', label: 'HDF' },
        { value: 'hout', label: 'Hout' },
      ],
    },
    { id: 'thickness', label: 'Dikte (mm)', type: 'range' },
    { id: 'underfloorHeating', label: 'Vloerverwarming', type: 'boolean' },
    { id: 'waterproof', label: 'Waterbestendig', type: 'boolean' },
    {
      id: 'usageClass',
      label: 'Gebruiksklasse',
      type: 'enum',
      options: [
        { value: '21', label: '21' },
        { value: '23', label: '23' },
        { value: '32', label: '32' },
        { value: '33', label: '33' },
      ],
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'backorder', label: 'Nalevering' },
      ],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
  kitchen: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'color',
      label: 'Kleur',
      type: 'enum',
      options: [
        { value: 'zwart', label: 'Zwart' },
        { value: 'wit', label: 'Wit' },
        { value: 'rvs', label: 'RVS' },
        { value: 'eiken', label: 'Eiken' },
      ],
    },
    {
      id: 'material',
      label: 'Materiaal',
      type: 'enum',
      options: [
        { value: 'rvs', label: 'RVS' },
        { value: 'composiet', label: 'Composiet' },
        { value: 'hout', label: 'Hout' },
        { value: 'metaal', label: 'Metaal' },
      ],
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
  cooling: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    { id: 'capacity', label: 'Inhoud (liter)', type: 'range' },
    {
      id: 'tempRange',
      label: 'Temperatuurbereik',
      type: 'enum',
      options: [
        { value: 'koel', label: 'Koelen' },
        { value: 'vries', label: 'Vriezen' },
        { value: 'combi', label: 'Combi' },
      ],
    },
    { id: 'width', label: 'Breedte (cm)', type: 'range' },
    { id: 'height', label: 'Hoogte (cm)', type: 'range' },
    {
      id: 'energy',
      label: 'Energieklasse',
      type: 'enum',
      options: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
      ],
    },
    {
      id: 'doors',
      label: 'Deuren',
      type: 'enum',
      options: [
        { value: '1', label: '1 deur' },
        { value: '2', label: '2 deuren' },
        { value: '3', label: '3 deuren' },
      ],
    },
    {
      id: 'audience',
      label: 'Gebruik',
      type: 'enum',
      options: [
        { value: 'particulier', label: 'Particulier' },
        { value: 'professioneel', label: 'Professioneel' },
      ],
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
  ],
  horeca: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'productType',
      label: 'Producttype',
      type: 'enum',
      options: [
        { value: 'koeling', label: 'Koeling' },
        { value: 'koken', label: 'Koken' },
        { value: 'meubel', label: 'Meubel' },
        { value: 'spoelen', label: 'Spoelen' },
      ],
    },
    { id: 'capacity', label: 'Capaciteit', type: 'range' },
    { id: 'power', label: 'Vermogen (kW)', type: 'range' },
    {
      id: 'connection',
      label: 'Aansluiting',
      type: 'enum',
      options: [
        { value: '230V', label: '230V' },
        { value: '400V', label: '400V' },
        { value: 'gas', label: 'Gas' },
      ],
    },
    {
      id: 'material',
      label: 'Materiaal',
      type: 'enum',
      options: [
        { value: 'rvs', label: 'RVS' },
        { value: 'metaal', label: 'Metaal' },
        { value: 'hout', label: 'Hout' },
      ],
    },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
  ],
  living: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'color',
      label: 'Kleur',
      type: 'enum',
      options: [
        { value: 'beige', label: 'Beige' },
        { value: 'zwart', label: 'Zwart' },
        { value: 'wit', label: 'Wit' },
      ],
    },
    {
      id: 'material',
      label: 'Materiaal',
      type: 'enum',
      options: [
        { value: 'stof', label: 'Stof' },
        { value: 'hout', label: 'Hout' },
        { value: 'metaal', label: 'Metaal' },
      ],
    },
    {
      id: 'style',
      label: 'Stijl',
      type: 'enum',
      options: [
        { value: 'modern', label: 'Modern' },
        { value: 'landelijk', label: 'Landelijk' },
      ],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
  business: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [
        { value: 'in_stock', label: 'Op voorraad' },
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
    {
      id: 'leadTime',
      label: 'Levertijd',
      type: 'enum',
      options: [{ value: '1-3 werkdagen', label: '1-3 werkdagen' }],
    },
  ],
  outlet: [
    { id: 'price', label: 'Prijs', type: 'range', unit: 'EUR' },
    { id: 'brand', label: 'Merk', type: 'enum' },
    {
      id: 'availability',
      label: 'Beschikbaarheid',
      type: 'enum',
      options: [{ value: 'in_stock', label: 'Beperkt beschikbaar' }],
    },
    { id: 'outlet', label: 'Outlet', type: 'boolean' },
  ],
}
