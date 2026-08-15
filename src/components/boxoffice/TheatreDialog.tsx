import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Building2,
  Clapperboard,
  Loader2,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Poster } from "./Poster";
import { dateLabel } from "./format";
import type { Movie, Showtime, Theatre } from "./types";

export function TheatreDialog({
  theatre,
  movies,
  onSelectMovie,
  onClose,
}: {
  theatre: Theatre | null;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onClose: () => void;
}) {
  const showtimes = useQuery(
    api.catalog.showtimesByTheatre,
    theatre ? { theatreId: theatre._id } : "skip",
  );

  const moviesById = useMemo(
    () => new Map(movies.map((m) => [m._id, m])),
    [movies],
  );

  const grouped = useMemo(() => {
    if (!showtimes) return null;
    const map = new Map<Showtime["movieId"], Showtime[]>();
    for (const s of showtimes) {
      const list = map.get(s.movieId) ?? [];
      list.push(s);
      map.set(s.movieId, list);
    }
    return [...map.entries()].sort((a, b) => {
      const ma = moviesById.get(a[0]);
      const mb = moviesById.get(b[0]);
      return (mb?.votes ?? 0) - (ma?.votes ?? 0);
    });
  }, [showtimes, moviesById]);

  if (!theatre) return null;

  const sampleDate = showtimes?.[0]?.dates[0];

  return (
    <Dialog open={theatre !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <div className="max-h-[88vh] overflow-y-auto">
          {/* Theatre header */}
          <div className="velvet-deep relative p-6 sm:p-8">
            <DialogTitle className="flex items-center gap-3 font-display text-3xl tracking-wide text-foreground sm:text-4xl">
              <div className="flex size-10 items-center justify-center rounded-md border border-secondary/40 bg-secondary/10">
                <Building2 className="size-5 text-secondary" />
              </div>
              <span>
                {theatre.name} <span className="gold-text">· {theatre.city}</span>
              </span>
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-xl">
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                {theatre.chain} · {theatre.screens} screens
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-sm text-foreground/70">
                <MapPin className="size-3.5 text-secondary/70" />
                {theatre.address}
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-sm text-foreground/70">
                <Phone className="size-3.5 text-secondary/70" />
                {theatre.phone}
              </span>
            </DialogDescription>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {theatre.formats.map((format) => (
                <span
                  key={format}
                  className="rounded-sm border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary"
                >
                  {format}
                </span>
              ))}
              {theatre.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-sm border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* On the bill */}
          <div className="p-6 sm:p-8">
            <h3 className="font-display text-2xl tracking-wide text-foreground">
              On the Bill <span className="gold-text">Today</span>
              {sampleDate && (
                <span className="ml-2 text-sm font-sans font-medium tracking-normal text-muted-foreground">
                  {dateLabel(0, sampleDate)}
                </span>
              )}
            </h3>

            <div className="mt-5">
              {grouped === null ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 py-12 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Fetching the bill…
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center">
                  <Clapperboard className="mb-3 size-8 text-secondary/60" />
                  <p className="text-sm font-semibold text-foreground">
                    No screenings scheduled
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This screen is dark today — check back tomorrow.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {grouped.map(([movieId, entries]) => {
                    const movie = moviesById.get(movieId);
                    if (!movie) return null;
                    const primary = entries[0];
                    return (
                      <motion.div
                        key={movieId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-3"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectMovie(movie);
                          }}
                          className="shrink-0 cursor-pointer overflow-hidden rounded-md border border-border/70"
                          aria-label={`View ${movie.title}`}
                        >
                          <Poster
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-24 w-16"
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="line-clamp-1 text-sm font-bold tracking-tight text-foreground">
                              {movie.title}
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-secondary/40 bg-secondary/10 px-1.5 py-0.5 text-[11px] font-bold text-secondary">
                              <Star className="size-3 fill-secondary" />
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {primary.format} · {primary.screen} · {movie.language[0] ?? "Hindi"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {primary.times.map((time) => (
                              <span
                                key={time}
                                className="cursor-default rounded-md border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden shrink-0 text-secondary sm:inline-flex"
                          onClick={() => {
                            onClose();
                            onSelectMovie(movie);
                          }}
                        >
                          Details
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
