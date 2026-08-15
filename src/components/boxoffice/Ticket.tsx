import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inr } from "./format";
import type { BookingSeat } from "./types";

export interface TicketData {
  booking: {
    date: string;
    time: string;
    seats: BookingSeat[];
    subtotal: number;
    fees: number;
    total: number;
    bookingCode: string;
  };
  movie: { title: string; rating: number; language: string[] };
  theatre: { name: string; chain: string; area: string; city: string };
  showtime: { format: string; screen: string };
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

function fullDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function barcodeBars(code: string): string {
  const chars = code.replace(/[^A-Z0-9]/g, "").padEnd(12, "0").slice(0, 16);
  let x = 0;
  let bars = "";
  for (let i = 0; i < chars.length; i++) {
    const width = 2 + (chars.charCodeAt(i) % 4);
    bars += `<rect x="${x}" y="0" width="${width}" height="34" fill="#e8d9a8"/>`;
    x += width + 3;
  }
  return bars;
}

export function ticketSvgString(data: TicketData): string {
  const { booking, movie, theatre, showtime } = data;
  const title = movie.title.length > 34 ? `${movie.title.slice(0, 33)}…` : movie.title;
  const seatsLabel = booking.seats.map((s) => s.label).join(", ");
  const date = fullDate(booking.date);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420" width="760" height="420" font-family="Inter, Arial, sans-serif">
  <rect width="760" height="420" fill="#130d0c"/>
  <rect x="0" y="0" width="760" height="4" fill="#d4af37"/>
  <rect x="0" y="416" width="760" height="4" fill="#d4af37"/>

  <!-- Left stub -->
  <text transform="rotate(-90 58 210)" x="58" y="210" font-family="'Bebas Neue','Arial Narrow',Arial,sans-serif" font-size="30" letter-spacing="8" fill="#d4af37">CINEBOX</text>
  <text transform="rotate(-90 120 210)" x="120" y="210" font-size="11" letter-spacing="3" fill="#9a8f7a">ADMIT ONE</text>
  <circle cx="150" cy="84" r="15" fill="#130d0c" stroke="#d4af37" stroke-opacity="0.35"/>
  <circle cx="150" cy="336" r="15" fill="#130d0c" stroke="#d4af37" stroke-opacity="0.35"/>
  <line x1="150" y1="4" x2="150" y2="416" stroke="#d4af37" stroke-opacity="0.4" stroke-dasharray="5 6"/>

  <!-- Main -->
  <text x="178" y="52" font-size="12" letter-spacing="5" fill="#d4af37" font-weight="700">CINEBOX · CONFIRMED TICKET</text>
  <text x="742" y="52" text-anchor="end" font-size="16" letter-spacing="1" fill="#e8d9a8" font-weight="700">PAID ${esc(inr(booking.total))}</text>

  <text x="178" y="108" font-family="'Bebas Neue','Arial Narrow',Arial,sans-serif" font-size="42" fill="#f4e9c3">${esc(title)}</text>
  <text x="178" y="136" font-size="13" fill="#cfc4b0">★ ${movie.rating.toFixed(1)} · ${esc(movie.language.join(", "))} · ${esc(showtime.format)} · ${esc(showtime.screen)}</text>

  <!-- Meta columns -->
  <text x="178" y="186" font-size="10" letter-spacing="3" fill="#9a8f7a" font-weight="700">DATE</text>
  <text x="178" y="208" font-size="15" fill="#f4e9c3" font-weight="600">${esc(date)}</text>
  <text x="368" y="186" font-size="10" letter-spacing="3" fill="#9a8f7a" font-weight="700">TIME</text>
  <text x="368" y="208" font-size="15" fill="#f4e9c3" font-weight="600">${esc(booking.time)}</text>
  <text x="558" y="186" font-size="10" letter-spacing="3" fill="#9a8f7a" font-weight="700">SEATS</text>
  <text x="558" y="208" font-size="15" fill="#f4e9c3" font-weight="600">${esc(seatsLabel)}</text>

  <line x1="178" y1="232" x2="742" y2="232" stroke="#d4af37" stroke-opacity="0.2"/>

  <text x="178" y="260" font-size="10" letter-spacing="3" fill="#9a8f7a" font-weight="700">THEATRE</text>
  <text x="178" y="282" font-size="16" fill="#f4e9c3" font-weight="600">${esc(theatre.name)}</text>
  <text x="178" y="302" font-size="12" fill="#cfc4b0">${esc(theatre.area)} · ${esc(theatre.city)} · ${esc(theatre.chain)}</text>

  <g transform="translate(178, 352)">${barcodeBars(booking.bookingCode)}</g>
  <text x="178" y="396" font-size="12" letter-spacing="3" fill="#e8d9a8" font-weight="700">${esc(booking.bookingCode)}</text>
  <text x="742" y="396" text-anchor="end" font-size="11" letter-spacing="2" fill="#9a8f7a">PRESENT THIS TICKET AT ENTRY</text>
</svg>`;
}

export function downloadTicket(data: TicketData): void {
  const svg = ticketSvgString(data);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `CineBox-${data.booking.bookingCode}.svg`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function TicketView({
  data,
  onDownload,
  className,
}: {
  data: TicketData;
  onDownload: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="overflow-hidden rounded-xl border border-secondary/40"
        dangerouslySetInnerHTML={{ __html: ticketSvgString(data) }}
      />
      <Button className="mt-4 gap-2" onClick={onDownload}>
        <Download className="size-4" />
        Download ticket
      </Button>
    </div>
  );
}
