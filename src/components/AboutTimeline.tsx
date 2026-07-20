import FocusedImage from "@/components/FocusedImage";
import type { AboutTimelineItem } from "@/lib/types";

interface AboutTimelineProps {
  eyebrow?: string;
  title?: string;
  items: AboutTimelineItem[];
}

export default function AboutTimeline({
  eyebrow = "Sobre",
  title = "A trajetória",
  items,
}: AboutTimelineProps) {
  if (!items.length) return null;

  return (
    <section className="about-timeline">
      <div className="container-site">
        <header className="about-timeline-header">
          <p className="about-timeline-eyebrow">{eyebrow}</p>
          <h2 className="about-timeline-title">{title}</h2>
        </header>

        <div className="about-timeline-list">
          {items.map((item, index) => {
            const reverse = index % 2 === 1;
            return (
              <article
                key={item.id}
                className={`about-timeline-row ${reverse ? "is-reverse" : ""}`}
              >
                <div className="about-timeline-copy">
                  {item.year && <span className="about-timeline-year">{item.year}</span>}
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                {item.image && (
                  <div className="about-timeline-media">
                    <div className="about-timeline-frame">
                      <FocusedImage
                        src={item.image}
                        alt={item.title}
                        fill
                        focus={item}
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 48vw"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
