import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, Menu, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Now Showing", href: "#now-showing" },
  { label: "Theatres", href: "#theatres" },
  { label: "Featured", href: "#featured" },
];

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          aria-label="CineBox home"
        >
          <img
            src="/logo.svg"
            alt=""
            width={30}
            height={30}
            className="size-[30px] transition-transform duration-300 group-hover:rotate-6"
          />
          <span className="font-display text-2xl tracking-[0.18em] text-foreground">
            CINE<span className="gold-text">BOX</span>
          </span>
          <span className="mt-0.5 hidden rounded-sm border border-secondary/40 px-1 py-px text-[10px] font-semibold uppercase tracking-widest text-secondary sm:inline-block">
            Live
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild className="gap-2">
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" />
                {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Dashboard"}
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/auth?returnTo=/dashboard">
                  <Ticket className="size-4" />
                  Join CineBox
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-l border-border/60 p-0">
              <div className="flex items-center gap-2.5 border-b border-border/60 px-6 py-5">
                <img src="/logo.svg" alt="" width={26} height={26} className="size-[26px]" />
                <span className="font-display text-xl tracking-[0.18em]">
                  CINE<span className="gold-text">BOX</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
                <div className="my-3 h-px bg-border/60" />
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-md bg-secondary px-3 py-3 text-sm font-semibold text-secondary-foreground"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/auth"
                      className="flex items-center gap-2 rounded-md bg-secondary px-3 py-3 text-sm font-semibold text-secondary-foreground"
                    >
                      <Ticket className="size-4" />
                      Sign in / Join
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
