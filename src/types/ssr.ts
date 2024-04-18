declare global {
  interface Window {
    initialProps: any
    metadata: any
  }
}

export type Props = {}

declare module 'hono' {
  interface ContextRenderer {
    (children: React.ReactElement, props?: Props): Response | Promise<Response>
  }
}

export interface Metadata {}
