import { Button } from '@/components/ui/button'
import imgUrl from '@/assets/template-5.png'
import assetUrl from '@/assets/template-5.png?url'
import React from 'react'
import { Context } from 'hono'
import { useLoaderData } from 'react-router-dom'

export async function getInitialProps(c: Context) {
  return {
    test: 'data tst asdf',
  }
}

const HomePage: React.FC = () => {
  // @ts-ignore
  const { initialProps } = useLoaderData()
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
