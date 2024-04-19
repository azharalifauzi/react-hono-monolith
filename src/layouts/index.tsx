import styles from '@/styles/global.css?inline'

export interface DefaultLayoutProps {
  children?: React.ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React</title>
        <style dangerouslySetInnerHTML={{ __html: styles }}></style>
      </head>
      <body>{children}</body>
    </html>
  )
}

export default DefaultLayout
