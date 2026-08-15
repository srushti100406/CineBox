import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";
import { formatRuntime } from "./format";
import type { Movie } from "./types";

export function Hero({
  movies,
  onSelect,
  theatresCount,
  cityCount,
}: {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  theatresCount: number;
  cityCount: number;
}) {
  const featured = movies.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || featured.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 6500);
    return () => clearInterval(id);
  }, [paused, featured.length]);

  useEffect(() => {
    setIndex(0);
  }, [movies.length]);

  const current = featured[index] ?? movies[0];
  const avgRating =
    movies.length > 0
      ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
      : "—";

  if (!current) return null;

  return (
    <section
      id="featured"
      className="velvet-deep grain relative overflow-hidden pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* gold edge line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-20 lg:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-secondary" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary">
                Real Indian Cinema · Booked in Style
              </p>
            </div>

            <h1 className="font-display text-[15vw] leading-[0.92] tracking-wide text-foreground sm:text-6xl md:text-7xl lg:text-[5.2rem]">
              {current.title.split(" ").slice(0, 2).join(" ")}{" "}
              <span className="gold-text">
                {current.title.split(" ").slice(2).join(" ") || "Now Showing"}
              </span>
            </h1>

            {current.tagline && (
              <p className="mt-3 max-w-xl text-base italic text-secondary/85 sm:text-lg">
                “{current.tagline}”
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <RatingBadge rating={current.rating} votes={current.votes} />
              <MetaChip icon={<CalendarDays className="size-3.5" />} label={String(current.year)} />
              <MetaChip icon={<Clock3 className="size-3.5" />} label={formatRuntime(current.runtime)} />
              <MetaChip label={current.language[0] ?? "Hindi"} />
            </div>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-[15px]">
              {current.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  document
                    .getElementById("now-showing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Ticket className="size-4" />
                Browse Now Showing
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-secondary/40 text-foreground hover:bg-secondary/10"
                onClick={() => onSelect(current)}
              >
                View Details
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {featured.map((m, i) => (
                <button
                  key={m._id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${m.title}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-secondary" : "w-3 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs font-medium text-foreground/50">
                {index + 1} / {featured.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Poster */}
        <div className="order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.96, rotate: -2 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative mx-auto w-56 sm:w-64 lg:w-72"
            >
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-secondary/60 via-secondary/20 to-transparent blur-[1px]" />
              <div className="relative overflow-hidden rounded-xl border border-secondary/50 bg-card p-1.5">
                <Poster
                  src={current.posterUrl}
                  alt={`${current.title} poster`}
                  className="aspect-[2/3] w-full rounded-lg"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-lg border border-secondary/50 bg-[#15100e] px-3 py-2 text-center backdrop-blur-sm">
                <p className="font-display text-lg leading-none text-secondary">★ {current.rating.toFixed(1)}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-foreground/55">
                  IMDb rating
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-border/60 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-5 sm:px-6 md:grid-cols-4">
          <Stat value={String(movies.length)} label="Movies" />
          <Stat value={String(theatresCount)} label="Partner screens" />
          <Stat value={String(cityCount)} label="Cities" />
          <Stat value={avgRating} label="Avg IMDb rating" />
        </div>
      </div>
    </section>
  );
}

function MetaChip({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground/80">
      {icon}
      {label}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 text-center">
      <span className="font-display text-2xl tracking-wide text-secondary sm:text-3xl">
        {value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/55">
        {label}
      </span>
    </div>
  );
}
