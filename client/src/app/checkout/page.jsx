"use client";

import dynamic from "next/dynamic";

const CheckoutPageClient = dynamic(() => import("./CheckoutPageClient"), {
  ssr: true,
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
