import { Link } from "react-router";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="velvet-deep grain relative flex min-h-screen flex-col"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-8xl leading-none tracking-wide text-foreground">
          4<span className="gold-text">0</span>4
        </p>
        <p className="mt-3 font-display text-2xl tracking-[0.2em] text-foreground/80">
          THIS SCREEN IS DARK
        </p>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          The page you&apos;re after isn&apos;t on the bill — head back to the
          marquee and browse the real lineup.
        </p>
        <Button asChild className="mt-7 gap-2">
          <Link to="/">
          <Ticket className="size-4" />
          Back to CineBox
        </Link>
        </Button>
      </div>
    </motion.div>
  );
}
