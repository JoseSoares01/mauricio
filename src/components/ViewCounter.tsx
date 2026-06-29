import { Eye } from "lucide-react";

interface ViewCounterProps {
  count: number;
  className?: string;
}

export default function ViewCounter({ count, className = "" }: ViewCounterProps) {
  return (
    <span className={`view-counter ${className}`.trim()} aria-label={`${count} visualizações`}>
      <Eye size={14} aria-hidden="true" />
      <span>{count}</span>
    </span>
  );
}
