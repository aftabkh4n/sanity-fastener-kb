import 'dotenv/config'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createClient} from '@sanity/client'

type SanityDocumentLike = {_id: string; _type: string; [key: string]: unknown}

const projectId = process.env.SANITY_PROJECT_ID || 'tko9cbz7'
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01'
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN in environment. Copy .env.example to .env and set it.')
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

type Ref = {_type: 'reference'; _ref: string}
const ref = (id: string): Ref => ({_type: 'reference', _ref: id})

const standardId = (code: string) => `standard-${code.toLowerCase().replace(/\s+/g, '-')}`
const fastenerTypeId = (name: string) => `fastenerType-${name.replace(/\s+/g, '-')}`
const propertyClassId = (grade: string) =>
  `propertyClass-${grade.toLowerCase().replace(/[.\s]/g, '-')}`
const sizeSpecId = (standardCode: string, size: string) =>
  `sizeSpec-${standardCode.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`

const standards: {code: string; body: 'DIN' | 'ISO'; title: string; notes?: string}[] = [
  {code: 'DIN 931', body: 'DIN', title: 'Hexagon head bolts, partially threaded'},
  {
    code: 'DIN 933',
    body: 'DIN',
    title: 'Hexagon head screws, fully threaded',
    notes:
      'M14 across-flats is a known source discrepancy: the original DIN 933 value is 22 mm (Wermac), but the Westfield Fasteners specification sheet lists 21 mm under the DIN heading, which is actually the ISO 4017 value. This dataset uses 22 mm for DIN 933 and 21 mm for ISO 4017.',
  },
  {code: 'DIN 934', body: 'DIN', title: 'Hexagon nuts, style 1'},
  {code: 'DIN 125', body: 'DIN', title: 'Plain washers, product grade A'},
  {code: 'ISO 4014', body: 'ISO', title: 'Hexagon head bolts, product grades A and B'},
  {code: 'ISO 4017', body: 'ISO', title: 'Hexagon head screws, product grades A and B'},
  {code: 'ISO 4032', body: 'ISO', title: 'Hexagon regular nuts, style 1'},
  {code: 'ISO 7089', body: 'ISO', title: 'Plain washers, normal series, product grade A'},
]

const fastenerTypes: {name: 'bolt' | 'set screw' | 'nut' | 'washer'; description: string}[] = [
  {name: 'bolt', description: 'Externally threaded fastener with a head, typically used with a nut.'},
  {name: 'set screw', description: 'Fully threaded screw driven into a tapped hole.'},
  {name: 'nut', description: 'Internally threaded fastener that mates with a bolt or stud.'},
  {name: 'washer', description: 'Flat annular disc used to distribute load under a nut or bolt head.'},
]

const propertyClasses: {
  grade: string
  material: 'carbon steel' | 'alloy steel' | 'stainless A2' | 'stainless A4'
}[] = [
  {grade: '8.8', material: 'carbon steel'},
  {grade: '10.9', material: 'alloy steel'},
  {grade: '12.9', material: 'alloy steel'},
  {grade: 'A2-70', material: 'stainless A2'},
  {grade: 'A4-80', material: 'stainless A4'},
]

type Entry = {
  standard: string
  nominalSize: string
  pitchCoarseMm: number | null
  pitchFineMm: number | null
  acrossFlatsMm: number | null
  headHeightMm: number | null
  sourceUrl: string
  notes?: string
}

type DataFile = {entries: Entry[]}

const dataPath = resolve(process.cwd(), 'data/din933-iso4017.json')
const data: DataFile = JSON.parse(readFileSync(dataPath, 'utf-8'))
const entries = data.entries

