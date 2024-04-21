import { useLoaderData } from '@/hooks/mrh'
import styles from '@/styles/global.css?inline'
import { Metadata } from '@/types/mrh'
import { createElement } from 'react'

export interface DefaultLayoutProps {
  children?: React.ReactNode
}

function generateMeta(metadata: Metadata[]) {
  let hasTitle: boolean = false
  let hasViewport: boolean = false

  const elements = metadata.map(({ tag, attrs, children }, index) => {
    if (tag === 'title') {
      hasTitle = true
    }

    if (attrs?.name === 'viewport') {
      hasViewport = true
    }

    return createElement(
      tag || 'meta',
      {
        ...attrs,
        key: `__mrh-metadata-${index}`,
      },
      children
    )
  })

  if (!hasTitle) {
    elements.unshift(
      createElement(
        'title',
        {
          key: '__mrh-metadata-title',
        },
        'Monolithic React + Hono'
      )
    )
  }

  if (!hasViewport) {
    elements.unshift(
      createElement('meta', {
        key: '__mrh-metadata-viewport',
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      })
    )
  }

  return elements
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const { metadata = [] } = useLoaderData()

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        {generateMeta(metadata)}
        <style dangerouslySetInnerHTML={{ __html: styles }}></style>
      </head>
      <body>{children}</body>
    </html>
  )
}

export default DefaultLayout
