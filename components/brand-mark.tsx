// Lucide `Binary` paths with the viewBox cropped to the digits, so 01/10 fills the box.
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-claude-600 text-white${className ? ` ${className}` : ""}`}
    >
      <svg
        viewBox="4.6 2.6 14.8 18.8"
        width="15"
        height="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="14" y="14" width="4" height="6" rx="2" />
        <rect x="6" y="4" width="4" height="6" rx="2" />
        <path d="M6 20h4" />
        <path d="M14 10h4" />
        <path d="M6 14h2v6" />
        <path d="M14 4h2v6" />
      </svg>
    </span>
  );
}
