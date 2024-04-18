import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './page'
import DefaultLayout from '@/layouts'
import { BrowserRouter } from 'react-router-dom'

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
      <BrowserRouter>
        <DefaultLayout metadata={metadata}>
          <App {...initialProps} />
        </DefaultLayout>
      </BrowserRouter>
    </React.StrictMode>
  )
}
