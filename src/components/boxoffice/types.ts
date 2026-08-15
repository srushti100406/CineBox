import type { Doc } from "@/convex/_generated/dataModel";

export type Movie = Doc<"movies">;
export type Theatre = Doc<"theatres">;
export type Showtime = Doc<"showtimes">;
export type Booking = Doc<"bookings">;
export type BookingSeat = { label: string; className: string; price: number };
