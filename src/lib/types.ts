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

export type ActionVisitStatus = "realizada";

/** Documento anexo — preparado para fase futura */
export interface ActionVisitDocument {
  title: string;
  url: string;
}

export interface ActionRoutePoint {
  x?: number;
  y?: number;
  latitude?: number;
  longitude?: number;
}

export interface ActionVisit {
  id: string;
  slug: string;
  city: string;
  latitude: number;
  longitude: number;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: ActionVisitStatus;
  image: string;
  gallery: string[];
  relatedLink?: string;
  relatedNewsId?: string;
  displayOrder: number;
  active: boolean;
  mapX?: number;
  mapY?: number;
  routePoints?: ActionRoutePoint[];
  /** Campos opcionais para expansão futura */
  videoUrl?: string;
  documents?: ActionVisitDocument[];
  emendaRef?: string;
  projectRef?: string;
  municipalityIndicators?: Record<string, string | number>;
}

export interface ActionMapConfig {
  enabled: boolean;
  mapImage?: string;
  visits: ActionVisit[];
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
  actionMap: ActionMapConfig;
  admin: {
    password: string;
  };
}
