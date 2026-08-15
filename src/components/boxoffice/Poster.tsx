import { useState } from "react";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

export function Poster({
  src,
  alt,
  className,
  iconClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-border/40 bg-gradient-to-br from-[#331018] via-[#1d0d10] to-[#0f0a09]",
          className,
        )}
      >
        <Film className={cn("size-10 text-secondary/40", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
