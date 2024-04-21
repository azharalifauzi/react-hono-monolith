import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'stream'
import { fileURLToPath } from 'url'
import { isProduction } from '../constants'
import { Context } from 'hono'
import {
  StaticRouterProvider,
  createStaticHandler,
  StaticHandlerContext,
  createStaticRouter,
} from 'react-router-dom/server'
import { getManifestKey } from '@/utils/mrh'
import { RouteObject } from 'react-router-dom'

let manifest: any

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (isProduction) {
  manifest = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../build/client/.vite/manifest.json'),
      'utf-8'
    )
  )
}

interface RenderOptions {
  staticHandler: ReturnType<typeof createStaticHandler>
  routes: RouteObject[]
  notFound?: boolean
  isError?: boolean
}

export const render = ({
  routes,
  staticHandler,
  notFound,
  isError,
}: RenderOptions) =>
  async function ssrRenderer(c: Context) {
    const body = new PassThrough()

    const bootstrapModules: string[] = []
    let entry = getManifestKey(c.req.path)
    if (notFound) {
      entry = 'src/views/_404/entry.tsx'
    } else if (isError) {
      entry = 'src/views/_error/entry.tsx'
    }

    if (isProduction) {
      const assetMapClient = manifest[entry]
      assetMapClient.imports.forEach((key) => {
        const asset = manifest[key]
        bootstrapModules.push('/' + asset.file)
      })
    } else {
      bootstrapModules.push(resolve(__dirname, '../../.mrh/hmr.ts'))
      bootstrapModules.push(resolve(__dirname, `../../${entry}`))
    }

    const routeContext = (await staticHandler.query(
      new Request(c.req.url, {
        method: c.req.method,
        headers: c.req.header(),
      })
    )) as StaticHandlerContext

    const router = createStaticRouter(routes, routeContext)

    const { pipe } = renderToPipeableStream(
      <StaticRouterProvider context={routeContext} router={router} />,
      {
        onShellReady() {
          c.status(200)
          pipe(body)
        },
        bootstrapModules,
      }
    )

    c.header('Content-Type', 'text/html')
    c.header('x-content-type-optinos', 'nosniff')
    c.header('transfer-encoding', 'chunked')

    // @ts-ignore
    return c.body(body)
  }
