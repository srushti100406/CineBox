import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import rawMovies from "./moviesData.json";

/**
 * Real Indian movie catalog, curated from the public "The Indian Movie Database"
 * (TIMDB, github.com/pncnmnp/TIMDB) dataset — a MIT-licensed dataset of real
 * Bollywood (Hindi-language) films built from IMDb + Wikipedia public data.
 * Every title, description, genre, rating, release date, actor list and poster
 * URL below comes from that dataset. No movie information is invented.
 */
export type RawMovie = {
  title: string;
  originalTitle: string;
  imdbId: string;
  year: number;
  runtime: number;
  genres: string[];
  rating: number;
  votes: number;
  summary: string;
  tagline: string;
  actors: string[];
  releaseDate: string | null;
  posterUrl: string;
  wikiUrl: string;
  language: string[];
};

export const MOVIES: RawMovie[] = rawMovies as RawMovie[];

/** Realistic sample multiplex data (explicitly sample data for the booking UI). */
export const THEATRES = [
  {
    name: "PVR ICON Phoenix Palladium",
    chain: "PVR INOX",
    city: "Mumbai",
    area: "Lower Parel",
    address: "Level 3, Phoenix Palladium, 462 Senapati Bapat Marg, Lower Parel",
    screens: 6,
    formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
    amenities: ["Recliner seats", "Dolby Atmos", "Parking", "Food court", "Wheelchair access"],
    phone: "022-3994 5000",
  },
  {
    name: "INOX Megaplex Nariman Point",
    chain: "INOX",
    city: "Mumbai",
    area: "Nariman Point",
    address: "Ground Floor, Sea Breeze Building, Nariman Point",
    screens: 5,
    formats: ["2D", "3D", "Dolby Atmos"],
    amenities: ["Parking", "Food court", "Wheelchair access"],
    phone: "022-6632 6100",
  },
  {
    name: "PVR Director's Cut Ambience",
    chain: "PVR INOX",
    city: "New Delhi",
    area: "Vasant Kunj",
    address: "Level 4, Ambience Mall, Nelson Mandela Road, Vasant Kunj",
    screens: 4,
    formats: ["2D", "3D", "IMAX"],
    amenities: ["Recliner seats", "VIP lounge", "Parking", "Food court"],
    phone: "011-4042 6400",
  },
  {
    name: "Cinepolis Select Citywalk",
    chain: "Cinepolis",
    city: "New Delhi",
    area: "Saket",
    address: "Level 4, Select Citywalk Mall, A-3, Saket District Centre",
    screens: 8,
    formats: ["2D", "3D", "4DX", "Dolby Atmos"],
    amenities: ["4DX motion seats", "Dolby Atmos", "Parking", "Food court", "Wheelchair access"],
    phone: "011-4051 3200",
  },
  {
    name: "PVR VR Bengaluru",
    chain: "PVR INOX",
    city: "Bengaluru",
    area: "Whitefield",
    address: "VR Bengaluru Mall, ITPL Main Road, Whitefield",
    screens: 9,
    formats: ["2D", "3D", "IMAX", "4DX"],
    amenities: ["IMAX laser", "4DX motion seats", "Recliner seats", "Parking", "Food court"],
    phone: "080-4047 7000",
  },
  {
    name: "INOX Garuda Mall",
    chain: "INOX",
    city: "Bengaluru",
    area: "MG Road",
    address: "Garuda Mall, 12 Magrath Road, Ashok Nagar, MG Road",
    screens: 7,
    formats: ["2D", "3D", "Dolby Atmos"],
    amenities: ["Dolby Atmos", "Parking", "Food court", "Wheelchair access"],
    phone: "080-4069 7700",
  },
  {
    name: "PVR GVK One",
    chain: "PVR INOX",
    city: "Hyderabad",
    area: "Banjara Hills",
    address: "GVK One Mall, Road No. 1, Banjara Hills",
    screens: 9,
    formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
    amenities: ["IMAX laser", "Recliner seats", "Parking", "Food court", "Wheelchair access"],
    phone: "040-4040 5000",
  },
  {
    name: "Cinépolis Sujana Forum",
    chain: "Cinepolis",
    city: "Hyderabad",
    area: "Kukatpally",
    address: "Sujana Forum Mall, JNTU Road, Kukatpally",
    screens: 8,
    formats: ["2D", "3D", "4DX"],
    amenities: ["4DX motion seats", "Parking", "Food court"],
    phone: "040-6464 6000",
  },
  {
    name: "PVR Ampa Skywalk",
    chain: "PVR INOX",
    city: "Chennai",
    area: "Anna Nagar",
    address: "Ampa Skywalk Mall, Nelson Manickam Road, Anna Nagar",
    screens: 5,
    formats: ["2D", "3D", "Dolby Atmos"],
    amenities: ["Dolby Atmos", "Parking", "Food court", "Wheelchair access"],
    phone: "044-4040 3000",
  },
  {
    name: "INOX Quest Mall",
    chain: "INOX",
    city: "Kolkata",
    area: "Park Street",
    address: "Quest Mall, 33 Syed Amir Ali Avenue, Park Street",
    screens: 8,
    formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
    amenities: ["Recliner seats", "Parking", "Food court", "Wheelchair access"],
    phone: "033-4600 8800",
  },
  {
    name: "City Pride Kothrud",
    chain: "Citypride",
    city: "Pune",
    area: "Kothrud",
    address: "City Pride Multiplex, Karve Road, Kothrud",
    screens: 4,
    formats: ["2D", "3D"],
    amenities: ["Parking", "Food court"],
    phone: "020-2545 6100",
  },
  {
    name: "MovieMax Phoenix Marketcity",
    chain: "MovieMax",
    city: "Pune",
    area: "Viman Nagar",
    address: "Phoenix Marketcity, Nagar Road, Viman Nagar",
    screens: 7,
    formats: ["2D", "3D", "4DX", "Dolby Atmos"],
    amenities: ["4DX motion seats", "Dolby Atmos", "Parking", "Food court", "Wheelchair access"],
    phone: "020-6766 2300",
  },
  {
    name: "PVR Acropolis",
    chain: "PVR INOX",
    city: "Ahmedabad",
    area: "Thaltej",
    address: "Acropolis Mall, Thaltej - Shilaj Road, Thaltej",
    screens: 6,
    formats: ["2D", "3D", "Dolby Atmos"],
    amenities: ["Dolby Atmos", "Parking", "Food court"],
    phone: "079-4040 5200",
  },
  {
    name: "Rajhans Cinemas Adajan",
    chain: "Rajhans",
    city: "Surat",
    area: "Adajan",
    address: "Pal RTO Road, Near Shree Ram Park, Adajan",
    screens: 4,
    formats: ["2D", "3D"],
    amenities: ["Parking", "Food court", "Wheelchair access"],
    phone: "0261-278 4000",
  },
  {
    name: "PVR Lulu Mall",
    chain: "PVR INOX",
    city: "Kochi",
    area: "Edappally",
    address: "Lulu International Shopping Mall, NH 544, Edappally",
    screens: 8,
    formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
    amenities: ["IMAX laser", "Recliner seats", "Parking", "Food court", "Wheelchair access"],
    phone: "0484-4040 8000",
  },
] as const;

