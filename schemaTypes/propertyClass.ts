import {defineType, defineField} from 'sanity'
import {ControlsIcon} from '@sanity/icons/Controls'

export const propertyClass = defineType({
  name: 'propertyClass',
  title: 'Property class',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'grade',
      title: 'Grade',
      type: 'string',
      description: 'e.g. "8.8", "10.9", "A2-70", "A4-80".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      options: {
        list: [
          {title: 'Carbon steel', value: 'carbon steel'},
          {title: 'Alloy steel', value: 'alloy steel'},
          {title: 'Stainless A2', value: 'stainless A2'},
          {title: 'Stainless A4', value: 'stainless A4'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'tensileStrengthMpa',
      title: 'Tensile strength (MPa)',
      type: 'number',
    }),
    defineField({
      name: 'yieldStrengthMpa',
      title: 'Yield strength (MPa)',
      type: 'number',
    }),
    defineField({
      name: 'typicalUse',
      title: 'Typical use',
      type: 'text',
    }),
    defineField({
      name: 'compatibleNutClass',
      title: 'Compatible nut class',
      type: 'reference',
      to: [{type: 'propertyClass'}],
    }),
  ],
  preview: {
    select: {title: 'grade', material: 'material'},
    prepare({title, material}) {
      return {title, subtitle: material}
    },
  },
})
