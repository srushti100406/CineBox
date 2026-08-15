import { motion } from "framer-motion";
import { Clock3, Eye } from "lucide-react";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";
import { formatRuntime } from "./format";
import type { Movie } from "./types";

export function MovieCard({
  movie,
  onSelect,
  index = 0,
}: {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  index?: number;
}) {
  const primaryGenres = movie.genres.slice(0, 2);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(movie)}
      className="group flex w-full flex-col text-left"
      aria-label={`View details for ${movie.title}`}
    >
      <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card transition-colors duration-300 group-hover:border-secondary/50">
        <Poster
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          className="aspect-[2/3] w-full"
          iconClassName="size-12"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a09]/95 via-[#0f0a09]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-2 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[11px] font-bold text-secondary-foreground">
            <Eye className="size-3.5" />
            View showtimes
          </span>
          <span className="rounded-md border border-secondary/40 bg-[#15100e]/85 px-2 py-1 text-[11px] font-semibold text-secondary">
            {movie.language[0] ?? "Hindi"}
          </span>
        </div>
        <RatingBadge
          rating={movie.rating}
          votes={movie.votes}
          className="absolute left-2.5 top-2.5"
        />
        <div className="absolute right-2.5 top-2.5 rounded-md bg-[#15100e]/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/80 backdrop-blur-sm">
          {movie.year}
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-1 text-[15px] font-bold tracking-tight text-foreground">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3" />
            {formatRuntime(movie.runtime)}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="line-clamp-1">{primaryGenres.join(" · ") || "Drama"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {primaryGenres.map((genre) => (
            <span
              key={genre}
              className="rounded-sm border border-border/70 bg-card px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
