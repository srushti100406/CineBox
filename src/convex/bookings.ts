import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

const seatValidator = v.object({
  label: v.string(),
  className: v.string(),
  price: v.number(),
});

/** Seat labels already booked for a given screening (showtime + date + time). */
export const bookedSeats = query({
  args: {
    showtimeId: v.id("showtimes"),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("bookings")
      .withIndex("by_showtime", (q) =>
        q.eq("showtimeId", args.showtimeId).eq("date", args.date).eq("time", args.time),
      )
      .collect();
    return docs.flatMap((b) => b.seats.map((s) => s.label));
  },
});

/** The signed-in user's bookings, newest first. Returns null when signed out. */
export const listMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return bookings.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** A single booking, only if it belongs to the signed-in user. */
export const getMyBooking = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const booking = await ctx.db.get(id);
    if (!booking || booking.userId !== user._id) return null;
    return booking;
  },
});

const CONVENIENCE_FEE = 25; // ₹ per ticket, shown transparently at checkout

/**
 * Place a mock-payment booking. Validates the screening, guards against
 * double-booking seats, and recomputes totals server-side so the client
 * never dictates the price.
 */
export const createBooking = mutation({
  args: {
    movieId: v.id("movies"),
    theatreId: v.id("theatres"),
    showtimeId: v.id("showtimes"),
    date: v.string(),
    time: v.string(),
    seats: v.array(seatValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Please sign in to complete your booking.");
    }
    if (args.seats.length === 0) {
      throw new Error("Select at least one seat.");
    }
    if (args.seats.length > 10) {
      throw new Error("A maximum of 10 seats can be booked per transaction.");
    }

    const showtime = await ctx.db.get(args.showtimeId);
    if (!showtime) {
      throw new Error("This screening is no longer available.");
    }
    if (!showtime.dates.includes(args.date) || !showtime.times.includes(args.time)) {
      throw new Error("That screening time is no longer available.");
    }

    // Guard against double-booking any seat on this screening.
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_showtime", (q) =>
        q.eq("showtimeId", args.showtimeId).eq("date", args.date).eq("time", args.time),
      )
      .collect();
    const taken = new Set(existing.flatMap((b) => b.seats.map((s) => s.label)));
    for (const seat of args.seats) {
      if (taken.has(seat.label)) {
        throw new Error(`Seat ${seat.label} was just booked by someone else.`);
      }
    }

    // Recompute totals from the showtime's own price list.
    const priceList = showtime.prices as Record<string, number>;
    const subtotal = args.seats.reduce((sum, seat) => {
      const price = priceList[seat.className];
      if (typeof price !== "number") {
        throw new Error(`Unknown seat class ${seat.className}.`);
      }
      return sum + price;
    }, 0);
    const fees = args.seats.length * CONVENIENCE_FEE;
    const total = subtotal + fees;

    // Generate a short, unique booking code.
    let bookingCode = "";
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate =
        "CB-" +
        Math.random().toString(36).slice(2, 6).toUpperCase() +
        Math.random().toString(36).slice(2, 4).toUpperCase();
      const duplicate = await ctx.db
        .query("bookings")
        .filter((q) => q.eq(q.field("bookingCode"), candidate))
        .first();
      if (!duplicate) {
        bookingCode = candidate;
        break;
      }
    }
    if (!bookingCode) {
      throw new Error("Could not allocate a booking code. Please try again.");
    }

    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      movieId: args.movieId,
      theatreId: args.theatreId,
      showtimeId: args.showtimeId,
      date: args.date,
      time: args.time,
      seats: args.seats,
      subtotal,
      fees,
      total,
      bookingCode,
      status: "confirmed",
    });

    return { bookingId, bookingCode, total };
  },
});
