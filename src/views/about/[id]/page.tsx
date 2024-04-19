import { Button } from '@/components/ui/button'
import { Link, LoaderFunctionArgs, useNavigate } from 'react-router-dom'

export async function getInitialProps({ params, request }: LoaderFunctionArgs) {
  console.log({ params, request })

  return {
    test: 'data tst asdf',
  }
}

const AboutPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div>About detail hmr ga</div>
      <Button onClick={() => navigate('/')}> Go to home</Button>
      <Link to="/">Home</Link>
    </div>
  )
}

export default AboutPage
