import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './page'
import DefaultLayout from '@/layouts'

export const render = {
  App,
  Layout: DefaultLayout,
}

if (typeof document !== 'undefined') {
  const metadata = window.metadata
  const initialProps = window.initialProps

  ReactDOM.hydrateRoot(
    document,
    <React.StrictMode>
      <DefaultLayout metadata={metadata}>
        <App {...initialProps} />
      </DefaultLayout>
    </React.StrictMode>
  )
}
