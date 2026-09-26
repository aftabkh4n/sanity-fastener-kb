import {defineType, defineField, defineArrayMember} from 'sanity'
import {TransferIcon} from '@sanity/icons/Transfer'

export const equivalence = defineType({
  name: 'equivalence',
  title: 'Equivalence',
  type: 'document',
  icon: TransferIcon,
  fields: [
    defineField({
      name: 'fromSpec',
      title: 'From standard',
      type: 'reference',
      to: [{type: 'standard'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'toSpec',
      title: 'To standard',
      type: 'reference',
      to: [{type: 'standard'}],
      validation: (rule) =>
        rule.required().custom((toSpec, context) => {
          const doc = context.document as {fromSpec?: {_ref?: string}} | undefined
          const fromRef = doc?.fromSpec?._ref
          const toRef = (toSpec as {_ref?: string} | undefined)?._ref
          if (fromRef && toRef && fromRef === toRef) {
            return 'From and To standards must differ.'
          }
          return true
        }),
    }),
    defineField({
      name: 'relationship',
      title: 'Relationship',
      type: 'string',
      options: {
        list: [
          {title: 'Direct replacement', value: 'direct replacement'},
          {title: 'Near equivalent', value: 'near equivalent'},
          {title: 'Not interchangeable', value: 'not interchangeable'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'differences',
      title: 'Differences',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'difference',
          fields: [
            defineField({
              name: 'nominalSize',
              title: 'Nominal size',
              type: 'string',
              validation: (rule) => rule.regex(/^M\d+$/).error('Format: M<digits>, e.g. M12.'),
            }),
            defineField({
              name: 'attribute',
              title: 'Attribute',
              type: 'string',
              options: {
                list: [
                  {title: 'Across flats', value: 'across flats'},
                  {title: 'Head height', value: 'head height'},
                  {title: 'Nut height', value: 'nut height'},
                  {title: 'Pitch', value: 'pitch'},
                  {title: 'Other', value: 'other'},
                ],
              },
            }),
            defineField({name: 'fromValue', title: 'From value', type: 'number'}),
            defineField({name: 'toValue', title: 'To value', type: 'number'}),
            defineField({
              name: 'unit',
              title: 'Unit',
              type: 'string',
              initialValue: 'mm',
            }),
            defineField({
              name: 'practicalImpact',
              title: 'Practical impact',
              type: 'text',
            }),
          ],
          preview: {
            select: {
              size: 'nominalSize',
              attribute: 'attribute',
              from: 'fromValue',
              to: 'toValue',
              unit: 'unit',
            },
            prepare({size, attribute, from, to, unit}) {
              return {
                title: `${size || '?'} ${attribute || ''}`.trim(),
                subtitle: `${from ?? '?'} vs ${to ?? '?'} ${unit || ''}`.trim(),
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'Plain-English explanation aimed at a customer.',
    }),
  ],
  preview: {
    select: {from: 'fromSpec.code', to: 'toSpec.code', relationship: 'relationship'},
    prepare({from, to, relationship}) {
      return {
        title: `${from || '?'} ↔ ${to || '?'}`,
        subtitle: relationship,
      }
    },
  },
})
