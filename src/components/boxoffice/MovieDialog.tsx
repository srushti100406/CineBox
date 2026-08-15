import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  MonitorPlay,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Poster } from "./Poster";
import { RatingBadge } from "./RatingBadge";
import { dateLabel, formatReleaseDate, formatRuntime, inr } from "./format";
import type { Movie, Showtime, Theatre } from "./types";

export function MovieDialog({
  movie,
  theatres,
  onClose,
}: {
  movie: Movie | null;
  theatres: Theatre[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [dateIndex, setDateIndex] = useState(0);

  const showtimes = useQuery(
    api.catalog.showtimesByMovie,
    movie ? { movieId: movie._id } : "skip",
  );

  useEffect(() => {
    setDateIndex(0);
  }, [movie?._id]);

  const theatresById = useMemo(
    () => new Map(theatres.map((t) => [t._id, t])),
    [theatres],
  );

  const grouped = useMemo(() => {
    if (!showtimes) return null;
    const map = new Map<Showtime["theatreId"], Showtime[]>();
    for (const s of showtimes) {
      const list = map.get(s.theatreId) ?? [];
      list.push(s);
      map.set(s.theatreId, list);
    }
    return [...map.entries()];
  }, [showtimes]);

  const lowestPrice = useMemo(() => {
    if (!showtimes || showtimes.length === 0) return null;
    return Math.min(
      ...showtimes.map((s) => Math.min(s.prices.silver, s.prices.gold, s.prices.recliner)),
    );
  }, [showtimes]);

  if (!movie) return null;

  const sampleDate = showtimes?.[0]?.dates[dateIndex];

  return (
    <Dialog open={movie !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <div className="max-h-[88vh] overflow-y-auto">
          {/* Movie header */}
          <div className="velvet-deep relative">
            <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[220px_1fr] md:gap-8">
              <div className="mx-auto w-44 md:w-full">
                <div className="rounded-xl border border-secondary/50 bg-card p-1.5">
                  <Poster
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    className="aspect-[2/3] w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-1 text-center md:text-left">
                <DialogTitle className="font-display text-4xl leading-none tracking-wide text-foreground sm:text-5xl">
                  {movie.title}
                </DialogTitle>
                {movie.tagline && (
                  <p className="mt-2 text-sm italic text-secondary/90">
                    “{movie.tagline}”
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <RatingBadge rating={movie.rating} votes={movie.votes} />
                  <MetaPill icon={<CalendarDays className="size-3.5" />} label={String(movie.year)} />
                  <MetaPill icon={<Clock3 className="size-3.5" />} label={formatRuntime(movie.runtime)} />
                  <MetaPill label={movie.language[0] ?? "Hindi"} />
                  {movie.releaseDate && (
                    <MetaPill label={`Released ${formatReleaseDate(movie.releaseDate)}`} />
                  )}
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5 md:justify-start">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-sm border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                  {movie.summary}
                </p>

                {movie.actors.length > 0 && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-widest text-secondary">
                      Starring
                    </span>{" "}
                    {movie.actors.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Showtimes */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-2xl tracking-wide text-foreground">
                Now <span className="gold-text">Playing</span> Across Theatres
              </h3>
              <div className="flex gap-2">
                {(showtimes?.[0]?.dates ?? ["", "", ""]).map((date, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDateIndex(i)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-bold transition-all duration-200",
                      i === dateIndex
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-border/70 bg-card/60 text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                    )}
                  >
                    {dateLabel(i, date)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {grouped === null ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 py-12 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Fetching showtimes…
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-12 text-center">
                  <MonitorPlay className="mb-3 size-8 text-secondary/60" />
                  <p className="text-sm font-semibold text-foreground">
                    No confirmed screenings yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Check back soon — this film is still being slotted across our
                    partner screens.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {grouped.map(([theatreId, entries]) => {
                    const theatre = theatresById.get(theatreId);
                    if (!theatre) return null;
                    const primary = entries[0];
                    return (
                      <motion.div
                        key={theatreId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border border-border/70 bg-card/60 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-md border border-secondary/40 bg-secondary/10">
                              <Building2 className="size-3.5 text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold tracking-tight text-foreground">
                                {theatre.name}
                              </p>
                              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="size-3" />
                                {theatre.area} · {theatre.city}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-sm border border-border/70 bg-background/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {primary.format} · {primary.screen}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {primary.times.map((time) => (
                            <span
                              key={time}
                              className="cursor-default rounded-md border border-secondary/40 bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                            >
                              {time}
                            </span>
                          ))}
                          <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                            from {inr(lowestPrice ?? primary.prices.silver)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogDescription className="sr-only">
              Showtimes and booking details for {movie.title}.
            </DialogDescription>

            {/* Footer CTA */}
            <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Silver · Gold · Recliner from {inr(lowestPrice ?? 150)} — sign
                in to pick your seats and check out.
              </p>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate(`/book/${movie._id}`)}
              >
                <Ticket className="size-4" />
                Book This Movie
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaPill({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground/80">
      {icon}
      {label}
    </span>
  );
}
