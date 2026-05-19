import { Newsletter } from "@/components/home/Newsletter";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Rejoindre la liste" };

export default function JoinPage() {
  return (
    <>
      <PageHeader title="Rejoindre" description="Accédez en avant-première aux nouvelles œuvres et événements." />
      <Newsletter />
    </>
  );
}
