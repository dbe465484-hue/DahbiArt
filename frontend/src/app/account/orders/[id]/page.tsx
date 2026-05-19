"use client";

import { useParams } from "next/navigation";
import { AccountOrderDetailContent } from "@/components/account/AccountOrderDetailContent";

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <AccountOrderDetailContent orderId={id} />;
}
