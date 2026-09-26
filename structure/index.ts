import type {StructureResolver} from 'sanity/structure'
import {TransferIcon} from '@sanity/icons/Transfer'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {NumberIcon} from '@sanity/icons/Number'
import {ControlsIcon} from '@sanity/icons/Controls'
import {TagIcon} from '@sanity/icons/Tag'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Fastener KB')
    .items([
      S.listItem()
        .title('Equivalences')
        .icon(TransferIcon)
        .child(S.documentTypeList('equivalence').title('Equivalences')),

      S.divider(),

      S.listItem()
        .title('Standards')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('standard').title('Standards')),

      S.listItem()
        .title('Size specs')
        .icon(NumberIcon)
        .child(
          S.documentTypeList('standard')
            .title('Size specs by standard')
            .child((standardId) =>
              S.documentList()
                .title('Size specs')
                .schemaType('sizeSpec')
                .filter('_type == "sizeSpec" && standard._ref == $standardId')
                .params({standardId})
                .apiVersion('2024-01-01'),
            ),
        ),

      S.divider(),

      S.listItem()
        .title('Property classes')
        .icon(ControlsIcon)
        .child(S.documentTypeList('propertyClass').title('Property classes')),

      S.listItem()
        .title('Fastener types')
        .icon(TagIcon)
        .child(S.documentTypeList('fastenerType').title('Fastener types')),
    ])
