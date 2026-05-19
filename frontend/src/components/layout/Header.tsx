"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  navbarConfigForRole,
  roleLabel,
  type NavLink,
} from "@/lib/roles";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CartDrawer } from "./CartDrawer";
import { Logo } from "./Logo";
import { MoroccanFlag } from "@/components/ui/MoroccanFlag";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationBell } from "./NotificationBell";
import { ShopMegaMenu } from "./ShopMegaMenu";

const HEADER_OFFSET = "top-10";
const navLinkClass =
  "shrink-0 text-xs font-medium uppercase tracking-[0.08em] xl:text-sm xl:tracking-[0.1em]";

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.5-4 12.5-4 14 0" strokeLinecap="round" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20.5l-1.1-1C5.5 14.9 2 11.6 2 7.5 2 4.9 4 3 6.5 3c1.5 0 3 .9 3.8 2.2C11.1 3.9 12.6 3 14.1 3 16.6 3 18.6 4.9 18.6 7.5c0 4.1-3.5 7.4-8.9 11.9L12 20.5z" strokeLinejoin="round" />
    </svg>
  );
}

const currencies = [
  { code: "EUR", label: "EUR €" },
  { code: "MAD", label: "MAD د.م." },
  { code: "USD", label: "USD $" },
] as const;

