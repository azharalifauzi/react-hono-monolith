import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './page'
import DefaultLayout from '../../layouts'

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
