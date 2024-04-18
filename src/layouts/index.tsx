import { Metadata } from '../types/ssr'

export interface DefaultLayoutProps {
  children?: React.ReactNode
  metadata?: Metadata
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React</title>
      </head>
      <body>{children}</body>
    </html>
  )
}

export default DefaultLayout
