export interface NavLink {
  label: string;
  icon: string;
  url: string;
}

export interface HeroStat {
  value: number;
  label: string;
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