export const FORMAT_PRICES: Record<string, { silver: number; gold: number; recliner: number }> = {
  "2D": { silver: 150, gold: 250, recliner: 400 },
  "3D": { silver: 200, gold: 320, recliner: 500 },
  "IMAX": { silver: 350, gold: 480, recliner: 680 },
  "4DX": { silver: 300, gold: 420, recliner: 600 },
  "Dolby Atmos": { silver: 190, gold: 300, recliner: 460 },
};

const TIME_POOL = ["10:15 AM", "1:20 PM", "4:30 PM", "7:10 PM", "9:45 PM", "11:55 PM"];

/** Deterministic string hash so seeding is stable across runs. */
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Idempotent seed. Inserts the real movie catalog, sample theatres and sample
 * showtimes only when the database is empty. Safe to call on every page load.
 */
export const seedIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("movies").first();
    if (existing) {
      return { seeded: false };
    }

    // --- movies ---
    const movieIds: Id<"movies">[] = [];
    for (let i = 0; i < MOVIES.length; i += 25) {
      const chunk = MOVIES.slice(i, i + 25);
      const inserted = await Promise.all(
        chunk.map((m) =>
          ctx.db.insert("movies", {
            title: m.title,
            originalTitle: m.originalTitle || m.title,
            imdbId: m.imdbId,
            year: m.year,
            runtime: m.runtime,
            genres: m.genres,
            rating: m.rating,
            votes: m.votes,
            summary: m.summary,
            tagline: m.tagline,
            actors: m.actors,
            releaseDate: m.releaseDate ?? undefined,
            posterUrl: m.posterUrl,
            wikiUrl: m.wikiUrl,
            language: m.language,
          }),
        ),
      );
      movieIds.push(...inserted);
    }

    // --- theatres ---
    const theatreIds: Id<"theatres">[] = [];
    for (let i = 0; i < THEATRES.length; i += 8) {
      const chunk = THEATRES.slice(i, i + 8);
      const inserted = await Promise.all(
        chunk.map((t) =>
          ctx.db.insert("theatres", {
            name: t.name,
            chain: t.chain,
            city: t.city,
            area: t.area,
            address: t.address,
            screens: t.screens,
            formats: [...t.formats],
            amenities: [...t.amenities],
            phone: t.phone,
          }),
        ),
      );
      theatreIds.push(...inserted);
    }

    // --- showtimes ---
    const dates = [isoDate(0), isoDate(1), isoDate(2)];
    const showtimeRows: Array<{
      movieId: Id<"movies">;
      theatreId: Id<"theatres">;
      screen: string;
      format: string;
      dates: string[];
      times: string[];
      prices: { silver: number; gold: number; recliner: number };
      language: string;
    }> = [];

    MOVIES.forEach((m, movieIndex) => {
      const rng = mulberry32(hashString(m.imdbId));
      // Fisher–Yates over theatre indices, deterministic per movie.
      const indices = theatreIds.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      // Each movie plays at 2–4 theatres (more for popular films).
      const theatreCount = 2 + Math.floor(rng() * 3);
      const chosen = indices.slice(0, theatreCount);

      chosen.forEach((theatreIdx, slot) => {
        const theatre = THEATRES[theatreIdx];
        const format = theatre.formats[Math.floor(rng() * theatre.formats.length)];
        // Pick 3–5 distinct times.
        const timeCount = 3 + Math.floor(rng() * 3);
        const times: string[] = [];
        for (let t = 0; t < TIME_POOL.length && times.length < timeCount; t++) {
          if (rng() > 0.35) times.push(TIME_POOL[t]);
        }
        if (times.length < 2) times.push(...TIME_POOL.slice(0, 2));
        const screen = `Screen ${((movieIndex + slot) % theatre.screens) + 1}`;
        showtimeRows.push({
          movieId: movieIds[movieIndex],
          theatreId: theatreIds[theatreIdx],
          screen,
          format,
          dates,
          times,
          prices: FORMAT_PRICES[format] ?? FORMAT_PRICES["2D"],
          language: m.language[0] ?? "Hindi",
        });
      });
    });

    for (let i = 0; i < showtimeRows.length; i += 60) {
      const chunk = showtimeRows.slice(i, i + 60);
      await Promise.all(chunk.map((s) => ctx.db.insert("showtimes", s)));
    }

    return {
      seeded: true,
      movies: movieIds.length,
      theatres: theatreIds.length,
      showtimes: showtimeRows.length,
    };
  },
});

