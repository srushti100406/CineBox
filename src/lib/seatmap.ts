export type SeatClass = "silver" | "gold" | "recliner";

export interface Seat {
  label: string;
  className: SeatClass;
  price: number;
  row: string;
  col: number;
  /** Column after which an aisle gap is rendered. */
  aisleAfter: number;
}

export interface PriceList {
  silver: number;
  gold: number;
  recliner: number;
}

const SECTIONS: {
  className: SeatClass;
  rows: string[];
  cols: number;
  aisleAfter: number;
}[] = [
  { className: "silver", rows: ["A", "B", "C", "D", "E", "F"], cols: 12, aisleAfter: 6 },
  { className: "gold", rows: ["G", "H", "I", "J", "K", "L"], cols: 12, aisleAfter: 6 },
  { className: "recliner", rows: ["M", "N"], cols: 8, aisleAfter: 4 },
];

export const MAX_SEATS_PER_BOOKING = 10;

export function buildSeatMap(prices: PriceList): Seat[] {
  const seats: Seat[] = [];
  for (const section of SECTIONS) {
    for (const row of section.rows) {
      for (let col = 1; col <= section.cols; col++) {
        seats.push({
          label: `${row}${col}`,
          className: section.className,
          price: prices[section.className],
          row,
          col,
          aisleAfter: section.aisleAfter,
        });
      }
    }
  }
  return seats;
}

export const SEAT_SECTION_LABELS: Record<SeatClass, string> = {
  silver: "Silver",
  gold: "Gold",
  recliner: "Recliner",
};
