const string = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './page'
import DefaultLayout from '@/layouts'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const { routes } = await import('.monrho/routes')

export const render = {
  App,
  Layout: DefaultLayout,
}

if (typeof document !== 'undefined') {
  const router = createBrowserRouter(routes)

  ReactDOM.hydrateRoot(
    document,
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
`
