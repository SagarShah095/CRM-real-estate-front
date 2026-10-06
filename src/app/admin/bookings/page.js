import AdminModulePlaceholderView from "@/components/admin/AdminModulePlaceholderView";

export const metadata = {
  title: "Bookings | RealtyCRM Enterprise",
  description: "Customer apartment bookings, token receipts, allotment letters, and demand notes.",
};

export default function BookingsPage() {
  return (
    <AdminModulePlaceholderView
      title="Bookings & Allotments"
      category="Sales Operations"
      subtitle="Verify customer bookings, agreement generation, token receipts, and cancellation management."
      actionLabel="+ New Booking"
      metrics={[
        { label: "Bookings This Month", value: "34", change: "+18% MoM", isPositive: true },
        { label: "Agreements Signed", value: "28", change: "Registered", isPositive: true },
        { label: "Pending Verification", value: "6", change: "Token Verification", isPositive: false },
        { label: "Total Booking Value", value: "₹28.4 Cr", change: "Collected", isPositive: true },
      ]}
    />
  );
}
