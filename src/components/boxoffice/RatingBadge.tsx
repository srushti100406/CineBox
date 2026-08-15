import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVotes } from "./format";

export function RatingBadge({
  rating,
  votes,
  className,
}: {
  rating: number;
  votes: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-[#15100e]/85 px-1.5 py-0.5 backdrop-blur-sm",
        className,
      )}
    >
      <Star className="size-3 fill-secondary text-secondary" />
      <span className="text-xs font-bold text-secondary">
        {rating.toFixed(1)}
      </span>
      <span className="text-[10px] font-medium text-foreground/60">
        {formatVotes(votes)}
      </span>
    </div>
  );
}
