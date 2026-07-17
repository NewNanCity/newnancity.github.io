import { Helmet } from 'react-helmet-async'
import { seoConfig } from '../config/seo.config'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'organization'
  keywords?: string
  author?: string
  canonicalUrl?: string
  noIndex?: boolean
}

const defaultSEO = {
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  image: seoConfig.defaultImage,
  url: seoConfig.siteUrl,
  keywords: seoConfig.defaultKeywords.join(','),
  author: '牛腩小镇',
  type: 'website' as const,
}

export default function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = defaultSEO.type,
  keywords = defaultSEO.keywords,
  author = defaultSEO.author,
  canonicalUrl = url,
  noIndex = false,
}: SEOProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="zh-CN" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="牛腩小镇" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, follow' : 'index, follow'} />
      <meta name="bingbot" content={noIndex ? 'noindex, follow' : 'index, follow'} />
    </Helmet>
  )
}
