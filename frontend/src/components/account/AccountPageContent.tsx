"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountPasswordForm } from "@/components/account/AccountPasswordForm";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { accountCardClass } from "@/components/account/account-form-styles";
import {
  homeBtnGhost,
  homeBtnPrimary,
  homeEyebrow,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { defaultHomeForRole, isStaffRole } from "@/lib/roles";

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function AccountPageContent() {
  const { user, isLoading, isAuthenticated, panelLinks, logout } = useAuth();
  const { count: cartCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/account");
      return;
    }
    if (user && isStaffRole(user.role)) {
      router.replace(defaultHomeForRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Chargement de votre compte…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <p className={homeEyebrow}>Espace client</p>
          <h1 className={`mt-3 ${homeTitle} sm:text-4xl`}>
            Bonjour,
            <span className={`mt-1 block ${homeTitleItalic}`}>{user.firstName}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-stone-600">
            Gérez vos informations, votre adresse de livraison et votre mot de passe.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1fr_18rem] lg:gap-12 lg:px-8 xl:grid-cols-[1fr_20rem]">
          <div className="space-y-8">
            <AccountProfileForm />
            <AccountPasswordForm />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className={accountCardClass}>
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 font-serif text-2xl text-amber-950"
                aria-hidden
              >
                {initials(user.firstName, user.lastName)}
              </div>
              <p className="mt-4 text-center font-serif text-xl text-stone-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-1 text-center text-sm text-stone-500">{user.email}</p>
              {user.phone && (
                <p className="mt-1 text-center text-sm text-stone-500">{user.phone}</p>
              )}
            </div>

            <nav className={accountCardClass}>
              <p className={homeEyebrow}>Raccourcis</p>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/wishlist"
                    className="block py-2 text-sm text-stone-700 transition hover:text-amber-900"
                  >
                    Mes favoris →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/paintings/available"
                    className="block py-2 text-sm text-stone-700 transition hover:text-amber-900"
                  >
                    Œuvres disponibles →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    className="block py-2 text-sm text-stone-700 transition hover:text-amber-900"
                  >
                    Mes commandes →
                  </Link>
                </li>
                {cartCount > 0 && (
                  <li>
                    <Link
                      href="/checkout"
                      className="block py-2 text-sm text-stone-700 transition hover:text-amber-900"
                    >
                      Finaliser mon panier ({cartCount}) →
                    </Link>
                  </li>
                )}
                {panelLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-2 text-sm font-medium text-amber-900 transition hover:text-amber-950"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3">
              {panelLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex w-full justify-center ${homeBtnGhost}`}
                >
                  {link.label}
                </Link>
              ))}
              {cartCount > 0 ? (
                <Link href="/checkout" className={`flex w-full justify-center ${homeBtnPrimary}`}>
                  Commander ({cartCount} article{cartCount > 1 ? "s" : ""})
                </Link>
              ) : (
                <Link href="/paintings" className={`flex w-full justify-center ${homeBtnGhost}`}>
                  Parcourir la galerie
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full border border-stone-300 bg-white py-3 text-xs uppercase tracking-[0.14em] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
              >
                Se déconnecter
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
