import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Poster } from "@/components/boxoffice/Poster";
import { downloadTicket, type TicketData } from "@/components/boxoffice/Ticket";
import { inr } from "@/components/boxoffice/format";
import type { Booking, Movie, Showtime, Theatre } from "@/components/boxoffice/types";

export default function Bookings() {
  const bookings = useQuery(api.bookings.listMyBookings);
  const movies = useQuery(api.catalog.listMovies);
  const theatres = useQuery(api.catalog.listTheatres);
  const showtimes = useQuery(api.catalog.listShowtimes);

  const loading =
    bookings === undefined || movies === undefined || theatres === undefined || showtimes === undefined;

  const moviesById = useMemo(
    () => new Map((movies ?? []).map((m) => [m._id, m])),
    [movies],
  );
  const theatresById = useMemo(
    () => new Map((theatres ?? []).map((t) => [t._id, t])),
    [theatres],
  );
  const showtimesById = useMemo(
    () => new Map((showtimes ?? []).map((s) => [s._id, s])),
    [showtimes],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
            <span className="font-display text-xl tracking-[0.18em]">
              CINE<span className="gold-text">BOX</span>
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to browse
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          Your account
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide sm:text-5xl">
          My <span className="gold-text">Bookings</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every confirmed ticket lives here. Download your digital pass and
          present it at the entrance.
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Fetching your bookings…
            </div>
          ) : bookings === null ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center">
              <TicketIcon className="mb-3 size-8 text-secondary/60" />
              <p className="text-sm font-semibold text-foreground">
                Sign in to see your bookings
              </p>
              <Button asChild className="mt-5">
                <Link to="/auth?returnTo=/bookings">Sign in</Link>
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center">
              <TicketIcon className="mb-3 size-8 text-secondary/60" />
              <p className="text-sm font-semibold text-foreground">
                No bookings yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Browse the real lineup, pick a screening, choose your seats and
                complete a checkout to see your tickets here.
              </p>
              <Button asChild className="mt-5 gap-2">
                <Link to="/">
                  <TicketIcon className="size-4" />
                  Browse Now Showing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking, i) => {
                const movie = moviesById.get(booking.movieId);
                const theatre = theatresById.get(booking.theatreId);
                const showtime = showtimesById.get(booking.showtimeId);
                if (!movie || !theatre || !showtime) {
                  return (
                    <div
                      key={booking._id}
                      className="rounded-xl border border-border/70 bg-card/60 p-5 text-sm text-muted-foreground"
                    >
                      This booking&apos;s details are no longer available.
                    </div>
                  );
                }
                const ticketData: TicketData = {
                  booking: {
                    date: booking.date,
                    time: booking.time,
                    seats: booking.seats,
                    subtotal: booking.subtotal,
                    fees: booking.fees,
                    total: booking.total,
                    bookingCode: booking.bookingCode,
                  },
                  movie: { title: movie.title, rating: movie.rating, language: movie.language },
                  theatre: {
                    name: theatre.name,
                    chain: theatre.chain,
                    area: theatre.area,
                    city: theatre.city,
                  },
                  showtime: { format: showtime.format, screen: showtime.screen },
                };
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                    className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/60 p-4 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="w-20 shrink-0 overflow-hidden rounded-md border border-border/70">
                      <Poster
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="aspect-[2/3] w-full"
                        iconClassName="size-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold tracking-tight text-foreground">
                          {movie.title}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-sm border border-secondary/40 bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                          <CheckCircle2 className="size-3" />
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-sm tracking-[0.15em] text-secondary">
                        {booking.bookingCode}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-secondary/70" />
                          {dateLabelFor(booking.date)} · {booking.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-secondary/70" />
                          {theatre.name}, {theatre.city}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5 text-secondary/70" />
                          {showtime.format} · {showtime.screen}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {booking.seats.map((s) => s.label).join(", ")} ·{" "}
                        <span className="font-semibold text-foreground">
                          {inr(booking.total)}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <Button size="sm" className="gap-2" onClick={() => downloadTicket(ticketData)}>
                        <TicketIcon className="size-4" />
                        Download ticket
                      </Button>
                      <Link
                        to={`/book/${movie._id}`}
                        className="text-xs font-medium text-secondary underline-offset-4 hover:underline"
                      >
                        Book again
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function dateLabelFor(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
