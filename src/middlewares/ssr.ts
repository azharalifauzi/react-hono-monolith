import { readFileSync } from 'fs'
import { Context, MiddlewareHandler } from 'hono'
import { dirname, resolve } from 'path'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'stream'
import { fileURLToPath } from 'url'
import { isProduction } from '../constants'
import DefaultLayout, { DefaultLayoutProps } from '../layouts'
import { Metadata } from '../types/ssr'

let manifest: any

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (isProduction) {
  manifest = JSON.parse(
    readFileSync(resolve(__dirname, '../../build/.vite/manifest.json'), 'utf-8')
  )
}

function getManifestKey(routePath: string) {
  if (routePath === '/') {
    routePath = '/index'
  }

  const splitted = routePath.split('/').map((s) => {
    if (s.startsWith(':')) {
      s = s.replace(':', '[')
      s += ']'
    }

    return s
  })

  return `src/views${splitted.join('/')}/entry-client.tsx`
}

interface SsrMiddlewareOptions<P extends Record<string, string>> {
  layout?: React.FC<DefaultLayoutProps>
  getInitialProps?: (c: Context) => Promise<P>
  getMetadata?: (c: Context) => Promise<Metadata>
}

export const ssrMiddleware = <P extends Record<string, string> = {}>(
  options: SsrMiddlewareOptions<P> = {}
): MiddlewareHandler<{
  Variables: {
    initialProps: Awaited<P>
  }
}> =>
  async function ssrRenderer(c, next) {
    let metadata: Metadata = {}
    let initialProps = {} as Awaited<P>

    if (options.getMetadata) {
      metadata = await options.getMetadata(c)
    }

    if (options.getInitialProps) {
      initialProps = (await options.getInitialProps(c)) as Awaited<P>
    }

    c.set('initialProps', initialProps)
    c.setRenderer((children) => {
      const body = new PassThrough()
      const bootstrapModules: string[] = []

      const Layout = options?.layout || DefaultLayout
      const node = children as React.ReactNode
      const entryClient = getManifestKey(c.req.routePath)

      if (isProduction) {
        const assetMap = manifest[entryClient]
        bootstrapModules.push(`/build/${assetMap.file}`)
        assetMap.imports.forEach((key) => {
          const obj = manifest[key]
          bootstrapModules.push(`/build/${obj.file}`)
        })
      } else {
        bootstrapModules.push('src/assets/hmr.ts')
        bootstrapModules.push(entryClient)
      }

      const { pipe } = renderToPipeableStream(
        React.createElement(Layout, {
          metadata,
          children: node,
        }),
        {
          onShellReady() {
            c.status(200)
            pipe(body)
          },
          bootstrapModules,
          bootstrapScriptContent: `window.metadata=${JSON.stringify(
            metadata
          )};window.initialProps=${JSON.stringify(initialProps)}`,
        }
      )

      c.header('Content-Type', 'text/html')
      c.header('x-content-type-optinos', 'nosniff')
      c.header('transfer-encoding', 'chunked')

      // @ts-ignore
      return c.body(body)
    })

    return next()
  }
