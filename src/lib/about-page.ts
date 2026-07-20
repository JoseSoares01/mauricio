import type { AboutGalleryItem, AboutTimelineItem, Images, SiteConfig } from "./types";
import { clampImageFocusAxis, clampImageZoom, DEFAULT_IMAGE_FOCUS } from "./image-focus";

function withFocus<T extends { imageFocusX?: number; imageFocusY?: number; imageZoom?: number }>(
  item: T
): T & { imageFocusX: number; imageFocusY: number; imageZoom: number } {
  return {
    ...item,
    imageFocusX: clampImageFocusAxis(item.imageFocusX ?? DEFAULT_IMAGE_FOCUS.x),
    imageFocusY: clampImageFocusAxis(item.imageFocusY ?? DEFAULT_IMAGE_FOCUS.y),
    imageZoom: clampImageZoom(item.imageZoom ?? DEFAULT_IMAGE_FOCUS.zoom),
  };
}

export function buildDefaultAboutGallery(images: Images): AboutGalleryItem[] {
  return [
    {
      id: "g1",
      image: images.aboutBg || images.heroPhoto,
      tag: "Trajetória",
      title: "Da periferia à vida pública",
      text: "Jovem da periferia que transformou estudo e fé em serviço ao povo piauiense.",
    },
    {
      id: "g2",
      image: images.senadoBg || images.heroPhoto,
      tag: "Ação",
      title: "Presente no Piauí",
      text: "Atuação em cidades, comunidades e causas que aproximam a política das pessoas.",
    },
    {
      id: "g3",
      image: images.banner || images.heroPhotoOriginal || images.heroPhoto,
      tag: "Compromisso",
      title: "Educação, ciência e segurança",
      text: "Experiência na educação pública, tecnologia científica, segurança e saúde.",
    },
  ];
}

export function buildDefaultAboutTimeline(images: Images): AboutTimelineItem[] {
  return [
    {
      id: "t1",
      year: "Origem",
      title: "Raízes e formação",
      text: "Nasci e fui criado na pobreza. Através dos estudos servi meu país e construí uma trajetória marcada pela fé, disciplina e compromisso com o próximo.",
      image: images.heroPhotoOriginal || images.heroPhoto,
    },
    {
      id: "t2",
      year: "Carreira",
      title: "Serviço ao Brasil",
      text: "Oficial R/2 do Exército Brasileiro da Arma de Engenharia, professor, servidor público federal, biólogo e doutor em melhoramento genético.",
      image: images.aboutBg || images.heroPhoto,
    },
    {
      id: "t3",
      year: "Causas",
      title: "Principais pautas",
      text: "Soberania nacional, valorização do policial e dos professores, amparo aos necessitados, desburocratização, defesa do meio ambiente e proteção às PcDs.",
      image: images.senadoBg || images.banner || images.heroPhoto,
    },
    {
      id: "t4",
      year: "Hoje",
      title: "Pronto para representar o Piauí",
      text: "Já contribui de diversas formas para o povo e a direita piauiense. Agora precisa do seu apoio para continuar essa luta no Congresso Nacional.",
      image: images.banner || images.aboutBg || images.heroPhoto,
    },
  ];
}

export function normalizeAboutSection(
  about: SiteConfig["about"] | undefined,
  images: Images,
  defaultsFromFile?: SiteConfig["about"]
): SiteConfig["about"] {
  const base = about ?? defaultsFromFile;
  const gallerySource =
    about?.gallery?.length
      ? about.gallery
      : defaultsFromFile?.gallery?.length
        ? defaultsFromFile.gallery
        : buildDefaultAboutGallery(images);
  const timelineSource =
    about?.timeline?.length
      ? about.timeline
      : defaultsFromFile?.timeline?.length
        ? defaultsFromFile.timeline
        : buildDefaultAboutTimeline(images);

  return {
    shortText: base?.shortText ?? "",
    fullText: base?.fullText ?? "",
    metrics: base?.metrics?.length ? base.metrics : defaultsFromFile?.metrics ?? [],
    timelineEyebrow: base?.timelineEyebrow || defaultsFromFile?.timelineEyebrow || "Sobre",
    timelineTitle: base?.timelineTitle || defaultsFromFile?.timelineTitle || "A trajetória",
    gallery: gallerySource
      .filter((item) => item.image || item.title)
      .map((item) =>
        withFocus({
          id: item.id || String(Date.now()),
          image: item.image || "",
          tag: item.tag?.trim() || "",
          title: item.title?.trim() || "Sem título",
          text: item.text?.trim() || "",
          imageFocusX: item.imageFocusX,
          imageFocusY: item.imageFocusY,
          imageZoom: item.imageZoom,
        })
      ) as AboutGalleryItem[],
    timeline: timelineSource
      .filter((item) => item.title || item.text)
      .map((item) =>
        withFocus({
          id: item.id || String(Date.now()),
          image: item.image || "",
          year: item.year?.trim() || "",
          title: item.title?.trim() || "Marco",
          text: item.text?.trim() || "",
          imageFocusX: item.imageFocusX,
          imageFocusY: item.imageFocusY,
          imageZoom: item.imageZoom,
        })
      ) as AboutTimelineItem[],
  };
}
