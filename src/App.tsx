import { SiteDataProvider } from './context/SiteDataContext'
import LoadingScreen from './components/LoadingScreen'
import LazyLoad from './components/LazyLoad'
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
import { useScrollAnimations } from './hooks/useScrollAnimations'

function AppContent() {
  useScrollAnimations()

  return (
    <>
      <LoadingScreen />
      <ParticleCanvas />
      <Navbar />
      <Hero />

      {/* 延迟加载非首屏组件 */}
      <LazyLoad delay={800}>
        <Showcase />
      </LazyLoad>

      <LazyLoad delay={1200}>
        <RetroTV />
      </LazyLoad>

      <LazyLoad delay={1600}>
        <Gallery />
      </LazyLoad>

      <LazyLoad delay={2000}>
        <Spirit />
      </LazyLoad>

      <LazyLoad delay={2400}>
        <Join />
      </LazyLoad>

      <LazyLoad delay={2800}>
        <Footer />
      </LazyLoad>

      <LazyLoad delay={1000}>
        <EasterEggs />
      </LazyLoad>
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
