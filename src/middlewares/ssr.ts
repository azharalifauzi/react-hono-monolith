import { readFileSync } from 'fs'
import { Context, MiddlewareHandler } from 'hono'
import { dirname, resolve } from 'path'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'stream'
import { fileURLToPath } from 'url'
import { isProduction } from '../constants'
import { Metadata } from '../types/ssr'

let manifest: any
let manifestServer: any

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (isProduction) {
  manifest = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../build/client/.vite/manifest.json'),
      'utf-8'
    )
  )

  manifestServer = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../build/server/.vite/manifest.json'),
      'utf-8'
    )
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
  async function ssrRenderer(c) {
    let metadata: Metadata = {}
    let initialProps = {} as Awaited<P>

    if (options.getMetadata) {
      metadata = await options.getMetadata(c)
    }

    if (options.getInitialProps) {
      initialProps = (await options.getInitialProps(c)) as Awaited<P>
    }

    const body = new PassThrough()

    c.set('initialProps', initialProps)
    const bootstrapModules: string[] = []

    let Layout: any
    let node: any
    const entryClient = getManifestKey(c.req.routePath)

    if (isProduction) {
      const assetMapClient = manifest[entryClient]
      const assetMapServer = manifestServer[entryClient]
      bootstrapModules.push(assetMapClient.file)
      assetMapClient.imports.forEach((key) => {
        const asset = manifest[key]
        bootstrapModules.push(asset.file)
      })

      const { render } = await import(`/build/server/${assetMapServer.file}`)
      Layout = render.Layout
      node = render.App
    } else {
      node = (
        await import(
          resolve(
            __dirname,
            `../../${entryClient.replace('entry-client.tsx', 'page.tsx')}`
          )
        )
      ).default
      bootstrapModules.push('src/assets/hmr.ts')
      bootstrapModules.push(entryClient)
    }

    const { pipe } = renderToPipeableStream(
      React.createElement(Layout!, {
        metadata,
        children: React.createElement(node, {
          ...initialProps,
        }),
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
  }
