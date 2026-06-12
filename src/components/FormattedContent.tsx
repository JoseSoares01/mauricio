import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { prepareNewsContent } from "@/lib/format-content";

interface FormattedContentProps {
  content: string;
  className?: string;
}

export default function FormattedContent({ content, className = "" }: FormattedContentProps) {
  const prepared = prepareNewsContent(content);

  if (!prepared.value) return null;

  if (prepared.type === "html") {
    return (
      <div
        className={`formatted-content ${className}`}
        dangerouslySetInnerHTML={{ __html: prepared.value }}
      />
    );
  }

  return (
    <div className={`formatted-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {prepared.value}
      </ReactMarkdown>
    </div>
  );
}
