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

  return `src/views${splitted.join('/')}/entry.tsx`
}