const boltSizes = ['M6', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20', 'M22', 'M24']
const seededStandards = ['DIN 933', 'ISO 4017']

function keyFor(standard: string, size: string) {
  return `${standard}::${size}`
}
const entryIndex = new Map<string, Entry>()
for (const e of entries) entryIndex.set(keyFor(e.standard, e.nominalSize), e)

for (const s of seededStandards) {
  for (const size of boltSizes) {
    if (!entryIndex.has(keyFor(s, size))) {
      console.error(`Missing entry in JSON for ${s} ${size}`)
      process.exit(1)
    }
  }
}

const ATTRIBUTES: {
  key: 'pitchCoarseMm' | 'pitchFineMm' | 'acrossFlatsMm' | 'headHeightMm'
  label: 'pitch' | 'across flats' | 'head height'
  unit: string
}[] = [
  {key: 'pitchCoarseMm', label: 'pitch', unit: 'mm'},
  {key: 'pitchFineMm', label: 'pitch', unit: 'mm'},
  {key: 'acrossFlatsMm', label: 'across flats', unit: 'mm'},
  {key: 'headHeightMm', label: 'head height', unit: 'mm'},
]

function practicalImpactFor(
  attribute: string,
  size: string,
  fromValue: number,
  toValue: number,
  unit: string,
) {
  if (attribute === 'across flats') {
    return `Different spanner needed at ${size}: ${fromValue} ${unit} for DIN 933, ${toValue} ${unit} for ISO 4017.`
  }
  if (attribute === 'head height') {
    return `Head height at ${size} differs: ${fromValue} ${unit} (DIN) vs ${toValue} ${unit} (ISO).`
  }
  if (attribute === 'pitch') {
    return `Thread pitch at ${size} differs: ${fromValue} ${unit} (DIN) vs ${toValue} ${unit} (ISO).`
  }
  return `${attribute} at ${size} differs: ${fromValue} ${unit} vs ${toValue} ${unit}.`
}

function buildDifferences() {
  const diffs: Record<string, unknown>[] = []
  for (const size of boltSizes) {
    const din = entryIndex.get(keyFor('DIN 933', size))!
    const iso = entryIndex.get(keyFor('ISO 4017', size))!
    for (const attr of ATTRIBUTES) {
      const from = din[attr.key]
      const to = iso[attr.key]
      if (from == null || to == null) continue
      if (from === to) continue
      const attrSlug = attr.label.replace(/\s+/g, '-')
      const keySlug = `diff-${size.toLowerCase()}-${attrSlug}`
      const extraNote =
        attr.label === 'across flats' && size === 'M22'
          ? ' Note: M22 is the only size in this range where the ISO across-flats is LARGER than the DIN value.'
          : ''
      diffs.push({
        _key: keySlug,
        _type: 'difference',
        nominalSize: size,
        attribute: attr.label,
        fromValue: from,
        toValue: to,
        unit: attr.unit,
        practicalImpact:
          practicalImpactFor(attr.label, size, from as number, to as number, attr.unit) + extraNote,
      })
    }
  }
  return diffs
}

async function run() {
  const now = new Date().toISOString()
  const docs: SanityDocumentLike[] = []

  for (const s of standards) {
    const doc: SanityDocumentLike = {
      _id: standardId(s.code),
      _type: 'standard',
      code: s.code,
      body: s.body,
      title: s.title,
      status: 'current',
    }
    if (s.notes) doc.notes = s.notes
    docs.push(doc)
  }

  for (const t of fastenerTypes) {
    docs.push({
      _id: fastenerTypeId(t.name),
      _type: 'fastenerType',
      name: t.name,
      slug: {_type: 'slug', current: t.name.replace(/\s+/g, '-')},
      description: t.description,
    })
  }

  for (const p of propertyClasses) {
    docs.push({
      _id: propertyClassId(p.grade),
      _type: 'propertyClass',
      grade: p.grade,
      material: p.material,
    })
  }

  for (const standardCode of seededStandards) {
    for (const size of boltSizes) {
      const e = entryIndex.get(keyFor(standardCode, size))!
      const doc: SanityDocumentLike = {
        _id: sizeSpecId(standardCode, size),
        _type: 'sizeSpec',
        standard: ref(standardId(standardCode)),
        fastenerType: ref(fastenerTypeId('bolt')),
        kind: 'bolt',
        nominalSize: size,
        verified: false,
        sourceUrl: e.sourceUrl,
      }
      if (e.pitchCoarseMm != null) doc.pitchCoarseMm = e.pitchCoarseMm
      if (e.pitchFineMm != null) doc.pitchFineMm = e.pitchFineMm
      if (e.acrossFlatsMm != null) doc.acrossFlatsMm = e.acrossFlatsMm
      if (e.headHeightMm != null) doc.headHeightMm = e.headHeightMm
      if (e.notes) doc.notes = e.notes
      docs.push(doc)
    }
  }

  const differences = buildDifferences()
  const affectedSizes = Array.from(new Set(differences.map((d) => d.nominalSize as string)))

  const summary = [
    'DIN 933 and ISO 4017 both cover fully threaded hexagon head screws.',
    `In the M6-M24 range covered by this dataset, the standards diverge only on across-flats width, and only at ${affectedSizes.join(', ')}.`,
    'Thread pitch and head height are identical.',
    'For M10, M12 and M14 the ISO across-flats is smaller than the DIN value; for M22 the ISO across-flats is LARGER than the DIN value (32 mm DIN vs 34 mm ISO).',
    'Parts are interchangeable in thread and load path but not in wrench size, so a DIN wrench set will not fully cover ISO 4017 stock and vice versa.',
  ].join(' ')

  docs.push({
    _id: 'equivalence-din-933-iso-4017',
    _type: 'equivalence',
    fromSpec: ref(standardId('DIN 933')),
    toSpec: ref(standardId('ISO 4017')),
    relationship: 'near equivalent',
    summary,
    differences,
  })

  console.log(`Seeding ${docs.length} documents into ${projectId}/${dataset} at ${now}`)

  const tx = client.transaction()
  for (const doc of docs) tx.createOrReplace(doc)
  const result = await tx.commit()

  console.log(`Committed transaction ${result.transactionId}. Documents upserted: ${docs.length}.`)
  console.log(`Equivalence differences seeded: ${differences.length}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
