export type Props = {}

declare module 'hono' {
  interface ContextRenderer {
    (children: React.ReactElement, props?: Props): Response | Promise<Response>
  }
}

export interface Metadata {
  tag?: 'title' | 'meta' | 'link'
  attrs?: Record<string, string>
  children?: string
}
