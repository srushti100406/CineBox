import { mutation } from "./_generated/server";
import rawMovies from "./moviesData.json";

export const updateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();

    let updated = 0;
    let notFound = 0;

    for (const movie of movies) {
      const sourceMovie = rawMovies.find(
        (m) => m.imdbId === movie.imdbId,
      );

      if (!sourceMovie) {
        notFound++;
        continue;
      }

      await ctx.db.patch(movie._id, {
        posterUrl: sourceMovie.posterUrl,
      });

      updated++;
    }

    return {
      totalMoviesInDatabase: movies.length,
      updated,
      notFound,
    };
  },
});