function CurrencyMenu({ overlay }: { overlay: boolean }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<(typeof currencies)[number]["code"]>("EUR");
  const ref = useRef<HTMLDivElement>(null);

  const triggerClass = overlay
    ? "text-white hover:text-white/85"
    : "text-stone-800 hover:text-stone-600";

  const current = currencies.find((c) => c.code === currency) ?? currencies[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wide ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <MoroccanFlag className="h-[14px] w-[21px] shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10" />
        <span className="whitespace-nowrap">{current.label}</span>
        <svg
          className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Devise"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] min-w-[10.5rem] overflow-hidden rounded border border-stone-200 bg-white py-1 shadow-xl"
        >
          {currencies.map((c) => (
            <li key={c.code} role="option" aria-selected={currency === c.code}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition ${
                  currency === c.code
                    ? "bg-stone-100 font-medium text-stone-900"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UserAccountMenu({
  iconClass,
  navConfig,
}: {
  iconClass: string;
  navConfig: ReturnType<typeof navbarConfigForRole>;
}) {
  const { user, isAuthenticated, isLoading, logout, panelLinks } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email
    : "";
  const accountHref = navConfig.accountHref;
  const workspaceLinks = panelLinks.filter((link) => link.href !== accountHref);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  if (isLoading) {
    return (
      <span className={`inline-flex h-10 w-10 items-center justify-center ${iconClass}`} aria-hidden>
        <IconUser />
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className={iconClass} aria-label="Connexion">
        <IconUser />
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={accountHref}
        className={`inline-flex h-10 w-10 items-center justify-center ${iconClass}`}
        aria-label={navConfig.accountMenuLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconUser />
      </Link>
      {open && (
        <div className="absolute right-0 top-full z-[80] pt-2">
          <div
            role="menu"
            aria-label="Menu compte"
            className="min-w-[12rem] overflow-hidden rounded border border-stone-200 bg-white py-1 shadow-xl"
          >
            <Link
              href={accountHref}
              role="menuitem"
              className="block border-b border-stone-100 px-4 py-3 transition hover:bg-stone-50"
            >
              <span className="block text-sm font-medium text-stone-900">{displayName}</span>
              {user && (
                <span className="mt-0.5 block text-xs text-stone-500">{roleLabel(user.role)}</span>
              )}
            </Link>
            {user?.role === "customer" && (
              <Link
                href="/account"
                role="menuitem"
                className="block px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Mon compte
              </Link>
            )}
            <Link
              href="/notifications"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Notifications
            </Link>
            {navConfig.showPersonalOrders && (
              <Link
                href="/account/orders"
                role="menuitem"
                className="block px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Mes commandes
              </Link>
            )}
            {workspaceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className="block px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-50"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full border-t border-stone-100 px-4 py-2.5 text-left text-sm text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CenterNav({
  items,
  navClass,
  shopOpen,
  setShopOpen,
}: {
  items: NavLink[];
  navClass: string;
  shopOpen: boolean;
  setShopOpen: (open: boolean) => void;
}) {
  return (
    <>
      {items.map((item) =>
        item.mega ? (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link href={item.href} className={`${navLinkClass} ${navClass}`}>
              {item.label}
            </Link>
            {shopOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(92vw,720px)] max-w-[calc(100vw-2rem)] -translate-x-1/2 border border-stone-200 bg-white px-6 py-8 text-stone-900 shadow-2xl sm:px-8 lg:py-10">
                <ShopMegaMenu onNavigate={() => setShopOpen(false)} />
              </div>
            )}
          </div>
        ) : (
          <Link key={item.href} href={item.href} className={`${navLinkClass} ${navClass}`}>
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}

function CartMenu({
  iconClass,
  overlay,
  enabled,
}: {
  iconClass: string;
  overlay: boolean;
  enabled: boolean;
}) {
  const { count, openCart, isHydrated } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayCount = isAuthenticated && enabled ? count : 0;
  const checkoutHref = isAuthenticated ? "/checkout" : "/login?redirect=/checkout";

  useEffect(() => {
    if (!enabled || !open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [enabled, open]);

  if (!enabled) {
    if (!isAuthenticated) {
      return (
        <Link
          href="/login?redirect=/checkout"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
          aria-label="Panier — connexion requise"
        >
          <IconBag className="shrink-0" />
        </Link>
      );
    }
    return null;
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={openCart}
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-visible ${iconClass}`}
        aria-label={`Panier${displayCount > 0 ? `, ${displayCount} article${displayCount > 1 ? "s" : ""}` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconBag className="shrink-0" />
        {displayCount > 0 && (
          <span
            className={`absolute right-0 top-0 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
              overlay
                ? "bg-amber-500 text-white ring-2 ring-black/30"
                : "bg-stone-900 text-white ring-2 ring-white"
            }`}
          >
            {displayCount > 9 ? "9+" : displayCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[80] pt-2">
          <div
            role="menu"
            aria-label="Menu panier"
            className="min-w-[12rem] overflow-hidden rounded border border-stone-200 bg-white py-1 shadow-xl"
          >
            {!isAuthenticated ? (
              <p className="px-4 py-3 text-sm text-stone-600">
                <Link
                  href="/login?redirect=/checkout"
                  className="font-medium text-amber-900 underline-offset-2 hover:underline"
                >
                  Connectez-vous
                </Link>{" "}
                pour utiliser votre panier.
              </p>
            ) : isHydrated && displayCount === 0 ? (
              <p className="px-4 py-3 text-sm text-stone-600">Votre panier est vide.</p>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openCart}
                  className="block w-full px-4 py-2.5 text-left text-sm text-stone-700 transition hover:bg-stone-50"
                >
                  Voir le panier ({displayCount})
                </button>
                <Link
                  href={checkoutHref}
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-50"
                >
                  Finaliser mon panier
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistNavLink({
  iconClass,
  overlay,
  enabled,
}: {
  iconClass: string;
  overlay: boolean;
  enabled: boolean;
}) {
  const { count } = useWishlist();
  const { isAuthenticated } = useAuth();
  const displayCount = isAuthenticated && enabled ? count : 0;

  if (!enabled) {
    if (!isAuthenticated) {
      return (
        <Link
          href="/login?redirect=/wishlist"
          className={`hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
          aria-label="Favoris — connexion requise"
        >
          <IconHeart />
        </Link>
      );
    }
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login?redirect=/wishlist"
        className={`hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
        aria-label="Favoris — connexion requise"
      >
        <IconHeart />
      </Link>
    );
  }

  return (
    <Link
      href="/wishlist"
      className={`relative hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center ${iconClass}`}
      aria-label={`Favoris${displayCount > 0 ? `, ${displayCount} œuvre${displayCount > 1 ? "s" : ""}` : ""}`}
    >
      <IconHeart />
      {displayCount > 0 && (
        <span
          className={`absolute right-0 top-0 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
            overlay
              ? "bg-amber-500 text-white ring-2 ring-black/30"
              : "bg-stone-900 text-white ring-2 ring-white"
          }`}
        >
          {displayCount > 9 ? "9+" : displayCount}
        </span>
      )}
    </Link>
  );
}

function IconBag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
      />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout, panelLinks } = useAuth();
  const navConfig = navbarConfigForRole(user?.role, isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = isHome && !scrolled;
  const iconClass = overlay ? "text-white hover:text-white/80" : "text-stone-800 hover:text-stone-600";
  const navClass = overlay
    ? "text-white hover:text-white/80"
    : "text-stone-800 hover:text-stone-600";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-[60] overflow-x-clip ${HEADER_OFFSET} transition-colors duration-300 ${
          overlay
            ? "border-transparent bg-transparent"
            : "border-b border-stone-200 bg-white/98 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-2 px-4 lg:gap-4 lg:px-8">
          <div className="flex shrink-0 items-center gap-3 lg:min-w-[100px] xl:min-w-[120px]">
            <button
              type="button"
              className={`lg:hidden ${iconClass}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Logo light={overlay} className="hidden sm:block" />
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6 2xl:gap-8">
            <CenterNav
              items={navConfig.centerNav}
              navClass={navClass}
              shopOpen={shopOpen}
              setShopOpen={setShopOpen}
            />
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 overflow-visible sm:gap-3">
            {navConfig.showCurrency && <CurrencyMenu overlay={overlay} />}

            {navConfig.showCurrency && navConfig.showSearch && (
              <span
                className={`hidden h-5 w-px md:block ${overlay ? "bg-white/30" : "bg-stone-300"}`}
                aria-hidden
              />
            )}

            {navConfig.showSearch && <HeaderSearch iconClass={iconClass} />}

            <NotificationBell iconClass={iconClass} overlay={overlay} />

            <UserAccountMenu iconClass={iconClass} navConfig={navConfig} />

            <WishlistNavLink
              iconClass={iconClass}
              overlay={overlay}
              enabled={navConfig.showWishlist}
            />

            <CartMenu
              iconClass={iconClass}
              overlay={overlay}
              enabled={navConfig.showCart}
            />

            <Logo light={overlay} className="sm:hidden" />
          </div>
        </div>

        {menuOpen && (
          <nav
            className={`max-h-[85vh] overflow-y-auto border-t px-4 py-4 lg:hidden ${
              overlay ? "border-white/20 bg-black/90 text-white" : "border-stone-200 bg-white text-stone-900"
            }`}
          >
            {navConfig.centerNav.map((item) =>
              item.mega ? (
                <div key={item.label} className="border-b border-stone-200/80 py-4 last:border-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-60">
                    {item.label}
                  </p>
                  <ShopMegaMenu onNavigate={() => setMenuOpen(false)} />
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-3 text-base uppercase tracking-wide ${
                    isAuthenticated && item.href === navConfig.accountHref
                      ? "font-semibold text-amber-900"
                      : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-2 border-t border-stone-200/80 pt-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={navConfig.accountHref}
                    className="block py-3 text-base font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                    <span className="mt-0.5 block text-xs font-normal opacity-60">
                      {roleLabel(user.role)}
                    </span>
                  </Link>
                  {user.role === "customer" && (
                    <Link
                      href="/account"
                      className="block py-3 text-base"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                  )}
                  <Link
                    href="/notifications"
                    className="block py-3 text-base"
                    onClick={() => setMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                  {navConfig.showPersonalOrders && (
                    <Link
                      href="/account/orders"
                      className="block py-3 text-base"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mes commandes
                    </Link>
                  )}
                  {panelLinks
                    .filter((link) => link.href !== navConfig.accountHref)
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block py-3 text-base font-medium text-amber-900"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  {navConfig.showCart && (
                    <Link
                      href="/checkout"
                      className="block py-3 text-base"
                      onClick={() => setMenuOpen(false)}
                    >
                      Finaliser mon panier
                    </Link>
                  )}
                  <button
                    type="button"
                    className="block w-full py-3 text-left text-base text-stone-600"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" className="block py-3 text-base" onClick={() => setMenuOpen(false)}>
                  Connexion
                </Link>
              )}
              {navConfig.showWishlist && isAuthenticated && (
                <Link href="/wishlist" className="block py-3 text-base" onClick={() => setMenuOpen(false)}>
                  Favoris
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
