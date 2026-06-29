export function isInlineSvgIcon(icon: string): boolean {
  return icon.trim().startsWith("<svg");
}

export function isUrlIcon(icon: string): boolean {
  const trimmed = icon.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
}

export function AboutMetricIconDisplay({ icon, className = "" }: { icon: string; className?: string }) {
  const trimmed = icon.trim();
  if (!trimmed) return null;

  if (isInlineSvgIcon(trimmed)) {
    return (
      <span
        className={`about-metric-icon about-metric-icon-svg ${className}`.trim()}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  if (isUrlIcon(trimmed)) {
    return (
      <span className={`about-metric-icon about-metric-icon-svg ${className}`.trim()} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trimmed} alt="" className="about-metric-icon-img" />
      </span>
    );
  }

  return (
    <span className={`about-metric-icon ${className}`.trim()} aria-hidden="true">
      {trimmed}
    </span>
  );
}
