import type { ReactNode } from 'react'

interface PortalPageHeaderProps {
  eyebrow: string
  title: string
  description: string
  image: string
  backHref?: string
  backLabel?: string
  children?: ReactNode
}

export default function PortalPageHeader({
  eyebrow,
  title,
  description,
  image,
  backHref = '#/',
  backLabel = '回到牛腩小镇',
  children,
}: PortalPageHeaderProps) {
  return (
    <header className="portal-page-hero">
      <img className="portal-page-hero-image" src={image} alt="" aria-hidden="true" />
      <div className="portal-page-hero-overlay" aria-hidden="true" />
      <div className="container portal-page-hero-content">
        <a className="portal-back-link" href={backHref}>
          <span aria-hidden="true">←</span> {backLabel}
        </a>
        <span className="portal-page-eyebrow pixel-text">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children && <div className="portal-page-actions">{children}</div>}
      </div>
    </header>
  )
}
