import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MovieCard } from "./MovieCard";
import type { Movie } from "./types";

type SortKey = "popularity" | "rating" | "newest" | "title";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest Releases" },
  { value: "title", label: "Title A–Z" },
];

export function NowShowing({
  movies,
  onSelect,
}: {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}) {
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [year, setYear] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popularity");

  const genreOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of movies) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([genre]) => genre);
  }, [movies]);

  const yearOptions = useMemo(() => {
    return [...new Set(movies.map((m) => m.year))].sort((a, b) => b - a);
  }, [movies]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = movies.filter((m) => {
      if (q) {
        const haystack = `${m.title} ${m.summary} ${m.actors.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (genres.length > 0 && !m.genres.some((g) => genres.includes(g))) return false;
      if (year !== "all" && m.year !== Number(year)) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "popularity":
        sorted.sort((a, b) => b.votes - a.votes);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
        break;
      case "newest":
        sorted.sort((a, b) => b.year - a.year || b.rating - a.rating);
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return sorted;
  }, [movies, query, genres, year, sort]);

  const hasFilters = query.trim() !== "" || genres.length > 0 || year !== "all";

  const clearFilters = () => {
    setQuery("");
    setGenres([]);
    setYear("all");
    setSort("popularity");
  };

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  return (
    <section id="now-showing" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          kicker="Browse the lineup"
          title={
            <>
              Now <span className="gold-text">Showing</span>
            </>
          }
          subtitle="Every film below is real Indian cinema — titles, ratings, genres and summaries straight from The Indian Movie Database."
        />

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, plots or actors…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortKey)}
              >
                <SelectTrigger className="w-[160px]">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {genreOptions.map((genre) => {
              const active = genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    active
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border/70 bg-card/60 text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                  )}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-secondary">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "film" : "films"} on the bill
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <motion.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} onSelect={onSelect} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10">
              <Clapperboard className="size-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              No screenings match your search
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Try a different title, genre or year — the full real lineup is one
              tap away.
            </p>
            <Button className="mt-6" onClick={clearFilters}>
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-10 bg-secondary" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary">
          {kicker}
        </p>
      </div>
      <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
