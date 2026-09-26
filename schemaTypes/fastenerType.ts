import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const fastenerType = defineType({
  name: 'fastenerType',
  title: 'Fastener type',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      options: {
        list: [
          {title: 'Bolt', value: 'bolt'},
          {title: 'Set screw', value: 'set screw'},
          {title: 'Nut', value: 'nut'},
          {title: 'Washer', value: 'washer'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 64},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'slug.current'},
  },
})
