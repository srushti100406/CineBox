import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./NowShowing";
import type { Showtime, Theatre } from "./types";

export function Theatres({
  theatres,
  showtimes,
  onSelect,
}: {
  theatres: Theatre[];
  showtimes: Showtime[];
  onSelect: (theatre: Theatre) => void;
}) {
  const [city, setCity] = useState<string>("all");

  const cities = useMemo(
    () => [...new Set(theatres.map((t) => t.city))].sort(),
    [theatres],
  );

  const playingCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of showtimes) {
      counts.set(s.theatreId, (counts.get(s.theatreId) ?? 0) + 1);
    }
    return counts;
  }, [showtimes]);

  const visible = useMemo(
    () => theatres.filter((t) => city === "all" || t.city === city),
    [theatres, city],
  );

  return (
    <section id="theatres" className="velvet-panel relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          kicker="Multiple theatres"
          title={
            <>
              Playing Across <span className="gold-text">India</span>
            </>
          }
          subtitle={`One lineup, many screens — sample multiplex partners in ${cities.length} cities. Tap a theatre to see what’s on the bill.`}
        />

        <div className="mt-6 flex flex-wrap gap-2">
          <CityChip
            label="All cities"
            active={city === "all"}
            onClick={() => setCity("all")}
          />
          {cities.map((c) => (
            <CityChip
              key={c}
              label={c}
              active={city === c}
              onClick={() => setCity(c)}
            />
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((theatre, i) => (
              <motion.button
                key={theatre._id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.5) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(theatre)}
                className="group flex flex-col rounded-xl border border-border/70 bg-card/70 p-5 text-left transition-colors duration-300 hover:border-secondary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-md border border-secondary/40 bg-secondary/10">
                      <Building2 className="size-4 text-secondary" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                        {theatre.chain}
                      </span>
                      <h3 className="mt-0.5 text-[15px] font-bold leading-snug tracking-tight text-foreground">
                        {theatre.name}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/60 px-2 py-1 text-[11px] font-semibold text-foreground/75">
                    <MonitorPlay className="size-3.5 text-secondary" />
                    {playingCount.get(theatre._id) ?? 0} films
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-secondary/70" />
                  {theatre.area} · {theatre.city} · {theatre.screens} screens
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {theatre.formats.map((format) => (
                    <span
                      key={format}
                      className="rounded-sm border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {format}
                    </span>
                  ))}
                </div>

                <div className="mt-4 border-t border-border/50 pt-3 text-xs font-medium text-secondary transition-colors group-hover:text-secondary/80">
                  View showtimes →
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              No partner theatres in {city} yet — browse another city.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function CityChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
        active
          ? "border-secondary bg-secondary text-secondary-foreground"
          : "border-border/70 bg-card/60 text-muted-foreground hover:border-secondary/50 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
