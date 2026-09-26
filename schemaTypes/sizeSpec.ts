import {defineType, defineField} from 'sanity'
import {NumberIcon} from '@sanity/icons/Number'

type Kind = 'bolt' | 'set screw' | 'nut' | 'washer'

const KIND_OPTIONS: {title: string; value: Kind}[] = [
  {title: 'Bolt', value: 'bolt'},
  {title: 'Set screw', value: 'set screw'},
  {title: 'Nut', value: 'nut'},
  {title: 'Washer', value: 'washer'},
]

const kindOf = (parent: unknown): Kind | undefined => {
  const p = parent as {kind?: Kind} | undefined
  return p?.kind
}

const isBoltLike = (parent: unknown) => {
  const k = kindOf(parent)
  return k !== 'bolt' && k !== 'set screw'
}

const isNut = (parent: unknown) => kindOf(parent) !== 'nut'
const isWasher = (parent: unknown) => kindOf(parent) !== 'washer'

export const sizeSpec = defineType({
  name: 'sizeSpec',
  title: 'Size spec',
  type: 'document',
  icon: NumberIcon,
  fields: [
    defineField({
      name: 'standard',
      title: 'Standard',
      type: 'reference',
      to: [{type: 'standard'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fastenerType',
      title: 'Fastener type',
      type: 'reference',
      to: [{type: 'fastenerType'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description:
        'Drives which dimension fields are shown. Must match the "name" of the referenced fastener type.',
      options: {list: KIND_OPTIONS, layout: 'radio'},
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          const parent = context.parent as {fastenerType?: {_ref?: string}} | undefined
          const ref = parent?.fastenerType?._ref
          if (!value || !ref) return true
          const client = context.getClient({apiVersion: '2024-01-01'})
          const referencedName = await client.fetch<string | null>(
            '*[_id == $id][0].name',
            {id: ref},
          )
          if (!referencedName) return true
          return referencedName === value
            ? true
            : `Kind "${value}" does not match the referenced fastener type ("${referencedName}").`
        }),
    }),
    defineField({
      name: 'nominalSize',
      title: 'Nominal size',
      type: 'string',
      description: 'Metric designation, e.g. "M12".',
      validation: (rule) =>
        rule
          .required()
          .regex(/^M\d+$/, {name: 'metric', invert: false})
          .error('Must match /^M\\d+$/ (e.g. M6, M12, M24).'),
    }),
    defineField({
      name: 'pitchCoarseMm',
      title: 'Coarse pitch (mm)',
      type: 'number',
    }),
    defineField({
      name: 'pitchFineMm',
      title: 'Fine pitch (mm)',
      type: 'number',
    }),
    defineField({
      name: 'acrossFlatsMm',
      title: 'Across flats (mm)',
      type: 'number',
    }),
    defineField({
      name: 'headHeightMm',
      title: 'Head height (mm)',
      type: 'number',
      hidden: ({parent}) => isBoltLike(parent),
    }),
    defineField({
      name: 'nutHeightMm',
      title: 'Nut height (mm)',
      type: 'number',
      hidden: ({parent}) => isNut(parent),
    }),
    defineField({
      name: 'outerDiameterMm',
      title: 'Outer diameter (mm)',
      type: 'number',
      hidden: ({parent}) => isWasher(parent),
    }),
    defineField({
      name: 'thicknessMm',
      title: 'Thickness (mm)',
      type: 'number',
      hidden: ({parent}) => isWasher(parent),
    }),
    defineField({
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      description: 'Tick after cross-checking against catalogue data.',
      initialValue: false,
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      nominalSize: 'nominalSize',
      standardCode: 'standard.code',
      verified: 'verified',
    },
    prepare({nominalSize, standardCode, verified}) {
      return {
        title: `${nominalSize || '?'} — ${standardCode || 'no standard'}`,
        subtitle: verified ? 'verified' : 'unverified',
      }
    },
  },
})
