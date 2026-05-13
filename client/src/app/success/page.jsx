import SuccessPageClient from "../../components/SuccessPageClient";

export const metadata = {
  title: "Order Successful | Essentialist Makeup Store",
  description: "View and verify your secure order receipt.",
};

export default function SuccessPage({ searchParams }) {
  return (
    <SuccessPageClient searchParams={searchParams ?? {}} />
  );
}