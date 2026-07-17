import Gallery from '../components/Gallery'
import PortalPageHeader from '../components/PortalPageHeader'
import RetroTV from '../components/RetroTV'
import Spirit from '../components/Spirit'
import { useSiteData } from '../context/SiteDataContext'

export default function ArchivePage() {
  const { portal } = useSiteData()
  const gateway = portal.gateways.find((item) => item.id === 'archive')!

  return (
    <div className="portal-page portal-archive-page">
      <PortalPageHeader
        eyebrow="NEWNAN ARCHIVE"
        title="小镇档案"
        description="从第一间避难所到今天的万家灯火，六年的热闹和回忆都收在这里。"
        image={gateway.image}
      />
      <RetroTV />
      <Gallery />
      <Spirit />
    </div>
  )
}
