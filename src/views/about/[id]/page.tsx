import { useParams } from 'react-router-dom'

const AboutPage = () => {
  const params = useParams()

  console.log(params)
  return <div>About detail</div>
}

export default AboutPage
