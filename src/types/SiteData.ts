export interface NavLink {
  label: string;
  icon: string;
  url: string;
}

export interface HeroStat {
  id?: 'years' | 'days';
  value?: number;
  unit: string;
  description: string;
}

export type PortalGatewayId = 'world' | 'community' | 'archive' | 'join';

export interface PortalGateway {
  id: PortalGatewayId;
  eyebrow: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  image: string;
}

export interface PortalUpdate {
  date: string;
  category: 'town' | 'community' | 'archive';
  title: string;
  summary: string;
  href: string;
}

export type PortalFeedCategory = 'news' | 'town' | 'activity' | 'memory' | 'scenery';

export interface PortalFeedItem {
  id: string;
  category: PortalFeedCategory;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  meta: string;
  actionLabel: string;
}

export interface PortalEcosystemLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
}

export type PortalQuickActionId = 'map' | 'skin' | 'towns';

export interface PortalQuickAction {
  id: PortalQuickActionId;
  label: string;
  meta: string;
  href: string;
  icon: string;
}

export type PortalTownDirectoryStatus = 'open' | 'preparing';

export interface PortalTownDirectoryEntry {
  id: string;
  name: string;
  summary: string;
  meta: string;
  href: string;
  status: PortalTownDirectoryStatus;
}

export interface PortalTownFact {
  label: string;
  value: string;
}

export interface PortalTown {
  slug: string;
  name: string;
  subtitle: string;
  summary: string;
  cover: string;
  siteUrl: string;
  tags: string[];
  facts: PortalTownFact[];
}

export interface PortalCommunityLink {
  title: string;
  description: string;
  href: string;
  icon: string;
  kind: 'official' | 'external';
}

export interface ShowcaseBadge {
  icon: string;
  label: string;
}

export interface ShowcaseCard {
  icon: string;
  title: string;
  desc: string;
}

export interface TVCard {
  type: 'event' | 'person' | 'place' | 'meme';
  title: string;
  date?: string;
  desc: string;
}

export interface GalleryItem {
  src: string;
  caption: string;
  year: string;
}

export interface SpiritValue {
  icon: string;
  title: string;
  desc: string;
}

export interface JoinStep {
  num: string;
  title: string;
  desc: string;
  link: string | null;
}

export interface SiteData {
  nav: {
    brand: string;
    links: NavLink[];
  };
  hero: {
    badge: string;
    titleWelcome: string;
    titleName: string;
    subtitle: string;
    stats: HeroStat[];
    slides: string[];
  };
  portal: {
    quickActions?: PortalQuickAction[];
    gateways: PortalGateway[];
    feed: PortalFeedItem[];
    spotlight: {
      eyebrow: string;
      title: string;
      summary: string;
      image: string;
      href: string;
      meta: string;
    };
    updates: PortalUpdate[];
    ecosystem: PortalEcosystemLink[];
    townDirectory?: PortalTownDirectoryEntry[];
    towns: PortalTown[];
    community: {
      intro: string;
      links: PortalCommunityLink[];
      creator: {
        title: string;
        description: string;
      };
    };
  };
  showcase: {
    intro: string;
    badges: ShowcaseBadge[];
    cards: ShowcaseCard[];
  };
  tv: {
    channels: Record<string, TVCard[]>;
  };
  gallery: GalleryItem[];
  tips: string[];
  spirit: {
    quote: string;
    values: SpiritValue[];
  };
  join: {
    title: string;
    subtitle: string;
    steps: JoinStep[];
    notice: string;
    ctaPrimary: { label: string; url: string };
    ctaSecondary: { label: string; url: string };
  };
  footer: {
    tagline: string;
    quickLinks: { label: string; url: string }[];
    socialLinks: { label: string; url: string }[];
    follow: { label: string; url: string };
    icp: string;
  };
}
