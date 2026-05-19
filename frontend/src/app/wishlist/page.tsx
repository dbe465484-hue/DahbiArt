import { WishlistContent } from "@/components/wishlist/WishlistContent";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Favoris" };

export default function WishlistPage() {
  return (
    <>
      <PageHeader
        title="Mes favoris"
        description="Les œuvres que vous avez enregistrées pour les retrouver plus tard."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <WishlistContent />
      </section>
    </>
  );
}
