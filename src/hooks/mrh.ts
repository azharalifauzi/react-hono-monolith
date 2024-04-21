import { Metadata } from '@/types/mrh'
import { useLoaderData as useLoaderDataPrimitives } from 'react-router-dom'

export const useLoaderData = <P = {}>(): {
  initialProps: P
  metadata: Metadata[]
} => useLoaderDataPrimitives() as any
