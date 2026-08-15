import { Star } from "lucide-react";

export function Marquee({ titles }: { titles: string[] }) {
  if (titles.length === 0) return null;
  const items = [...titles, ...titles];

  return (
    <div className="relative overflow-hidden border-y border-secondary/30 bg-[#1b0d11] py-2.5">
      <div className="animate-marquee flex w-max items-center gap-6 whitespace-nowrap">
        {items.map((title, i) => (
          <span
            key={`${title}-${i}`}
            className="flex items-center gap-6 text-sm font-semibold uppercase tracking-[0.22em] text-secondary/90"
          >
            {title}
            <Star className="size-3 fill-secondary/70 text-secondary/70" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0f0a09] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0f0a09] to-transparent" />
    </div>
  );
}
