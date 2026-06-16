export interface MenuItem {
  label: string;
  href: string;
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  footerBg: string;
  fontHeading: string;
  fontBody: string;
}

export interface Images {
  heroLogo: string;
  logoBlue: string;
  headerLogo?: string;
  heroPhoto: string;
  heroPhotoOriginal?: string;
  aboutPhoto: string;
  aboutBg: string;
  senadoBg: string;
  banner: string;
  bannerSecondary?: string;
  favicon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  imageFocusX?: number;
  imageFocusY?: number;
  content: string;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string;
  videoFile?: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  permalink?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

export interface SiteConfig {
  site: {
    title: string;
    subtitle: string;
    description: string;
    copyright: string;
  };
  theme: Theme;
  menu: MenuItem[];
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  images: Images;
  hero: {
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
  };
  about: {
    shortText: string;
    fullText: string;
  };
  senado: {
    title: string;
    buttonAccess: string;
    buttonProposicoes: string;
    accessUrl: string;
    proposicoesUrl: string;
  };
  contact: {
    title: string;
    email: string;
    phone: string;
    address: string;
  };
  news: NewsItem[];
  videos: VideoItem[];
  instagram: {
    username: string;
    posts: InstagramPost[];
  };
  agenda: AgendaEvent[];
  admin: {
    password: string;
  };
}
