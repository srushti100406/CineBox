import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/boxoffice/Navbar";
import { Hero } from "@/components/boxoffice/Hero";
import { Marquee } from "@/components/boxoffice/Marquee";
import { NowShowing } from "@/components/boxoffice/NowShowing";
import { Theatres } from "@/components/boxoffice/Theatres";
import { MovieDialog } from "@/components/boxoffice/MovieDialog";
import { TheatreDialog } from "@/components/boxoffice/TheatreDialog";
import { Footer } from "@/components/boxoffice/Footer";
import type { Movie, Theatre } from "@/components/boxoffice/types";

export default function Landing() {
  const movies = useQuery(api.catalog.listMovies);
  const theatres = useQuery(api.catalog.listTheatres);
  const showtimes = useQuery(api.catalog.listShowtimes);
  const seed = useMutation(api.seed.seedIfNeeded);

  const [seedState, setSeedState] = useState<"idle" | "seeding" | "error">("idle");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);

  useEffect(() => {
    if (movies !== undefined && movies.length === 0 && seedState === "idle") {
      setSeedState("seeding");
      seed()
        .then(() => setSeedState("idle"))
        .catch((error) => {
          console.error("Catalog seeding failed:", error);
          setSeedState("error");
        });
    }
  }, [movies, seed, seedState]);

  const cities = useMemo(
    () => [...new Set((theatres ?? []).map((t) => t.city))].sort(),
    [theatres],
  );

  const loading =
    movies === undefined ||
    theatres === undefined ||
    showtimes === undefined ||
    (movies.length === 0 && seedState !== "error");

  if (loading) {
    return <CinematicLoader />;
  }

  if (movies.length === 0 && seedState === "error") {
    return <SeedError onRetry={() => setSeedState("idle")} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero
          movies={movies}
          theatresCount={theatres.length}
          cityCount={cities.length}
          onSelect={setSelectedMovie}
        />
        <Marquee titles={movies.slice(0, 24).map((m) => m.title)} />
        <NowShowing movies={movies} onSelect={setSelectedMovie} />
        <Theatres
          theatres={theatres}
          showtimes={showtimes}
          onSelect={setSelectedTheatre}
        />
      </main>
      <Footer cities={cities} />

      <MovieDialog
        movie={selectedMovie}
        theatres={theatres}
        onClose={() => setSelectedMovie(null)}
      />
      <TheatreDialog
        theatre={selectedTheatre}
        movies={movies}
        onSelectMovie={(movie) => {
          setSelectedTheatre(null);
          setSelectedMovie(movie);
        }}
        onClose={() => setSelectedTheatre(null)}
      />
    </div>
  );
}

function CinematicLoader() {
  return (
    <div className="velvet-deep grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
      <motion.img
        src="/logo.svg"
        alt="CineBox"
        width={56}
        height={56}
        className="size-14"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="mt-6 font-display text-3xl tracking-[0.22em] text-foreground">
        CINE<span className="gold-text">BOX</span>
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-secondary" />
        Rolling out the red carpet…
      </div>
    </div>
  );
}

function SeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="velvet-deep grain relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-4xl tracking-wide text-foreground">
        The <span className="gold-text">curtain</span> caught
      </p>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load the catalog. Give the box office another tap.
      </p>
      <Button className="mt-6 gap-2" onClick={onRetry}>
        <RefreshCcw className="size-4" />
        Retry
      </Button>
    </div>
  );
}
