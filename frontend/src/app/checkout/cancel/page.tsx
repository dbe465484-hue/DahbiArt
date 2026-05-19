import Link from "next/link";
import { accountCardClass } from "@/components/account/account-form-styles";
import { homeBtnGhost, homeEyebrow } from "@/components/home/home-theme";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className={accountCardClass}>
        <p className={homeEyebrow}>Paiement annulé</p>
        <h1 className="mt-4 font-serif text-3xl text-stone-900">Commande non finalisée</h1>
        <p className="mt-4 text-sm text-stone-600">
          Vous pouvez reprendre votre commande depuis le panier.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/checkout" className={homeBtnGhost}>
            Retour au paiement
          </Link>
          <Link href="/paintings" className="text-sm text-stone-500 hover:text-amber-900">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
