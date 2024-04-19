import fs, { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path, { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RouteObject } from 'react-router-dom'

interface Route {
  path: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getRoutes(folderPath: string, basePath = ''): Route[] {
  const routes: Route[] = []

  const files = fs.readdirSync(folderPath)

  files.forEach((file) => {
    const filePath = path.join(folderPath, file)
    const relativePath = path.join(basePath, file)

    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      const nestedRoutes = getRoutes(filePath, relativePath)
      routes.push(...nestedRoutes)
    } else if (file.endsWith('page.tsx')) {
      let routePath = relativePath
        .replace(/\/page\.tsx?$/, '')
        .replace(/\index?$/, '')
      routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1')
      routes.push({ path: '/' + routePath })
    }
  })

  return routes
}

export function getManifestKey(routePath: string) {
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

  return `/views${splitted.join('/')}/entry.tsx`
}

export async function createReactRouteRoutes(routePath: Route[]) {
  const routes: RouteObject[] = []

  const imports: string[] = ["import DefaultLayout from '../src/layouts'"]

  let i = 0

  for (const { path } of routePath) {
    imports.push(
      `import * as App${i} from '../src${getManifestKey(path).replace(
        'entry.tsx',
        'page'
      )}'`
    )
    i++

    // const { getInitialProps, getMetadata } = await import(
    //   resolve(
    //     __dirname,
    //     `../${getManifestKey(path).replace('entry.tsx', 'page.tsx')}`
    //   )
    // )
    // const {
    //   render: { Layout, App },
    // } = await import(resolve(__dirname, `../${getManifestKey(path)}`))

    // routes.push({
    //   path,
    //   element: (
    //     <Layout>
    //       <App />
    //     </Layout>
    //   ),
    //   loader: async () => {
    //     let initialProps: any = {}
    //     let metadata: any = {}

    //     if (getInitialProps) {
    //       initialProps = await getInitialProps()
    //     }

    //     if (getMetadata) {
    //       metadata = await getMetadata()
    //     }

    //     return {
    //       initialProps,
    //       metadata,
    //     }
    //   },
    // })
  }

  let mainString = `\nconst routes = [
    ${routePath
      .map(({ path }, i) => {
        return `{
        path: '${path}',
        element: (
          <DefaultLayout>
            <App${i}.default />
          </DefaultLayout>
        ),
        loader: async () => {
          let initialProps: any = {}
          let metadata: any = {}

          const app = App${i} as any

          if (app.getInitialProps) {
            initialProps = await app.getInitialProps()
          }

          if (app.getMetadata) {
            initialProps = await app.getMetadata()
          }

          return { metadata, initialProps }
        }
      }`
      })
      .join(',\n')}
]`

  let importString = imports.join('\n')

  const destination = resolve(__dirname, '../.monrho')

  if (!existsSync(destination)) {
    mkdirSync(destination)
  }

  writeFileSync(
    join(destination, './routes.tsx'),
    importString + mainString + '\n export default routes'
  )
}

const routes = getRoutes('src/views')
await createReactRouteRoutes(routes)
