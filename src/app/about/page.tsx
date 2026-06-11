import AboutClient from './AboutClient'

export async function generateMetadata() {
  return { title: 'Hakkımızda — The Eternal Memory' }
}

export default function AboutPage() {
  return <AboutClient />
}
