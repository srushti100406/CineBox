import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  MonitorPlay,
  Ticket as TicketIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Poster } from "@/components/boxoffice/Poster";
import { RatingBadge } from "@/components/boxoffice/RatingBadge";
import { dateLabel, formatRuntime, inr } from "@/components/boxoffice/format";
import {
  MAX_SEATS_PER_BOOKING,
  SEAT_SECTION_LABELS,
  buildSeatMap,
  type Seat,
  type SeatClass,
} from "@/lib/seatmap";
import { TicketView, downloadTicket, type TicketData } from "@/components/boxoffice/Ticket";
import type { Movie, Showtime, Theatre } from "@/components/boxoffice/types";

type Step = "showtime" | "seats" | "payment" | "confirmed";

const STEPS: { key: Step; label: string }[] = [
  { key: "showtime", label: "Screening" },
  { key: "seats", label: "Seats" },
  { key: "payment", label: "Payment" },
  { key: "confirmed", label: "Confirmed" },
];

interface Selection {
  showtime: Showtime;
  theatre: Theatre;
  time: string;
  date: string;
}

export default function Book() {
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useAuth();
  const createBooking = useMutation(api.bookings.createBooking);

  const movie = useQuery(
    api.catalog.getMovie,
    movieId ? { id: movieId as Id<"movies"> } : "skip",
  );
  const showtimes = useQuery(
    api.catalog.showtimesByMovie,
    movieId ? { movieId: movieId as Id<"movies"> } : "skip",
  );
  const theatres = useQuery(api.catalog.listTheatres);

  const [step, setStep] = useState<Step>("showtime");
  const [dateIndex, setDateIndex] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [seatLabels, setSeatLabels] = useState<string[]>([]);
  const [result, setResult] = useState<{ bookingCode: string; total: number } | null>(null);
  const [paying, setPaying] = useState(false);

  const booked = useQuery(
    api.bookings.bookedSeats,
    selection
      ? {
          showtimeId: selection.showtime._id,
          date: selection.date,
          time: selection.time,
        }
      : "skip",
  );

  const bookedSet = useMemo(() => new Set(booked ?? []), [booked]);

  const seatMap = useMemo(
    () => (selection ? buildSeatMap(selection.showtime.prices) : []),
    [selection],
  );

  const selectedSeats = useMemo(
    () => seatMap.filter((s) => seatLabels.includes(s.label)),
    [seatMap, seatLabels],
  );

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const fees = selectedSeats.length * 25;
  const total = subtotal + fees;

  useEffect(() => {
    setSeatLabels([]);
  }, [selection]);

  useEffect(() => {
    setSelection(null);
    setSeatLabels([]);
    setStep("showtime");
    setResult(null);
  }, [movieId]);

  const loading =
    movie === undefined || showtimes === undefined || theatres === undefined;

  const theatresById = useMemo(
    () => new Map((theatres ?? []).map((t) => [t._id, t])),
    [theatres],
  );

  const groupedShowtimes = useMemo(() => {
    if (!showtimes) return null;
    const map = new Map<Showtime["theatreId"], Showtime[]>();
    for (const s of showtimes) {
      const list = map.get(s.theatreId) ?? [];
      list.push(s);
      map.set(s.theatreId, list);
    }
    return [...map.entries()].sort((a, b) => {
      const ta = theatresById.get(a[0])?.name ?? "";
      const tb = theatresById.get(b[0])?.name ?? "";
      return ta.localeCompare(tb);
    });
  }, [showtimes, theatresById]);

  const toggleSeat = (seat: Seat) => {
    if (bookedSet.has(seat.label)) return;
    setSeatLabels((prev) => {
      if (prev.includes(seat.label)) {
        return prev.filter((l) => l !== seat.label);
      }
      if (prev.length >= MAX_SEATS_PER_BOOKING) {
        toast.error(`A maximum of ${MAX_SEATS_PER_BOOKING} seats per booking.`);
        return prev;
      }
      return [...prev, seat.label];
    });
  };

  const handlePaid = async () => {
    if (!selection) return;
    setPaying(true);
    try {
      const created = await createBooking({
        movieId: movie!._id,
        theatreId: selection.theatre._id,
        showtimeId: selection.showtime._id,
        date: selection.date,
        time: selection.time,
        seats: selectedSeats.map((s) => ({
          label: s.label,
          className: s.className,
          price: s.price,
        })),
      });
      setResult({ bookingCode: created.bookingCode, total: created.total });
      setStep("confirmed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment could not be completed.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <BookLoader />;
  }

  if (!movie) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-display text-4xl tracking-wide text-foreground">
            This film isn&apos;t on the bill
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have left our screens. Browse the current lineup instead.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Browse Now Showing</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Step progress */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const activeIdx = STEPS.findIndex((x) => x.key === step);
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    done && "border-secondary bg-secondary text-secondary-foreground",
                    active && "border-secondary text-secondary",
                    !done && !active && "border-border/70 text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-semibold uppercase tracking-wider sm:block",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      done || active ? "bg-secondary/60" : "bg-border/60",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6"
        >
          {step === "showtime" && (
            <ShowtimeStep
              movie={movie}
              grouped={groupedShowtimes}
              theatresById={theatresById}
              dateIndex={dateIndex}
              setDateIndex={setDateIndex}
              onPick={(showtime, theatre, time, date) => {
                setSelection({ showtime, theatre, time, date });
                setStep("seats");
              }}
            />
          )}

          {step === "seats" && selection && (
            <SeatsStep
              movie={movie}
              selection={selection}
              seatMap={seatMap}
              bookedSet={bookedSet}
              seatLabels={seatLabels}
              onToggle={toggleSeat}
              subtotal={subtotal}
              fees={fees}
              total={total}
              onBack={() => setStep("showtime")}
              onContinue={() => {
                if (seatLabels.length === 0) {
                  toast.error("Select at least one seat to continue.");
                  return;
                }
                setStep("payment");
              }}
            />
          )}

          {step === "payment" && selection && (
            <PaymentStep
              movie={movie}
              selection={selection}
              selectedSeats={selectedSeats}
              subtotal={subtotal}
              fees={fees}
              total={total}
              userEmail={user?.email}
              paying={paying}
              onBack={() => setStep("seats")}
              onPaid={handlePaid}
            />
          )}

          {step === "confirmed" && selection && result && (
            <ConfirmedStep
              movie={movie}
              selection={selection}
              selectedSeats={selectedSeats}
              subtotal={subtotal}
              fees={fees}
              result={result}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — choose screening                                           */
/* ------------------------------------------------------------------ */

function ShowtimeStep({
  movie,
  grouped,
  theatresById,
  dateIndex,
  setDateIndex,
  onPick,
}: {
  movie: Movie;
  grouped: Array<[Showtime["theatreId"], Showtime[]]> | null;
  theatresById: Map<Id<"theatres">, Theatre>;
  dateIndex: number;
  setDateIndex: (i: number) => void;
  onPick: (showtime: Showtime, theatre: Theatre, time: string, date: string) => void;
}) {
  const dates = grouped?.[0]?.[1][0]?.dates ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div>
        <MovieMini movie={movie} />
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl tracking-wide text-foreground">
            Choose Your <span className="gold-text">Screening</span>
          </h2>
          <div className="flex gap-2">
            {dates.map((date, i) => (
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
                This film is still being slotted across our partner screens.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {grouped.map(([theatreId, entries]) => {
                const theatre = theatresById.get(theatreId);
                if (!theatre) return null;
                return entries.map((showtime) => (
                  <div
                    key={showtime._id}
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
                        {showtime.format} · {showtime.screen}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {showtime.times.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() =>
                            onPick(
                              showtime,
                              theatre,
                              time,
                              dates[dateIndex] ?? showtime.dates[0],
                            )
                          }
                          className="rounded-md border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground"
                        >
                          {time}
                        </button>
                      ))}
                      <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                        from {inr(showtime.prices.silver)}
                      </span>
                    </div>
                  </div>
                ));
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — seats                                                      */
/* ------------------------------------------------------------------ */

function SeatsStep({
  movie,
  selection,
  seatMap,
  bookedSet,
  seatLabels,
  onToggle,
  subtotal,
  fees,
  total,
  onBack,
  onContinue,
}: {
  movie: Movie;
  selection: Selection;
  seatMap: Seat[];
  bookedSet: Set<string>;
  seatLabels: string[];
  onToggle: (seat: Seat) => void;
  subtotal: number;
  fees: number;
  total: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const sections: SeatClass[] = ["silver", "gold", "recliner"];
  const rowsBySection = (className: SeatClass) =>
    seatMap.filter((s) => s.className === className);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h2 className="font-display text-3xl tracking-wide text-foreground">
          Select Your <span className="gold-text">Seats</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {selection.theatre.name} · {selection.time} ·{" "}
          {selection.showtime.format}
        </p>

        {/* Screen */}
        <div className="mx-auto mt-8 w-3/4">
          <div className="mx-auto h-2.5 w-2/3 rounded-t-[999px] border border-t-2 border-secondary/40 bg-secondary/10" />
          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Screen this way
          </p>
        </div>

        {/* Seat map */}
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="mx-auto w-max">
            {sections.map((section) => {
              const rows = rowsBySection(section);
              const rowNames = [...new Set(rows.map((s) => s.row))];
              return (
                <div key={section} className="mb-6">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-secondary">
                    {SEAT_SECTION_LABELS[section]} ·{" "}
                    {inr(rows[0]?.price ?? 0)}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {rowNames.map((rowName) => {
                      const rowSeats = rows.filter((s) => s.row === rowName);
                      return (
                        <div key={rowName} className="flex items-center gap-1.5">
                          <span className="w-4 text-right text-[10px] font-semibold text-muted-foreground">
                            {rowName}
                          </span>
                          {rowSeats.map((seat) => {
                            const isBooked = bookedSet.has(seat.label);
                            const isSelected = seatLabels.includes(seat.label);
                            return (
                              <button
                                key={seat.label}
                                type="button"
                                disabled={isBooked}
                                onClick={() => onToggle(seat)}
                                aria-label={`Seat ${seat.label}`}
                                className={cn(
                                  "h-6 w-6 rounded-sm border text-[8px] font-bold transition-all duration-150 sm:h-7 sm:w-7 sm:text-[9px]",
                                  seat.col === seat.aisleAfter && "mr-3",
                                  isBooked &&
                                    "cursor-not-allowed border-transparent bg-foreground/10 text-foreground/25",
                                  !isBooked &&
                                    isSelected &&
                                    "border-secondary bg-secondary text-secondary-foreground",
                                  !isBooked &&
                                    !isSelected &&
                                    "border-border/70 bg-card text-transparent hover:border-secondary hover:bg-secondary/20 hover:text-secondary/60",
                                )}
                              >
                                {isBooked ? "✕" : seat.label}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <LegendDot className="border-border/70 bg-card" label="Available" />
          <LegendDot className="border-secondary bg-secondary" label="Selected" />
          <LegendDot className="border-transparent bg-foreground/10" label="Booked" />
          <span className="ml-auto text-[11px]">
            Max {MAX_SEATS_PER_BOOKING} seats per booking
          </span>
        </div>
      </div>

      {/* Summary */}
      <BookingSummary
        movie={movie}
        selection={selection}
        seatLabels={seatLabels}
        subtotal={subtotal}
        fees={fees}
        total={total}
        footer={
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full gap-2" onClick={onContinue}>
              Continue to payment
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="ghost" className="w-full gap-2" onClick={onBack}>
              <ChevronLeft className="size-4" />
              Change screening
            </Button>
          </div>
        }
      />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("inline-block size-3.5 rounded-sm border", className)} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — mock payment                                               */
/* ------------------------------------------------------------------ */

function PaymentStep({
  movie,
  selection,
  selectedSeats,
  subtotal,
  fees,
  total,
  userEmail,
  paying,
  onBack,
  onPaid,
}: {
  movie: Movie;
  selection: Selection;
  selectedSeats: Seat[];
  subtotal: number;
  fees: number;
  total: number;
  userEmail?: string;
  paying: boolean;
  onBack: () => void;
  onPaid: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCard = (value: string) =>
    value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = (): string | null => {
    if (name.trim().length < 2) return "Enter the cardholder name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (card.replace(/\s/g, "").length !== 16) return "Card number must be 16 digits.";
    const m = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return "Expiry must be in MM/YY format.";
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    const now = new Date();
    if (month < 1 || month > 12) return "Expiry month is invalid.";
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      return "This card has expired.";
    }
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3–4 digits.";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    onPaid();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="max-w-xl">
        <h2 className="font-display text-3xl tracking-wide text-foreground">
          Complete Your <span className="gold-text">Payment</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo checkout — no real card is charged.
        </p>

        <div className="mt-6 space-y-4">
          <Field label="Cardholder name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As it appears on the card"
              autoComplete="cc-name"
            />
          </Field>
          <Field label="Email for the ticket">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Card number">
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={card}
                onChange={(e) => setCard(formatCard(e.target.value))}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                className="pl-9"
                autoComplete="cc-number"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry">
              <Input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                className="tracking-widest"
                autoComplete="cc-exp"
              />
            </Field>
            <Field label="CVV">
              <Input
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </Field>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-secondary">
              <Lock className="size-3.5" />
              Secure demo checkout
            </span>
            <p className="mt-1.5">
              This is a simulated payment for demonstration. No money moves and
              your card details never leave this page.
            </p>
          </div>

          <Button size="lg" type="submit" className="w-full gap-2" disabled={paying}>
            {paying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing payment…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Pay {inr(total)}
              </>
            )}
          </Button>
          <Button variant="ghost" type="button" className="w-full gap-2" onClick={onBack}>
            <ChevronLeft className="size-4" />
            Back to seats
          </Button>
        </div>
      </form>

      <BookingSummary
        movie={movie}
        selection={selection}
        seatLabels={selectedSeats.map((s) => s.label)}
        subtotal={subtotal}
        fees={fees}
        total={total}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — confirmation + ticket                                      */
/* ------------------------------------------------------------------ */

function ConfirmedStep({
  movie,
  selection,
  selectedSeats,
  subtotal,
  fees,
  result,
}: {
  movie: Movie;
  selection: Selection;
  selectedSeats: Seat[];
  subtotal: number;
  fees: number;
  result: { bookingCode: string; total: number };
}) {
  const ticketData: TicketData = {
    booking: {
      date: selection.date,
      time: selection.time,
      seats: selectedSeats,
      subtotal,
      fees,
      total: result.total,
      bookingCode: result.bookingCode,
    },
    movie: {
      title: movie.title,
      rating: movie.rating,
      language: movie.language,
    },
    theatre: {
      name: selection.theatre.name,
      chain: selection.theatre.chain,
      area: selection.theatre.area,
      city: selection.theatre.city,
    },
    showtime: {
      format: selection.showtime.format,
      screen: selection.showtime.screen,
    },
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex size-16 items-center justify-center rounded-full border border-secondary/50 bg-secondary/10"
      >
        <CheckCircle2 className="size-8 text-secondary" />
      </motion.div>
      <h2 className="mt-4 font-display text-4xl tracking-wide text-foreground">
        Booking <span className="gold-text">Confirmed</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your tickets for {movie.title} are reserved. A confirmation is on its
        way to your inbox.
      </p>
      <p className="mt-4 rounded-lg border border-secondary/40 bg-secondary/10 px-4 py-2 font-display text-2xl tracking-[0.2em] text-secondary">
        {result.bookingCode}
      </p>

      <TicketView
        data={ticketData}
        onDownload={() => downloadTicket(ticketData)}
        className="mt-8 w-full max-w-2xl"
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link to="/bookings">
            <TicketIcon className="size-4" />
            My Bookings
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Browse more films</Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function BookingSummary({
  movie,
  selection,
  seatLabels,
  subtotal,
  fees,
  total,
  footer,
}: {
  movie: Movie;
  selection: Selection;
  seatLabels: string[];
  subtotal: number;
  fees: number;
  total: number;
  footer?: ReactNode;
}) {
  return (
    <div className="h-fit rounded-xl border border-border/70 bg-card/60 p-5 lg:sticky lg:top-24">
      <h3 className="font-display text-xl tracking-wide text-foreground">
        Booking <span className="gold-text">Summary</span>
      </h3>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-14 shrink-0 overflow-hidden rounded-md border border-border/70">
          <Poster
            src={movie.posterUrl}
            alt={movie.title}
            className="aspect-[2/3] w-full"
            iconClassName="size-5"
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-bold tracking-tight text-foreground">
            {movie.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selection.theatre.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {selection.showtime.format} · {selection.showtime.screen}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Date" value={dateLabelFor(selection.date)} />
        <Row label="Time" value={selection.time} />
        <Row label="Seats" value={seatLabels.length > 0 ? seatLabels.join(", ") : "—"} />
      </div>

      <div className="my-4 h-px bg-border/60" />

      <div className="space-y-1.5 text-sm">
        <Row label="Ticket subtotal" value={inr(subtotal)} />
        <Row label="Convenience fee" value={`${inr(fees)}`} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="font-display text-2xl tracking-wide text-secondary">
          {inr(total)}
        </span>
      </div>

      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
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
  });
}

function MovieMini({ movie }: { movie: Movie }) {
  return (
    <div className="lg:sticky lg:top-24">
      <div className="w-44 overflow-hidden rounded-xl border border-secondary/50 bg-card p-1.5">
        <Poster
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          className="aspect-[2/3] w-full rounded-lg"
        />
      </div>
      <h1 className="mt-4 font-display text-3xl leading-none tracking-wide text-foreground">
        {movie.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RatingBadge rating={movie.rating} votes={movie.votes} />
        <span className="text-xs text-muted-foreground">
          {movie.year} · {formatRuntime(movie.runtime)} · {movie.language[0] ?? "Hindi"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {movie.genres.slice(0, 3).map((genre) => (
          <span
            key={genre}
            className="rounded-sm border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary"
          >
            {genre}
          </span>
        ))}
      </div>
      <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
        {movie.summary}
      </p>
    </div>
  );
}

function BookLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-secondary" />
      <p className="text-sm">Preparing the auditorium…</p>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
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
      {children}
    </div>
  );
}
