"use client";

import { useParams } from "next/navigation";
import { CommandeOrderDetailContent } from "@/components/commande/CommandeOrderDetailContent";

export default function CommandeOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CommandeOrderDetailContent orderId={id} />;
}
