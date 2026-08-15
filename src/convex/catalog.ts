import { query } from "./_generated/server";
import { v } from "convex/values";

/** All movies, most-voted first (used for popularity ordering). */
export const listMovies = query({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();
    return movies.sort((a, b) => b.votes - a.votes);
  },
});

export const getMovie = query({
  args: { id: v.id("movies") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listTheatres = query({
  args: {},
  handler: async (ctx) => {
    const theatres = await ctx.db.query("theatres").collect();
    return theatres.sort(
      (a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
    );
  },
});

export const listShowtimes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("showtimes").collect();
  },
});

export const showtimesByMovie = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, { movieId }) => {
    return await ctx.db
      .query("showtimes")
      .withIndex("by_movie", (q) => q.eq("movieId", movieId))
      .collect();
  },
});

export const showtimesByTheatre = query({
  args: { theatreId: v.id("theatres") },
  handler: async (ctx, { theatreId }) => {
    return await ctx.db
      .query("showtimes")
      .withIndex("by_theatre", (q) => q.eq("theatreId", theatreId))
      .collect();
  },
});

/** Catalog counts, used to know whether seeding has run. */
export const catalogStats = query({
  args: {},
  handler: async (ctx) => {
    const movies = (await ctx.db.query("movies").collect()).length;
    const theatres = (await ctx.db.query("theatres").collect()).length;
    const showtimes = (await ctx.db.query("showtimes").collect()).length;
    return { movies, theatres, showtimes };
  },
});
