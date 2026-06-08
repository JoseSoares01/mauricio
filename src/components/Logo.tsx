interface LogoProps {
  line1: string;
  line2: string;
  line3: string;
  className?: string;
}

export default function Logo({ line1, line2, line3, className = "" }: LogoProps) {
  const letters = line2.split("");
  const lastLetter = letters.pop() || "O";

  return (
    <div className={`select-none ${className}`}>
      <p
        className="text-[14px] md:text-[16px] font-semibold tracking-[0.3em] mb-1 md:mb-2"
        style={{ color: "var(--color-secondary)", fontFamily: "var(--font-heading)" }}
      >
        {line1}
      </p>
      <div className="flex items-end gap-0 leading-none">
        <span
          className="text-[60px] md:text-[100px] lg:text-[130px] font-bold"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}
        >
          {letters.join("")}
        </span>
        <span className="relative inline-block" style={{ width: "0.85em", height: "0.85em" }}>
          <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] md:w-[100px] md:h-[100px] lg:w-[130px] lg:h-[130px]">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-accent)" strokeWidth="6" />
            <circle cx="72" cy="22" r="14" fill="var(--color-primary)" />
            <polygon
              points="72,16 74,22 80,22 75,26 77,32 72,28 67,32 69,26 64,22 70,22"
              fill="white"
            />
          </svg>
        </span>
      </div>
      <p
        className="text-[24px] md:text-[36px] lg:text-[48px] font-medium tracking-[0.4em] mt-1"
        style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}
      >
        {line3}
      </p>
    </div>
  );
}
