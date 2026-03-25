/**
 * SEO配置文件 - 牛腩小镇
 * 适用于静态展示网站
 */

export const seoConfig = {
  // ========== 基本信息 ==========
  siteName: '牛腩小镇',
  siteUrl: 'https://newnancity.com/',
  alternativeName: 'NewNanCity',
  foundingYear: 2020,
  language: 'zh-CN',

  // ========== SEO元数据 ==========
  defaultTitle: '牛腩小镇 | NewNanCity - 公益Minecraft服务器',
  defaultDescription:
    '牛腩小镇，一个自2020年起持续运营的公益Minecraft服务器社区。公益、自由、友善、有序，做玩家温暖的家。',
  defaultKeywords: [
    '牛腩小镇',
    'NewNanCity',
    'Minecraft',
    '我的世界',
    '服务器',
    '公益服',
    'MC服务器',
  ],
  defaultImage: 'https://newnancity.com/pic/zh_mc_zq2025.webp',

  // ========== 组织信息 (JSON-LD) ==========
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '牛腩小镇',
    alternateName: 'NewNanCity',
    url: 'https://newnancity.com/',
    logo: 'https://newnancity.com/favicon.ico',
    description: '自2020年起持续运营的公益Minecraft服务器社区',
    foundingDate: '2020-02-02',
    areaServed: 'CN',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: '在线支持',
      availableLanguage: 'zh-CN',
    },
  },

  // ========== 社交媒体链接 ==========
  socialProfiles: {
    bilibili: 'https://space.bilibili.com/1704080503',
  },
}

/**
 * 获取网站的完整Schema信息
 * 用于JSON-LD结构化数据
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    image: seoConfig.defaultImage,
    inLanguage: seoConfig.language,
    publisher: seoConfig.organization,
  }
}
