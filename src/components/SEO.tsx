import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'organization'
  keywords?: string
  author?: string
  canonicalUrl?: string
}

const defaultSEO = {
  title: '牛腩小镇 | NewNanCity - 公益Minecraft服务器',
  description: '牛腩小镇，一个自2020年起持续运营的公益Minecraft服务器社区。公益、自由、友善、有序，做玩家温暖的家。',
  image: 'https://newnancity.com/pic/zh_mc_zq2025.webp',
  url: 'https://newnancity.com/',
  keywords: '牛腩小镇,NewNanCity,Minecraft,我的世界,服务器,公益服,MC服务器',
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
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
    </Helmet>
  )
}
