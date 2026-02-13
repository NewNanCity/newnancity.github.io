import { useState, useEffect } from 'react'
import { SiteDataProvider } from './context/SiteDataContext'
import SEO from './components/SEO'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Showcase from './components/Showcase'
import RetroTV from './components/RetroTV'
import Gallery from './components/Gallery'
import Spirit from './components/Spirit'
import Join from './components/Join'
import Footer from './components/Footer'
import ParticleCanvas from './components/ParticleCanvas'
import EasterEggs from './components/EasterEggs'
import Map from './components/Map'
import { useScrollAnimations } from './hooks/useScrollAnimations'

function AppContent() {
  const [page, setPage] = useState<string>(window.location.hash.slice(1) || 'home')

  useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash.slice(1) || 'home')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useScrollAnimations()

  // Show Map page for map route
  if (page === 'map') {
    return (
      <>
        <SEO />
        <Navbar />
        <Map />
      </>
    )
  }

  // Show home page for all other routes
  return (
    <>
      <SEO />
      <LoadingScreen />
      <ParticleCanvas />
      <Navbar />
      <Hero />
      <Showcase />
      <RetroTV />
      <Gallery />
      <Spirit />
      <Join />
      <Footer />
      <EasterEggs />
    </>
  )
}

export default function App() {
  return (
    <SiteDataProvider>
      <AppContent />
    </SiteDataProvider>
  )
}
