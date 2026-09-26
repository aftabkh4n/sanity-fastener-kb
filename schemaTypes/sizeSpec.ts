import {defineType, defineField} from 'sanity'
import {NumberIcon} from '@sanity/icons/Number'

const isBoltLike = (parent: {fastenerType?: {_ref?: string}} | undefined) => {
  const ref = parent?.fastenerType?._ref
  return !ref || (!ref.startsWith('fastenerType-bolt') && !ref.startsWith('fastenerType-set-screw'))
}

const isNut = (parent: {fastenerType?: {_ref?: string}} | undefined) => {
  const ref = parent?.fastenerType?._ref
  return !ref || !ref.startsWith('fastenerType-nut')
}

const isWasher = (parent: {fastenerType?: {_ref?: string}} | undefined) => {
  const ref = parent?.fastenerType?._ref
  return !ref || !ref.startsWith('fastenerType-washer')
}

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
