import { Link } from "react-router";
import { Database, Ticket } from "lucide-react";

export function Footer({ cities }: { cities: string[] }) {
  return (
    <footer className="border-t border-border/60 bg-[#0f0a09]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
              <span className="font-display text-xl tracking-[0.18em]">
                CINE<span className="gold-text">BOX</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A premium booking desk for real Indian cinema. Browse the genuine
              lineup, choose your screening and seats, and check out in minutes —
              your digital ticket is ready to download.
            </p>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground/80">
              <Database className="mt-0.5 size-3.5 shrink-0 text-secondary/70" />
              Movie data (titles, descriptions, ratings, genres, release dates,
              posters) is real — curated from the public{" "}
              <span className="text-foreground/80">Indian Movie Database (TIMDB)</span>,
              built on IMDb &amp; Wikipedia data. No movie information is invented.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="#featured" className="transition-colors hover:text-foreground">
                  Featured films
                </a>
              </li>
              <li>
                <a href="#now-showing" className="transition-colors hover:text-foreground">
                  Now showing
                </a>
              </li>
              <li>
                <a href="#theatres" className="transition-colors hover:text-foreground">
                  Partner theatres
                </a>
              </li>
              <li>
                <Link to="/auth" className="transition-colors hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
              Cities
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {cities.slice(0, 6).map((city) => (
                <li key={city}>
                  <a href="#theatres" className="transition-colors hover:text-foreground">
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
              Your account
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-secondary" />
                Sign up &amp; sign in
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-secondary" />
                Browse &amp; search the catalog
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-secondary" />
                Seat selection &amp; checkout
              </li>
              <li className="flex items-center gap-2 text-foreground/60">
                <Ticket className="size-3.5" />
                Downloadable digital tickets
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CineBox — a movie-booking demonstration. Sample theatre &amp; showtime data; mock payment only.</p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-secondary animate-gold-pulse" />
            Curtains up — the real films are here.
          </p>
        </div>
      </div>
    </footer>
  );
}
