import styles from '@/styles/global.css?inline'

const ErrorPage = () => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <title>500 | Internal Server Error</title>
        <style dangerouslySetInnerHTML={{ __html: styles }}></style>
      </head>
      <body>500 | Internal Server Error</body>
    </html>
  )
}

export default ErrorPage
