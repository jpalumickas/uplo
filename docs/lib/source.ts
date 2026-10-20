import { loader, type LoaderPlugin } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineDocs } from 'fumadocs-mdx/macro'

const docs = defineDocs({
  dir: 'content',
  docs: {
    // `sidebarTitle` sets a shorter sidebar label than the page title.
    schema: pageSchema.extend({
      sidebarTitle: pageSchema.shape.description,
    }),
  },
  meta: {
    schema: metaSchema,
  },
})

const sidebarTitlePlugin: LoaderPlugin = {
  name: 'uplo:sidebar-title',
  transformPageTree: {
    file(node, filePath) {
      if (!filePath) return node
      const file = this.storage.read(filePath)
      if (
        file?.format === 'page' &&
        'sidebarTitle' in file.data &&
        typeof file.data.sidebarTitle === 'string'
      ) {
        node.name = file.data.sidebarTitle
      }
      return node
    },
  },
}

export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [sidebarTitlePlugin],
})
