import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Real Indian movie catalog (seeded from the TIMDB public dataset).
    movies: defineTable({
      title: v.string(),
      originalTitle: v.string(),
      imdbId: v.string(),
      year: v.number(),
      runtime: v.number(), // minutes
      genres: v.array(v.string()),
      rating: v.number(), // IMDb rating
      votes: v.number(), // IMDb votes
      summary: v.string(), // real description from the dataset
      tagline: v.string(),
      actors: v.array(v.string()),
      releaseDate: v.optional(v.string()), // ISO date
      posterUrl: v.string(),
      wikiUrl: v.string(),
      language: v.array(v.string()),
    })
      .index("by_rating", ["rating"])
      .index("by_year", ["year"]),

    // Realistic sample multiplex theatres across India.
    theatres: defineTable({
      name: v.string(),
      chain: v.string(),
      city: v.string(),
      area: v.string(),
      address: v.string(),
      screens: v.number(),
      formats: v.array(v.string()),
      amenities: v.array(v.string()),
      phone: v.string(),
    }).index("by_city", ["city"]),

    // Sample showtimes linking movies to theatres.
    showtimes: defineTable({
      movieId: v.id("movies"),
      theatreId: v.id("theatres"),
      screen: v.string(),
      format: v.string(),
      dates: v.array(v.string()), // upcoming ISO dates
      times: v.array(v.string()), // show times on each date
      prices: v.object({
        silver: v.number(),
        gold: v.number(),
        recliner: v.number(),
      }),
      language: v.string(),
    })
      .index("by_movie", ["movieId"])
      .index("by_theatre", ["theatreId"]),

    // Confirmed bookings placed through the (mock) checkout flow.
    bookings: defineTable({
      userId: v.id("users"),
      movieId: v.id("movies"),
      theatreId: v.id("theatres"),
      showtimeId: v.id("showtimes"),
      date: v.string(), // ISO date of the screening
      time: v.string(), // show time, e.g. "7:10 PM"
      seats: v.array(
        v.object({
          label: v.string(),
          className: v.string(),
          price: v.number(),
        }),
      ),
      subtotal: v.number(),
      fees: v.number(),
      total: v.number(),
      bookingCode: v.string(),
      status: v.string(), // "confirmed"
    })
      .index("by_user", ["userId"])
      .index("by_showtime", ["showtimeId", "date", "time"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
