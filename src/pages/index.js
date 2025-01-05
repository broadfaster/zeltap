import Layout from '../components/Layout'
import { Description } from '../screens/Home'
import chooseBySlug from '../utils/chooseBySlug'
import { getAllDataByType } from '../lib/cosmic'

const Home = ({ landing, navigationItems }) => {
  return (
    <Layout navigationPaths={navigationItems[0]?.metadata}>
      <Description info={chooseBySlug(landing, 'marketing')} />
    </Layout>
  )
}

export default Home

export async function getServerSideProps() {
  const landing = (await getAllDataByType('landings')) || []
  const navigationItems = (await getAllDataByType('navigation')) || []

  return {
    props: {
      landing,
      navigationItems,
    },
  }
}
