import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'stream'
import { fileURLToPath } from 'url'
import { isProduction } from '../constants'
import { Context } from 'hono'
import { StaticRouter } from 'react-router-dom/server'
import { type Metadata } from '../types/ssr'

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

  return `src/views${splitted.join('/')}/entry.tsx`
}

export const ssrMiddleware = () =>
  async function ssrRenderer(c: Context) {
    let metadata: Metadata = {}
    let initialProps = {} as any

    const body = new PassThrough()

    const bootstrapModules: string[] = []

    let Layout: any
    let Component: any
    const entry = getManifestKey(c.req.routePath)

    if (isProduction) {
      const assetMapClient = manifest[entry]
      const assetMapServer = manifestServer[entry]
      const assetMapPage =
        manifestServer[entry.replace('entry.tsx', 'page.tsx')]
      bootstrapModules.push(assetMapClient.file)
      assetMapClient.imports.forEach((key) => {
        const asset = manifest[key]
        bootstrapModules.push(asset.file)
      })

      const { render } = await import(`/build/server/${assetMapServer.file}`)
      Layout = render.Layout
      Component = render.App

      const { getInitialProps, getMetadata } = await import(
        `/build/server/${assetMapPage.file}`
      )

      if (getInitialProps) {
        initialProps = await getInitialProps(c)
      }

      if (getMetadata) {
        metadata = await getMetadata(c)
      }
    } else {
      const { getInitialProps, getMetadata } = await import(
        resolve(__dirname, `../../${entry.replace('entry.tsx', 'page.tsx')}`)
      )
      const { render } = await import(resolve(__dirname, `../../${entry}`))

      Layout = render.Layout
      Component = render.App

      if (getInitialProps) {
        initialProps = await getInitialProps(c)
      }

      if (getMetadata) {
        metadata = await getMetadata(c)
      }

      bootstrapModules.push(resolve(__dirname, '../../src/assets/hmr.ts'))
      bootstrapModules.push(resolve(__dirname, `../../${entry}`))
    }

    const { pipe } = renderToPipeableStream(
      <StaticRouter location={c.req.url}>
        <Layout metadata={metadata}>
          <Component {...initialProps} />
        </Layout>
      </StaticRouter>,
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
