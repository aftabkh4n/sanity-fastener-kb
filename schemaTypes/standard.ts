import {defineType, defineField} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const standard = defineType({
  name: 'standard',
  title: 'Standard',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      description: 'Full designation, e.g. "DIN 933" or "ISO 4017".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Standards body',
      type: 'string',
      options: {
        list: [
          {title: 'DIN', value: 'DIN'},
          {title: 'ISO', value: 'ISO'},
          {title: 'BS', value: 'BS'},
          {title: 'ANSI', value: 'ANSI'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Descriptive title, e.g. "Hexagon head screws, fully threaded".',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Current', value: 'current'},
          {title: 'Withdrawn', value: 'withdrawn'},
          {title: 'Superseded', value: 'superseded'},
        ],
        layout: 'radio',
      },
      initialValue: 'current',
    }),
    defineField({
      name: 'supersededBy',
      title: 'Superseded by',
      type: 'reference',
      to: [{type: 'standard'}],
      hidden: ({parent}) => parent?.status !== 'superseded' && parent?.status !== 'withdrawn',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {code: 'code', title: 'title', body: 'body', status: 'status'},
    prepare({code, title, body, status}) {
      const subtitle = [body, title, status && status !== 'current' ? `(${status})` : null]
        .filter(Boolean)
        .join(' · ')
      return {title: code || 'Untitled standard', subtitle}
    },
  },
})
