import Join from '../components/Join'
import PortalPageHeader from '../components/PortalPageHeader'
import { useSiteData } from '../context/SiteDataContext'

export default function JoinPage() {
  const { portal } = useSiteData()
  const gateway = portal.gateways.find((item) => item.id === 'join')!

  return (
    <div className="portal-page portal-join-page">
      <PortalPageHeader
        eyebrow="JOIN NEWNAN"
        title="加入牛腩小镇"
        description="准备好背包，我们会陪你一步步认识这里，然后找到回家的路。"
        image={gateway.image}
      />
      <Join />
    </div>
  )
}
