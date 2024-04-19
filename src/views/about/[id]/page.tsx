import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'

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
