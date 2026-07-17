interface NotFoundPageProps {
  title?: string
  description?: string
}

export default function NotFoundPage({
  title = '这条路还没有铺好',
  description = '这组坐标还没有通向牛腩的某个地方，也许换条路就能遇见熟悉的灯火。',
}: NotFoundPageProps) {
  return (
    <section className="portal-not-found" aria-labelledby="not-found-title">
      <div className="portal-not-found-grid" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => <span key={index} />)}
      </div>
      <div className="container portal-not-found-content">
        <span className="pixel-text">404 / UNCHARTED</span>
        <h1 id="not-found-title">{title}</h1>
        <p>{description}</p>
        <div>
          <a className="mc-btn mc-btn-primary" href="#/">返回门户</a>
          <a className="mc-btn" href="#/world">打开世界目录</a>
        </div>
      </div>
    </section>
  )
}
