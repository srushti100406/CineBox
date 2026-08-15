import { type ReactNode } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Ticket,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const bookings = useQuery(api.bookings.listMyBookings);

  const bookingCount = bookings?.length ?? 0;
  const totalSpent =
    bookings?.reduce((sum, b) => sum + b.total, 0) ?? 0;

  const NAV = [
    { label: "Overview", icon: LayoutDashboard, active: true, href: null as string | null },
    { label: "My Bookings", icon: CalendarDays, active: false, href: "/bookings" },
    { label: "Browse films", icon: Ticket, active: false, href: "/" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 p-5 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-2.5">
            <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
            <span className="font-display text-lg tracking-[0.18em]">
              CINE<span className="gold-text">BOX</span>
            </span>
          </Link>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-md border border-secondary/40 bg-secondary/10 px-3 py-2.5 text-sm font-medium text-secondary"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </div>
              ),
            )}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start gap-2 text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
            <p className="px-3 text-[10px] leading-relaxed text-muted-foreground/70">
              CineBox — real Indian cinema, premium screens, mock checkout for
              demonstration.
            </p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 px-5 py-8 sm:px-8">
          <div className="flex items-center justify-between gap-3 md:hidden">
            <img src="/logo.svg" alt="" width={26} height={26} className="size-6" />
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-muted-foreground">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              Member home
            </p>
            <h1 className="mt-2 font-display text-4xl tracking-wide sm:text-5xl">
              Welcome to the <span className="gold-text">CineBox Club</span>
            </h1>

            {/* Profile card */}
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-5">
              <div className="flex size-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 font-display text-2xl tracking-wide text-secondary">
                {(user?.name ?? user?.email ?? "C").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold tracking-tight text-foreground">
                  {user?.name ?? "CineBox member"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Location • {user?.email ?? "Signed in as a guest"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button asChild className="gap-2">
                  <Link to="/bookings">
                    <CalendarDays className="size-4" />
                    My Bookings
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={<CalendarDays className="size-5 text-secondary" />}
                value={String(bookingCount)}
                label="Confirmed bookings"
              />
              <StatCard
                icon={<Ticket className="size-5 text-secondary" />}
                value={bookingCount > 0 ? `₹${totalSpent.toLocaleString("en-IN")}` : "—"}
                label="Total spent"
              />
              <StatCard
                icon={<UserRound className="size-5 text-secondary" />}
                value="Member"
                label="Account type"
              />
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-6">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-secondary/40 bg-secondary/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-3xl leading-none tracking-wide text-secondary">
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
