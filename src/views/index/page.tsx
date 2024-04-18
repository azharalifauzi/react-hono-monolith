import { Button } from '@/components/ui/button'
import imgUrl from '@/assets/template-5.png'
import assetUrl from '@/assets/template-5.png?url'
import React from 'react'

const HomePage: React.FC<{ test: string }> = ({ test }) => {
  return (
    <div>
      <div className="mb-2">HomePage {test} hmr</div>
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
