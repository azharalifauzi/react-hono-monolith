import { Button } from '@/components/ui/button'
import imgUrl from '@/assets/template-5.png'
import assetUrl from '@/assets/template-5.png?url'
import React from 'react'
import { LoaderFunctionArgs } from 'react-router-dom'
import { Metadata } from '@/types/mrh'
import { useLoaderData } from '@/hooks/mrh'

export async function getMetadata({
  params,
  request,
}: LoaderFunctionArgs): Promise<Metadata[]> {
  return [
    {
      tag: 'title',
      children: 'Homepage',
    },
    {
      tag: 'meta',
      attrs: {
        property: 'og:title',
        content: 'Homepage',
      },
    },
  ]
}

export async function getInitialProps({ params, request }: LoaderFunctionArgs) {
  return {
    test: 'data tst asdf asdf',
  }
}

const HomePage: React.FC = () => {
  const { initialProps } = useLoaderData<{ test: string }>()
  return (
    <div>
      <div className="mb-2">HomePage {initialProps.test} hmr</div>
      <div className="flex items-center gap-4">
        <div>
          <div>Public image</div>
          <div>
            <img src="/template-5.png" />
          </div>
        </div>
        <div>
          <div>Asset image</div>
          <div>
            <img src={imgUrl} />
          </div>
        </div>
        <div>
          <div>Asset image</div>
          <div>
            <img src={assetUrl} />
          </div>
        </div>
      </div>
      <Button>Click me pliss</Button>
    </div>
  )
}

export default HomePage
